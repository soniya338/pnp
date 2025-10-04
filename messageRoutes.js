const express = require('express');
const router = express.Router();
const Message = require('./Message');
const { body, validationResult } = require('express-validator');

// Get all messages for a conversation
router.get('/conversation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: 'admin', receiverId: userId },
        { senderId: userId, receiverId: 'admin' }
      ]
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/send', [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('content').notEmpty().withMessage('Message content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, content, messageType = 'text' } = req.body;
    
    const message = new Message({
      senderId: 'admin',
      receiverId: receiverId,
      content: content,
      messageType: messageType,
      isRead: false
    });

    await message.save();
    
    res.status(201).json({ 
      message: 'Message sent successfully', 
      messageId: message._id 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/read/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    await Message.updateMany(
      { 
        receiverId: 'admin',
        senderId: conversationId,
        isRead: false 
      },
      { isRead: true }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get all conversations (for admin)
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: 'admin' },
            { receiverId: 'admin' }
          ]
        }
      },
      {
        $addFields: {
          otherUserId: {
            $cond: {
              if: { $eq: ['$senderId', 'admin'] },
              then: '$receiverId',
              else: '$senderId'
            }
          }
        }
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', 'admin'] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);
    
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Broadcast message to all members
router.post('/broadcast', [
  body('content').notEmpty().withMessage('Message content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, messageType = 'announcement' } = req.body;
    
    // Get all member IDs (you might want to fetch from Member collection)
    const members = await require('./member').find({}, '_id');
    
    const broadcastMessages = members.map(member => ({
      senderId: 'admin',
      receiverId: member._id.toString(),
      content: content,
      messageType: messageType,
      isRead: false
    }));
    
    await Message.insertMany(broadcastMessages);
    
    res.status(201).json({ 
      message: `Broadcast sent to ${members.length} members`,
      sentTo: members.length
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    res.status(500).json({ error: 'Failed to broadcast message' });
  }
});

module.exports = router;

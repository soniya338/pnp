// server.js

// Load environment variables safely
try {
  require('dotenv').config(); // loads .env
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: './sendgrid.env' }); // loads SendGrid API key
  }
} catch (error) {
  console.warn('Warning: Could not load .env files:', error.message);
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express(); // Must initialize app first

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// --- Serve static files ---
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Error handling middleware ---
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// --- Routes with error handling ---
try {
  const authRoutes = require('./auth');
  app.use('/api/auth', authRoutes);
} catch (error) {
  console.error('Error loading auth routes:', error.message);
  app.use('/api/auth', (req, res) => res.status(500).json({ error: 'Auth service unavailable' }));
}

try {
  const memberAuthRoutes = require('./memberAuth');
  app.use('/api/member', memberAuthRoutes);
} catch (error) {
  console.error('Error loading member auth routes:', error.message);
  app.use('/api/member', (req, res) => res.status(500).json({ error: 'Member auth service unavailable' }));
}

try {
  const eventRoutes = require('./eventRoutes');
  app.use('/api/events', eventRoutes);
} catch (error) {
  console.error('Error loading event routes:', error.message);
  app.use('/api/events', (req, res) => res.status(500).json({ error: 'Event service unavailable' }));
}

try {
  const messageRoutes = require('./messageRoutes');
  app.use('/api/messages', messageRoutes);
} catch (error) {
  console.error('Error loading message routes:', error.message);
  app.use('/api/messages', (req, res) => res.status(500).json({ error: 'Message service unavailable' }));
}

// --- Health check endpoint ---
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: MONGO_URI ? 'configured' : 'not configured',
    sendgrid: process.env.SENDGRID_API_KEY ? 'configured' : 'not configured'
  });
});

// --- Admin page ---
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// --- Member dashboard ---
app.get('/dash', (req, res) => {
  res.sendFile(path.join(__dirname, 'dash.html'));
});

// --- Fallback for other routes ---
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn("⚠️ Warning: MONGO_URI is not defined in your environment variables.");
  console.warn("Database operations will not work until MONGO_URI is configured.");
} else {
  // Connect to MongoDB with better error handling
  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    // Don't crash the server, just log the error
  });
}

// Start server only if not in Vercel environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;

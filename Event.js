const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  image: { type: String, default: '' },
  venue: { type: String, default: '' },
  maxParticipants: { type: Number, default: 100 },
  registrationDeadline: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }, // Admin user ID
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);

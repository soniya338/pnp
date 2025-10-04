const mongoose = require('mongoose');

const EventRegistrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  eventTitle: { type: String, required: true }, // Denormalized for easier queries
  registrantName: { type: String, required: true },
  registrantEmail: { type: String, required: true },
  registrantPhone: { type: String, required: true },
  registrantClass: { type: String, required: true },
  registrantRollNo: { type: String, required: true },
  registrantPRN: { type: String, required: true },
  aadharFile: { type: String, default: '' }, // File path or URL
  receiptFile: { type: String, default: '' }, // File path or URL
  registrationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Index for efficient queries
EventRegistrationSchema.index({ eventId: 1, registrantEmail: 1 });
EventRegistrationSchema.index({ registrantEmail: 1 });

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);

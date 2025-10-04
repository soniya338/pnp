// Member.js
const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationExpires: { type: Number }, // timestamp (Date.now() + ms)
  role: { type: String, default: 'Member' },
  avatarUrl: { type: String, default: '' },
  points: { type: Number, default: 0 },
  joinedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Member', MemberSchema);
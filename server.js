// server.js

// Load environment variables
require('dotenv').config(); // loads .env
require('dotenv').config({ path: './sendgrid.env' }); // loads SendGrid API key

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express(); // Must initialize app first

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Serve static files ---
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
const authRoutes = require('./auth'); // Your auth.js
const memberAuthRoutes = require('./memberAuth'); // Member authentication routes
const eventRoutes = require('./eventRoutes'); // Event management routes
const messageRoutes = require('./messageRoutes'); // Message routes
app.use('/api/auth', authRoutes);
app.use('/api/member', memberAuthRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);

// --- Admin page ---
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// --- Fallback for other routes ---
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Error: MONGO_URI is not defined in your environment variables.");
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

// Connect to MongoDB
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully!');
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
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

// --- Optional: Debug SendGrid API Key ---
console.log('SENDGRID_API_KEY loaded:', process.env.SENDGRID_API_KEY?.startsWith('SG.') ? '✅ OK' : '❌ Invalid key');


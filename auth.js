// auth.js
const express = require('express');
const router = express.Router();
const sendEmail = require('./email'); // SendGrid helper
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User');

// --- Check environment variables ---
if (!process.env.EMAIL_USER) {
  console.warn('EMAIL_USER not set in .env. Emails will fail until configured.');
}

// --- Helper function to generate verification code ---
function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

// === Signup route (example) ===
router.post('/signup', async (req, res) => {
  const { name, email } = req.body;

  // --- Your signup logic here (DB save, password hash, etc.) ---

  // Send Welcome Email via SendGrid
  const subject = 'Welcome to Pop N Plan!';
  const html = `<h1>Hello ${name}</h1><p>Thanks for signing up with Pop N Plan.</p>`;

  await sendEmail(email, subject, html);

  res.status(200).json({ message: 'Signup successful, email sent!' });
});

// === Register route ===
router.post('/register', [
  body('college').notEmpty(),
  body('committee').notEmpty(),
  body('email').isEmail(),
  body('contact').isLength({ min: 7 }),
  body('password').isLength({ min: 6 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match");
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { college, committee, email, contact, password } = req.body;

  try {
    let user = await User.findOne({ email });

    const hashed = await bcrypt.hash(password, 10);
    const verificationCode = genCode();
    const verificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (user) {
      // User exists and verified
      if (user.isVerified) {
        return res.status(400).json({ errors: [{ msg: 'User already exists and is verified' }] });
      }
      // Update user if not verified
      user.college = college;
      user.committee = committee;
      user.contact = contact;
      user.password = hashed;
      user.verificationCode = verificationCode;
      user.verificationExpires = verificationExpires;
      user.isVerified = false;
      await user.save();
    } else {
      // New user
      user = new User({
        college, committee, email, contact,
        password: hashed,
        verificationCode,
        verificationExpires,
        isVerified: false
      });
      await user.save();
    }

    // Send verification email
    const subject = 'POP N\' PLAN — Your verification code';
    const html = `<p>Your POP N' PLAN verification code is <b>${verificationCode}</b>.</p><p>This code will expire in 10 minutes.</p>`;
    await sendEmail(user.email, subject, html);

    return res.json({ msg: 'Verification code sent', email: user.email });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).send('Server error');
  }
});

// === Verify code ===
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  if (!code || !email) return res.status(400).json({ errors: [{ msg: 'Missing email or code' }] });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ errors: [{ msg: 'User not found' }] });
    if (user.isVerified) return res.status(400).json({ errors: [{ msg: 'User already verified' }] });
    if (!user.verificationCode || Date.now() > user.verificationExpires) {
      return res.status(400).json({ errors: [{ msg: 'Code expired. Please request a new code.' }] });
    }

    if (user.verificationCode === code) {
      user.isVerified = true;
      user.verificationCode = undefined;
      user.verificationExpires = undefined;
      await user.save();
      return res.json({ msg: 'Registration successful' });
    } else {
      return res.status(400).json({ errors: [{ msg: 'Invalid verification code' }] });
    }
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).send('Server error');
  }
});

// === Resend code ===
router.post('/resend-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ errors: [{ msg: 'Missing email' }] });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ errors: [{ msg: 'User not found' }] });
    if (user.isVerified) return res.status(400).json({ errors: [{ msg: 'User already verified' }] });

    const verificationCode = genCode();
    const verificationExpires = Date.now() + 10 * 60 * 1000;
    user.verificationCode = verificationCode;
    user.verificationExpires = verificationExpires;
    await user.save();

    const subject = 'POP N\' PLAN — Your new verification code';
    const html = `<p>Your new verification code is <b>${verificationCode}</b>.</p><p>This code will expire in 10 minutes.</p>`;
    await sendEmail(user.email, subject, html);

    return res.json({ msg: 'Verification code resent' });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).send('Server error');
  }
});

// === Login route ===
router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    if (!user.isVerified) return res.status(400).json({ errors: [{ msg: 'Please verify your email before login' }] });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });

    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.json({ msg: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).send('Server error');
  }
});

module.exports = router;

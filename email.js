// email.js
require('dotenv').config(); // load all environment variables

const sgMail = require('@sendgrid/mail');

// Check API key safely
if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  console.warn('⚠️ Warning: Invalid or missing SendGrid API key. Email functionality will be disabled.');
  console.warn('Make sure SENDGRID_API_KEY is set and starts with "SG."');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * sendEmail - send an email using SendGrid
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - HTML body
 * @param {boolean} eu - send with EU Data Residency
 */
async function sendEmail(to, subject, html, eu = false) {
  // Check if SendGrid is properly configured
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    console.warn('⚠️ SendGrid not configured. Email not sent to:', to);
    return { success: false, message: 'SendGrid not configured' };
  }

  if (!process.env.EMAIL_USER) {
    console.warn('⚠️ EMAIL_USER not configured. Email not sent to:', to);
    return { success: false, message: 'EMAIL_USER not configured' };
  }

  const msg = {
    to,
    from: process.env.EMAIL_USER, // Must be a verified sender in SendGrid
    subject,
    html,
    ...(eu && { setDataResidency: 'eu' })
  };

  try {
    const response = await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
    console.log('SendGrid response status:', response[0].statusCode);
    return response;
  } catch (err) {
    console.error('❌ SendGrid error:', err.response ? err.response.body : err.message);
    // Don't throw error, just log it and return a failure response
    return { success: false, error: err.message };
  }
}

module.exports = sendEmail;

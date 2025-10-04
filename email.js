/ email.js
require('dotenv').config(); // load all environment variables

const sgMail = require('@sendgrid/mail');

// Check API key
if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  console.error('❌ Invalid SendGrid API key. Make sure it starts with "SG."');
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * sendEmail - send an email using SendGrid
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - HTML body
 * @param {boolean} eu - send with EU Data Residency
 */
async function sendEmail(to, subject, html, eu = false) {
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
    throw err;
  }
}

module.exports = sendEmail;



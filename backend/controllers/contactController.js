/**
 * contactController.js
 * ─────────────────────────────────────────────────────────────
 * Handles contact form submissions.
 * Saves to MongoDB + sends email notification via Resend.
 * ─────────────────────────────────────────────────────────────
 */

const ContactMessage = require('../models/ContactMessage');
const { sendContactEmail } = require('../services/emailService');

const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // 1. Save to database
    const newMessage = new ContactMessage({ name, email, subject, message });
    await newMessage.save();

    // 2. Send email notification to admin via Resend
    await sendContactEmail({ name, email, subject, message });

    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { submitContactMessage, getAllContactMessages };


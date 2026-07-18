/**
 * bookingController.js
 * ─────────────────────────────────────────────────────────────
 * Controller for managing consultation bookings.
 * ─────────────────────────────────────────────────────────────
 */

const Booking = require('../models/Booking');
const { sendBookingConfirmation, sendBookingAdminNotification } = require('../services/emailService');

/**
 * Create a new consultation booking
 */
const createBooking = async (req, res) => {
  try {
    const { name, email, phone, service, date, timeSlot = '', details } = req.body;

    // Validation
    if (!name || !email || !phone || !service || !date) {
      return res.status(400).json({ success: false, message: 'All fields (name, email, phone, service, date) are required.' });
    }

    // 1. Save booking to DB
    const newBooking = new Booking({
      name,
      email,
      phone,
      service,
      date,
      timeSlot,
      details,
    });
    await newBooking.save();

    // 2. Send email notification to user
    await sendBookingConfirmation({
      email,
      name,
      service,
      date,
      timeSlot,
    });

    // 3. Send notification to admin
    await sendBookingAdminNotification({
      name,
      email,
      phone,
      service,
      date,
      timeSlot,
      details,
    });

    return res.status(201).json({
      success: true,
      message: 'Consultation booked successfully!',
      booking: newBooking,
    });
  } catch (error) {
    console.error('Booking controller error:', error);
    
    // Catch unique index conflict error from MongoDB
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This slot is already booked. Please choose a different date or time.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error while booking consultation.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Fetch already booked slots for a given date
 */
const getBookedSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required.' });
    }

    // Retrieve all bookings for that date
    const bookings = await Booking.find({ date }).select('timeSlot service -_id');
    
    // Map to a list of booked slots (or structured object)
    const booked = bookings.map(b => b.timeSlot);

    return res.status(200).json({
      success: true,
      bookedSlots: booked,
    });
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching booked slots.',
    });
  }
};

/**
 * Fetch all bookings for admin dashboard
 */
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = {
  createBooking,
  getBookedSlots,
  getAllBookings,
};

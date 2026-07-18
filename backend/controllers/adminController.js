/**
 * adminController.js
 * ─────────────────────────────────────────────────────────────
 * Handles admin-only aggregated statistics and user management.
 * ─────────────────────────────────────────────────────────────
 */

const User = require('../models/User');
const InternshipApplication = require('../models/InternshipApplication');
const JobApplication = require('../models/JobApplication');
const Booking = require('../models/Booking');
const ContactMessage = require('../models/ContactMessage');

// ─────────────────────────────────────────────────────────────
// @route  GET /api/admin/overview
// @access Private/Admin
// ─────────────────────────────────────────────────────────────
exports.getOverviewStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalInternships,
      pendingInternships,
      totalJobs,
      pendingJobs,
      totalBookings,
      totalContacts,
      recentInternships,
      recentJobs,
      recentBookings,
      recentContacts,
    ] = await Promise.all([
      User.countDocuments(),
      InternshipApplication.countDocuments(),
      InternshipApplication.countDocuments({ applicationStatus: 'Pending' }),
      JobApplication.countDocuments(),
      JobApplication.countDocuments({ applicationStatus: 'Pending' }),
      Booking.countDocuments(),
      ContactMessage.countDocuments(),
      InternshipApplication.find().sort({ appliedAt: -1 }).limit(5).select('fullName internshipRole applicationStatus appliedAt'),
      JobApplication.find().sort({ appliedAt: -1 }).limit(5).select('fullName jobTitle applicationStatus appliedAt'),
      Booking.find().sort({ createdAt: -1 }).limit(5).select('name service date createdAt'),
      ContactMessage.find().sort({ createdAt: -1 }).limit(5).select('name subject createdAt'),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalInternships,
        pendingInternships,
        totalJobs,
        pendingJobs,
        totalBookings,
        totalContacts,
      },
      recentActivity: {
        internships: recentInternships,
        jobs: recentJobs,
        bookings: recentBookings,
        contacts: recentContacts,
      },
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route  GET /api/admin/users
// @access Private/Admin
// ─────────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query)
      .select('name email authProvider isEmailVerified createdAt phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

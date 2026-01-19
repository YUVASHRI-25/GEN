/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/google - Google OAuth login
router.post('/google', authController.googleLogin);

// GET /api/auth/me - Get current user (protected)
router.get('/me', protect, authController.getMe);

module.exports = router;

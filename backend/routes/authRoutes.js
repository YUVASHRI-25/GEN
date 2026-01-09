/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/auth/login - Login user
router.post('/login', authController.login);

// POST /api/auth/google - Google OAuth login
router.post('/google', authController.googleLogin);

// GET /api/auth/me - Get current user
router.get('/me', authController.getMe);

module.exports = router;

/**
 * Auth Controller
 * Handles user authentication with session-based JWT
 */

const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

// In-memory user store (for demo purposes)
const users = new Map();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

/**
 * Get current user
 */
const getMe = (req, res) => {
  try {
    // The auth middleware adds the user to the request
    const { id, email, name, picture } = req.user;

    if (!id) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id,
        username: name,
        email,
        picture
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

/**
 * Google OAuth Login
 * Verifies Google ID token and creates session
 */
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify Google ID token on the backend (NEVER trust frontend data)
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    // Extract user info from verified token
    const { sub: googleId, email, name, picture } = payload;

    // Validate email domain - only allow @bitsathy.ac.in
    if (!email.endsWith('@bitsathy.ac.in')) {
      return res.status(403).json({
        success: false,
        message: 'Only @bitsathy.ac.in email addresses are allowed'
      });
    }

    // Check if user exists in memory
    let user = users.get(email);
    const userId = user?.id || `user_${Date.now()}`;
    
    // Create or update user in memory
    users.set(email, {
      id: userId,
      name,
      email,
      googleId,
      picture,
      provider: 'google',
      lastLogin: new Date().toISOString()
    });

    // Generate JWT token
    const token = generateToken({ 
      id: userId, 
      email, 
      name,
      picture,
      provider: 'google' 
    });

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: userId,
        username: name,
        email,
        picture
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google login failed',
      error: error.message
    });
  }
};

module.exports = {
  getMe,
  googleLogin
};

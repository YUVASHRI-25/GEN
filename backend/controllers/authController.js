/**
 * Auth Controller
 * Handles user authentication (simple version for first-year students)
 */

const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In-memory user storage (replace with database in production)
const users = [];

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      });
    }

    // Validate email domain - only allow @bitsathy.ac.in
    if (!email.endsWith('@bitsathy.ac.in')) {
      return res.status(403).json({
        success: false,
        message: 'Only @bitsathy.ac.in email addresses are allowed'
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user (in production, hash the password!)
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password, // Note: In production, use bcrypt to hash passwords
      createdAt: new Date()
    };

    users.push(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * Get current user
 */
const getMe = async (req, res) => {
  try {
    // In production, extract user from JWT token
    res.json({
      success: true,
      user: req.user || { message: 'Implement token verification' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

/**
 * Google OAuth Login
 * Verifies Google ID token and creates/logs in user
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

    // Check if user exists (by email or Google ID)
    let user = users.find(u => u.email === email || u.googleId === googleId);

    if (user) {
      // Update Google info if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
      }
    } else {
      // Create new user
      user = {
        id: users.length + 1,
        username: name,
        email,
        googleId,
        picture,
        password: null, // Google users don't have password
        createdAt: new Date()
      };
      users.push(user);
    }

    // Generate JWT token
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        picture: user.picture
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
  register,
  login,
  getMe,
  googleLogin
};

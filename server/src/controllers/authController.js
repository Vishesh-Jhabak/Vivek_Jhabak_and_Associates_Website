const supabase = require('../config/supabase');

// @desc    Admin/User Login via Supabase Auth
// @route   POST /api/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        message: 'Supabase client is not configured on this server',
      });
    }

    // Sign in user using Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid credentials',
      });
    }

    res.status(200).json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.name || 'Administrator',
        email: data.user.email,
        role: data.user.user_metadata?.role || 'admin',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile (using session user attached from auth middleware)
// @route   GET /api/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.user_metadata?.name || 'Administrator',
        email: req.user.email,
        role: req.user.user_metadata?.role || 'admin',
      },
    });
  } catch (error) {
    next(error);
  }
};

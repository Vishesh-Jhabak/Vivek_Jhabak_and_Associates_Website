const supabase = require('../config/supabase');

// Protect routes - Verify JWT token using Supabase Auth
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, session token is missing',
    });
  }

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        message: 'Authentication client is not configured on the server',
      });
    }

    // Validate the token with Supabase Auth API
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route, session is invalid or expired',
      });
    }

    // Attach user record metadata to the request
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token validation failed',
    });
  }
};

// Grant access to specific roles (e.g. admin checks)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
    }

    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'vivekjhabak@gmail.com';
    const isUserAdmin = req.user.email === adminEmail || req.user.user_metadata?.role === 'admin';

    if (roles.includes('admin') && !isUserAdmin) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Administrator privileges required.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

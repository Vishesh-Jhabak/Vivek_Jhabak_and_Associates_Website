const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Route imports
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const serviceRoutes = require('./routes/services');
const pricingRoutes = require('./routes/pricing');
const careerRoutes = require('./routes/careers');
const contactRoutes = require('./routes/contact');

// Middleware imports
const errorHandler = require('./middleware/error');
const { xssSanitizer } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimiter');

// Initialize Express app
const app = express();

// --- 1. Security Middlewares ---
// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting for all requests
app.use('/api', apiLimiter);

// Parse request body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitize inputs against XSS attacks
app.use(xssSanitizer);


// --- 2. Static Files ---
// Serve public uploads statically (if needed)
app.use('/uploads/public', express.static(path.join(__dirname, '../uploads/public')));


// --- 3. Mount Routes ---
app.use('/api', authRoutes); // mounts /api/login and /api/me
app.use('/api', careerRoutes); // mounts /api/jobs, /api/careers, /api/resume, /api/careers/applicants, /api/careers/resumes/:filename
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/contact', contactRoutes);

// Base route healthcheck
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vivek Jhabak & Associates API (Supabase Integration) is active and running',
    version: '2.0.0'
  });
});

// --- 4. Fallback 404 Route ---
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server`,
  });
});

// --- 5. Global Error Handling Middleware ---
app.use(errorHandler);

module.exports = app;

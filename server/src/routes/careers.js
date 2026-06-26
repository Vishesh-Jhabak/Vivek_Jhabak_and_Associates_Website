const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const {
  applyJob,
  uploadResumeOnly,
  getApplicants,
  getResumeFile,
} = require('../controllers/applicantController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');
const { formSubmitLimiter } = require('../middleware/rateLimiter');

// --- Vacancies (Jobs) Routing ---
// Public routes to view job listings
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJob);

// Admin-only routes to manage job listings
router.post('/jobs', protect, authorize('admin'), createJob);
router.put('/jobs/:id', protect, authorize('admin'), updateJob);
router.delete('/jobs/:id', protect, authorize('admin'), deleteJob);


// --- Job Submissions (Applicants) Routing ---
// Public route to apply for a vacancy (rate-limited, processes file upload)
router.post('/', formSubmitLimiter, uploadResume, applyJob);

// Public route to upload resume file separately (rate-limited)
router.post('/resume', formSubmitLimiter, uploadResume, uploadResumeOnly);

// Admin-only route to view applicants list
router.get('/applicants', protect, authorize('admin'), getApplicants);

// Admin-only route to download resume PDFs securely
router.get('/resumes/:filename', protect, authorize('admin'), getResumeFile);

module.exports = router;

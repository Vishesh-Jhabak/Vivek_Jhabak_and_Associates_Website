const supabase = require('../config/supabase');
const path = require('path');

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'resumes';

// Helper to upload file buffer to Supabase Storage
const uploadToSupabase = async (file) => {
  if (!supabase) {
    throw new Error('Supabase Storage is not configured. Add credentials to your .env file.');
  }

  // Generate a unique filename: resume-timestamp-random.pdf
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const fileName = `resume-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`;

  // Upload to Supabase Storage Bucket
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage Upload Error: ${error.message}`);
  }

  // Return the uploaded file path key (e.g. "resume-17000000-12345.pdf")
  return data.path;
};

// @desc    Apply for a vacancy (Submit details + upload resume PDF to Supabase)
// @route   POST /api/careers
// @access  Public
exports.applyJob = async (req, res, next) => {
  try {
    const { name, email, phone, job: jobId, notes } = req.body;
    let resumePath = '';

    // Validation
    if (!name || !email || !phone || !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, and job ID',
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        message: 'Supabase client is not configured on this server',
      });
    }

    // Verify job vacancy exists and is open in Supabase
    const { data: jobExists, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !jobExists) {
      return res.status(404).json({
        success: false,
        message: 'Specified job vacancy does not exist',
      });
    }

    if (jobExists.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This job vacancy has already closed',
      });
    }

    // Upload to Supabase Storage if file is present
    if (req.file) {
      resumePath = await uploadToSupabase(req.file);
    } else if (req.body.resumePath) {
      resumePath = req.body.resumePath;
    }

    if (!resumePath) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume in PDF format',
      });
    }

    // Save applicant record referencing Supabase file path key
    const { data: applicant, error: insertError } = await supabase
      .from('applicants')
      .insert([{
        name,
        email: email.toLowerCase(),
        phone,
        job_id: jobId,
        resume_path: resumePath,
        notes,
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({
      success: true,
      data: applicant,
      message: 'Application submitted successfully. Thank you!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume separately (Returns path)
// @route   POST /api/resume
// @access  Public
exports.uploadResumeOnly = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume',
      });
    }

    const resumePath = await uploadToSupabase(req.file);

    res.status(200).json({
      success: true,
      resumePath,
      message: 'Resume file uploaded to cloud storage successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applicants (Admin only)
// @route   GET /api/careers/applicants
// @access  Private (Admin Only)
exports.getApplicants = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    // Fetch list joining job vacancy details
    const { data: applicants, error } = await supabase
      .from('applicants')
      .select('*, job:jobs(*)')
      .order('applied_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: applicants.length,
      data: applicants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Redirect to a secure, signed Supabase URL to download resume file (Admin only)
// @route   GET /api/careers/resumes/:filename
// @access  Private (Admin Only)
exports.getResumeFile = async (req, res, next) => {
  try {
    const filename = req.params.filename;
    // Security check: prevent directory traversal
    const safeFilename = path.basename(filename);

    if (!supabase) {
      return res.status(500).json({
        success: false,
        message: 'Supabase client is not configured on this server.',
      });
    }

    // Generate signed download URL valid for 60 seconds
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(safeFilename, 60);

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Could not generate signed download URL: ' + (error ? error.message : 'File not found'),
      });
    }

    // Redirect user to download file from Supabase storage securely
    res.redirect(data.signedUrl);
  } catch (error) {
    next(error);
  }
};

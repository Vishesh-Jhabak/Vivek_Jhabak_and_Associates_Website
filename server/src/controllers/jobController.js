const supabase = require('../config/supabase');

// @desc    Get all job vacancies (Open only for public, all for Admin)
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    let query = supabase.from('jobs').select('*');

    if (req.query.all !== 'true') {
      query = query.eq('status', 'open');
    }

    const { data: jobs, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job vacancy details
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !job) {
      return res.status(404).json({
        success: false,
        message: 'Job vacancy not found',
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job vacancy
// @route   POST /api/jobs
// @access  Private (Admin Only)
exports.createJob = async (req, res, next) => {
  try {
    const { title, department, description, requirements, type, location, status } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and type for the job',
      });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .insert([{
        title,
        department: department || 'Taxation & Auditing',
        description,
        requirements: requirements || [],
        type,
        location: location || 'Nawapara, Rajim',
        status: status || 'open'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: job,
      message: 'Job vacancy posted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job vacancy
// @route   PUT /api/jobs/:id
// @access  Private (Admin Only)
exports.updateJob = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: checkJob, error: checkError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (checkError || !checkJob) {
      return res.status(404).json({
        success: false,
        message: 'Job vacancy not found',
      });
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: job,
      message: 'Job vacancy updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job vacancy
// @route   DELETE /api/jobs/:id
// @access  Private (Admin Only)
exports.deleteJob = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: checkJob, error: checkError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (checkError || !checkJob) {
      return res.status(404).json({
        success: false,
        message: 'Job vacancy not found',
      });
    }

    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    res.status(200).json({
      success: true,
      message: 'Job vacancy deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

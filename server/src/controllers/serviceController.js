const supabase = require('../config/supabase');

// @desc    Get all services (Active only for public, all for Admin)
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    let query = supabase.from('services').select('*');

    // Filter active items unless requested by admin
    if (req.query.all !== 'true') {
      query = query.eq('status', 'active');
    }

    // Sort order
    const { data: services, error } = await query
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service details
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Admin Only)
exports.createService = async (req, res, next) => {
  try {
    const { name, description, price, category, icon, status } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, and price for the service',
      });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: service, error } = await supabase
      .from('services')
      .insert([{
        name,
        description,
        price,
        category: category || 'Taxation',
        icon: icon || 'percent',
        status: status || 'active'
      }])
      .select()
      .single();

    if (error) {
      // Handle unique constraint violations
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'A service with this name already exists'
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      data: service,
      message: 'Service created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin Only)
exports.updateService = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: serviceExists, error: checkError } = await supabase
      .from('services')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (checkError || !serviceExists) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    const { data: service, error } = await supabase
      .from('services')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: service,
      message: 'Service updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin Only)
exports.deleteService = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: service, error: checkError } = await supabase
      .from('services')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (checkError || !service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

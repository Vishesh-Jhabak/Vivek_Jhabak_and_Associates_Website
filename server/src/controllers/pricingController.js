const supabase = require('../config/supabase');

// @desc    Get all pricing plans (Active only for public, all for Admin)
// @route   GET /api/pricing
// @access  Public
exports.getPricing = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    let query = supabase.from('pricing').select('*');

    if (req.query.all !== 'true') {
      query = query.eq('status', 'active');
    }

    const { data: plans, error } = await query
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new pricing plan
// @route   POST /api/pricing
// @access  Private (Admin Only)
exports.createPricing = async (req, res, next) => {
  try {
    const { name, description, price, features, category, status } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, and category',
      });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: plan, error } = await supabase
      .from('pricing')
      .insert([{
        name,
        description,
        price,
        features: features || [],
        category,
        status: status || 'active'
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'A pricing plan with this name already exists'
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      data: plan,
      message: 'Pricing plan created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pricing plan
// @route   PUT /api/pricing/:id
// @access  Private (Admin Only)
exports.updatePricing = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: checkPlan, error: checkError } = await supabase
      .from('pricing')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (checkError || !checkPlan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found',
      });
    }

    const { data: plan, error } = await supabase
      .from('pricing')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: plan,
      message: 'Pricing plan updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete pricing plan
// @route   DELETE /api/pricing/:id
// @access  Private (Admin Only)
exports.deletePricing = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: checkPlan, error: checkError } = await supabase
      .from('pricing')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (checkError || !checkPlan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found',
      });
    }

    const { error: deleteError } = await supabase
      .from('pricing')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    res.status(200).json({
      success: true,
      message: 'Pricing plan deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

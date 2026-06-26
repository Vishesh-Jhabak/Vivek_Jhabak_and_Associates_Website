const supabase = require('../config/supabase');

// @desc    Submit a contact form message
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, subject, and message',
      });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert([{
        name,
        email: email.toLowerCase(),
        phone,
        subject,
        message,
        status: 'unread'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message submitted successfully. We will get back to you shortly!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact messages (Admin only)
// @route   GET /api/contact
// @access  Private (Admin Only)
exports.getMessages = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update message status (e.g. read/unread)
// @route   PUT /api/contact/:id
// @access  Private (Admin Only)
exports.updateMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['read', 'unread'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status: read or unread',
      });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: message, error: updateError } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError || !message) {
      return res.status(404).json({
        success: false,
        message: 'Message record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: message,
      message: `Message status marked as ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private (Admin Only)
exports.deleteMessage = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: message, error: checkError } = await supabase
      .from('messages')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (checkError || !message) {
      return res.status(404).json({
        success: false,
        message: 'Message record not found',
      });
    }

    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

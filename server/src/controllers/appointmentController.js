const supabase = require('../config/supabase');
const transporter = require('../config/nodemailer');

// @desc    Create new appointment booking in Supabase
// @route   POST /api/appointments
// @access  Public
exports.createAppointment = async (req, res, next) => {
  try {
    const { name, email, phone, service: serviceId, date, timeSlot, notes } = req.body;

    if (!name || !email || !phone || !serviceId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields: name, email, phone, service, date, timeSlot',
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        message: 'Supabase client is not configured',
      });
    }

    // Verify service exists
    const { data: serviceObj, error: svcError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (svcError || !serviceObj) {
      return res.status(404).json({
        success: false,
        message: 'Selected service does not exist',
      });
    }

    // Convert date to YYYY-MM-DD
    const bookingDate = new Date(date).toISOString().split('T')[0];

    // Prevent duplicate bookings: check if slot is already booked and NOT cancelled
    const { data: duplicate, error: dupError } = await supabase
      .from('appointments')
      .select('id')
      .eq('date', bookingDate)
      .eq('time_slot', timeSlot)
      .neq('status', 'cancelled')
      .limit(1)
      .maybeSingle();

    if (dupError) throw dupError;

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'This date and time slot is already booked. Please choose another slot.',
      });
    }

    // Prevent duplicate spam check
    const { data: spamCheck, error: spamError } = await supabase
      .from('appointments')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('phone', phone)
      .eq('service_id', serviceId)
      .eq('date', bookingDate)
      .neq('status', 'cancelled')
      .limit(1)
      .maybeSingle();

    if (spamError) throw spamError;

    if (spamCheck) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested an appointment for this service on this day.',
      });
    }

    // Create appointment in database
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert([{
        name,
        email: email.toLowerCase(),
        phone,
        service_id: serviceId,
        date: bookingDate,
        time_slot: timeSlot,
        notes,
        status: 'pending',
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Attach service details for response and templates
    appointment.service = serviceObj;

    const formattedDate = new Date(bookingDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 1. Send Confirmation Email to Client
    const clientMailOptions = {
      from: `"Vivek Jhabak & Associates" <${process.env.SMTP_FROM || 'no-reply@vivekjhabak.com'}>`,
      to: email,
      subject: 'Appointment Booking Received - Vivek Jhabak & Associates',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">Appointment Confirmed</h2>
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for booking an appointment with <strong>Vivek Jhabak & Associates</strong>. We have received your booking request.</p>
          
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2d3748;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #718096; width: 120px;"><strong>Service:</strong></td>
                <td style="padding: 6px 0; color: #2d3748;">${serviceObj.name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;"><strong>Date:</strong></td>
                <td style="padding: 6px 0; color: #2d3748;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;"><strong>Time Slot:</strong></td>
                <td style="padding: 6px 0; color: #2d3748;">${timeSlot}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;"><strong>Status:</strong></td>
                <td style="padding: 6px 0; color: #d69e2e; font-weight: bold;">Pending Review</td>
              </tr>
            </table>
          </div>

          <p>We will review your appointment request and reach out if any adjustments are needed. If you need to reschedule, please contact us at +91-7000826981.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #a0aec0; text-align: center;">
            Vivek Jhabak & Associates | Nawapara, Rajim | Chhattisgarh, India
          </p>
        </div>
      `,
    };

    // 2. Send Booking Alert Email to Admin
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'vivekjhabak@gmail.com';
    const adminMailOptions = {
      from: `"Appointment System" <${process.env.SMTP_FROM || 'no-reply@vivekjhabak.com'}>`,
      to: adminEmail,
      subject: `New Booking Request: ${name} - ${serviceObj.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #e53e3e; border-bottom: 2px solid #e53e3e; padding-bottom: 10px;">New Appointment Booking Alert</h2>
          <p>A new appointment has been scheduled by a client. Please review the details below:</p>
          
          <div style="background-color: #fffaf0; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dd6b20;">
            <h3 style="margin-top: 0; color: #2d3748;">Appointment Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #718096; width: 120px;"><strong>Client Name:</strong></td>
                <td style="padding: 6px 0; color: #2d3748; font-weight: bold;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;"><strong>Email:</strong></td>
                <td style="padding: 6px 0; color: #2d3748;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;"><strong>Phone:</strong></td>
                <td style="padding: 6px 0; color: #2d3748;"><a href="tel:${phone}">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;"><strong>Service:</strong></td>
                <td style="padding: 6px 0; color: #2d3748;">${serviceObj.name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;"><strong>Date:</strong></td>
                <td style="padding: 6px 0; color: #2d3748;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;"><strong>Time Slot:</strong></td>
                <td style="padding: 6px 0; color: #2d3748;">${timeSlot}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;"><strong>Notes:</strong></td>
                <td style="padding: 6px 0; color: #2d3748; font-style: italic;">${notes || 'No additional notes provided'}</td>
              </tr>
            </table>
          </div>
          <p>Please log in to your admin dashboard to approve or manage this appointment.</p>
        </div>
      `,
    };

    transporter.sendMail(clientMailOptions).catch(err => console.error('Error sending confirmation email to client:', err.message));
    transporter.sendMail(adminMailOptions).catch(err => console.error('Error sending notification email to admin:', err.message));

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment booked successfully. Confirmation email sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments (joining service names)
// @route   GET /api/appointments
// @access  Private (Admin Only)
exports.getAppointments = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    // Join query equivalent to mongoose populate
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*, service:services(*)')
      .order('date', { ascending: false })
      .order('time_slot', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (approve/cancel)
// @route   PUT /api/appointments/:id
// @access  Private (Admin Only)
exports.updateAppointment = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status: pending, approved, or cancelled',
      });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    // Update state
    const { data: appointment, error: updateError } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', req.params.id)
      .select('*, service:services(*)')
      .single();

    if (updateError || !appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Notify client
    const formattedDate = new Date(appointment.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const statusMailOptions = {
      from: `"Vivek Jhabak & Associates" <${process.env.SMTP_FROM || 'no-reply@vivekjhabak.com'}>`,
      to: appointment.email,
      subject: `Appointment Status Update: ${status.toUpperCase()} - Vivek Jhabak & Associates`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">Appointment Status Update</h2>
          <p>Dear <strong>${appointment.name}</strong>,</p>
          <p>Your appointment status has been updated to: <strong style="color: ${status === 'approved' ? '#38a169' : status === 'cancelled' ? '#e53e3e' : '#d69e2e'}">${status.toUpperCase()}</strong>.</p>
          
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2d3748;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #718096; width: 120px;"><strong>Service:</strong></td>
                <td style="padding: 6px 0; color: #2d3748;">${appointment.service ? appointment.service.name : 'Consultation'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;"><strong>Date:</strong></td>
                <td style="padding: 6px 0; color: #2d3748;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;"><strong>Time Slot:</strong></td>
                <td style="padding: 6px 0; color: #2d3748;">${appointment.timeSlot}</td>
              </tr>
            </table>
          </div>

          ${status === 'approved' ? '<p>We look forward to meeting you. Please arrive 5 minutes before your scheduled slot.</p>' : ''}
          ${status === 'cancelled' ? '<p>If you wish to schedule a new slot, please request a new booking online.</p>' : ''}
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #a0aec0; text-align: center;">
            Vivek Jhabak & Associates | Phone: +91-7000826981
          </p>
        </div>
      `,
    };

    transporter.sendMail(statusMailOptions).catch(err => console.error('Error sending status update email:', err.message));

    res.status(200).json({
      success: true,
      data: appointment,
      message: `Appointment status updated to ${status} and notification sent to client.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin Only)
exports.deleteAppointment = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not configured' });
    }

    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    res.status(200).json({
      success: true,
      message: 'Appointment removed from records',
    });
  } catch (error) {
    next(error);
  }
};

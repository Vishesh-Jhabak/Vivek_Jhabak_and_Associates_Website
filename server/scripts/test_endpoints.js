const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../src/app');

const PORT = process.env.TEST_PORT || 5555;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const runTests = async () => {
  console.log('\n=========================================');
  console.log('STARTING SUPABASE ENDPOINT INTEGRATION TESTS');
  console.log('=========================================\n');

  // Verify Supabase configs exist
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your .env file to run these tests.');
    process.exit(1);
  }

  const server = app.listen(PORT, async () => {
    console.log(`Test server active on ${BASE_URL}`);
    
    let token = '';
    let testServiceId = '';
    let testJobId = '';
    let testAppointmentId = '';
    let testMessageId = '';

    try {
      // 1. Healthcheck Endpoint
      console.log('\n--- Test 1: GET / (Healthcheck) ---');
      const healthRes = await fetch(`${BASE_URL}/`);
      const healthData = await healthRes.json();
      console.log(`Status: ${healthRes.status} (Expected: 200)`);
      console.log(`Response message: "${healthData.message}"`);
      if (healthRes.status !== 200) throw new Error('Healthcheck failed');

      // 2. Admin Login Endpoint (Requires a user created in Supabase Auth Dashboard)
      console.log('\n--- Test 2: POST /api/login (Supabase Auth Credentials) ---');
      const loginPayload = {
        email: process.env.ADMIN_NOTIFY_EMAIL || 'admin@vivekjhabak.com',
        password: 'AdminPassword123' // Or custom password set in Supabase Dashboard
      };
      
      console.log(`Attempting login for: ${loginPayload.email}`);
      const loginRes = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload)
      });
      const loginData = await loginRes.json();
      console.log(`Status: ${loginRes.status} (Expected: 200)`);
      if (loginRes.status !== 200) {
        console.warn('⚠️ WARNING: Login failed. Note that tests require you to register your admin user in your Supabase Auth Panel first.');
        console.warn('Skipping subsequent protected route tests. Checking public routes...');
      } else {
        token = loginData.token;
        console.log('JWT Token retrieved successfully from Supabase Auth.');
      }

      // 3. Private Profile Route (Skip if login failed)
      if (token) {
        console.log('\n--- Test 3: GET /api/me (With Authorization Bearer Token) ---');
        const profileRes = await fetch(`${BASE_URL}/api/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        console.log(`Status: ${profileRes.status} (Expected: 200)`);
        console.log(`Logged in as: ${profileData.user.email} (UID: ${profileData.user.id})`);
        if (profileRes.status !== 200) throw new Error('Get profile details failed');
      }

      // 4. Retrieve Services (Public)
      console.log('\n--- Test 4: GET /api/services (Public List) ---');
      const servicesRes = await fetch(`${BASE_URL}/api/services`);
      const servicesData = await servicesRes.json();
      console.log(`Status: ${servicesRes.status} (Expected: 200)`);
      console.log(`Count of services found: ${servicesData.count}`);
      if (servicesRes.status !== 200) throw new Error('Retrieve services failed');
      
      if (servicesData.count > 0) {
        testServiceId = servicesData.data[0].id;
        console.log(`Selected Service UUID for booking test: ${testServiceId}`);
      } else {
        console.warn('⚠️ No services found. Please run "npm run seed" to populate Supabase tables first.');
      }

      // 5. Create Appointment (Public - Skip if no services)
      if (testServiceId) {
        console.log('\n--- Test 5: POST /api/appointments (Create Booking) ---');
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() + 5); // Book for 5 days from now
        const bookingDateString = bookingDate.toISOString().split('T')[0];

        const appointmentPayload = {
          name: 'Test Client',
          email: 'testclient@example.com',
          phone: '9876543210',
          service: testServiceId,
          date: bookingDateString,
          timeSlot: '03:00 PM - 04:00 PM',
          notes: 'Need corporate compliance audit consultation'
        };

        const appointmentRes = await fetch(`${BASE_URL}/api/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentPayload)
        });
        const appointmentData = await appointmentRes.json();
        console.log(`Status: ${appointmentRes.status} (Expected: 201)`);
        console.log(`Response message: "${appointmentData.message}"`);
        if (appointmentRes.status !== 201) throw new Error('Appointment creation failed');
        testAppointmentId = appointmentData.data.id;

        // 6. Duplicate Booking Prevention
        console.log('\n--- Test 6: POST /api/appointments (Duplicate Booking Block Check) ---');
        const duplicateRes = await fetch(`${BASE_URL}/api/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentPayload)
        });
        const duplicateData = await duplicateRes.json();
        console.log(`Status: ${duplicateRes.status} (Expected: 400)`);
        console.log(`Error Response message: "${duplicateData.message}"`);
        if (duplicateRes.status !== 400) throw new Error('Duplicate booking check failed (allowed overlap!)');
        console.log('SUCCESS: Duplicate booking blocked correctly.');
      }

      // 7. Get Appointments (Admin Only)
      console.log('\n--- Test 7: GET /api/appointments (Admin Retrieval Check) ---');
      const noTokenRes = await fetch(`${BASE_URL}/api/appointments`);
      console.log(`Without Token Status: ${noTokenRes.status} (Expected: 401)`);
      if (noTokenRes.status !== 401) throw new Error('Unauthorized route protection failed');

      if (token) {
        const adminApptsRes = await fetch(`${BASE_URL}/api/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const adminApptsData = await adminApptsRes.json();
        console.log(`With Admin Token Status: ${adminApptsRes.status} (Expected: 200)`);
        console.log(`Admin retrieved appointments count: ${adminApptsData.count}`);
        if (adminApptsRes.status !== 200) throw new Error('Admin appointments retrieval failed');
      }

      // 8. Contact Form Message Submission (Public)
      console.log('\n--- Test 8: POST /api/contact (Public Message Submission) ---');
      const contactPayload = {
        name: 'Contact Tester',
        email: 'contact@tester.com',
        phone: '8888888888',
        subject: 'Inquiry about corporate audits',
        message: 'Looking to transfer corporate auditor roles for private limited company.'
      };
      const contactRes = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactPayload)
      });
      const contactData = await contactRes.json();
      console.log(`Status: ${contactRes.status} (Expected: 201)`);
      console.log(`Response message: "${contactData.message}"`);
      if (contactRes.status !== 201) throw new Error('Contact message post failed');
      testMessageId = contactData.data.id;

      // 9. Get Messages (Admin Only)
      if (token) {
        console.log('\n--- Test 9: GET /api/contact (Admin Message Retrieval) ---');
        const messagesRes = await fetch(`${BASE_URL}/api/contact`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const messagesData = await messagesRes.json();
        console.log(`Status: ${messagesRes.status} (Expected: 200)`);
        console.log(`Messages retrieved count: ${messagesData.count}`);
        if (messagesRes.status !== 200) throw new Error('Admin message retrieve failed');
      }

      // 10. Fetch Vacancies (Public)
      console.log('\n--- Test 10: GET /api/jobs (Public Vacancies) ---');
      const jobsRes = await fetch(`${BASE_URL}/api/jobs`);
      const jobsData = await jobsRes.json();
      console.log(`Status: ${jobsRes.status} (Expected: 200)`);
      console.log(`Jobs vacancy count: ${jobsData.count}`);
      if (jobsRes.status !== 200) throw new Error('Get vacancies failed');

      // 11. Clean Up Test Records (Admin Commands - Only if token is set)
      if (token) {
        if (testAppointmentId) {
          console.log('\n--- Test 11: DELETE /api/appointments/:id (Admin Cleanup) ---');
          const deleteApptRes = await fetch(`${BASE_URL}/api/appointments/${testAppointmentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log(`Status: ${deleteApptRes.status} (Expected: 200)`);
          if (deleteApptRes.status !== 200) throw new Error('Admin delete appointment failed');
        }

        if (testMessageId) {
          console.log('\n--- Test 12: DELETE /api/contact/:id (Admin Cleanup) ---');
          const deleteMsgRes = await fetch(`${BASE_URL}/api/contact/${testMessageId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log(`Status: ${deleteMsgRes.status} (Expected: 200)`);
          if (deleteMsgRes.status !== 200) throw new Error('Admin delete contact message failed');
        }
      }

      console.log('\n=========================================');
      console.log('INTEGRATION CHECKS EXECUTED SUCCESSFULLY! ✅');
      console.log('=========================================\n');

    } catch (err) {
      console.error('\n❌ TEST RUN ENCOUNTERED AN ERROR:');
      console.error(err.message);
      console.log('=========================================\n');
    } finally {
      console.log('Shutting down test server...');
      server.close(() => {
        console.log('Resources released. Exiting.');
        process.exit(0);
      });
    }
  });
};

runTests();

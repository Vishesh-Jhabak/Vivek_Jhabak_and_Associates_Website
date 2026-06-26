const nodemailer = require('nodemailer');

let transporter;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('Nodemailer SMTP Transporter configured.');
} else {
  // Fallback / Development transporter that prints emails to console
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('==================================================');
      console.log('EMAIL SIMULATION (SMTP configuration missing)');
      console.log(`To:      ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body:    ${mailOptions.text || mailOptions.html}`);
      console.log('==================================================');
      return { messageId: 'simulated-id-' + Date.now() };
    }
  };
  console.log('Nodemailer using simulated console-log transporter.');
}

module.exports = transporter;

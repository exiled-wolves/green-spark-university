const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Send admission acceptance email to a newly admitted student.
 * Called by the admin controller when an application is accepted.
 */
const sendAdmissionEmail = async ({ to, fullName, loginId, password, department }) => {
  const mailOptions = {
    from:    process.env.MAIL_FROM || '"Green Spark University" <no-reply@greensparkuni.edu.ng>',
    to,
    subject: 'Congratulations! Your Admission to Green Spark University',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F8F9FA;padding:32px;border-radius:8px;">
        <div style="background:#0A1F44;padding:20px 32px;border-radius:6px 6px 0 0;">
          <h2 style="color:#C9A227;margin:0;">Green Spark University</h2>
          <p style="color:#ffffff;margin:4px 0 0;">Office of Admissions</p>
        </div>
        <div style="background:#ffffff;padding:32px;border-radius:0 0 6px 6px;border:1px solid #dee2e6;">
          <p style="color:#1C1C1C;">Dear <strong>${fullName}</strong>,</p>
          <p style="color:#1C1C1C;">
            We are delighted to inform you that your application to study
            <strong>${department}</strong> at Green Spark University has been
            <span style="color:#1F4E79;font-weight:bold;">accepted</span>.
          </p>
          <div style="background:#E8F0FE;border-left:4px solid #0A1F44;padding:16px 20px;margin:24px 0;border-radius:4px;">
            <p style="margin:0 0 8px;color:#0A1F44;font-weight:bold;">Your Login Credentials</p>
            <p style="margin:4px 0;color:#1C1C1C;">Login ID: <strong style="color:#1F4E79;">${loginId}</strong></p>
            <p style="margin:4px 0;color:#1C1C1C;">Password: <strong style="color:#1F4E79;">${password}</strong></p>
          </div>
          <p style="color:#D9534F;font-size:14px;">
            ⚠️ For your security, you will be required to change your password on first login.
          </p>
          <p style="color:#1C1C1C;">
            Please visit the student portal at
            <a href="http://localhost:5173" style="color:#1F4E79;">Green Spark University Portal</a>
            to complete your registration and register your courses.
          </p>
          <p style="color:#1C1C1C;margin-top:32px;">
            Congratulations once again and welcome to the GSU family!
          </p>
          <p style="color:#1C1C1C;">
            Regards,<br/>
            <strong>The Admissions Office</strong><br/>
            Green Spark University
          </p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter Error:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});
  transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter Error:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});
};

/**
 * Send rejection email to an applicant.
 */
const sendRejectionEmail = async ({ to, fullName, department }) => {
  const mailOptions = {
    from:    process.env.MAIL_FROM || '"Green Spark University" <no-reply@greensparkuni.edu.ng>',
    to,
    subject: 'Update on Your Application — Green Spark University',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F8F9FA;padding:32px;border-radius:8px;">
        <div style="background:#0A1F44;padding:20px 32px;border-radius:6px 6px 0 0;">
          <h2 style="color:#C9A227;margin:0;">Green Spark University</h2>
          <p style="color:#ffffff;margin:4px 0 0;">Office of Admissions</p>
        </div>
        <div style="background:#ffffff;padding:32px;border-radius:0 0 6px 6px;border:1px solid #dee2e6;">
          <p style="color:#1C1C1C;">Dear <strong>${fullName}</strong>,</p>
          <p style="color:#1C1C1C;">
            Thank you for your interest in studying <strong>${department}</strong>
            at Green Spark University.
          </p>
          <p style="color:#1C1C1C;">
            After careful review of your application, we regret to inform you that
            we are unable to offer you admission at this time.
          </p>
          <p style="color:#1C1C1C;">
            We encourage you to consider applying again in a future academic session.
            We wish you the very best in your academic pursuits.
          </p>
          <p style="color:#1C1C1C;margin-top:32px;">
            Regards,<br/>
            <strong>The Admissions Office</strong><br/>
            Green Spark University
          </p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendAdmissionEmail, sendRejectionEmail };
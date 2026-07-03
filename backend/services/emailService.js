/**
 * emailService.js
 * ─────────────────────────────────────────────────────────────
 * Centralised Resend email service for AI InfoWave.
 * All emails in the app go through this file.
 * ─────────────────────────────────────────────────────────────
 */

const { Resend } = require('resend');

// Initialise Resend client with your API key from .env
let resend;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn('⚠️ RESEND_API_KEY is not defined in the backend environment variables. Email sending is disabled.');
}

// Who emails are sent FROM (set in .env)
const FROM = process.env.RESEND_FROM || 'AI InfoWave <hrmanager@aiinfowave.com>';

// ─────────────────────────────────────────────────────────────
// HELPER: send a single email via Resend
// ─────────────────────────────────────────────────────────────
const sendMail = async ({ to, subject, html }) => {
  try {
    if (!resend) {
      console.warn(`⚠️ Email send skipped (Resend client offline) | To: ${to} | Subject: ${subject}`);
      return;
    }
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('❌ Resend error:', error);
    } else {
      console.log(`✅ Email sent to ${to} | id: ${data.id}`);
    }
  } catch (err) {
    console.error('❌ emailService crash:', err.message);
  }
};


// ─────────────────────────────────────────────────────────────
// 1. OTP VERIFICATION EMAIL  (sent after registration)
// ─────────────────────────────────────────────────────────────
const sendOTPEmail = async (email, name, otp) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { margin:0; padding:0; background:#f4f7ff; font-family:'Segoe UI',Arial,sans-serif; }
      .wrap { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(37,99,235,.10); }
      .header { background:linear-gradient(135deg,#2563eb,#7c3aed); padding:40px 40px 32px; text-align:center; }
      .header h1 { margin:0; color:#fff; font-size:28px; font-weight:700; letter-spacing:-0.5px; }
      .header p { margin:8px 0 0; color:rgba(255,255,255,.8); font-size:15px; }
      .body { padding:40px; }
      .hi { font-size:18px; font-weight:600; color:#0f172a; margin:0 0 16px; }
      .text { font-size:15px; color:#475569; line-height:1.7; margin:0 0 32px; }
      .otp-box { background:#f0f4ff; border:2px dashed #2563eb; border-radius:14px; padding:24px; text-align:center; margin-bottom:32px; }
      .otp-box .otp { font-size:44px; font-weight:800; letter-spacing:12px; color:#2563eb; font-family:monospace; }
      .otp-box .expires { font-size:13px; color:#64748b; margin:10px 0 0; }
      .note { background:#fff7ed; border-left:4px solid #f59e0b; border-radius:4px; padding:14px 18px; font-size:13px; color:#92400e; }
      .footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>AI InfoWave</h1>
        <p>Verify your email address</p>
      </div>
      <div class="body">
        <p class="hi">Hello, ${name}! 👋</p>
        <p class="text">
          Thanks for signing up with <strong>AI InfoWave</strong>. To activate your account, 
          please enter the verification code below on the verification page.
        </p>
        <div class="otp-box">
          <div class="otp">${otp}</div>
          <div class="expires">⏱ This code expires in <strong>5 minutes</strong></div>
        </div>
        <div class="note">
          🔒 If you didn't create an account with AI InfoWave, you can safely ignore this email.
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} AI InfoWave. All rights reserved.<br/>
        This is an automated email — please do not reply.
      </div>
    </div>
  </body>
  </html>`;

  await sendMail({
    to: email,
    subject: 'Your AI InfoWave Verification Code',
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// 2. FORGOT PASSWORD OTP EMAIL
// ─────────────────────────────────────────────────────────────
const sendForgotPasswordOTP = async (email, name, otp) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { margin:0; padding:0; background:#f4f7ff; font-family:'Segoe UI',Arial,sans-serif; }
      .wrap { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(37,99,235,.10); }
      .header { background:linear-gradient(135deg,#7c3aed,#db2777); padding:40px 40px 32px; text-align:center; }
      .header h1 { margin:0; color:#fff; font-size:28px; font-weight:700; }
      .header p { margin:8px 0 0; color:rgba(255,255,255,.8); font-size:15px; }
      .body { padding:40px; }
      .hi { font-size:18px; font-weight:600; color:#0f172a; margin:0 0 16px; }
      .text { font-size:15px; color:#475569; line-height:1.7; margin:0 0 32px; }
      .otp-box { background:#fdf4ff; border:2px dashed #7c3aed; border-radius:14px; padding:24px; text-align:center; margin-bottom:32px; }
      .otp-box .otp { font-size:44px; font-weight:800; letter-spacing:12px; color:#7c3aed; font-family:monospace; }
      .otp-box .expires { font-size:13px; color:#64748b; margin:10px 0 0; }
      .note { background:#fff7ed; border-left:4px solid #f59e0b; border-radius:4px; padding:14px 18px; font-size:13px; color:#92400e; }
      .footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>AI InfoWave</h1>
        <p>Password Reset Request</p>
      </div>
      <div class="body">
        <p class="hi">Hello, ${name}! 🔑</p>
        <p class="text">
          We received a request to reset your <strong>AI InfoWave</strong> password. 
          Use the code below on the password reset page. This is only valid for <strong>5 minutes</strong>.
        </p>
        <div class="otp-box">
          <div class="otp">${otp}</div>
          <div class="expires">⏱ This code expires in <strong>5 minutes</strong></div>
        </div>
        <div class="note">
          🔒 If you did not request a password reset, please ignore this email. 
          Your account is safe.
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} AI InfoWave. All rights reserved.<br/>
        This is an automated email — please do not reply.
      </div>
    </div>
  </body>
  </html>`;

  await sendMail({
    to: email,
    subject: 'AI InfoWave — Password Reset Code',
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// 3. CONTACT FORM — Admin notification
// ─────────────────────────────────────────────────────────────
const sendContactEmail = async ({ name, email, subject, message }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { margin:0; padding:0; background:#f4f7ff; font-family:'Segoe UI',Arial,sans-serif; }
      .wrap { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(37,99,235,.10); }
      .header { background:linear-gradient(135deg,#0f172a,#1e40af); padding:32px 40px; }
      .header h1 { margin:0; color:#fff; font-size:22px; font-weight:700; }
      .header p { margin:6px 0 0; color:rgba(255,255,255,.65); font-size:13px; }
      .body { padding:40px; }
      .row { display:flex; gap:12px; margin-bottom:20px; }
      .label { font-size:12px; font-weight:700; text-transform:uppercase; color:#94a3b8; letter-spacing:1px; margin-bottom:6px; }
      .value { font-size:15px; color:#0f172a; font-weight:500; }
      .msg-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-top:24px; }
      .msg-box .label { margin-bottom:12px; }
      .msg-text { font-size:15px; color:#334155; line-height:1.7; white-space:pre-wrap; }
      .footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:20px 40px; text-align:center; font-size:12px; color:#94a3b8; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>📬 New Contact Form Submission</h1>
        <p>AI InfoWave Website · ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      </div>
      <div class="body">
        <div style="margin-bottom:20px;">
          <div class="label">From</div>
          <div class="value">${name} &lt;${email}&gt;</div>
        </div>
        <div style="margin-bottom:20px;">
          <div class="label">Subject</div>
          <div class="value">${subject}</div>
        </div>
        <div class="msg-box">
          <div class="label">Message</div>
          <div class="msg-text">${message}</div>
        </div>
      </div>
      <div class="footer">
        Reply directly to ${email} to respond to this message.
      </div>
    </div>
  </body>
  </html>`;

  await sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: `[Contact] ${subject} — from ${name}`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// 4. INTERNSHIP APPLICATION CONFIRMATION (to applicant)
// ─────────────────────────────────────────────────────────────
const sendInternshipConfirmation = async ({ email, name, role }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { margin:0; padding:0; background:#f4f7ff; font-family:'Segoe UI',Arial,sans-serif; }
      .wrap { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(37,99,235,.10); }
      .header { background:linear-gradient(135deg,#059669,#0891b2); padding:40px; text-align:center; }
      .header h1 { margin:0; color:#fff; font-size:26px; font-weight:700; }
      .header p { margin:8px 0 0; color:rgba(255,255,255,.8); }
      .body { padding:40px; }
      .hi { font-size:18px; font-weight:600; color:#0f172a; margin:0 0 16px; }
      .text { font-size:15px; color:#475569; line-height:1.7; margin:0 0 24px; }
      .badge { display:inline-block; background:#ecfdf5; border:1px solid #6ee7b7; color:#065f46; padding:10px 20px; border-radius:100px; font-size:15px; font-weight:700; margin:0 0 28px; }
      .steps { background:#f8fafc; border-radius:12px; padding:24px; margin-bottom:24px; }
      .step { display:flex; gap:14px; margin-bottom:16px; align-items:flex-start; }
      .step:last-child { margin-bottom:0; }
      .step-num { background:#2563eb; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; }
      .step-text { font-size:14px; color:#334155; line-height:1.5; padding-top:4px; }
      .footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>Application Received! 🎉</h1>
        <p>AI InfoWave Internship Program</p>
      </div>
      <div class="body">
        <p class="hi">Dear ${name},</p>
        <p class="text">
          Congratulations! We've successfully received your application for the 
          <strong>${role}</strong> internship at AI InfoWave. 
          Our team will review your profile and reach out to you shortly.
        </p>
        <div>
          <span class="badge">✅ ${role}</span>
        </div>
        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-text"><strong>Application Review</strong> — Our team reviews your resume and profile (3–5 business days)</div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-text"><strong>Technical Screening</strong> — We evaluate your GitHub, portfolio, and skills</div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-text"><strong>Interview</strong> — A quick video call with our engineering team</div>
          </div>
        </div>
        <p class="text" style="margin:0;">
          Best of luck, ${name}! We're excited to learn more about you. 🚀
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} AI InfoWave · Questions? Reply to this email.<br/>
        AI InfoWave, Saskatoon, SK, Canada
      </div>
    </div>
  </body>
  </html>`;

  await sendMail({
    to: email,
    subject: `Application Received — ${role} Internship | AI InfoWave`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// 5. INTERNSHIP APPLICATION NOTIFICATION (to admin)
// ─────────────────────────────────────────────────────────────
const sendInternshipNotification = async ({ fullName, email, phone, internshipRole, resumeUrl }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"/>
  <style>
    body { margin:0; padding:0; background:#f4f7ff; font-family:'Segoe UI',Arial,sans-serif; }
    .wrap { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(37,99,235,.10); }
    .header { background:linear-gradient(135deg,#0f172a,#1e40af); padding:28px 40px; }
    .header h1 { margin:0; color:#fff; font-size:20px; font-weight:700; }
    .body { padding:40px; }
    .field { margin-bottom:18px; }
    .label { font-size:11px; font-weight:700; text-transform:uppercase; color:#94a3b8; letter-spacing:1px; }
    .value { font-size:15px; color:#0f172a; margin-top:4px; }
    .btn { display:inline-block; background:#2563eb; color:#fff; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:700; margin-top:24px; }
    .footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:20px 40px; text-align:center; font-size:12px; color:#94a3b8; }
  </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header"><h1>🎓 New Internship Application</h1></div>
      <div class="body">
        <div class="field"><div class="label">Applicant Name</div><div class="value">${fullName}</div></div>
        <div class="field"><div class="label">Email</div><div class="value">${email}</div></div>
        <div class="field"><div class="label">Phone</div><div class="value">${phone}</div></div>
        <div class="field"><div class="label">Applied For</div><div class="value">${internshipRole}</div></div>
        <a href="${resumeUrl}" class="btn">📄 View Resume</a>
      </div>
      <div class="footer">&copy; ${new Date().getFullYear()} AI InfoWave Admin Portal</div>
    </div>
  </body>
  </html>`;

  await sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Internship Application: ${internshipRole} — ${fullName}`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// 6. JOB APPLICATION CONFIRMATION (to applicant)
// ─────────────────────────────────────────────────────────────
const sendJobConfirmation = async ({ email, name, jobTitle }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"/>
  <style>
    body { margin:0; padding:0; background:#f4f7ff; font-family:'Segoe UI',Arial,sans-serif; }
    .wrap { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(37,99,235,.10); }
    .header { background:linear-gradient(135deg,#2563eb,#7c3aed); padding:40px; text-align:center; }
    .header h1 { margin:0; color:#fff; font-size:26px; font-weight:700; }
    .header p { margin:8px 0 0; color:rgba(255,255,255,.8); }
    .body { padding:40px; }
    .text { font-size:15px; color:#475569; line-height:1.7; margin:0 0 20px; }
    .badge { display:inline-block; background:#eff6ff; border:1px solid #bfdbfe; color:#1d4ed8; padding:10px 20px; border-radius:100px; font-size:15px; font-weight:700; margin:0 0 28px; }
    .footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; }
  </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>Application Received! 🎉</h1>
        <p>AI InfoWave Careers</p>
      </div>
      <div class="body">
        <p class="text"><strong>Dear ${name},</strong></p>
        <p class="text">
          Thank you for applying for the <strong>${jobTitle}</strong> position at AI InfoWave. 
          Our hiring team will review your application and reach out within 5–7 business days.
        </p>
        <span class="badge">💼 ${jobTitle}</span>
        <p class="text">Best of luck — we're looking forward to learning more about you!</p>
      </div>
      <div class="footer">&copy; ${new Date().getFullYear()} AI InfoWave · Saskatoon, SK, Canada</div>
    </div>
  </body>
  </html>`;

  await sendMail({
    to: email,
    subject: `Application Received — ${jobTitle} | AI InfoWave`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// 7. JOB APPLICATION NOTIFICATION (to admin)
// ─────────────────────────────────────────────────────────────
const sendJobNotification = async ({ fullName, email, phone, jobTitle, department, linkedin, coverLetter, resumeUrl }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"/>
  <style>
    body { margin:0; padding:0; background:#f4f7ff; font-family:'Segoe UI',Arial,sans-serif; }
    .wrap { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(37,99,235,.10); }
    .header { background:linear-gradient(135deg,#0f172a,#7c3aed); padding:28px 40px; }
    .header h1 { margin:0; color:#fff; font-size:20px; font-weight:700; }
    .body { padding:40px; }
    .field { margin-bottom:18px; }
    .label { font-size:11px; font-weight:700; text-transform:uppercase; color:#94a3b8; letter-spacing:1px; }
    .value { font-size:15px; color:#0f172a; margin-top:4px; }
    .cover { background:#f8fafc; border-radius:12px; padding:20px; margin:20px 0; font-size:14px; color:#334155; white-space:pre-wrap; line-height:1.7; }
    .btn { display:inline-block; background:#7c3aed; color:#fff; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:700; margin-top:24px; }
    .footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:20px 40px; text-align:center; font-size:12px; color:#94a3b8; }
  </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header"><h1>💼 New Job Application</h1></div>
      <div class="body">
        <div class="field"><div class="label">Name</div><div class="value">${fullName}</div></div>
        <div class="field"><div class="label">Email</div><div class="value">${email}</div></div>
        <div class="field"><div class="label">Phone</div><div class="value">${phone}</div></div>
        <div class="field"><div class="label">Position</div><div class="value">${jobTitle} · ${department}</div></div>
        ${linkedin ? `<div class="field"><div class="label">LinkedIn</div><div class="value"><a href="${linkedin}">${linkedin}</a></div></div>` : ''}
        <div class="field"><div class="label">Cover Letter</div><div class="cover">${coverLetter}</div></div>
        <a href="${resumeUrl}" class="btn">📄 View Resume</a>
      </div>
      <div class="footer">&copy; ${new Date().getFullYear()} AI InfoWave Admin Portal</div>
    </div>
  </body>
  </html>`;

  await sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Job Application: ${jobTitle} — ${fullName}`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// 8. CONSULTATION BOOKING CONFIRMATION (to client)
// ─────────────────────────────────────────────────────────────
const sendBookingConfirmation = async ({ email, name, service, date, timeSlot }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { margin:0; padding:0; background:#f4f7ff; font-family:'Segoe UI',Arial,sans-serif; }
      .wrap { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(37,99,235,.10); }
      .header { background:linear-gradient(135deg,#1e3a8a,#2563eb); padding:40px; text-align:center; }
      .header h1 { margin:0; color:#fff; font-size:26px; font-weight:700; }
      .header p { margin:8px 0 0; color:rgba(255,255,255,.8); font-size:15px; }
      .body { padding:40px; }
      .hi { font-size:18px; font-weight:600; color:#0f172a; margin:0 0 16px; }
      .text { font-size:15px; color:#475569; line-height:1.7; margin:0 0 24px; }
      .details-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:24px; margin-bottom:24px; }
      .detail-row { display:flex; margin-bottom:12px; border-bottom:1px solid #f1f5f9; padding-bottom:12px; }
      .detail-row:last-child { margin-bottom:0; border-bottom:none; padding-bottom:0; }
      .detail-label { width:120px; font-size:12px; font-weight:700; text-transform:uppercase; color:#94a3b8; letter-spacing:0.5px; }
      .detail-val { flex:1; font-size:14px; color:#334155; font-weight:500; }
      .note { background:#eff6ff; border-left:4px solid #2563eb; border-radius:4px; padding:14px 18px; font-size:13px; color:#1e40af; }
      .footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>Booking Confirmed! 🎉</h1>
        <p>Your AI InfoWave Consultation</p>
      </div>
      <div class="body">
        <p class="hi">Dear ${name},</p>
        <p class="text">
          Thank you for scheduling a free consultation with AI InfoWave. We are excited to connect and learn more about your needs. Here are your booking details:
        </p>
        <div class="details-box">
          <div class="detail-row">
            <div class="detail-label">Service</div>
            <div class="detail-val">${service}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Date</div>
            <div class="detail-val">${date}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Time Slot</div>
            <div class="detail-val">${timeSlot} (IST)</div>
          </div>
        </div>
        <div class="note">
          💻 A video conference link will be sent to you shortly before the meeting. Please make sure to be on time.
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} AI InfoWave. Saskatoon, SK, Canada.<br/>
        Need to reschedule? Reply directly to this email.
      </div>
    </div>
  </body>
  </html>`;

  await sendMail({
    to: email,
    subject: `Consultation Confirmed: ${service} — AI InfoWave`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// 9. CONSULTATION BOOKING NOTIFICATION (to admin)
// ─────────────────────────────────────────────────────────────
const sendBookingAdminNotification = async ({ name, email, phone, service, date, timeSlot, details }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { margin:0; padding:0; background:#f4f7ff; font-family:'Segoe UI',Arial,sans-serif; }
      .wrap { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(37,99,235,.10); }
      .header { background:linear-gradient(135deg,#0f172a,#1e3a8a); padding:32px 40px; }
      .header h1 { margin:0; color:#fff; font-size:22px; font-weight:700; }
      .header p { margin:6px 0 0; color:rgba(255,255,255,.65); font-size:13px; }
      .body { padding:40px; }
      .field { margin-bottom:18px; }
      .label { font-size:11px; font-weight:700; text-transform:uppercase; color:#94a3b8; letter-spacing:1px; }
      .value { font-size:15px; color:#0f172a; margin-top:4px; font-weight:500; }
      .msg-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-top:20px; }
      .msg-box .label { margin-bottom:8px; }
      .msg-text { font-size:14px; color:#334155; line-height:1.6; white-space:pre-wrap; }
      .footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:20px 40px; text-align:center; font-size:12px; color:#94a3b8; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>🗓 New Consultation Booking</h1>
        <p>AI InfoWave Website · ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      </div>
      <div class="body">
        <div class="field">
          <div class="label">Client Name</div>
          <div class="value">${name}</div>
        </div>
        <div class="field">
          <div class="label">Contact Info</div>
          <div class="value">Email: ${email} | Phone: ${phone}</div>
        </div>
        <div class="field">
          <div class="label">Requested Service</div>
          <div class="value">${service}</div>
        </div>
        <div class="field">
          <div class="label">Date & Time</div>
          <div class="value">${date} at ${timeSlot}</div>
        </div>
        ${details ? `
        <div class="msg-box">
          <div class="label">Client Message / Project Details</div>
          <div class="msg-text">${details}</div>
        </div>
        ` : ''}
      </div>
      <div class="footer">
        Reply to ${email} to communicate with the client.
      </div>
    </div>
  </body>
  </html>`;

  await sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: `[Booking] ${service} — ${name} (${date})`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// 10. PROJECT CALL CONFIRMATION (to applicant)
// ─────────────────────────────────────────────────────────────
const sendProjectCallConfirmation = async ({ email, name, projectTitle }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { margin:0; padding:0; background:#f4f7ff; font-family:'Segoe UI',Arial,sans-serif; }
      .wrap { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(37,99,235,.10); }
      .header { background:linear-gradient(135deg,#2563eb,#7c3aed); padding:40px 40px 32px; text-align:center; }
      .header h1 { margin:0; color:#fff; font-size:26px; font-weight:700; }
      .header p { margin:8px 0 0; color:rgba(255,255,255,.8); font-size:14px; }
      .body { padding:40px; }
      .hi { font-size:18px; font-weight:600; color:#0f172a; margin:0 0 16px; }
      .text { font-size:15px; color:#475569; line-height:1.7; margin:0 0 24px; }
      .details-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:24px; }
      .detail-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9; }
      .detail-row:last-child { border-bottom:none; }
      .detail-label { font-weight:600; color:#64748b; font-size:13px; }
      .detail-val { color:#0f172a; font-size:14px; font-weight:500; }
      .note { background:#fff7ed; border-left:4px solid #f59e0b; border-radius:4px; padding:14px; font-size:13px; color:#92400e; }
      .footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>Project Application Received! 🚀</h1>
        <p>AI InfoWave Open Project Call</p>
      </div>
      <div class="body">
        <p class="hi">Dear ${name},</p>
        <p class="text">
          Thank you for submitting your research proposal to the AI InfoWave Open Project Call. Our scientific committee and computational infrastructure team will review your proposal under strict NDA guidelines.
        </p>
        <div class="details-box">
          <div class="detail-row">
            <div class="detail-label">Project Title</div>
            <div class="detail-val">${projectTitle}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Submission Status</div>
            <div class="detail-val">Under Review</div>
          </div>
        </div>
        <div class="note">
          🔒 Our team will contact you within 3–5 business days to discuss potential alignment and infrastructure support.
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} AI InfoWave. All rights reserved.<br/>
        If you have any questions, please reply directly to this email.
      </div>
    </div>
  </body>
  </html>`;

  await sendMail({
    to: email,
    subject: `Project Proposal Received: ${projectTitle} — AI InfoWave`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// 11. PROJECT CALL NOTIFICATION (to admin)
// ─────────────────────────────────────────────────────────────
const sendProjectCallNotification = async ({ name, email, institution, title, researchArea, summary, timeline }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { margin:0; padding:0; background:#f4f7ff; font-family:'Segoe UI',Arial,sans-serif; }
      .wrap { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(37,99,235,.10); }
      .header { background:linear-gradient(135deg,#0f172a,#1e3a8a); padding:32px 40px; }
      .header h1 { margin:0; color:#fff; font-size:22px; font-weight:700; }
      .header p { margin:6px 0 0; color:rgba(255,255,255,.65); font-size:13px; }
      .body { padding:40px; }
      .field { margin-bottom:18px; }
      .label { font-size:11px; font-weight:700; text-transform:uppercase; color:#94a3b8; letter-spacing:1px; }
      .value { font-size:15px; color:#0f172a; margin-top:4px; font-weight:500; }
      .msg-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-top:20px; }
      .msg-box .label { margin-bottom:8px; }
      .msg-text { font-size:14px; color:#334155; line-height:1.6; white-space:pre-wrap; }
      .footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:20px 40px; text-align:center; font-size:12px; color:#94a3b8; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>🔬 New Project Call Submission</h1>
        <p>AI InfoWave Website · ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      </div>
      <div class="body">
        <div class="field">
          <div class="label">Researcher Name</div>
          <div class="value">${name}</div>
        </div>
        <div class="field">
          <div class="label">Contact Info</div>
          <div class="value">Email: ${email} | Institution: ${institution}</div>
        </div>
        <div class="field">
          <div class="label">Project Title</div>
          <div class="value">${title}</div>
        </div>
        <div class="field">
          <div class="label">Research Area</div>
          <div class="value">${researchArea}</div>
        </div>
        <div class="field">
          <div class="label">Proposed Timeline</div>
          <div class="value">${timeline}</div>
        </div>
        <div class="msg-box">
          <div class="label">Project Abstract & Infrastructure Requirements</div>
          <div class="msg-text">${summary}</div>
        </div>
      </div>
      <div class="footer">
        Reply to ${email} to communicate with the researcher.
      </div>
    </div>
  </body>
  </html>`;

  await sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: `[Project Call] ${title} — ${name}`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
  sendOTPEmail,
  sendForgotPasswordOTP,
  sendContactEmail,
  sendInternshipConfirmation,
  sendInternshipNotification,
  sendJobConfirmation,
  sendJobNotification,
  sendBookingConfirmation,
  sendBookingAdminNotification,
  sendProjectCallConfirmation,
  sendProjectCallNotification,
};



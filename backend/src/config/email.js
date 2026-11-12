
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Campus Ride" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Campus Ride - Password Reset OTP',
    text: `Your password reset code is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2 style="color: #FF781F;">Campus Ride</h2>
        <p>You requested to reset your password.</p>
        <h1 style="letter-spacing: 8px; color: #FF781F;">${otp}</h1>
        <p>This code expires in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };

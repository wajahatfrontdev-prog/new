const nodemailer = require('nodemailer');

// Create transporter based on environment configuration
const createTransporter = () => {
  // Check if using SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }
  
  // Check if using AWS SES
  if (process.env.AWS_SES_REGION) {
    return nodemailer.createTransport({
      host: `email-smtp.${process.env.AWS_SES_REGION}.amazonaws.com`,
      port: 587,
      secure: false,
      auth: {
        user: process.env.AWS_SES_ACCESS_KEY,
        pass: process.env.AWS_SES_SECRET_KEY,
      },
    });
  }
  
  // Fallback to Gmail or custom SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

// Send email verification
exports.sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@icare.com',
    to: email,
    subject: 'Verify Your Email - iCare Virtual Hospital',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to iCare Virtual Hospital!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with iCare. Please verify your email address to access all features of the platform.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #7f8c8d; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #e74c3c; font-size: 14px;">This link will expire in 24 hours.</p>
        <hr style="border: 1px solid #ecf0f1; margin: 30px 0;">
        <p style="color: #7f8c8d; font-size: 12px;">
          If you didn't create an account with iCare, please ignore this email.
        </p>
      </div>
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after verification
exports.sendWelcomeEmail = async (email, name, role) => {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@icare.com',
    to: email,
    subject: 'Welcome to iCare Virtual Hospital!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Email Verified Successfully!</h2>
        <p>Hi ${name},</p>
        <p>Your email has been verified. Welcome to iCare Virtual Hospital Platform!</p>
        <p>As a <strong>${role}</strong>, you now have access to:</p>
        ${role === 'Patient' ? `
          <ul>
            <li>Book appointments with verified doctors</li>
            <li>Access your prescriptions and medical records</li>
            <li>View lab reports</li>
            <li>Track your health journey</li>
          </ul>
        ` : role === 'Doctor' ? `
          <ul>
            <li>Manage patient consultations</li>
            <li>Create prescriptions and SOAP notes</li>
            <li>Order lab tests</li>
            <li>Access patient medical records</li>
          </ul>
        ` : `
          <ul>
            <li>Access your personalized dashboard</li>
            <li>Manage your healthcare activities</li>
            <li>Connect with healthcare providers</li>
          </ul>
        `}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <hr style="border: 1px solid #ecf0f1; margin: 30px 0;">
        <p style="color: #7f8c8d; font-size: 12px;">
          Need help? Contact our support team at support@icare.com
        </p>
      </div>
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

import nodemailer from 'nodemailer';

// Create transporter - configure based on your email provider
const createTransporter = () => {
  // For development/testing, use ethereal email or configure your SMTP
  // For production, use services like SendGrid, AWS SES, Gmail, etc.
  
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  return nodemailer.createTransport(config);
};

// Email templates
const templates = {
  verification: (otp, name) => ({
    subject: 'Verify Your Email - LinkSnip',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">LinkSnip</h1>
          </div>
          <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #18181b; margin: 0 0 16px;">Hi ${name || 'there'}! 👋</h2>
            <p style="color: #71717a; line-height: 1.6; margin: 0 0 24px;">
              Welcome to LinkSnip! Please verify your email address by entering the code below:
            </p>
            <div style="background: linear-gradient(135deg, #f4f4f5 0%, #e4e4e7 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6366f1;">${otp}</span>
            </div>
            <p style="color: #71717a; font-size: 14px; margin: 0 0 8px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
              If you didn't create an account with LinkSnip, please ignore this email.
            </p>
          </div>
          <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
            © ${new Date().getFullYear()} LinkSnip. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name || 'there'}! Your LinkSnip verification code is: ${otp}. This code expires in 10 minutes.`,
  }),

  passwordReset: (otp, name) => ({
    subject: 'Reset Your Password - LinkSnip',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">LinkSnip</h1>
          </div>
          <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #18181b; margin: 0 0 16px;">Password Reset Request 🔐</h2>
            <p style="color: #71717a; line-height: 1.6; margin: 0 0 24px;">
              Hi ${name || 'there'}, we received a request to reset your password. Enter the code below to proceed:
            </p>
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ef4444;">${otp}</span>
            </div>
            <p style="color: #71717a; font-size: 14px; margin: 0 0 8px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
          </div>
          <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
            © ${new Date().getFullYear()} LinkSnip. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name || 'there'}! Your password reset code is: ${otp}. This code expires in 10 minutes.`,
  }),
};

// Send email function
export const sendEmail = async (to, type, data = {}) => {
  try {
    const transporter = createTransporter();
    
    let emailContent;
    switch (type) {
      case 'verification':
        emailContent = templates.verification(data.otp, data.name);
        break;
      case 'password_reset':
        emailContent = templates.passwordReset(data.otp, data.name);
        break;
      default:
        throw new Error('Invalid email type');
    }

    const mailOptions = {
      from: `"LinkSnip" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    // Don't throw - let the caller handle gracefully
    return { success: false, error: error.message };
  }
};

export default { sendEmail };

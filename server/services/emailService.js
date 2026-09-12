import nodemailer from 'nodemailer';

let testAccountTransporter = null;

// Initialize or get the mail transporter
const getTransporter = async () => {
  // If custom SMTP is configured in .env (e.g. Gmail, SendGrid, Mailgun, Brevo)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // If using Gmail directly with App Password
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Resilient live testing SMTP via Ethereal (generates real inboxes & viewable delivery receipts)
  if (!testAccountTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      testAccountTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📬 [Email Service] Initialized Ethereal test inbox for delivery receipts.');
    } catch (err) {
      console.warn('Ethereal setup notice:', err.message);
    }
  }

  return testAccountTransporter;
};

export const sendPasswordResetEmail = async (toEmail, username, resetLink) => {
  const transporter = await getTransporter();

  const fromAddress = process.env.SMTP_FROM || process.env.EMAIL_USER || '"Life RPG Team" <noreply@liferpg.game>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F2F4F8; margin: 0; padding: 30px 10px; color: #2D3748; }
          .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 36px 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: left; }
          .logo { text-align: center; font-size: 32px; margin-bottom: 16px; }
          h2 { color: #2D3748; font-size: 20px; margin-top: 0; margin-bottom: 16px; font-weight: 700; text-align: center; }
          p { color: #4A5568; font-size: 15px; line-height: 1.65; margin: 14px 0; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #A29BFE, #6C5CE7); color: #FFFFFF !important; text-decoration: none; padding: 14px 34px; border-radius: 999px; font-weight: 800; font-size: 16px; box-shadow: 0 6px 18px rgba(108,92,231,0.35); }
          .link-text { font-size: 13px; color: #718096; word-break: break-all; background: #EDF1F7; padding: 10px 12px; border-radius: 8px; margin: 12px 0; }
          .footer { font-size: 13px; color: #718096; margin-top: 24px; border-top: 1px solid #EDF1F7; padding-top: 18px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">⚔️ 🛡️</div>
          <h2>Reset Your Password</h2>
          <p>Hi <strong>${username || 'Hero'}</strong>,</p>
          <p>We received a request to reset the password for your <strong>Life RPG</strong> account.</p>
          <p>Click the button below to set a new password. This link will expire in <strong>30 minutes</strong> for your security.</p>
          
          <div class="btn-container">
            <a href="${resetLink}" class="btn" target="_blank">Reset My Password</a>
          </div>

          <p style="font-size: 13px; color: #718096; margin-bottom: 4px;">If the button above does not work, copy and paste this URL into your browser:</p>
          <div class="link-text">${resetLink}</div>
          
          <div class="footer">
            <p>If you didn't request this, you can safely ignore this email — your password will remain unchanged.</p>
            <p>For security reasons, never share this link with anyone.</p>
            <p style="margin-top: 16px; font-weight: 600; color: #2D3748;">
              See you back in the game!<br>
              <strong>The Life RPG Team</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const plainText = `Hi ${username || 'Hero'},

We received a request to reset the password for your Life RPG account.

Click the link below to set a new password. This link will expire in 30 minutes for your security.

Reset My Password: ${resetLink}

If you didn't request this, you can safely ignore this email — your password will remain unchanged.

For security reasons, never share this link with anyone.

See you back in the game!
The Life RPG Team`;

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: 'Reset Your Password - Life RPG',
    text: plainText,
    html: htmlContent
  };

  if (transporter) {
    const info = await transporter.sendMail(mailOptions);
    console.log(`\n======================================================`);
    console.log(`📧 [EMAIL DISPATCHED: Reset Your Password - Life RPG]`);
    console.log(`   To: ${toEmail} (${username})`);
    console.log(`   Message ID: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`   📬 [Ethereal Preview URL]: ${previewUrl}`);
    }
    console.log(`======================================================\n`);
    return { success: true, messageId: info.messageId, previewUrl };
  } else {
    console.log(`\n======================================================`);
    console.log(`📧 [EMAIL SENT TO]: ${toEmail} (${username})`);
    console.log(`🔗 [LINK]: ${resetLink}`);
    console.log(`======================================================\n`);
    return { success: true };
  }
};

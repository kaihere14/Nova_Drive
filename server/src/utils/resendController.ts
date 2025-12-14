import { Resend } from 'resend';
import { logger } from "../index.js";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendOtpEmailParams {
  email: string;
  otp: string;
}

export const sendOtpEmail = async ({ email, otp }: SendOtpEmailParams) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'NovaDrive <no-reply@pawpick.store>',
      to: [email],
      subject: 'Verify Your Email - NovaDrive',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                          🚀 NovaDrive
                        </h1>
                        <p style="margin: 10px 0 0 0; color: #93c5fd; font-size: 14px; font-family: 'Courier New', monospace;">
                          SECURE_CLOUD_STORAGE
                        </p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #fafafa; font-size: 24px; font-weight: 600;">
                          Verify Your Email Address
                        </h2>
                        <p style="margin: 0 0 30px 0; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                          Thank you for signing up with NovaDrive! To complete your registration, please use the verification code below:
                        </p>

                        <!-- OTP Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td align="center" style="background-color: #27272a; border: 2px solid #3b82f6; border-radius: 12px; padding: 30px;">
                              <p style="margin: 0 0 10px 0; color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;">
                                YOUR VERIFICATION CODE
                              </p>
                              <div style="font-size: 42px; font-weight: 700; color: #3b82f6; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                ${otp}
                              </div>
                            </td>
                          </tr>
                        </table>

                        <!-- Expiry Notice -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #27272a; border-left: 4px solid #ef4444; border-radius: 8px;">
                          <tr>
                            <td style="padding: 20px;">
                              <p style="margin: 0; color: #fca5a5; font-size: 14px; line-height: 1.5;">
                                ⏰ <strong>This code will expire in 5 minutes</strong><br>
                                <span style="color: #a1a1aa;">Please verify your email as soon as possible.</span>
                              </p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 30px 0 0 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                          If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #09090b; padding: 30px; text-align: center; border-top: 1px solid #27272a;">
                        <p style="margin: 0 0 10px 0; color: #71717a; font-size: 12px;">
                          🔒 256-BIT ENCRYPTION | SECURE CLOUD STORAGE
                        </p>
                        <p style="margin: 0; color: #52525b; font-size: 12px;">
                          © 2025 NovaDrive. All rights reserved.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      logger.error('Error sending OTP email:', error);
      return { success: false, error };
    }

    
    return { success: true, data };
  } catch (error) {
    logger.error('Error in sendOtpEmail:', error);
    return { success: false, error };
  }
};
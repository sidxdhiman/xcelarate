import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, html: string) {
  try {
    console.log(`📨 Connecting to Brevo on Port 2525...`);

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 2525,             // <--- THIS IS THE FIX. Port 2525 bypasses firewalls.
      secure: false,          // Must be false for 2525
      auth: {
        user: process.env.EMAIL_USER, // Your Brevo Login Email
        pass: process.env.EMAIL_PASS, // Your Brevo Master Password or SMTP Key
      },
      tls: {
        rejectUnauthorized: false // Helps with handshake issues
      }
    });

    const info = await transporter.sendMail({
      from: `"Xcelarate Admin" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email via Brevo:`, error);
    return false;
  }
}
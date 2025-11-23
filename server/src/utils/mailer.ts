import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, html: string) {
  try {
    console.log(`📨 Using SMTP Provider: Brevo`);

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com", // Brevo's SMTP Server
      port: 587,                    // Standard Port
      secure: false,                // Use STARTTLS
      auth: {
        user: process.env.EMAIL_USER, // Your Brevo Login Email
        pass: process.env.EMAIL_PASS, // Your Brevo SMTP Key
      },
      tls: {
        rejectUnauthorized: false // Fix for cloud certificate issues
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
    console.error(`❌ Failed to send email:`, error);
    return false;
  }
}
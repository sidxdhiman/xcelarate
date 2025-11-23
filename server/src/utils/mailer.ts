import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, html: string) {
  try {
    // Log credentials presence to debug (never log the full password!)
    console.log(`📨 Configuring Mailer... User: ${process.env.EMAIL_USER}, Pass Length: ${process.env.EMAIL_PASS?.length}`);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,      // Use Port 587 for STARTTLS (Best for Render/Cloud)
      secure: false,  // secure: false means "use STARTTLS" upgrade, NOT "no security"
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection configuration before sending
    // This helps catch authentication errors immediately
    await transporter.verify();
    console.log("✅ SMTP Connection Verified. Sending email...");

    const info = await transporter.sendMail({
      from: `"Xcelarate Admin" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    return false;
  }
}
import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, html: string) {
  try {
    console.log(`📨 Configuring Mailer (Robust Mode)...`);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // --- FIXES FOR RENDER TIMEOUTS ---
      tls: {
        // Do not fail on invalid certs (Common fix for cloud servers)
        rejectUnauthorized: false,
      },
      // Increase timeouts to prevent ETIMEDOUT
      connectionTimeout: 20000, // 20 seconds
      greetingTimeout: 20000,   // 20 seconds
      socketTimeout: 20000,     // 20 seconds
      // Enable detailed logs
      logger: true,
      debug: true,
    });

    // Test connection before sending
    console.log("🔄 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP Connection Verified!");

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
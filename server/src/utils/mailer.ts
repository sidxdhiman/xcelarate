import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, html: string) {
  try {
    console.log(`📨 Configuring Mailer (Service Mode)...`);
    console.log(`   User: ${process.env.EMAIL_USER}`);

    // USE THE "SERVICE" SHORTCUT
    // This automatically handles host, port, and secure settings for Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log("✅ SMTP Connection Verified via 'gmail' service.");

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
import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, html: string) {
  try {
    console.log(`📨 Connecting to Gmail SMTP on Port 587...`);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Gmail requires false for 587
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // your Gmail App Password
      },
    });

    const info = await transporter.sendMail({
      from: `"Xcelarate Assessment" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email via Gmail:`, error);
    return false;
  }
}

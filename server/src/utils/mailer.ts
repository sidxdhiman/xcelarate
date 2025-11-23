import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, html: string) {
  try {
    // Create the transporter with Gmail settings
    // Port 465 (SSL) is less likely to be blocked by cloud firewalls than port 587
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address from Render Env
        pass: process.env.EMAIL_PASS, // Your 16-char App Password from Render Env
      },
    });

    // Send the email
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
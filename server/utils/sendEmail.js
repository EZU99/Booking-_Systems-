import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER; // e.g., your Gmail: example@gmail.com
const EMAIL_PASS = process.env.EMAIL_PASS; // app password if Gmail

const transporter = nodemailer.createTransport({
  service: "gmail", // or another SMTP service
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"Cinema Notifications" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<pre>${text}</pre>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};

export default sendEmail;

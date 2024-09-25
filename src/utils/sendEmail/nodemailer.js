import nodemailer from "nodemailer";
const sendEmail = async ({
  subject,
  text
} = {}) => {
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 465,
    secure: true,
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
  const info = await transporter.sendMail({
    from: `machine genius" <${process.env.EMAIL}>`,
    to:process.env.EMAIL_PERSONAL,
    subject,
    text:`twitter cron ${text}`, 
  });
  return info.accepted.length < 1 ? false : true;
};
export default sendEmail;
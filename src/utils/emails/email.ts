import nodemailer from 'nodemailer';

export const sendEmail = async (
  userEmail: string,
  subject: string,
  htmlTemplate: string
) => {
  try {
    const transport = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.APP_EMAIL_ADDRESS,
      to: userEmail,
      subject: subject,
      html: htmlTemplate,
    };
    const info = await transport.sendMail(mailOptions);
    console.log(info.response);
  } catch (err) {
    console.log(err);
    throw new Error('Internal server Error with nodemailer');
  }
};

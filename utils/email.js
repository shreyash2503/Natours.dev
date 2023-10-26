import nodemailer from "nodemailer";
import pug from 'pug';
import { convert } from 'html-to-text';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Shreyash Tekade <${process.env.EMAIL_FROM}>`;
  }
  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    // 1). Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    })

    // 2). Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html, { wordwrap: 130 })
    }
    // 3). Create a transport and send email
    await this.createTransport().sendMail(mailOptions)


  }


  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the Natours Family');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes');


  }

}


// const sendEmail = async (options) => {
//   // & 1). Create a transporter
//   // const transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EMAIL_PORT,
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD,
//   //   },
//   // });

//   // & 2). Define the email options
//   const mailOptions = {
//     from: "Shreyash Tekade <shreyash@gmail.com>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };
//   // & 3). Actually send the email
//   await transporter.sendMail(mailOptions);
// };



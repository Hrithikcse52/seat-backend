import nodemailer from 'nodemailer';
import { EMAIL, PASS } from '../config';

export async function sendMail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  console.log('inside mailer', { to, subject, text, html });
  const mailer = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth: {
      user: EMAIL,
      pass: PASS,
    },
    secure: true,
  });

  const options = {
    from: EMAIL,
    cc: 'hrithik.cse52@gmail.com',
    to,
    subject,
    text,
    html,
  };
  const data = await mailer.sendMail(options);
  console.log('data', data);
  return data;
}

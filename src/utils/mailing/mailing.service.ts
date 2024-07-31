import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';


export interface MailingInterface {
  email: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailingService {
  private readonly transporter;

  constructor() {
    const SMTP_HOST = process.env.SMTP_HOST as string;
    const SMTP_PORT = parseInt(process.env.SMTP_PORT as string);
    const SMTP_USERNAME = process.env.SMTP_USERNAME as string;
    const SMTP_PASSWORD = process.env.SMTP_PASSWORD as string;
    const SMTP_STARTTLS_REQUIRED = process.env.SMTP_STARTTLS_REQUIRED === 'true';

    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST || 'live.smtp.mailtrap.io',
      port: SMTP_PORT || 587,
      auth: {
        user: SMTP_USERNAME || 'api',
        pass: SMTP_PASSWORD || '5a2460ef951e4415adaa5e16f50e8a3a',
        authMethod: 'PLAIN,LOGIN',
      },
      debug: true,
      tls: {
        rejectUnauthorized: SMTP_STARTTLS_REQUIRED,
      },
    } as nodemailer.TransportOptions);
  }

  async send(payload: MailingInterface) {
    try {
      await this.transporter.sendMail({
        from: `"ABH" ${process.env.SENDERS_EMAIL}`,
        to: payload.email,
        subject: payload.subject,
        html: payload.html,
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.log('Email not sent');
      console.log('Error:', error);
    }
  }
}

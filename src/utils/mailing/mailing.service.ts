import { Injectable } from '@nestjs/common';
import { MailtrapClient } from 'mailtrap';
// import Mailjet from 'node-mailjet';
import { Client } from 'node-mailjet';

interface MailingInterface {
  email: string;
  name: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class MailingService {
  // mailjet = new Client(
  //     {
  //         apiKey: process.env.MJ_APIKEY,
  //         apiSecret: process.env.MJ_SECRETKEY
  //     })

  TOKEN = process.env.MAILTRAP_TOKEN;
  SENDER_EMAIL = process.env.MAILTRAP_SENDER_EMAIL;
  sender = { name: 'Mailtrap Test', email: this.SENDER_EMAIL };
  client = new MailtrapClient({ token: this.TOKEN });

  // async send(payload: MailingInterface) {
  //     try {
  //         await this.mailjet
  //             .post('send', { version: 'v3.1' })
  //             .request({
  //                 Messages: [
  //                     {
  //                         From: {
  //                             Email: "emmanuel.olusola@pmt.ng",
  //                             Name: "ABH Ecommerce"
  //                         },
  //                         To: [
  //                             {
  //                                 Email: payload.email,
  //                                 Name: payload.name
  //                             }
  //                         ],
  //                         Subject: payload.subject,
  //                         TextPart: payload.text,
  //                         HTMLPart: payload.html
  //                     }
  //                 ]
  //             })
  //     } catch (error) {
  //         throw new Error(error)
  //     }
  // }

  async send(payload: MailingInterface) {
    this.client
      .send({
        from: this.sender,
        to: [{ email: payload.email}],
        subject: payload.subject,
        text: payload.text,
      })
      .then(console.log)
      .catch(console.error);
  }
}

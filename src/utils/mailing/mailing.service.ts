import { Injectable } from '@nestjs/common';
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

    mailjet = new Client(
        {
            apiKey: process.env.MJ_APIKEY,
            apiSecret: process.env.MJ_SECRETKEY
        })

    async send(payload: MailingInterface) {
        try {
            await this.mailjet
                .post('send', { version: 'v3.1' })
                .request({
                    Messages: [
                        {
                            From: {
                                Email: "emmanuel.olusola@pmt.ng",
                                Name: "ABH Ecommerce"
                            },
                            To: [
                                {
                                    Email: payload.email,
                                    Name: payload.name
                                }
                            ],
                            Subject: payload.subject,
                            TextPart: payload.text,
                            HTMLPart: payload.html
                        }
                    ]
                })
        } catch (error) {
            throw new Error(error)
        }
    }
}

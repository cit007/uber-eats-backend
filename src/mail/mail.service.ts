import { Inject, Injectable } from '@nestjs/common';
import { MailModuleOptions } from './mail.interface';
import { MAIL_OPTIONS } from './mail.constants';
import got from 'got';
import * as FormData from 'form-data';
import * as mailgun from 'mailgun-js';

@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    // console.log('MAIL OPTIONS :', options);
    this.sendEmail('testing', 'test');
  }

  private async sendEmail(subject: string, content: string) {
    const DOMAIN = this.options.domain;
    const mg = mailgun({
      apiKey: this.options.apiKey,
      domain: DOMAIN,
    });
    const data = {
      from: `Excited User <me@${this.options.domain}/>`,
      to: 'itcho0077@gmail.com, citack007@gmail.com',
      subject: subject,
      text: content,
    };
    console.log('sendmail:', data);
    mg.messages().send(data, function (error, body) {
      console.log(body);
    });
  }
}

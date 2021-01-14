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
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    form.append('to', `itcho0077@gmail.com`);
    form.append('subject', subject);
    form.append('template', 'verify-email');
    form.append('v:code', 'asasas');
    form.append('v:username', 'itcho!!!');
    const response = await got(
      `https://api.mailgun.net/v3/${this.options.domain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      },
    );
    console.log(response.body);
  }
}

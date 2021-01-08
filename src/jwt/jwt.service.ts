import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './interfaces/jwt-module-options.interface';

@Injectable()
export class JwtService {
  constructor(@Inject('JWT_OPT') private readonly options: JwtModuleOptions) {
    console.log('JWT OPTIONS :', options);
  }
  hello() {
    console.log('hello JwtService');
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // console.log(req.headers);
    if ('x-jwt' in req.headers) {
      console.log(req.headers['x-jwt']);
      const token = req.headers['x-jwt'];
      const decoded = this.jwtService.verify(token.toString());
      //   console.log(decoded);
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        console.log(decoded['id']);
        const user = await this.usersService.findOneById(+decoded['id']);
        req['user'] = user;
        console.log('user from token id : ', user);
      }
    }
    next();
  }
}

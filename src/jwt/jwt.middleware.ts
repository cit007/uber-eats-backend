import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  id = null;
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // console.log(req.headers);
    if ('x-jwt' in req.headers) {
      //   console.log(req.headers['x-jwt']);
      const token = req.headers['x-jwt'];
      try {
        const decoded = this.jwtService.verify(token.toString());
        //   console.log(decoded);
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          console.log('middleware:', this.id, decoded['id']);
          if (this.id === decoded['id']) {
            console.log('skip find search by polling in middleware');
          } else {
            this.id = decoded['id'];
            const user = await this.usersService.findOneUserById(
              +decoded['id'],
            );
            req['user'] = user;
          }

          // -------------------------------
          // @See : this request user data flow : middleware->context of apollo server->authorization guard->resolver
          //        ->use context info with @decorator or @context in resolver()
          // -------------------------------
        }
      } catch (e) {}
    }
    next();
  }
}

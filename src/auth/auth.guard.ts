import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // console.log('CanActivie :', context);
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    console.log('CanActivie :', user);
    if (!user) {
      return false;
    }
    return true;
  }
}

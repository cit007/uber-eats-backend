import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

export class AuthGuard implements CanActivate {
  private reflector = null;
  constructor() {
    this.reflector = new Reflector();
  }

  canActivate(context: ExecutionContext) {
    // console.log('CanActivie reflector:', this.reflector, context.getHandler());
    const roles = this.reflector.get('roles', context.getHandler());
    console.log('CanActivie roles: ', roles);
    if (!roles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];
    console.log('CanActivie user:', user);
    if (!user) {
      return false;
    }

    if (roles.includes('Any')) {
      return true;
    }
    return roles.includes(user.role);
  }
}

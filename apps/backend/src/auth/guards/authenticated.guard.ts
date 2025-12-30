import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_ROLE_KEY } from '../decorators/access.decorator';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accessRole = this.reflector.getAllAndOverride(ACCESS_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (accessRole === 'public') {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (accessRole === 'admin') {
      return request.isAuthenticated() && request.user.role === 'admin';
    }

    return request.isAuthenticated();
  }
}

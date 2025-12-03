import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@app/data';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    return requiredRoles.some((role) => this.hasRole(user.role, role));
  }

  private hasRole(userRole: Role, requiredRole: Role): boolean {
    const hierarchy = {
      [Role.OWNER]: 3,
      [Role.ADMIN]: 2,
      [Role.VIEWER]: 1,
    };

    return hierarchy[userRole] >= hierarchy[requiredRole];
  }
}


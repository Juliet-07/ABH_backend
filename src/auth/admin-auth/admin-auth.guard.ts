import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AdminRolesEnums } from '../../constants';
import { AdminService } from '../../admin/admin.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private readonly adminService: AdminService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET
        }
      );
      const admin = await this.adminService.findOne(payload.id)
      if (!admin) throw new UnauthorizedException('Not Authorized')
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      if (![Object.values(AdminRolesEnums).includes(payload.role)]) throw new UnauthorizedException('Not Authorized')
      request['admin'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
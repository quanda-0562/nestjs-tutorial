import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    // If the token is invalid or missing, just continue without user
    // This guard is optional - it doesn't throw errors for missing auth
    return user || undefined;
  }
}

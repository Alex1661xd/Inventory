import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class N8nApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const apiKey = request.headers['x-api-key'];
    const expected = process.env.N8N_INTEGRATION_API_KEY;

    if (!expected) {
      throw new UnauthorizedException('N8N integration API key is not configured');
    }

    if (!apiKey || Array.isArray(apiKey) || apiKey !== expected) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}

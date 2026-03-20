import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { AuthenticatedUser } from '../../common/auth/interfaces/authenticated-request.interface';

interface TokenPayload extends AuthenticatedUser {
  exp: number;
}

@Injectable()
export class TokenService {
  constructor(private readonly configService: ConfigService) {}

  signToken(user: AuthenticatedUser) {
    const payload: TokenPayload = {
      ...user,
      exp: Date.now() + 1000 * 60 * 60 * 12,
    };

    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${body}.${this.sign(body)}`;
  }

  verifyToken(token: string): AuthenticatedUser {
    const [body, signature] = token.split('.');

    if (!body || !signature || this.sign(body) !== signature) {
      throw new UnauthorizedException('Token invalido');
    }

    const payload = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf-8'),
    ) as TokenPayload;

    if (!payload.exp || payload.exp < Date.now()) {
      throw new UnauthorizedException('Token expirado');
    }

    return {
      userId: payload.userId,
      tipo: payload.tipo,
    };
  }

  readAuthorizationHeader(authorization?: string) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token nao informado');
    }

    return this.verifyToken(authorization.slice('Bearer '.length).trim());
  }

  private sign(value: string) {
    const secret =
      this.configService.get<string>('AUTH_TOKEN_SECRET') ?? 'updin-dev-secret';

    return createHmac('sha256', secret).update(value).digest('base64url');
  }
}

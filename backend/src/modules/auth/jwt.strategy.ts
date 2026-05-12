// src/modules/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // ensure secret is present and fail fast if not
    const secret = process.env.APP_JWT_SECRET ?? process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT secret is not set. Set APP_JWT_SECRET (or JWT_SECRET) in your .env');
    }

    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      // passReqToCallback: false // default - no request in validate()
    };

    super(opts);
  }

  // Optionally type payload for clarity
  async validate(payload: { sub: string; email: string; name?: string; role?: string; doctorId?: string }) {
    // You can perform additional checks here e.g. check user still exists
    // If you want to refuse tokens return false or throw UnauthorizedException
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Return the user information that will be attached to req.user
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role ?? 'doctor',
      doctorId: payload.doctorId,
    };
  }
}

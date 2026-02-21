// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { AuthController } from '../auth/auth.controller';
import { JwtStrategy } from '../auth/jwt.strategy';
import { doctorProviders } from '../doctor/doctor.providers';
import { DatabaseModule } from '../../db/database.module';

function parseExpiresIn(raw?: string | null): string | number {
  if (!raw || raw.trim() === '') return '3600s';
  const num = Number(raw);
  return Number.isFinite(num) ? num : raw;
}

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('APP_JWT_SECRET') ?? config.get<string>('JWT_SECRET');
        if (!secret) throw new Error('Missing JWT secret (APP_JWT_SECRET or JWT_SECRET)');

        const raw = config.get<string>('JWT_EXPIRATION') ?? config.get<string>('JWT_EXPIRES_IN');
        const expiresIn = parseExpiresIn(raw);

        // Build signOptions as an `any`-ish shape so TypeScript won't complain
        // about the library-specific StringValue type differences across versions.
        const signOptions: any = { expiresIn };

        const opts: JwtModuleOptions = {
          secret,
          signOptions,
        };

        return opts;
      },
    }),
  ],
  controllers: [AuthController],
  providers: [...doctorProviders, AuthService, JwtStrategy],
  exports: [AuthService],
})
export class DoctorModule {}

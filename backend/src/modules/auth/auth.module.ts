// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { doctorProviders } from '../doctor/doctor.providers';
import { receptionistProviders } from '../receptionist/receptionist.providers';
import { refreshTokenProviders } from './refresh-token.providers';
import { DatabaseModule } from '../../db/database.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule, // make sure ConfigModule is imported (can be global in AppModule)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('APP_JWT_SECRET') ?? config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('Missing JWT secret in environment');
        }

        const raw =
          config.get<string>('JWT_ACCESS_EXPIRATION') ??
          config.get<string>('JWT_EXPIRATION') ??
          config.get<string>('JWT_EXPIRES_IN');
        const defaultVal = '1h';

        // If raw is a numeric string (e.g. "3600"), convert to number. Otherwise keep the string.
        let expiresInValue: string | number | undefined = defaultVal;
        if (raw && raw.trim() !== '') {
          const asNum = Number(raw);
          expiresInValue = !Number.isNaN(asNum) ? asNum : raw;
        }

        // CAST: jsonwebtoken's types declare `expiresIn` as number | StringValue | undefined
        // TypeScript won't accept a plain `string` as `StringValue`, so cast here safely.
        const signOptions = {
          expiresIn: expiresInValue as unknown as number | unknown,
        };

        return {
          secret,
          signOptions,
        } as JwtModuleOptions;
      },
    }),
  ],
  controllers: [AuthController],
  providers: [...doctorProviders, ...receptionistProviders, ...refreshTokenProviders, AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

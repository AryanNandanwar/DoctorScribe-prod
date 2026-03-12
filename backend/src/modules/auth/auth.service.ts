import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Doctor } from '../doctor/doctor.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DOCTOR_REPOSITORY') private doctorRepo: Repository<Doctor>,
    private jwtService: JwtService,
  ) {}

  private async hashPassword(password: string) {
    const saltRounds = 12; // 12 is a reasonable default
    return bcrypt.hash(password, saltRounds);
  }

  async signup(payload: {
    fullName: string;
    email: string;
    password: string;
    contactNo?: string;
    specialization?: string;
  }) {
    const existing = await this.doctorRepo.findOne({ where: { email: payload.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await this.hashPassword(payload.password);
    const doctor = this.doctorRepo.create({
      fullName: payload.fullName,
      email: payload.email,
      passwordHash,
      contactNo: payload.contactNo,
      specialization: payload.specialization,
    });
    await this.doctorRepo.save(doctor);

    // Optionally send verification email here
    const { passwordHash: _, ...safe } = doctor as any;
    return safe;
  }

  async validateCredentials(email: string, password: string) {
    // #region agent log
    fetch('http://127.0.0.1:7885/ingest/231ef9cf-d927-49db-82f0-f19e114f6243', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'b8fd10',
      },
      body: JSON.stringify({
        sessionId: 'b8fd10',
        runId: 'initial',
        hypothesisId: 'H4',
        location: 'src/modules/auth/auth.service.ts:validateCredentials',
        message: 'validateCredentials called',
        data: {
          hasEmail: !!email,
          emailLength: email ? email.length : 0,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    const doctor = await this.doctorRepo.findOne({ where: { email } });

    // #region agent log
    fetch('http://127.0.0.1:7885/ingest/231ef9cf-d927-49db-82f0-f19e114f6243', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'b8fd10',
      },
      body: JSON.stringify({
        sessionId: 'b8fd10',
        runId: 'initial',
        hypothesisId: 'H4',
        location: 'src/modules/auth/auth.service.ts:validateCredentials',
        message: 'validateCredentials doctor lookup result',
        data: {
          doctorFound: !!doctor,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    if (!doctor) return null;
    if (typeof password !== 'string' || !password || typeof doctor.passwordHash !== 'string') return null;
    const ok = await bcrypt.compare(password, doctor.passwordHash);

    // #region agent log
    fetch('http://127.0.0.1:7885/ingest/231ef9cf-d927-49db-82f0-f19e114f6243', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'b8fd10',
      },
      body: JSON.stringify({
        sessionId: 'b8fd10',
        runId: 'initial',
        hypothesisId: 'H5',
        location: 'src/modules/auth/auth.service.ts:validateCredentials',
        message: 'validateCredentials password compare result',
        data: {
          doctorFoundBeforeCompare: !!doctor,
          passwordMatch: ok,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    if (!ok) return null;
    return doctor;
  }

  async login(email: string, password: string) {
    // #region agent log
    fetch('http://127.0.0.1:7885/ingest/231ef9cf-d927-49db-82f0-f19e114f6243', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'b8fd10',
      },
      body: JSON.stringify({
        sessionId: 'b8fd10',
        runId: 'initial',
        hypothesisId: 'H5',
        location: 'src/modules/auth/auth.service.ts:login',
        message: 'AuthService.login called',
        data: {
          hasEmail: !!email,
          hasPassword: !!password,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    const doctor = await this.validateCredentials(email, password);
    if (!doctor) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: doctor.id, email: doctor.email, name: doctor.fullName, role: 'doctor' };
    const token = this.jwtService.sign(payload);

    // #region agent log
    fetch('http://127.0.0.1:7885/ingest/231ef9cf-d927-49db-82f0-f19e114f6243', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'b8fd10',
      },
      body: JSON.stringify({
        sessionId: 'b8fd10',
        runId: 'initial',
        hypothesisId: 'H5',
        location: 'src/modules/auth/auth.service.ts:login',
        message: 'AuthService.login created token',
        data: {
          hasDoctor: !!doctor,
          tokenLength: token ? token.length : 0,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    return {
      accessToken: token,
      user: {
        id: doctor.id,
        name: doctor.fullName,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    };
  }

  async loogout(){
    
  }
}

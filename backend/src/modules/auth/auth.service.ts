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
    const doctor = await this.doctorRepo.findOne({ where: { email } });
    if (!doctor) return null;
    const ok = await bcrypt.compare(password, doctor.passwordHash);
    if (!ok) return null;
    return doctor;
  }

  async login(email: string, password: string) {
    const doctor = await this.validateCredentials(email, password);
    if (!doctor) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: doctor.id, email: doctor.email, name: doctor.fullName, role: 'doctor' };
    const token = this.jwtService.sign(payload);

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

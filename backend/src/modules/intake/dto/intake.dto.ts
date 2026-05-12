import { IsIn, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import type { PatientIntakeStatus } from '../entities/patient-intake.entity';

export class CreateIntakePatientDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsString()
  age?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phone?: string;
}

export class UpdateIntakeStatusDto {
  @IsIn(['pending', 'in_progress', 'completed', 'cancelled'])
  status: PatientIntakeStatus;
}

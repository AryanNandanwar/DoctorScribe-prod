import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../db/database.module';
import { doctorProviders } from '../doctor/doctor.providers';
import { patientProviders } from '../patient/patient.provider';
import { receptionistProviders } from '../receptionist/receptionist.providers';
import { IntakeController } from './intake.controller';
import { intakeProviders } from './intake.providers';
import { IntakeService } from './intake.service';

@Module({
  imports: [DatabaseModule],
  controllers: [IntakeController],
  providers: [
    IntakeService,
    ...intakeProviders,
    ...patientProviders,
    ...doctorProviders,
    ...receptionistProviders,
  ],
  exports: [IntakeService, ...intakeProviders],
})
export class IntakeModule {}

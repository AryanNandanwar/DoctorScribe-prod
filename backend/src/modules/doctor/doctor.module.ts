import { Module } from '@nestjs/common';
import { doctorProviders } from '../doctor/doctor.providers';
import { DatabaseModule } from '../../db/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [...doctorProviders],
  exports: [...doctorProviders],
})
export class DoctorModule {}

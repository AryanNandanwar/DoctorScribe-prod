import { DataSource } from 'typeorm';
import { PatientIntake } from './entities/patient-intake.entity';

export const intakeProviders = [
  {
    provide: 'PATIENT_INTAKE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PatientIntake),
    inject: ['POSTGRES_DATA_SOURCE'],
  },
];

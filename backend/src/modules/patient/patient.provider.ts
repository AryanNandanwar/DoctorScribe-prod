// src/patient/patient.providers.ts
import { DataSource } from 'typeorm';
import { Patient } from './entities/patient.entity';

export const patientProviders = [
  {
    provide: 'PATIENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Patient),
    inject: ['POSTGRES_DATA_SOURCE'],
  },
];

import { DataSource } from 'typeorm';
import { Doctor } from './doctor.entity';

export const doctorProviders = [
  {
    provide: 'DOCTOR_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Doctor),
    inject: ['POSTGRES_DATA_SOURCE'],
  },
];

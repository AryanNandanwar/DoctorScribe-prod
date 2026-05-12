import { DataSource } from 'typeorm';
import { Receptionist } from './receptionist.entity';

export const receptionistProviders = [
  {
    provide: 'RECEPTIONIST_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Receptionist),
    inject: ['POSTGRES_DATA_SOURCE'],
  },
];

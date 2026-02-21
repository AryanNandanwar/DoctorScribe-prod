import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config(); // load .env manually if not already done

export const databaseProviders = [
  {
    provide: 'POSTGRES_DATA_SOURCE',
    useFactory: async () => {
      if (!process.env.SUPABASE_DB_URL) {
        throw new Error('SUPABASE_DB_URL is missing in .env');
      }

      const options: DataSourceOptions = {
        type: 'postgres',
        url: process.env.SUPABASE_DB_URL,
        ssl: {
          rejectUnauthorized: false, // Supabase requires SSL
        },
        entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
        migrations: [path.join(__dirname, '../../migrations/*{.ts,.js}')],

        // Never auto-sync schema in production — use migrations!
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV !== 'production',
      };

      const dataSource = new DataSource(options);
      return dataSource.initialize();
    },
  },
  
];

require('dotenv').config();
const { DataSource } = require('typeorm');

module.exports.AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: ['dist/**/*.entity{.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});

require('dotenv').config();
const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: ['dist/**/*.entity{.js}'],
  synchronize: false,
  logging: false,
});

async function checkSchema() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to database');
    
    // Check if new columns exist in clinical_notes table
    const result = await AppDataSource.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'clinical_notes' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('Clinical notes table columns:');
    result.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check specifically for our new columns
    const newColumns = ['findings', 'diagnosis', 'investigations_advised'];
    console.log('\nNew columns check:');
    newColumns.forEach(col => {
      const exists = result.some(r => r.column_name === col);
      console.log(`- ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await AppDataSource.destroy();
  }
}

checkSchema();

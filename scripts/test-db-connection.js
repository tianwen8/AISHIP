require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function testConnection() {
  console.log('Testing database connection...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  // Mask password for logging
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
  console.log(`Connecting to: ${maskedUrl}`);

  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    connect_timeout: 10
  });

  try {
    const result = await sql`SELECT 1+1 AS result`;
    console.log('✅ Database connection successful!');
    console.log('Test Query Result:', result);
    
    // Check if tables exist
    const tables = await sql`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname != 'pg_catalog' 
      AND schemaname != 'information_schema'
    `;
    
    console.log('\nExisting Tables:', tables.length > 0 ? tables.map(t => t.tablename).join(', ') : '(None - Database is empty)');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await sql.end();
  }
}

testConnection();

// Force using Port 5432 to test standard connection
const postgres = require('postgres');

// Hardcoded connection string with 5432 port
const DB_URL = "postgresql://postgres:qq253400489QQ@db.difibumhfmkgsmzqlnwq.supabase.co:5432/postgres?sslmode=require";

async function testConnection() {
  console.log('Testing connection to Port 5432 (Standard Session)...');
  console.log('Target: db.difibumhfmkgsmzqlnwq.supabase.co:5432');

  const sql = postgres(DB_URL, {
    ssl: 'require',
    connect_timeout: 10
  });

  try {
    const start = Date.now();
    const result = await sql`SELECT NOW() as time`;
    const duration = Date.now() - start;
    
    console.log(`✅ Success! Connected in ${duration}ms`);
    console.log('Server Time:', result[0].time);
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    if (error.code) console.error('Error Code:', error.code);
  } finally {
    await sql.end();
  }
}

testConnection();
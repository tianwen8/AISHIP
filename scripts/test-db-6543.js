// Force using Port 6543 to test connection capability
const postgres = require('postgres');

// Hardcoded connection string with 6543 port
// Using the project ID and password you provided earlier
const DB_URL = "postgresql://postgres:qq253400489QQ@db.difibumhfmkgsmzqlnwq.supabase.co:6543/postgres?sslmode=require";

async function testConnection() {
  console.log('Testing connection to Port 6543 (Transaction Pooler)...');
  console.log('Target: db.difibumhfmkgsmzqlnwq.supabase.co:6543');

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
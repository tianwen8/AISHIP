require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function seedCredits() {
  console.log('--- Debug Info ---');
  const url = process.env.DATABASE_URL || '';
  console.log('DB Host:', url.split('@')[1]?.split(':')[0]);
  console.log('DB Port:', url.split(':')[3]?.split('/')[0]);
  
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    // 1. List all tables
    const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
    console.log('Tables in DB:', tables.map(t => t.tablename).join(', '));

    // 2. Count users
    const count = await sql`SELECT count(*) FROM users`;
    console.log('User count:', count[0].count);

    // 3. Find the first user
    const users = await sql`SELECT uuid, email FROM users LIMIT 1`;
    
    if (users.length === 0) {
      console.log('❌ No users found in database.');
      return;
    }

    const user = users[0];
    console.log(`Found user: ${user.email} (${user.uuid})`);

    // 4. Check if already has credits
    const existing = await sql`SELECT SUM(credits) as total FROM credits WHERE user_uuid = ${user.uuid}`;
    console.log(`Current Balance: ${existing[0].total || 0}`);

    // 5. Add 1000 credits
    const transNo = 'INIT_GIFT_' + Date.now();
    await sql`
      INSERT INTO credits (user_uuid, trans_no, trans_type, credits)
      VALUES (${user.uuid}, ${transNo}, 'bonus', 1000)
    `;

    console.log('✅ Success! Added 1000 credits to user.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

seedCredits();
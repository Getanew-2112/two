const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'clinic_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function runFix() {
  const client = await pool.connect();
  
  try {
    console.log('Adding triage_complete notification type...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database', 'migrations', 'add-triage-notification-type.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('✅ Notification type added successfully!');
    console.log('The triage_complete notification type is now available.');
    
  } catch (error) {
    console.error('❌ Error adding notification type:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runFix()
  .then(() => {
    console.log('\n🎉 Fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  });

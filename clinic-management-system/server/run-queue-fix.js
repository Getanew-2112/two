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
    console.log('Starting queue function fix...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database', 'migrations', 'fix-queue-function.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('✅ Queue function fixed successfully!');
    console.log('The get_estimated_wait_time function has been updated.');
    
  } catch (error) {
    console.error('❌ Error fixing queue function:', error);
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

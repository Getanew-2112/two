const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'clinic_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'zxcvbnm'
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting payment enhancements migration...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'database', 'migrations', 'add-payment-enhancements.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Execute migration
    await client.query(migrationSQL);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('✓ Migration completed successfully!');
    console.log('✓ New tables created: notifications, payment_receipts');
    console.log('✓ Enhanced tables: payments, triage_records, queue');
    console.log('✓ New functions created for receipt generation and queue management');
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('✗ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

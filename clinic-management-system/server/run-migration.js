require('dotenv').config();
const fs = require('fs');
const db = require('./config/database');

async function runMigration() {
  try {
    console.log('Running database migration...');
    
    const sql = fs.readFileSync('./database/add-patient-auth.sql', 'utf8');
    
    await db.query(sql);
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

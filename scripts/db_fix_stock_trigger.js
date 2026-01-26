
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigration() {
  try {
    // 1. Read DATABASE_URL
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^DATABASE_URL=(.+)$/m);
    
    if (!match) {
      throw new Error('DATABASE_URL not found in .env.local');
    }
    
    const connectionString = match[1].trim();
    
    // 2. Read SQL file
    const sqlPath = path.join(process.cwd(), 'supabase', 'fix_stock_trigger_permissions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 3. Execute
    const client = new Client({ connectionString });
    await client.connect();
    
    console.log('Executing fix_stock_trigger_permissions.sql...');
    await client.query(sql);
    console.log('Success!');
    
    await client.end();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();

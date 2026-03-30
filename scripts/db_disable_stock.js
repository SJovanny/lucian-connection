/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigration() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^DATABASE_URL=(.+)$/m);
    
    if (!match) {
      throw new Error('DATABASE_URL not found in .env.local');
    }
    
    const connectionString = match[1].trim();
    const sqlPath = path.join(process.cwd(), 'supabase', 'disable_stock_tracking.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    const client = new Client({ connectionString });
    await client.connect();
    
    console.log('Disabling stock tracking...');
    await client.query(sql);
    console.log('Success! track_stock is now FALSE for all products.');
    
    await client.end();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();

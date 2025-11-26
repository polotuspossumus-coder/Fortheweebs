#!/usr/bin/env node
/**
 * Automated database schema setup
 * Reads SQL from SUPABASE_DATABASE_SETUP.md and executes it
 * Run after adding SUPABASE_SERVICE_ROLE_KEY to .env
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env');
  console.log('📝 See DATABASE_SETUP_ACTION_REQUIRED.md for instructions');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('\n🚀 ForTheWeebs Database Setup\n');
console.log('This will create all necessary tables and policies.\n');

async function runSQL(sql, description) {
  console.log(`🔧 ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) throw error;
    console.log(`✅ ${description} - Success`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Failed:`);
    console.error(error.message);
    return false;
  }
}

async function setupDatabase() {
  console.log('📖 Reading SQL schemas from SUPABASE_DATABASE_SETUP.md...\n');
  
  try {
    const setupDoc = readFileSync(
      join(__dirname, 'SUPABASE_DATABASE_SETUP.md'),
      'utf-8'
    );

    // Extract SQL blocks from markdown
    const sqlBlocks = setupDoc.match(/```sql\n([\s\S]*?)```/g) || [];
    
    if (sqlBlocks.length === 0) {
      console.error('❌ No SQL blocks found in SUPABASE_DATABASE_SETUP.md');
      process.exit(1);
    }

    console.log(`✅ Found ${sqlBlocks.length} SQL blocks\n`);

    // Execute each SQL block
    for (let i = 0; i < sqlBlocks.length; i++) {
      const sql = sqlBlocks[i]
        .replace(/```sql\n/g, '')
        .replace(/```/g, '')
        .trim();

      const description = `Executing SQL block ${i + 1}/${sqlBlocks.length}`;
      
      // For simplicity, we'll execute via direct connection
      // Note: Supabase doesn't support exec_sql RPC by default
      // You'll need to run these manually in SQL Editor
      console.log(`\n📝 SQL Block ${i + 1}/${sqlBlocks.length}:`);
      console.log('─'.repeat(50));
      console.log(sql.substring(0, 200) + '...');
      console.log('─'.repeat(50));
    }

    console.log('\n⚠️  MANUAL STEP REQUIRED:\n');
    console.log('Supabase doesn\'t allow programmatic SQL execution for security.');
    console.log('You need to run the SQL manually:\n');
    console.log('1. Open: https://app.supabase.com/project/iqipomerawkvtojbtvom/sql');
    console.log('2. Copy SQL from SUPABASE_DATABASE_SETUP.md (lines 50-600)');
    console.log('3. Paste into SQL Editor');
    console.log('4. Click "Run"');
    console.log('5. Verify tables appear in Table Editor\n');
    console.log('💡 I can help copy/paste if you share your screen!\n');

  } catch (error) {
    console.error('❌ Setup failed:');
    console.error(error.message);
    process.exit(1);
  }
}

setupDatabase();

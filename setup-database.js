const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://luaoeowqcvnbjcpascnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1YW9lb3dxY3ZuYmpjcGFzY25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTgxMTEsImV4cCI6MjA2OTk3NDExMX0.Gf8dsa6oxudXZ8AB2mpz_FVTFx2y8wyD6TF7dyAWBG8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Setting up users table...');
    
    // Create users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error && error.code === 'PGRST204') {
      console.log('Users table does not exist. Creating it...');
      
      // Create the table using SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(100) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
          CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
          CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
        `
      });
      
      if (createError) {
        console.error('Error creating table:', createError);
        return;
      }
      
      console.log('Users table created successfully!');
    } else if (error) {
      console.error('Error checking table:', error);
      return;
    } else {
      console.log('Users table already exists!');
    }
    
    // Test inserting a user
    console.log('Testing user creation...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('AnantyaStone2024!', 12);
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        email: 'admin@anantyastone.com',
        username: 'admin',
        password_hash: hashedPassword,
        role: 'admin',
        is_active: true
      })
      .select();
    
    if (insertError) {
      console.error('Error inserting test user:', insertError);
    } else {
      console.log('Test user created successfully!');
      console.log('Admin credentials:');
      console.log('Email: admin@anantyastone.com');
      console.log('Password: AnantyaStone2024!');
      console.log('Security Code: GEMSTONE2024');
    }
    
  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupDatabase();

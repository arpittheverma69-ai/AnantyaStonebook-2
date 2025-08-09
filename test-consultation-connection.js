// Test script to verify consultation database connection
const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConsultationConnection() {
  try {
    console.log('Testing consultation database connection...');
    
    // Test 1: Check if consultations table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('consultations')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access error:', tableError.message);
      return;
    }
    
    console.log('✅ Consultations table accessible');
    
    // Test 2: Try to insert a test consultation
    const testConsultation = {
      client_name: 'Test Client',
      client_phone: '+91 9876543210',
      client_email: 'test@example.com',
      consultation_type: 'Initial',
      consultation_date: new Date().toISOString(),
      consultation_time: '10:00',
      duration: '30 min',
      gemstone_interest: ['Ruby', 'Sapphire'],
      budget: '₹50,000 - ₹1,00,000',
      urgency: 'Medium',
      consultation_status: 'Scheduled',
      consultation_notes: 'Test consultation for database connection',
      follow_up_required: false,
      recommendations: 'Test recommendations',
      next_steps: 'Test next steps',
      location: 'Mumbai, Maharashtra',
      consultation_method: 'In-Person',
      payment_status: 'Pending'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('consultations')
      .insert(testConsultation)
      .select();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError.message);
      return;
    }
    
    console.log('✅ Test consultation inserted successfully');
    console.log('Inserted ID:', insertData[0].id);
    
    // Test 3: Try to read consultations
    const { data: readData, error: readError } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (readError) {
      console.error('❌ Read error:', readError.message);
      return;
    }
    
    console.log('✅ Consultations read successfully');
    console.log('Total consultations found:', readData.length);
    
    // Test 4: Clean up test data
    const { error: deleteError } = await supabase
      .from('consultations')
      .delete()
      .eq('client_name', 'Test Client');
    
    if (deleteError) {
      console.error('❌ Delete error:', deleteError.message);
      return;
    }
    
    console.log('✅ Test consultation cleaned up');
    console.log('🎉 All database tests passed! Consultation system is fully connected.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConsultationConnection();

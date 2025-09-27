// SUPABASE CONNECTION TEST
// Run this in your browser console on localhost:5173 to test database connection

(async () => {
  console.log('🧪 Testing Supabase Connection...');
  
  // Test 1: Check environment variables
  console.log('📋 Environment Check:');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_DEMO_MODE:', import.meta.env.VITE_DEMO_MODE);
  console.log('Anon Key (first 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  
  // Test 2: Test database connection  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    console.log('🔌 Testing database connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
    } else {
      console.log('✅ Database connection successful!');
      console.log('📊 Query result:', data);
    }
    
    // Test 3: Check authentication
    console.log('🔐 Checking current auth session...');
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      console.log('✅ User authenticated:', session.session.user.email);
      console.log('👤 User ID:', session.session.user.id);
    } else {
      console.log('ℹ️ No active session (not logged in)');
    }
    
  } catch (err) {
    console.error('❌ Connection test failed:', err);
  }
  
  console.log('🧪 Test completed!');
})();
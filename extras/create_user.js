const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ssfwmtjftfwlsfvdvzex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZndtdGpmdGZ3bHNmdmR2emV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNDE3MTMsImV4cCI6MjEwMTgxNzcxM30.yFF6VZC7UCZTpi9FgCPHw-C2hVtRzxzSObW8GRpQ8lQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'dixon@dixon.com',
    password: 'Pass123Dix'
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created successfully:', data.user?.email);
  }
}

createUser();

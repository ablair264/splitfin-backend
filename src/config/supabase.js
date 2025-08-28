import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let supabase = null;

export const initSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️ Supabase credentials not found. Using mock data.');
    return null;
  }

  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase connection initialized');
    return supabase;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    return null;
  }
};

export const getSupabase = () => {
  if (!supabase) {
    console.warn('⚠️ Supabase not initialized. Using mock data.');
  }
  return supabase;
};

export default supabase;
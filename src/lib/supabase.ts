import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket for file uploads
export const STORAGE_BUCKET = 'transfers';

// Subscription tiers and their limits
export const SUBSCRIPTION_TIERS = {
  free: {
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    maxExpiry: 7, // 7 days
    showAds: true,
  },
  pro: {
    maxSize: 20 * 1024 * 1024 * 1024, // 20GB
    maxExpiry: 30, // 30 days
    showAds: false,
  },
  premium: {
    maxSize: 100 * 1024 * 1024 * 1024, // 100GB
    maxExpiry: 90, // 90 days
    showAds: false,
    customBranding: true,
  },
} as const;
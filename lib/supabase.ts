// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://padithokjukzwkntvrhi.supabase.co';
const supabaseAnonKey = 'sb_publishable_y1RKIQP3VdP_fulCAmXrIg_Oj8J0rn1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
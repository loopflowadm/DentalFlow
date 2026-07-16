import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

const createDummySupabase = () => {
  const dummyHandler = {
    get(target, prop) {
      if (prop === 'auth') {
        return {
          signInWithPassword: async () => ({ data: { user: null }, error: new Error('Supabase não configurado') }),
          signOut: async () => {},
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        };
      }
      if (prop === 'from') {
        return () => {
          const queryBuilder = {
            select: () => queryBuilder,
            insert: () => queryBuilder,
            update: () => queryBuilder,
            delete: () => queryBuilder,
            eq: () => queryBuilder,
            order: () => queryBuilder,
            single: () => queryBuilder,
            then: (resolve) => resolve({ data: [], error: new Error('Supabase não configurado') })
          };
          return queryBuilder;
        };
      }
      return () => {};
    }
  };
  return new Proxy({}, dummyHandler);
};

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDummySupabase();

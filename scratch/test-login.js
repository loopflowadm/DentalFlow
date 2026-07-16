import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    env[key] = val;
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log('Tentando autenticar admin@sorriso.com...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@sorriso.com',
    password: '123'
  });

  if (error) {
    console.error('❌ Erro no login:', error.message);
  } else {
    console.log('✅ Sucesso no login! Usuário ID:', data.user.id);
  }
  process.exit(0);
}

test();

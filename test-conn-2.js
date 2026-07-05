import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Ler o arquivo .env.local manualmente
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

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('❌ Erro:', error);
      process.exit(1);
    } else {
      console.log('✅ SUCESSO! Linhas encontradas na tabela profiles:', data);
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    process.exit(1);
  }
}

runTest();

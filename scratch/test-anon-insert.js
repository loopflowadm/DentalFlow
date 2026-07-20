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

async function runTest() {
  console.log('🔗 Testando inserção anônima na tabela clinics...');
  const { data, error } = await supabase
    .from('clinics')
    .insert({
      name: 'Clínica Teste Anon',
      subdomain: 'testanon' + Math.random().toString(36).substring(2, 6),
      logo_url: '🦷'
    })
    .select();

  if (error) {
    console.error('❌ Erro na inserção anônima:', error.code, error.message);
  } else {
    console.log('✅ SUCESSO! Inserido com sucesso. ID:', data[0].id);
    // Deletar a clínica criada (como anônimo não deve ter permissão de exclusão, tentamos mas pode falhar)
    const { error: delErr } = await supabase
      .from('clinics')
      .delete()
      .eq('id', data[0].id);
    if (delErr) {
      console.log('ℹ️ Deleção anônima bloqueada (esperado):', delErr.message);
    } else {
      console.log('✅ Deleção anônima permitida.');
    }
  }
  process.exit(0);
}

runTest();

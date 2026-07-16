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
  const testEmail = `test_${Math.random().toString(36).substring(2, 9)}@sorriso.com`;
  const testPassword = 'Password123!';
  console.log(`Tentando registrar usuário de teste: ${testEmail}...`);

  // 1. Criar clínica de teste primeiro no banco real
  const { data: clinicData, error: clinicErr } = await supabase
    .from('clinics')
    .insert({
      name: 'Clínica Teste Rápido',
      subdomain: 'testerapido' + Math.random().toString(36).substring(2, 5),
      logo_url: '🦷',
      primary_color: '#03269A',
      secondary_color: '#196BFB'
    })
    .select()
    .single();

  if (clinicErr) {
    console.error('❌ Erro ao criar clínica:', clinicErr.message);
    process.exit(1);
  }

  console.log('✅ Clínica de teste criada com ID:', clinicData.id);

  // 2. SignUp
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        clinic_id: clinicData.id,
        role: 'CLINIC_ADMIN',
        full_name: 'Dr. Teste Automático'
      }
    }
  });

  if (authErr) {
    console.error('❌ Erro no Sign Up:', authErr.message);
    process.exit(1);
  }

  console.log('✅ Sign Up efetuado com sucesso.');

  // 3. Tentar fazer Login imediatamente
  console.log('Tentando fazer Login imediatamente...');
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (loginErr) {
    console.error('❌ Erro ao logar:', loginErr.message);
    console.log('ℹ️ Isso indica que confirmação de e-mail está ATIVA no Supabase.');
  } else {
    console.log('✅ Sucesso no login imediato! Usuário ID:', loginData.user.id);
    console.log('ℹ️ Confirmação de e-mail está DESATIVADA (o que facilita o teste).');
  }

  process.exit(0);
}

test();

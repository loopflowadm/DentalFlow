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
  console.log('🔗 Buscando clínicas existentes...');
  const { data: clinics, error: readErr } = await supabase
    .from('clinics')
    .select('id, name');

  if (readErr) {
    console.error('❌ Erro ao ler clínicas:', readErr.message);
    process.exit(1);
  }

  console.log(`Encontradas ${clinics.length} clínicas.`);
  if (clinics.length === 0) {
    console.log('Nenhuma clínica para testar.');
    process.exit(0);
  }

  // Tentar atualizar uma clínica existente de forma anônima
  const targetClinic = clinics[0];
  console.log(`Tentando atualizar clinic: "${targetClinic.name}" (ID: ${targetClinic.id}) de forma anônima...`);
  
  const { data: updateData, error: updateErr } = await supabase
    .from('clinics')
    .update({ name: targetClinic.name + ' - Alterado' })
    .eq('id', targetClinic.id)
    .select();

  if (updateErr) {
    console.log('🔒 SUCESSO DE SEGURANÇA! Atualização anônima bloqueada:', updateErr.message);
  } else {
    console.log('⚠️ ALERTA DE SEGURANÇA! Atualização anônima permitida! Retorno:', updateData);
    // Reverter
    await supabase.from('clinics').update({ name: targetClinic.name }).eq('id', targetClinic.id);
  }

  // Tentar deletar uma clínica existente de forma anônima
  console.log(`Tentando deletar clinic: "${targetClinic.name}" (ID: ${targetClinic.id}) de forma anônima...`);
  const { error: delErr } = await supabase
    .from('clinics')
    .delete()
    .eq('id', targetClinic.id);

  if (delErr) {
    console.log('🔒 SUCESSO DE SEGURANÇA! Deleção anônima bloqueada:', delErr.message);
  } else {
    console.log('⚠️ ALERTA DE SEGURANÇA! Deleção anônima permitida! Clínica deletada.');
  }

  process.exit(0);
}

runTest();

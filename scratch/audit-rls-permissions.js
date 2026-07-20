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

const tablesToCheck = [
  'clinics',
  'profiles',
  'patients',
  'chairs',
  'appointments',
  'whatsapp_config',
  'suppliers',
  'accounts_payable',
  'medical_records',
  'prescriptions',
  'tooth_records',
  'crm_leads',
  'treatment_budgets',
  'treatment_items',
  'installments',
  'transactions'
];

async function runAudit() {
  console.log('🔑 Tentando autenticar como tester@dentalflow.com...');
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'tester@dentalflow.com',
    password: 'Password123!'
  });

  if (authErr) {
    console.error('❌ Falha na autenticação:', authErr.message);
    process.exit(1);
  }

  console.log('✅ Autenticado com sucesso! ID do usuário:', auth.user.id);

  // Obter perfil do usuário para saber a clínica
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .single();

  if (profileErr) {
    console.error('❌ Falha ao carregar perfil do usuário:', profileErr.message);
    process.exit(1);
  }

  const clinicId = profile.clinic_id;
  console.log(`Clínica associada: ${clinicId} | Papel (Role): ${profile.role}`);

  console.log('\n========================================================');
  console.log('🔍 INICIANDO AUDITORIA DE LEITURA/ESCRITA RLS');
  console.log('========================================================\n');

  for (const table of tablesToCheck) {
    console.log(`--- Tabela: ${table} ---`);

    // 1. Testar SELECT
    let selectSuccess = false;
    let sampleRow = null;
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`  Read: ❌ ERRO: [${error.code}] ${error.message}`);
      } else {
        selectSuccess = true;
        sampleRow = data && data.length > 0 ? data[0] : null;
        console.log(`  Read: ✅ SUCESSO (Retornou ${data.length} linhas)`);
      }
    } catch (err) {
      console.log(`  Read: 💥 EXCEÇÃO: ${err.message}`);
    }

    // 2. Testar INSERT (dummy)
    try {
      // Criar payload de inserção específico para cada tabela com clinic_id correto
      let dummyPayload = { clinic_id: clinicId };
      
      if (table === 'clinics') {
        dummyPayload = { name: 'Clinica Dummy Test', subdomain: 'dummytest_' + Math.random().toString(36).substring(2, 7) };
      } else if (table === 'profiles') {
        dummyPayload = { id: '00000000-0000-0000-0000-000000000000', full_name: 'Dummy Profile', clinic_id: clinicId, role: 'DOCTOR' };
      } else if (table === 'patients') {
        dummyPayload = { clinic_id: clinicId, name: 'Dummy Patient', phone: '123456789' };
      } else if (table === 'chairs') {
        dummyPayload = { clinic_id: clinicId, name: 'Cadeira Teste' };
      } else if (table === 'appointments') {
        dummyPayload = { clinic_id: clinicId, start_time: new Date().toISOString(), end_time: new Date().toISOString(), status: 'PENDING' };
      } else if (table === 'whatsapp_config') {
        dummyPayload = { clinic_id: clinicId, instance_name: 'dummy-instance', api_key: 'dummy-key' };
      } else if (table === 'suppliers') {
        dummyPayload = { clinic_id: clinicId, name: 'Supplier Dummy' };
      } else if (table === 'accounts_payable') {
        dummyPayload = { clinic_id: clinicId, description: 'Dummy Expense', amount: 10.0, due_date: new Date().toISOString().split('T')[0], category: 'OTHER' };
      } else if (table === 'medical_records') {
        dummyPayload = { clinic_id: clinicId, patient_id: '00000000-0000-0000-0000-000000000000', dentist_id: auth.user.id, description: 'Test', signature_hash: 'abc' };
      } else if (table === 'prescriptions') {
        dummyPayload = { clinic_id: clinicId, patient_id: '00000000-0000-0000-0000-000000000000', dentist_id: auth.user.id, title: 'Receita Teste', description: 'Test', signature_hash: 'abc' };
      } else if (table === 'tooth_records') {
        dummyPayload = { clinic_id: clinicId, patient_id: '00000000-0000-0000-0000-000000000000', tooth_number: 11, status: 'NEED_TREATMENT' };
      } else if (table === 'crm_leads') {
        dummyPayload = { clinic_id: clinicId, name: 'Lead Dummy', phone: '123456789' };
      } else if (table === 'treatment_budgets') {
        dummyPayload = { clinic_id: clinicId, patient_id: '00000000-0000-0000-0000-000000000000', total_amount: 100 };
      } else if (table === 'treatment_items') {
        dummyPayload = { clinic_id: clinicId, budget_id: '00000000-0000-0000-0000-000000000000', procedure_name: 'Proc Test', price: 100 };
      } else if (table === 'installments') {
        dummyPayload = { clinic_id: clinicId, budget_id: '00000000-0000-0000-0000-000000000000', installment_number: 1, due_date: new Date().toISOString().split('T')[0], amount: 100 };
      } else if (table === 'transactions') {
        dummyPayload = { clinic_id: clinicId, description: 'Trans Dummy', amount: 100, type: 'INCOME', date: new Date().toISOString().split('T')[0] };
      }

      const { data, error } = await supabase
        .from(table)
        .insert([dummyPayload])
        .select();

      if (error) {
        console.log(`  Write (Insert): ❌ ERRO: [${error.code}] ${error.message}`);
      } else {
        console.log(`  Write (Insert): ✅ SUCESSO`);
        // Se inseriu com sucesso, vamos deletar para limpar
        if (data && data.length > 0) {
          const insertedId = data[0].id;
          const { error: delErr } = await supabase
            .from(table)
            .delete()
            .eq('id', insertedId);
          if (delErr) {
            console.log(`    Cleanup Delete: ⚠️ Falha ao limpar item inserido: ${delErr.message}`);
          }
        }
      }
    } catch (err) {
      console.log(`  Write (Insert): 💥 EXCEÇÃO: ${err.message}`);
    }

    // 3. Testar UPDATE
    if (selectSuccess && sampleRow) {
      try {
        let updatePayload = {};
        if (table === 'patients') updatePayload = { name: sampleRow.name };
        else if (table === 'appointments') updatePayload = { status: sampleRow.status };
        else if (table === 'clinics') updatePayload = { name: sampleRow.name };
        else if (table === 'profiles') updatePayload = { full_name: sampleRow.full_name };
        else if (table === 'chairs') updatePayload = { name: sampleRow.name };
        else if (table === 'whatsapp_config') updatePayload = { instance_name: sampleRow.instance_name };
        else if (table === 'suppliers') updatePayload = { name: sampleRow.name };
        else if (table === 'accounts_payable') updatePayload = { description: sampleRow.description };
        else if (table === 'medical_records') updatePayload = { description: sampleRow.description };
        else if (table === 'prescriptions') updatePayload = { description: sampleRow.description };
        else if (table === 'tooth_records') updatePayload = { status: sampleRow.status };
        else if (table === 'crm_leads') updatePayload = { name: sampleRow.name };
        else if (table === 'treatment_budgets') updatePayload = { description: sampleRow.description };
        else if (table === 'treatment_items') updatePayload = { procedure_name: sampleRow.procedure_name };
        else if (table === 'installments') updatePayload = { status: sampleRow.status };
        else if (table === 'transactions') updatePayload = { description: sampleRow.description };
        
        if (Object.keys(updatePayload).length > 0) {
          const { error: retryErr } = await supabase
            .from(table)
            .update(updatePayload)
            .eq('id', sampleRow.id);
          if (retryErr) {
            console.log(`  Write (Update): ❌ ERRO: [${retryErr.code}] ${retryErr.message}`);
          } else {
            console.log(`  Write (Update): ✅ SUCESSO`);
          }
        } else {
          console.log(`  Write (Update): ℹ️ Ignorado (sem campo de teste compatível)`);
        }
      } catch (err) {
        console.log(`  Write (Update): 💥 EXCEÇÃO: ${err.message}`);
      }
    } else {
      console.log(`  Write (Update): ℹ️ Ignorado (nenhuma linha de amostra disponível)`);
    }
  }

  console.log('\n========================================================');
  console.log('🎉 Auditoria de leitura/escrita concluída!');
  console.log('========================================================\n');
  process.exit(0);
}

runAudit();

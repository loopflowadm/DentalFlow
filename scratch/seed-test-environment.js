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

async function runSeed() {
  const testEmail = 'tester@dentalflow.com';
  const testPassword = 'Password123!';
  let clinicId;

  console.log('1. Verificando/Criando Clínica e Usuário...');

  // Tentar fazer login para ver se o usuário já existe
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (!loginErr && loginData.user) {
    console.log('✅ Usuário de teste já existe. Obtendo ID da clínica...');
    // Obter clínica do perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', loginData.user.id)
      .single();
    
    clinicId = profile.clinic_id;
  } else {
    // Cadastrar nova clínica
    console.log('Clínica não encontrada. Registrando Clínica de Teste...');
    const { data: clinicData, error: clinicErr } = await supabase
      .from('clinics')
      .insert({
        name: 'Clínica DentalFlow Teste',
        subdomain: 'dentalflowteste',
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
    clinicId = clinicData.id;
    console.log('✅ Clínica criada com ID:', clinicId);

    // Cadastrar usuário
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          clinic_id: clinicId,
          role: 'CLINIC_ADMIN',
          full_name: 'Dr. Thácio Maikon'
        }
      }
    });

    if (authErr) {
      console.error('❌ Erro no Sign Up do usuário de teste:', authErr.message);
      process.exit(1);
    }
    console.log('✅ Usuário tester@dentalflow.com registrado.');
  }

  console.log(`Using Clinic ID: ${clinicId}`);

  // 2. Criar paciente João Silva
  console.log('2. Verificando/Criando paciente João Silva...');
  let patientId;
  const { data: existingPatients } = await supabase
    .from('patients')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('name', 'João Silva');

  if (existingPatients && existingPatients.length > 0) {
    patientId = existingPatients[0].id;
    console.log('✅ João Silva já existe com ID:', patientId);
  } else {
    const { data: patData, error: patErr } = await supabase
      .from('patients')
      .insert({
        clinic_id: clinicId,
        name: 'João Silva',
        phone: '5511999998888',
        email: 'joao@email.com',
        medical_history: 'Sensibilidade geral. Histórico de cáries.'
      })
      .select()
      .single();

    if (patErr) {
      console.error('❌ Erro ao criar paciente João Silva:', patErr.message);
      process.exit(1);
    }
    patientId = patData.id;
    console.log('✅ João Silva criado com ID:', patientId);
  }

  // 3. Criar Orçamento aprovado
  console.log('3. Verificando/Criando Orçamento de Tratamento...');
  let budgetId;
  const { data: existingBudgets } = await supabase
    .from('treatment_budgets')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId);

  if (existingBudgets && existingBudgets.length > 0) {
    budgetId = existingBudgets[0].id;
    console.log('✅ Orçamento já existe com ID:', budgetId);
  } else {
    const { data: budData, error: budErr } = await supabase
      .from('treatment_budgets')
      .insert({
        clinic_id: clinicId,
        patient_id: patientId,
        description: 'Tratamento de Canal Geral',
        status: 'APPROVED',
        total_amount: 1000.00
      })
      .select()
      .single();

    if (budErr) {
      console.error('❌ Erro ao criar orçamento:', budErr.message);
      process.exit(1);
    }
    budgetId = budData.id;
    console.log('✅ Orçamento criado com ID:', budgetId);
  }

  // 4. Criar Parcela Vencida (> 30 dias atrás)
  console.log('4. Verificando/Criando Parcela Vencida...');
  const { data: existingInstallments } = await supabase
    .from('installments')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('budget_id', budgetId);

  if (existingInstallments && existingInstallments.length > 0) {
    console.log('✅ Parcela já existe. Nenhuma nova parcela inserida.');
  } else {
    // Data de vencimento: 40 dias atrás
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 40);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const { error: instErr } = await supabase
      .from('installments')
      .insert({
        clinic_id: clinicId,
        budget_id: budgetId,
        installment_number: 1,
        due_date: dueDateStr,
        amount: 1000.00,
        status: 'PENDING'
      });

    if (instErr) {
      console.error('❌ Erro ao criar parcela vencida:', instErr.message);
      process.exit(1);
    }
    console.log(`✅ Parcela vencida adicionada (Vencimento: ${dueDateStr}, Status: PENDING).`);
  }

  console.log('\n🚀 AMBIENTE DE TESTE CONFIGURADO COM SUCESSO!');
  console.log('Use o e-mail: tester@dentalflow.com');
  console.log('Use a senha: Password123!');
  process.exit(0);
}

runSeed();

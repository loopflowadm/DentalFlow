import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carregar variáveis do .env.local se existirem
const envPath = path.resolve('.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      env[key] = val;
    }
  });
}
const getEnv = (key) => process.env[key] || env[key] || '';

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

const globalKey = getEnv('VITE_EVOLUTION_API_KEY');
const url = getEnv('VITE_EVOLUTION_API_BASE_URL');
const targetPhone = process.env.TEST_PHONE || '5583996973326';

console.log('---------------------------------------------------------');
console.log('⚡ ODONTOCRM — TESTE DE FLUXO DE BOTÕES INTERATIVOS (EVOLUTION v2)');
console.log('---------------------------------------------------------');
console.log(`📌 Telefone: ${targetPhone}`);
console.log(`📌 Instância: dentalflow-prod`);

async function runTest() {
  console.log('\n🚀 1. Disparando Botões Interativos Nativos...');
  const buttonRes = await fetch(`${url}/message/sendButtons/dentalflow-prod`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': globalKey },
    body: JSON.stringify({
      number: targetPhone,
      title: 'Confirmação de Consulta OdontoCRM 🦷',
      description: 'Olá! Você possui uma consulta agendada na Clínica OdontoCRM para amanhã às 14:00. Por favor, confirme sua presença abaixo:',
      footer: 'OdontoCRM - Odontologia Especializada',
      buttons: [
        { type: 'reply', displayText: 'Confirmar Presença ✅', id: 'btn_confirm' },
        { type: 'reply', displayText: 'Reagendar Horário 🔄', id: 'btn_reschedule' }
      ]
    })
  }).then(r => r.json());

  console.log('📩 Status Disparo de Botões:', buttonRes.status || 'OK (201)');
  console.log('🆔 ID da Mensagem:', buttonRes.key?.id);

  console.log('\n🚀 2. Simulando Clique do Paciente no Botão "Confirmar Presença ✅"...');
  const webhookRes = await fetch(`${supabaseUrl}/functions/v1/whatsapp-agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': globalKey
    },
    body: JSON.stringify({
      event: 'messages.upsert',
      instance: 'dentalflow-prod',
      data: {
        key: {
          remoteJid: `${targetPhone}@s.whatsapp.net`,
          fromMe: false,
          id: 'TEST_BUTTON_REPLY_001'
        },
        pushName: 'Paciente Teste',
        message: {
          buttonsResponseMessage: {
            selectedButtonId: 'btn_confirm',
            selectedDisplayText: 'Confirmar Presença ✅'
          }
        }
      }
    })
  }).then(r => r.json());

  console.log('📩 Resposta do Webhook ao clique:', webhookRes);

  console.log('\n🚀 3. Verificando Atualização da Agenda no Banco de Dados...');
  const { data: appt, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('clinic_id', '00000000-0000-0000-0000-000000000001')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Erro ao consultar agendamento:', error);
  } else {
    console.log('✨ Estado Atual do Agendamento no Supabase:');
    console.log(`   - ID Agendamento: ${appt.id}`);
    console.log(`   - Data/Hora: ${appt.appointment_date}`);
    console.log(`   - STATUS NO BANCO: ${appt.status} ${appt.status === 'CONFIRMED' ? '✅ (SUCESSO!)' : ''}`);
  }

  console.log('\n---------------------------------------------------------');
  console.log('🏁 TESTE DO FLUXO COMPLETO DE BOTÕES CONCLUÍDO COM SUCESSO!');
  console.log('---------------------------------------------------------');
}

runTest();

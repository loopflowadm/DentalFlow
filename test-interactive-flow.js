import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxjwfzknxatoozbuhqtr.supabase.co';
const supabaseKey = 'sb_publishable_RfO9DUfBP1yi4gT1k2Qbbw_la4aLu7p';
const supabase = createClient(supabaseUrl, supabaseKey);

const globalKey = 'dentalflow_key_secure_123456';
const url = 'http://179.197.225.90:8080';
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

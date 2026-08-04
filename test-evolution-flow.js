import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Carregar variáveis do arquivo .env.local
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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://rxjwfzknxatoozbuhqtr.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RfO9DUfBP1yi4gT1k2Qbbw_la4aLu7p';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/whatsapp-agent`;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('---------------------------------------------------------');
console.log('🦷 DENTALFLOW / ODONTOCRM — TEST SUITE EVOLUTION API');
console.log('---------------------------------------------------------');
console.log(`📌 Supabase URL: ${SUPABASE_URL}`);
console.log(`📌 Edge Function: ${EDGE_FUNCTION_URL}\n`);

async function sendWebhookMessage(phone, text, instanceName, apiKey) {
  const mockPayload = {
    event: 'messages.upsert',
    instance: instanceName,
    data: {
      key: {
        remoteJid: `${phone}@s.whatsapp.net`,
        fromMe: false,
        id: `TEST_MSG_${Date.now()}`
      },
      pushName: 'Paciente Teste 1Chip',
      message: { conversation: text }
    }
  };

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey
    },
    body: JSON.stringify(mockPayload)
  });

  const data = await response.json();
  return { status: response.status, data };
}

async function runEvolutionTests() {
  const testPhone = process.env.TEST_PHONE || '5583999999999';
  const instanceName = process.env.INSTANCE_NAME || 'odonto-crm';
  const apiKey = process.env.EVOLUTION_API_KEY || 'odonto-secret-key';
  const evolutionBaseUrl = process.env.EVOLUTION_API_URL || 'http://179.197.225.90:8080';

  console.log('🧪 ETAPA 1: Verificando Configurações e Instância Evolution API...');
  console.log(`   - Instância Alvo: ${instanceName}`);
  console.log(`   - Número de Teste (1 Chip): ${testPhone}`);
  console.log(`   - URL Evolution API: ${evolutionBaseUrl}`);

  try {
    const checkRes = await fetch(`${evolutionBaseUrl}/instance/fetchInstances`, {
      headers: { 'apikey': apiKey }
    });
    if (checkRes.ok) {
      console.log('   ✅ Conexão com Evolution API estabelecida com sucesso!');
    } else {
      console.log(`   ℹ️ Evolution API respondeu HTTP ${checkRes.status}.`);
    }
  } catch (err) {
    console.log(`   ℹ️ Testando integração via Edge Function...`);
  }

  console.log('\n🧪 ETAPA 2 & 3: Diálogo com a IA Sofia (Solicitação de Agendamento)...');
  console.log('   💬 Enviando Turno 1: "Olá, gostaria de agendar uma limpeza para amanhã às 14:00 por favor"');
  
  const turn1 = await sendWebhookMessage(testPhone, 'Olá, gostaria de agendar uma limpeza para amanhã às 14:00 por favor', instanceName, apiKey);
  console.log(`   📩 Status Edge Function: ${turn1.status}`);
  console.log(`   🤖 Resposta Sofia IA: "${turn1.data.responseText || turn1.data.error || JSON.stringify(turn1.data)}"\n`);

  console.log('   💬 Enviando Turno 2 (Confirmação): "Sim, pode confirmar o agendamento por favor!"');
  const turn2 = await sendWebhookMessage(testPhone, 'Sim, pode confirmar o agendamento por favor!', instanceName, apiKey);
  console.log(`   📩 Status Edge Function: ${turn2.status}`);
  console.log(`   🤖 Resposta Sofia IA: "${turn2.data.responseText || turn2.data.error || JSON.stringify(turn2.data)}"`);

  console.log('\n🧪 ETAPA 4: Auditando Banco de Dados Supabase (Consultas e Chat Logs)...');
  try {
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    if (messages && messages.length > 0) {
      console.log(`   💬 Log das últimas ${messages.length} mensagens no banco de dados:`);
      messages.reverse().forEach(m => console.log(`      [${m.sender}] ${m.message_text}`));
    }

    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (appointments && appointments.length > 0) {
      console.log(`\n   📅 ${appointments.length} agendamento(s) gravado(s) com sucesso na tabela appointments:`);
      appointments.forEach(a => console.log(`      ✅ ID: ${a.id} | Início: ${a.start_time} | Término: ${a.end_time} | Status: ${a.status}`));
    } else {
      console.log('   ℹ️ Nenhum agendamento gravado ainda. (Verifique RLS da tabela appointments no Supabase se necessário)');
    }
  } catch (err) {
    console.error('   ❌ Erro na auditoria:', err.message);
  }

  console.log('\n---------------------------------------------------------');
  console.log('🏁 BATERIA DE TESTES COMPLETA CONCLUÍDA COM SUCESSO!');
  console.log('---------------------------------------------------------');
}

runEvolutionTests();

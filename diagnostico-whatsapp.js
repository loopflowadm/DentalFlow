/**
 * 🔍 DIAGNÓSTICO COMPLETO — Evolution API + Supabase Webhook
 * 
 * Roda com: node diagnostico-whatsapp.js
 * 
 * O que este script verifica:
 *  1. Conectividade com a Evolution API
 *  2. Status da instância WhatsApp (se está conectada)
 *  3. Configuração do webhook na Evolution API
 *  4. Se a Edge Function está respondendo
 *  5. Se a trava de número de teste está bloqueando mensagens
 */

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

const EVOLUTION_URL = getEnv('VITE_EVOLUTION_API_BASE_URL');
const EVOLUTION_KEY = getEnv('VITE_EVOLUTION_API_KEY');
const INSTANCE = 'dentalflow-prod';
const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
const EDGE_FUNCTION_URL = getEnv('VITE_WHATSAPP_EDGE_URL') || `${SUPABASE_URL}/functions/v1/whatsapp-agent`;

if (!EVOLUTION_URL || !EVOLUTION_KEY || !SUPABASE_URL) {
  console.error('\n❌ Configure VITE_EVOLUTION_API_BASE_URL, VITE_EVOLUTION_API_KEY e VITE_SUPABASE_URL\n   no arquivo .env.local (não use credenciais hardcoded).\n');
  process.exit(1);
}

const OK  = '  OK';
const ERR = '  ERRO';
const WRN = '  AVISO';
const INF = '  INFO';

async function check(label, fn) {
  process.stdout.write(`\n${label}...`);
  try {
    const result = await fn();
    return result;
  } catch (e) {
    console.log(`\n${ERR}: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('DIAGNOSTICO WHATSAPP / EVOLUTION API / SUPABASE');
  console.log('======================================================');

  // 1. Ping na Evolution API
  console.log('\n[ETAPA 1] CONECTIVIDADE COM EVOLUTION API');
  await check('   Ping', async () => {
    const r = await fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
      headers: { apikey: EVOLUTION_KEY }
    });
    const data = await r.json();
    console.log(`\n${OK} Conectado! HTTP ${r.status}`);
    return data;
  });

  // 2. Status da Instancia
  console.log('\n[ETAPA 2] STATUS DA INSTANCIA WHATSAPP');
  await check('   Status', async () => {
    const r = await fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
      headers: { apikey: EVOLUTION_KEY }
    });
    const instances = await r.json();
    const list = Array.isArray(instances) ? instances : [instances];
    const inst = list.find(i => i.name === INSTANCE || i.instance?.instanceName === INSTANCE);

    if (!inst) {
      console.log(`\n${ERR} Instancia "${INSTANCE}" NAO encontrada!`);
      console.log(`${INF} Instancias disponíveis: ${list.map(i => i.name || i.instance?.instanceName).join(', ')}`);
      return;
    }

    const state = inst.instance?.state || inst.state || 'desconhecida';
    const connected = state === 'open';

    if (connected) {
      console.log(`\n${OK} Instancia "${INSTANCE}" CONECTADA (state: ${state})`);
    } else {
      console.log(`\n${ERR} Instancia "${INSTANCE}" NAO conectada. Estado: "${state}"`);
      console.log(`${WRN} Escanear QR code novamente ou sessao expirou.`);
    }
    return state;
  });

  // 3. Webhook
  console.log('\n[ETAPA 3] CONFIGURACAO DO WEBHOOK');
  await check('   Webhook', async () => {
    const r = await fetch(`${EVOLUTION_URL}/webhook/find/${INSTANCE}`, {
      headers: { apikey: EVOLUTION_KEY }
    });
    const data = await r.json();
    console.log(`\n${INF} Webhook raw: ${JSON.stringify(data, null, 2)}`);

    const url = data?.url || data?.webhook?.url;
    if (!url) {
      console.log(`\n${ERR} Webhook NAO configurado!`);
      console.log(`${INF} Configure para: ${EDGE_FUNCTION_URL}`);
    } else if (url.includes('whatsapp-agent')) {
      console.log(`\n${OK} Webhook correto: ${url}`);
    } else {
      console.log(`\n${WRN} Webhook para URL diferente: ${url}`);
    }
    
    const events = data?.events || data?.webhook?.events || [];
    if (events.length > 0) {
      console.log(`${INF} Eventos: ${events.join(', ')}`);
      if (!events.includes('MESSAGES_UPSERT') && !events.includes('messages.upsert')) {
        console.log(`${ERR} Evento MESSAGES_UPSERT ausente! Mensagens nao chegam ao webhook.`);
      }
    }
    return data;
  });

  // 4. Edge Function
  console.log('\n[ETAPA 4] TESTE DA EDGE FUNCTION');
  await check('   Simulando mensagem', async () => {
    const testPhone = '5583000000000';
    const payload = {
      event: 'messages.upsert',
      instance: INSTANCE,
      data: {
        key: {
          remoteJid: `${testPhone}@s.whatsapp.net`,
          fromMe: false,
          id: `DIAG_TEST_${Date.now()}`
        },
        pushName: 'Amigo Diagnostico',
        message: { conversation: 'Oi, teste de diagnostico' }
      }
    };

    const r = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    console.log(`\n${OK} Edge Function respondeu HTTP ${r.status}`);
    console.log(`${INF} Resposta: ${JSON.stringify(data)}`);

    if (JSON.stringify(data).includes('Ignorado') || JSON.stringify(data).includes('numero de testes') || JSON.stringify(data).includes('testes configurado')) {
      console.log(`\n${ERR} TRAVA DE NUMERO DE TESTE ATIVA!`);
      console.log(`${WRN} Mensagens de outros numeros sao IGNORADAS.`);
      console.log(`${INF} SOLUCAO: No Supabase Dashboard > Edge Functions > whatsapp-agent > Secrets`);
      console.log(`${INF}          Adicione: LIMIT_TO_TEST_NUMBER = false`);
    }
    return data;
  });

  // 5. Banco de dados
  console.log('\n[ETAPA 5] ULTIMAS MENSAGENS NO BANCO');
  await check('   Consultando chat_messages', async () => {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/chat_messages?order=created_at.desc&limit=5`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
    
    if (!r.ok) {
      console.log(`\n${ERR} Erro ao consultar banco: HTTP ${r.status}`);
      return;
    }

    const msgs = await r.json();
    if (!msgs || msgs.length === 0) {
      console.log(`\n${WRN} Nenhuma mensagem em chat_messages. Webhook nunca processou nada.`);
    } else {
      console.log(`\n${OK} ${msgs.length} mensagem(ns) encontrada(s):`);
      msgs.forEach(m => {
        const ts = new Date(m.created_at).toLocaleString('pt-BR');
        const sender = m.sender || m.role || '?';
        const text = (m.message_text || m.content || '').substring(0, 80);
        console.log(`     [${ts}] [${sender}] ${text}`);
      });
    }
    return msgs;
  });

  console.log('\n======================================================');
  console.log('RESUMO: Passos para corrigir se nao estiver funcionando');
  console.log('======================================================');
  console.log(`
  1. Instancia deve estar no estado "open" (Etapa 2)
  2. Webhook deve apontar para:
     ${EDGE_FUNCTION_URL}
  3. Se Etapa 4 retornar "Ignorado" -> DESATIVAR TRAVA:
     Supabase Dashboard > Project Settings > Edge Functions
     > whatsapp-agent > Environment Variables
     > LIMIT_TO_TEST_NUMBER = false
  4. Evento MESSAGES_UPSERT deve estar ativo no webhook (Etapa 3)
  `);
  console.log('======================================================\n');
}

main().catch(console.error);

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

const evolutionUrl = (process.env.EVOLUTION_API_URL || 'http://179.197.225.90:8080').replace(/\/$/, '');
const instanceName = process.env.INSTANCE_NAME || 'odonto-crm';
const globalApiKey = process.env.EVOLUTION_GLOBAL_KEY || process.env.EVOLUTION_API_KEY || 'odonto-secret-key';
const webhookUrl = 'https://rxjwfzknxatoozbuhqtr.supabase.co/functions/v1/whatsapp-agent';

console.log('---------------------------------------------------------');
console.log('🛠️ EVOLUTION API — CRIAR INSTÂNCIA E CONFIGURAR WEBHOOK');
console.log('---------------------------------------------------------');
console.log(`📌 URL VPS: ${evolutionUrl}`);
console.log(`📌 Nome da Instância: ${instanceName}`);
console.log(`📌 Webhook Edge Function: ${webhookUrl}\n`);

async function createInstance() {
  const createUrl = `${evolutionUrl}/instance/create`;

  const payload = {
    instanceName: instanceName,
    token: 'odonto-secret-key',
    qrcode: true,
    integration: 'WHATSAPP-BAILEYS',
    webhook: webhookUrl,
    webhook_by_events: false,
    events: [
      'MESSAGES_UPSERT'
    ]
  };

  console.log(`🚀 Solicitando criação da instância '${instanceName}' em ${createUrl}...`);

  try {
    const res = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': globalApiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log(`📩 Status HTTP: ${res.status}`);
    console.log(`📄 Resposta:`, JSON.stringify(data, null, 2));

    if (res.ok || res.status === 201) {
      console.log(`\n✅ INSTÂNCIA '${instanceName}' CRIADA COM SUCESSO!`);
      if (data.qrcode?.base64 || data.code) {
        console.log(`📲 QR Code gerado! Abra o WhatsApp no seu celular e escaneie o código.`);
      }
    } else if (data.response?.message?.includes('already exists')) {
      console.log(`\nℹ️ A instância '${instanceName}' já existe na Evolution API!`);
    } else {
      console.log(`\n⚠️ Verifique a Global API Key no arquivo .env ou no painel da sua VPS.`);
    }
  } catch (err) {
    console.error(`❌ Erro ao conectar com Evolution API:`, err.message);
  }
}

createInstance();

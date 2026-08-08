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

const globalKey = getEnv('VITE_EVOLUTION_API_KEY');
const url = getEnv('VITE_EVOLUTION_API_BASE_URL');
const phone = process.env.TEST_PHONE || '5583996973326';

if (!globalKey || !url) {
  console.error('\n❌ Configure VITE_EVOLUTION_API_KEY e VITE_EVOLUTION_API_BASE_URL\n   no arquivo .env.local (não use credenciais hardcoded).\n');
  process.exit(1);
}

console.log('---------------------------------------------------------');
console.log('🔑 GERADOR DE CÓDIGO DE PAREAMENTO WHATSAPP (WITHOUT CAMERA)');
console.log('---------------------------------------------------------');
console.log(`📌 Telefone: ${phone}`);

async function getPairingCode() {
  try {
    const res = await fetch(`${url}/instance/connect/odonto-crm?number=${phone}`, {
      headers: { 'apikey': globalKey }
    });
    const data = await res.json();
    const code = data.pairingCode || data.code || (data.qrcode && data.qrcode.pairingCode);

    if (code) {
      console.log(`\n🎉 CÓDIGO DE PAREAMENTO GERADO: ${code}`);
      console.log(`\n📲 NO SEU CELULAR:`);
      console.log(`1. Abra o WhatsApp > Aparelhos Conectados > Conectar um aparelho.`);
      console.log(`2. Toque em 'Conectar com número de telefone' no rodapé da tela.`);
      console.log(`3. Digite o código: ${code}`);
    } else {
      console.log('⚠️ Status atual:', data);
    }
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
}

getPairingCode();

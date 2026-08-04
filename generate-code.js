import fs from 'fs';
import path from 'path';

const globalKey = 'dentalflow_key_secure_123456';
const url = 'http://179.197.225.90:8080';
const phone = process.env.TEST_PHONE || '5583996973326';

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

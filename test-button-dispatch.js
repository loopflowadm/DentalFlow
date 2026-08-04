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

const targetPhone = process.env.TEST_PHONE || '5583996973326';
const evolutionUrl = (process.env.EVOLUTION_API_URL || 'http://179.197.225.90:8080').replace(/\/$/, '');
const instanceName = process.env.INSTANCE_NAME || 'dentalflow-prod';
const apiKey = process.env.EVOLUTION_API_KEY || 'dentalflow_key_secure_123456';

console.log('---------------------------------------------------------');
console.log('⚡ ODONTOCRM — TESTE DE DISPARO DE MENSAGENS E BOTÕES');
console.log('---------------------------------------------------------');
console.log(`📌 Número de Destino (1 Chip): ${targetPhone}`);
console.log(`📌 URL Evolution API: ${evolutionUrl}`);
console.log(`📌 Instância: ${instanceName}\n`);

// Formatação do número com DDI 55
function formatPhone(phone) {
  let clean = phone.replace(/\D/g, '');
  if (!clean.startsWith('55') && clean.length <= 11) {
    clean = '55' + clean;
  }
  return clean;
}

// Botões / Modelos de Disparo Manual e Automático do OdontoCRM
const buttonDispatches = [
  {
    buttonName: 'Confirmar Consulta (Botão de Ação Rápida)',
    messageText: `Olá! Confirmamos sua consulta odontológica agendada para amanhã na Clínica OdontoCRM Teste. Por favor, responda SIM para confirmar sua presença! 🦷`
  },
  {
    buttonName: 'Enviar Dados PIX (Botão Financeiro)',
    messageText: `Olá! Seguem os dados para pagamento do seu tratamento via PIX:\n\nChave PIX: 12.345.678/0001-90\nFavorecido: Clínica OdontoCRM Teste\n\nPor favor, nos envie o comprovante após a transferência!`
  },
  {
    buttonName: 'Lembrete de Check-up 6 Meses (Automação)',
    messageText: `Olá! Já faz 6 meses da sua última limpeza preventiva na Clínica OdontoCRM. Manter a saúde bucal em dia previne cáries. Vamos agendar seu retorno? 😊`
  }
];

async function runButtonDispatchTests() {
  const formattedNumber = formatPhone(targetPhone);
  console.log(`🎯 Número Formatado para Envio: ${formattedNumber}`);
  const sendUrl = `${evolutionUrl}/message/sendText/${instanceName}`;

  for (let i = 0; i < buttonDispatches.length; i++) {
    const item = buttonDispatches[i];
    console.log(`\n🚀 [Disparo ${i + 1}/${buttonDispatches.length}] Clicando no Botão: "${item.buttonName}"...`);

    const payload = {
      number: formattedNumber,
      text: item.messageText,
      options: {
        delay: 1200,
        presence: 'composing'
      }
    };

    try {
      const res = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify(payload)
      });

      const textRes = await res.text();
      console.log(`   📩 Status HTTP Evolution API: ${res.status}`);
      console.log(`   📄 Resposta Evolution API: ${textRes}`);

      if (res.ok) {
        console.log(`   🎉 DISPARO ENVIADO COM SUCESSO! Verifique a mensagem no celular ${formattedNumber}`);
      } else {
        console.log(`   ⚠️ Evolution API retornou erro HTTP ${res.status}. Verifique se a instância '${instanceName}' está conectada via QR Code e se a chave de API é válida.`);
      }
    } catch (err) {
      console.error(`   ❌ Falha ao contactar servidor Evolution API:`, err.message);
    }
  }

  console.log('\n---------------------------------------------------------');
  console.log('🏁 FIM DO TESTE DE DISPARO DOS BOTÕES DO CRM');
  console.log('---------------------------------------------------------');
}

runButtonDispatchTests();

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

async function fixLogos() {
  console.log('Buscando todas as clínicas no Supabase...');
  const { data: clinics, error: fetchErr } = await supabase.from('clinics').select('*');
  
  if (fetchErr) {
    console.error('❌ Erro ao buscar clínicas:', fetchErr.message);
    process.exit(1);
  }

  console.log(`Encontradas ${clinics.length} clínicas. Analisando logos...`);

  for (const clinic of clinics) {
    let logoRaw = clinic.logo_url;
    if (!logoRaw) continue;

    if (logoRaw.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(logoRaw);
        let innerLogo = parsed.logo_url || '';
        
        // Verificar se o logo_url interno é um JSON de endereço
        if (innerLogo.trim().startsWith('{')) {
          const innerParsed = JSON.parse(innerLogo);
          if (innerParsed.address_cep || innerParsed.cep) {
            console.log(`\n🔍 Corrupção detectada na clínica: "${clinic.name}"`);
            console.log('Endereço antigo encontrado no campo logo_url:', innerParsed);
            
            // Reestruturar para o formato correto
            const correctedAddress = {
              cep: innerParsed.address_cep || innerParsed.cep || '',
              logradouro: innerParsed.address_street || innerParsed.logradouro || '',
              numero: innerParsed.address_number || innerParsed.numero || '',
              complemento: innerParsed.address_complement || innerParsed.complemento || '',
              bairro: innerParsed.address_neighborhood || innerParsed.bairro || '',
              cidade: innerParsed.address_city || innerParsed.cidade || '',
              uf: innerParsed.address_uf || innerParsed.uf || 'SP'
            };

            const correctedPacked = {
              logo_url: '🦷', // Reset para dente padrão
              accent_color: parsed.accent_color || '#D9E2FF',
              font_family: parsed.font_family || 'Inter',
              theme_base: parsed.theme_base || 'light',
              favicon_url: parsed.favicon_url || '',
              login_title: parsed.login_title || 'Bem-vindo ao seu portal',
              login_bg: parsed.login_bg || '',
              address: correctedAddress
            };

            const newPackedString = JSON.stringify(correctedPacked);

            console.log(`Corrigindo no banco para "${clinic.name}"...`);
            const { error: updateErr } = await supabase
              .from('clinics')
              .update({ logo_url: newPackedString })
              .eq('id', clinic.id);

            if (updateErr) {
              console.error(`❌ Erro ao atualizar "${clinic.name}":`, updateErr.message);
            } else {
              console.log(`✅ Clínica "${clinic.name}" corrigida com sucesso! Logo definida para 🦷`);
            }
          }
        }
      } catch (err) {
        console.error(`Falha ao processar logo_url da clínica ${clinic.name}:`, err.message);
      }
    }
  }

  console.log('\n🎉 Varredura e correção concluídas!');
  process.exit(0);
}

fixLogos();

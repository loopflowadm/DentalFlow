import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Ler o arquivo .env.local manualmente para obter as credenciais
const envPath = path.resolve('.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
  console.error('❌ Não foi possível carregar o arquivo .env.local:', e.message);
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    env[key] = val;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Credenciais do Supabase ausentes no .env.local');
  process.exit(1);
}

console.log('🔗 Conectando ao Supabase em:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tablesToCheck = [
  'clinics',
  'profiles',
  'patients',
  'chairs',
  'appointments',
  'whatsapp_config',
  'suppliers',
  'accounts_payable',
  'medical_records',
  'prescriptions',
  'tooth_records',
  'crm_leads',
  'treatment_budgets',
  'treatment_items',
  'installments',
  'transactions'
];

async function runAudit() {
  console.log('\n========================================================');
  console.log('🔍 RELATÓRIO DE AUDITORIA DO BANCO DE DADOS SUPABASE');
  console.log('========================================================\n');

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === 'PGRST204' || error.message.includes('does not exist')) {
          console.log(`❌ Tabela "${table}": NÃO EXISTE NO BANCO (Erro PGRST204)`);
        } else if (error.code === '42501' || error.message.includes('row-level security')) {
          // RLS bloqueou a leitura anônima sem filtros, o que é esperado e significa que a tabela existe!
          console.log(`🔒 Tabela "${table}": EXISTE (Segura com políticas de RLS ativas)`);
        } else {
          console.log(`⚠️ Tabela "${table}": Erro ao ler (${error.code}) - ${error.message}`);
        }
      } else {
        console.log(`✅ Tabela "${table}": EXISTE E ESTÁ INTEGRADA (Registros estimados: ${count ?? 0})`);
      }
    } catch (err) {
      console.log(`⚠️ Tabela "${table}": Falha de conexão/exceção - ${err.message || err}`);
    }
  }

  console.log('\n========================================================');
  console.log('🎉 Auditoria concluída com sucesso!');
  console.log('========================================================\n');
}

runAudit();

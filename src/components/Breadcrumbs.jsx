import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Breadcrumbs({ activeTab }) {
  const { clinic } = useAuth();
  
  const tabLabels = {
    dashboard: 'Dashboard Geral',
    crm: 'Funil Comercial (CRM)',
    pacientes: 'Prontuários e Pacientes',
    agenda: 'Agenda Clínica',
    whatsapp: 'Central WhatsApp',
    ai: 'Agente de IA',
    automacoes: 'Automações Comerciais',
    marketing: 'Campanhas & Marketing',
    financeiro: 'Fluxo de Caixa & Finanças',
    relatorios: 'Relatórios & Business Intelligence',
    configuracoes: 'Configurações do Sistema'
  };

  return (
    <nav className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 select-none">
      <div className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer">
        {clinic?.logo_url ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center border border-slate-200/50 dark:border-slate-800/40 flex-shrink-0 select-none shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            {clinic.logo_url.startsWith('http') || clinic.logo_url.startsWith('/') ? (
              <img src={clinic.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-sm font-bold text-slate-700">{clinic.logo_url}</span>
            )}
          </div>
        ) : (
          <Home className="w-4 h-4 text-slate-400" />
        )}
        <span className="text-[15px] font-black text-slate-800 dark:text-white leading-none tracking-wide">{clinic?.name || 'DentalFlow'}</span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-450" />
      <span className="text-slate-800 dark:text-slate-200 text-xs font-medium pt-[1px]">
        {tabLabels[activeTab] || 'Página Inicial'}
      </span>
    </nav>
  );
}

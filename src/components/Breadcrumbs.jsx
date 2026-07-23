import React from 'react';
import { ChevronRight, Home, Activity, Sparkles, Gem, Building, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Breadcrumbs({ activeTab }) {
  const clinic = useAuth().clinic;
  
  const tabLabels = {
    dashboard: 'Dashboard Geral',
    crm: 'Jornada do Paciente (CRM)',
    pacientes: 'Prontuários e Pacientes',
    agenda: 'Agenda Clínica',
    whatsapp: 'Central WhatsApp',
    ai: 'Agente de IA',
    automacoes: 'Automações Comerciais',
    financeiro: 'Fluxo de Caixa & Finanças',
    relatorios: 'Relatórios & Business Intelligence',
    configuracoes: 'Configurações do Sistema'
  };

  return (
    <nav className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 select-none">
      <div className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer">
        {clinic?.logo_url ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-white/10 flex-shrink-0 select-none shadow-[0_2px_8px_rgba(25,107,251,0.2)]">
            {clinic.logo_url.startsWith('http') || clinic.logo_url.startsWith('/') || clinic.logo_url.startsWith('data:image/') || clinic.logo_url.includes('.') ? (
              <img src={clinic.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
            ) : clinic.logo_url === '🦷' ? (
              <Logo collapsed={true} className="w-7 h-7" />
            ) : (
              (() => {
                const logoMap = {
                  '✨': Sparkles,
                  '💎': Gem,
                  '🏥': Building,
                  '🛡️': Shield,
                  '⚕️': Activity
                };
                const IconComponent = logoMap[clinic.logo_url] || Activity;
                return <IconComponent className="w-5 h-5 text-secondary" style={{ color: clinic.secondary_color }} />;
              })()
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/10 flex-shrink-0 select-none shadow-[0_2px_8px_rgba(25,107,251,0.2)]">
            <Logo collapsed={true} className="w-7 h-7" />
          </div>
        )}
        <span className="text-[15px] font-black text-slate-800 dark:text-white leading-none tracking-wide">{clinic?.name || 'DentalFlow'}</span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-455" />
      <span className="text-slate-800 dark:text-slate-200 text-xs font-medium pt-[1px]">
        {tabLabels[activeTab] || 'Página Inicial'}
      </span>
    </nav>
  );
}

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CommandPalette from '../components/ui/CommandPalette';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Onboarding from './onboarding/Onboarding';

// Imports dos Módulos da Aplicação
import Dashboard from './dashboard/Dashboard';
import CRM from './crm/CRM';
import Pacientes from './pacientes/Pacientes';
import Agenda from './agenda/Agenda';
import Financeiro from './financeiro/Financeiro';
import Configuracoes from './configuracoes/Configuracoes';
import WhatsApp from './whatsapp/WhatsApp';

export default function ClinicApp() {
  const { currentTheme, themeMode } = useTheme();
  const { user, clinic, updateClinic } = useAuth();

  // Função para verificar se o onboarding já foi concluído pela clínica ou usuário
  const checkIfOnboardingDone = () => {
    if (clinic?.onboarding_completed || clinic?.has_completed_onboarding) return true;
    if (user?.onboarding_completed || user?.user_metadata?.onboarding_completed) return true;

    if (localStorage.getItem('df_onboarding_completed') === 'true') return true;
    if (localStorage.getItem('df_onboarding_done') === 'true') return true;
    if (user?.id && localStorage.getItem(`df_onboarding_done_${user.id}`) === 'true') return true;
    if (clinic?.id && localStorage.getItem(`df_onboarding_done_${clinic.id}`) === 'true') return true;
    if (clinic?.id && user?.id && localStorage.getItem(`df_onboarding_done_${clinic.id}_${user.id}`) === 'true') return true;

    return false;
  };

  const [showOnboarding, setShowOnboarding] = useState(() => !checkIfOnboardingDone());

  // Atualizar quando dados da clínica ou usuário forem carregados
  useEffect(() => {
    if (checkIfOnboardingDone()) {
      setShowOnboarding(false);
    }
  }, [clinic, user]);

  const handleOnboardingComplete = async () => {
    localStorage.setItem('df_onboarding_completed', 'true');
    localStorage.setItem('df_onboarding_done', 'true');
    if (user?.id) localStorage.setItem(`df_onboarding_done_${user.id}`, 'true');
    if (clinic?.id) localStorage.setItem(`df_onboarding_done_${clinic.id}`, 'true');
    if (clinic?.id && user?.id) localStorage.setItem(`df_onboarding_done_${clinic.id}_${user.id}`, 'true');

    if (clinic && updateClinic) {
      try {
        await updateClinic({ onboarding_completed: true });
      } catch (err) {
        console.warn('[ClinicApp] Erro ao persistir onboarding na clínica:', err);
      }
    }

    setShowOnboarding(false);
  };

  // Módulos: 'dashboard' | 'agenda' | 'pacientes' | 'crm' | 'financeiro' | 'configuracoes' | 'whatsapp'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  
  // Modais e seleções compartilhadas
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);

  // Estados compartilhados da Agenda
  const [agendaDate, setAgendaDate] = useState(() => new Date());
  const [selectedChairs, setSelectedChairs] = useState([]);
  const [selectedDentists, setSelectedDentists] = useState([]);
  const [agendaViewMode, setAgendaViewMode] = useState('day');
  const [prefilledLeadData, setPrefilledLeadData] = useState(null);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickAction = (actionType) => {
    switch (actionType) {
      case 'agenda':
        setActiveTab('agenda');
        break;
      case 'paciente':
        setActiveTab('pacientes');
        break;
      case 'lead':
        setActiveTab('crm');
        break;
      case 'financeiro':
        setActiveTab('financeiro');
        break;
      case 'whatsapp':
        setActiveTab('whatsapp');
        break;
      default:
        setActiveTab('dashboard');
    }
  };

  // Renderizador condicional do módulo ativo (Full Page Modules)
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigateTab={setActiveTab} />;
      case 'agenda':
        return (
          <Agenda 
            selectedAppointment={selectedAppointment} 
            setSelectedAppointment={setSelectedAppointment}
            currentDate={agendaDate}
            setCurrentDate={setAgendaDate}
            selectedChairs={selectedChairs}
            setSelectedChairs={setSelectedChairs}
            selectedDentists={selectedDentists}
            setSelectedDentists={setSelectedDentists}
            view={agendaViewMode}
            setView={setAgendaViewMode}
            setActiveTab={setActiveTab}
            setSelectedPatient={setSelectedPatient}
            prefilledLeadData={prefilledLeadData}
            setPrefilledLeadData={setPrefilledLeadData}
            onOpenWhatsApp={() => setActiveTab('whatsapp')}
          />
        );
      case 'pacientes':
        return (
          <Pacientes 
            selectedPatient={selectedPatient} 
            setSelectedPatient={setSelectedPatient} 
            onOpenWhatsApp={() => setActiveTab('whatsapp')}
          />
        );
      case 'crm':
        return (
          <CRM 
            selectedLead={selectedLead} 
            setSelectedLead={setSelectedLead} 
            setActiveTab={setActiveTab} 
            setPrefilledLeadData={setPrefilledLeadData} 
            onOpenWhatsApp={(patId) => {
              if (patId) setSelectedPatientId(patId);
              setActiveTab('whatsapp');
            }}
          />
        );
      case 'whatsapp':
        return (
          <WhatsApp 
            onNavigateTab={setActiveTab}
            setSelectedPatient={setSelectedPatient}
            setPrefilledLeadData={setPrefilledLeadData}
            selectedPatientId={selectedPatientId}
          />
        );
      case 'financeiro':
        return <Financeiro />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard onNavigateTab={setActiveTab} />;
    }
  };

  const { logout, selectClinic } = useAuth();

  // Se a clínica estiver inativa por motivo financeiro ou bloqueio
  if (clinic?.status === 'INACTIVE' || clinic?.status === 'SUSPENDED') {
    return (
      <div className="h-screen w-screen bg-[#090D16] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Glow de fundo vermelho sutil */}
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-red-600/10 -top-20 -left-20" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-amber-600/10 -bottom-20 -right-20" />

        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-inner">
            <span className="text-3xl">⚠️</span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              Acesso Temporariamente Suspenso
            </span>
            <h2 className="text-xl font-bold font-title text-white pt-1">
              {clinic.name || 'Sua Clínica'} está inativa
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              O acesso aos módulos operacionais foi pausado devido a uma pendência na assinatura do OdontoCRM.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-left text-xs text-slate-300 space-y-2 font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Motivo:</span>
              <span className="text-red-400 font-bold">Pendência Financeira</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Subdomínio:</span>
              <span className="text-slate-200">{clinic.subdomain}.crm.com</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href="https://wa.me/5511999999999?text=Olá,%20gostaria%20de%20regularizar%20a%20assinatura%20da%20minha%20clínica%20no%20OdontoCRM"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs"
            >
              Falar com o Suporte Financeiro
            </a>

            <button
              onClick={() => {
                if (user?.role === 'SUPER_ADMIN') {
                  selectClinic(null);
                } else {
                  logout();
                }
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition-all text-xs flex items-center justify-center gap-2"
            >
              {user?.role === 'SUPER_ADMIN' ? 'Voltar ao SuperAdmin' : 'Sair da Conta'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <Onboarding 
        onComplete={handleOnboardingComplete} 
      />
    );
  }

  return (
    <div 
      className="h-screen w-screen p-2 sm:p-4 pb-20 md:pb-4 flex flex-col md:flex-row gap-2 sm:gap-4 overflow-hidden font-body transition-colors duration-300 relative bg-[#f8fafc] dark:bg-black"
      style={themeMode === 'clinic' ? { backgroundColor: currentTheme.body_bg } : undefined}
    >
      {/* Barra Lateral Navegação */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        selectedLead={selectedLead}
        setSelectedLead={setSelectedLead}
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        selectedAppointment={selectedAppointment}
        setSelectedAppointment={setSelectedAppointment}
        agendaDate={agendaDate}
        setAgendaDate={setAgendaDate}
        selectedChairs={selectedChairs}
        setSelectedChairs={setSelectedChairs}
        selectedDentists={selectedDentists}
        setSelectedDentists={setSelectedDentists}
        agendaViewMode={agendaViewMode}
        setAgendaViewMode={setAgendaViewMode}
        onOpenWhatsApp={(patId) => {
          if (patId) setSelectedPatientId(patId);
          setActiveTab('whatsapp');
        }}
      />

      {/* Conteúdo Principal + Cabeçalho Superior */}
      <div className="flex-1 flex flex-col h-full overflow-hidden rounded-[24px] border border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0D0D0D] shadow-xl transition-colors duration-300">
        <Header 
          activeTab={activeTab}
          onSearchChange={(q) => console.log('Search query:', q)}
          onOpenWhatsApp={(patId) => {
            if (patId) setSelectedPatientId(patId);
            setActiveTab('whatsapp');
          }}
          onQuickAction={handleQuickAction}
          onOpenCmdPalette={() => setIsCmdPaletteOpen(true)}
        />
        
        <main className="flex-1 overflow-hidden p-0 bg-transparent transition-colors duration-300">
          {renderContent()}
        </main>
      </div>

      {/* Paleta de Comandos (⌘K) */}
      <CommandPalette 
        isOpen={isCmdPaletteOpen} 
        onClose={() => setIsCmdPaletteOpen(false)} 
        onNavigate={setActiveTab}
      />
    </div>
  );
}

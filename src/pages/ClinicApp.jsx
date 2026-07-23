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
  const { user, clinic } = useAuth();

  const onboardingKey = `df_onboarding_done_${clinic?.id}_${user?.id}`;
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem(onboardingKey);
  });

  // Módulos: 'dashboard' | 'agenda' | 'pacientes' | 'crm' | 'financeiro' | 'configuracoes' | 'whatsapp'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  
  // Modais e seleções compartilhadas
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
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
            onOpenWhatsApp={() => setActiveTab('whatsapp')}
          />
        );
      case 'whatsapp':
        return (
          <WhatsApp 
            onNavigateTab={setActiveTab}
            setSelectedPatient={setSelectedPatient}
            setPrefilledLeadData={setPrefilledLeadData}
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

  if (showOnboarding) {
    return (
      <Onboarding 
        onComplete={() => {
          localStorage.setItem(onboardingKey, 'true');
          setShowOnboarding(false);
        }} 
      />
    );
  }

  return (
    <div 
      className="h-screen w-screen p-2 sm:p-4 pb-20 md:pb-4 flex flex-col md:flex-row gap-2 sm:gap-4 overflow-hidden font-body transition-colors duration-300 relative bg-[#f8fafc] dark:bg-[#0B1220]"
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
        onOpenWhatsApp={() => setActiveTab('whatsapp')}
      />

      {/* Conteúdo Principal + Cabeçalho Superior */}
      <div className="flex-1 flex flex-col h-full overflow-hidden rounded-[24px] border border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0B1220] shadow-xl transition-colors duration-300">
        <Header 
          activeTab={activeTab}
          onSearchChange={(q) => console.log('Search query:', q)}
          onOpenWhatsApp={() => setActiveTab('whatsapp')}
          onQuickAction={handleQuickAction}
          onOpenCmdPalette={() => setIsCmdPaletteOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-[#0B1220] transition-colors duration-300">
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

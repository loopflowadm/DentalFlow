import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Onboarding from './onboarding/Onboarding';

// Imports dos Módulos Modulares
import Dashboard from './dashboard/Dashboard';
import CRM from './crm/CRM';
import Pacientes from './pacientes/Pacientes';
import Agenda from './agenda/Agenda';
import WhatsApp from './whatsapp/WhatsApp';
import AIModule from './ai/AIModule';
import Automacoes from './automacoes/Automacoes';
import Financeiro from './financeiro/Financeiro';
import Relatorios from './relatorios/Relatorios';
import Configuracoes from './configuracoes/Configuracoes';

export default function ClinicApp() {
  const { currentTheme } = useTheme();
  const { user, clinic } = useAuth();

  const onboardingKey = `df_onboarding_done_${clinic?.id}_${user?.id}`;
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem(onboardingKey);
  });

  // Abas do Panel: 'dashboard' | 'crm' | 'pacientes' | 'agenda' | 'whatsapp' | 'ai' | 'automacoes' | 'marketing' | 'financeiro' | 'relatorios' | 'configuracoes'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  // Estados compartilhados de seleção do layout duplo
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Estados compartilhados da Agenda (elevados)
  const [agendaDate, setAgendaDate] = useState(new Date());
  const [selectedChairs, setSelectedChairs] = useState([]);
  const [selectedDentists, setSelectedDentists] = useState([]);
  const [agendaViewMode, setAgendaViewMode] = useState('week');

  // Estado para preenchimento de agendamento vindo de leads do CRM
  const [prefilledLeadData, setPrefilledLeadData] = useState(null);

  // Renderizador condicional do módulo ativo
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'crm':
        return (
          <CRM 
            selectedLead={selectedLead} 
            setSelectedLead={setSelectedLead} 
            setActiveTab={setActiveTab} 
            setPrefilledLeadData={setPrefilledLeadData} 
          />
        );
      case 'pacientes':
        return <Pacientes selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />;
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
          />
        );
      case 'whatsapp':
        return <WhatsApp />;
      case 'ai':
        return <AIModule />;
      case 'automacoes':
        return <Automacoes />;
      case 'financeiro':
        return <Financeiro />;
      case 'relatorios':
        return <Relatorios />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  // Calcular padding esquerdo com base no estado e aba
  const hasSubSidebar = ['crm', 'pacientes', 'agenda'].includes(activeTab);
  const showSubSidebar = hasSubSidebar && !collapsed;

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
      className="h-screen w-screen p-2 sm:p-4 pb-20 md:pb-4 flex flex-col md:flex-row gap-2 sm:gap-4 overflow-hidden font-body transition-colors duration-300"
      style={{ backgroundColor: currentTheme.body_bg }}
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
      />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden">
        {/* Cabeçalho */}
        <Header activeTab={activeTab} />

        {/* Módulo Ativo */}
        <main className="flex-1 p-6 overflow-hidden flex flex-col h-full">
          {renderContent()}
        </main>
      </div>    </div>
  );
}

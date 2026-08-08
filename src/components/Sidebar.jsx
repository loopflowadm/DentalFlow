import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useClinic } from '../context/ClinicContext';
import { 
  IconLayoutDashboard, 
  IconLayoutKanban, 
  IconUsers, 
  IconCalendar, 
  IconChartBar, 
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconSearch,
  IconBrandWhatsapp,
  IconArrowUpRight,
  IconLogout,
  IconUser,
  IconSparkles
} from '@tabler/icons-react';

const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const weekdaysMin = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed,
  selectedLead,
  setSelectedLead,
  selectedPatient,
  setSelectedPatient,
  selectedAppointment,
  setSelectedAppointment,
  agendaDate,
  setAgendaDate,
  selectedChairs,
  setSelectedChairs,
  selectedDentists,
  setSelectedDentists,
  agendaViewMode,
  setAgendaViewMode,
  onOpenWhatsApp
}) {
  const { user, logout, clinic } = useAuth();
  const { currentTheme, themeMode } = useTheme();
  const { patients, appointments, crmLeads, whatsappChats, addCrmLead, chairs, dentists, addChair, addDentist } = useClinic();
  const totalUnreadWhatsApp = (whatsappChats || []).reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);

  // Consultas de hoje para badge da Agenda
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = (appointments || []).filter(app => {
    const rawDate = app.start_time || app.date || app.appointment_date;
    if (!rawDate) return false;
    const appDateStr = rawDate.split('T')[0];
    return appDateStr === todayStr && app.status !== 'completed' && app.status !== 'Concluído' && app.status !== 'CANCELLED';
  }).length;

  // Estados dos filtros da segunda sidebar
  const [crmSearch, setCrmSearch] = useState('');
  const [crmPriority, setCrmPriority] = useState('');
  const [crmStageFilter, setCrmStageFilter] = useState('all'); // 'all' | 'new' | 'negotiating' | 'closed'
  const [patientSearch, setPatientSearch] = useState('');
  const [appointmentSearch, setAppointmentSearch] = useState('');

  // Lista de Colunas do CRM para exibir badge
  const columnsList = [
    'Novo Paciente', 'Primeiro Contato', 'Avaliação Agendada', 'Confirmado', 
    'Compareceu', 'Orçamento', 'Negociação', 'Fechado', 
    'Tratamento', 'Retorno', 'Concluído', 'Perdido'
  ];

  // Cálculos precisos baseados nas 12 etapas reais do funil
  const totalLeadsCount = crmLeads.length;
  const newLeadsCount = crmLeads.filter(l => (l.stage || 0) <= 1).length;
  const inNegotiationCount = crmLeads.filter(l => (l.stage || 0) >= 2 && (l.stage || 0) <= 6).length;
  const closedCount = crmLeads.filter(l => (l.stage || 0) >= 7 || l.is_patient).length;

  // Filtros dinâmicos da Sub-Sidebar
  const filteredLeads = crmLeads.filter(lead => {
    const matchSearch = lead.name.toLowerCase().includes(crmSearch.toLowerCase()) || 
                        (lead.procedure_name && lead.procedure_name.toLowerCase().includes(crmSearch.toLowerCase()));
    const matchPriority = !crmPriority || lead.priority === crmPriority;
    
    let matchStage = true;
    if (crmStageFilter === 'new') matchStage = (lead.stage || 0) <= 1;
    else if (crmStageFilter === 'negotiating') matchStage = (lead.stage || 0) >= 2 && (lead.stage || 0) <= 6;
    else if (crmStageFilter === 'closed') matchStage = (lead.stage || 0) >= 7 || lead.is_patient;

    return matchSearch && matchPriority && matchStage;
  });

  // Mini Calendar states & helper functions
  const [miniCalDate, setMiniCalDate] = useState(() => new Date());

  useEffect(() => {
    if (agendaDate) {
      Promise.resolve().then(() => {
        setMiniCalDate(new Date(agendaDate));
      });
    }
  }, [agendaDate]);

  const navigateMiniCal = (dir) => {
    const d = new Date(miniCalDate);
    d.setMonth(d.getMonth() + dir);
    setMiniCalDate(d);
  };

  const getMiniCalDays = () => {
    const year = miniCalDate.getFullYear();
    const month = miniCalDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days = [];
    // Prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthTotalDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthTotalDays - i)
      });
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    // Next month padding to fill grid
    const totalCells = days.length > 35 ? 42 : 35;
    const nextDaysCount = totalCells - days.length;
    for (let i = 1; i <= nextDaysCount; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    return days;
  };

  const miniCalDays = getMiniCalDays();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekdaysMin = ["D", "S", "T", "Q", "Q", "S", "S"];

  // Menu móvel
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Mapeamento de perfis e permissões
  const userRole = user?.role || 'admin';

  // Configuração dos itens do menu principal (Módulos Core) com Tabler Icons
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: IconLayoutDashboard },
    { id: 'crm', label: 'Jornada Paciente', icon: IconLayoutKanban },
    { id: 'pacientes', label: 'Pacientes', icon: IconUsers },
    { id: 'agenda', label: 'Agenda', icon: IconCalendar },
    { id: 'whatsapp', label: 'Central WhatsApp', icon: IconBrandWhatsapp },
    { id: 'financeiro', label: 'Financeiro', icon: IconChartBar },
    { id: 'configuracoes', label: 'Configurações', icon: IconSettings },
  ];

  const allowedMenuItems = menuItems;

  // Verifica se o módulo ativo utiliza a Sub-Sidebar contextual
  const hasSubSidebar = ['crm', 'pacientes', 'agenda'].includes(activeTab);

  return (
    <>
      <aside 
        className="hidden md:flex w-20 border border-slate-200/80 dark:border-white/5 flex-col justify-between items-center pb-4 flex-shrink-0 h-full rounded-[24px] overflow-hidden shadow-2xl relative bg-white dark:bg-[#0D0D0D] transition-colors duration-300 z-[60]"
        style={themeMode === 'clinic' ? { backgroundColor: currentTheme.sidebar_bg_1 } : undefined}
      >
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo compacta - DentalFlow Symbol com Alinhamento h-16 (32px center) */}
          <div className="h-16 w-full flex items-center justify-center border-b border-slate-200/80 dark:border-white/5 flex-shrink-0 bg-white dark:bg-black/20 rounded-t-[24px]">
            <div 
              className="h-12 w-12 flex items-center justify-center cursor-pointer group relative" 
              onClick={() => setActiveTab('dashboard')}
            >
              <Logo collapsed={true} className="h-10 w-10 text-slate-800 dark:text-white transition-all duration-300 transform group-hover:scale-110 drop-shadow-[0_2px_10px_rgba(25,107,251,0.25)]" />
              {/* Tooltip da Logo */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900/95 dark:bg-black/95 border border-white/10 text-white text-xs font-bold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 whitespace-nowrap z-[70] flex items-center gap-1.5 backdrop-blur-md">
                <span>DentalFlow</span>
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-slate-950" />
              </div>
            </div>
          </div>

          {/* Lista de Ícones de Módulos */}
          <nav className="flex flex-col items-center gap-3 w-full px-2 pt-1">
            {allowedMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isWhatsApp = item.id === 'whatsapp';
              const isDarkTheme = themeMode === 'dark' || (themeMode === 'clinic' && (currentTheme?.theme_base === 'dark' || currentTheme?.sidebar_bg_1?.startsWith('#0')));

              let buttonStyle = 'text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:hover:text-white dark:bg-white/10 dark:hover:bg-white/20';
              if (isActive) {
                buttonStyle = isWhatsApp 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 border border-emerald-400' 
                  : 'bg-[#196BFB] text-white shadow-md border border-blue-400/30';
              } else if (isWhatsApp) {
                buttonStyle = isDarkTheme
                  ? 'bg-emerald-500/25 text-emerald-300 hover:bg-emerald-500/35 border border-emerald-400/50 shadow-sm'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 dark:bg-emerald-500/25 border border-emerald-500/30 dark:border-emerald-400/50 shadow-sm';
              }

              let iconStyle = isActive ? 'text-white font-bold' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white';
              if (isWhatsApp && !isActive) {
                iconStyle = isDarkTheme ? 'text-emerald-300 font-bold' : 'text-emerald-600 dark:text-emerald-300 font-bold';
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center relative group transition-all duration-300 ${buttonStyle}`}
                  style={isActive && themeMode === 'clinic' && !isWhatsApp ? { backgroundColor: currentTheme.secondary_color, boxShadow: `0 4px 15px ${currentTheme.secondary_color}40` } : {}}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${iconStyle}`} />
                  
                  {isWhatsApp && totalUnreadWhatsApp > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center z-20">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-emerald-500 text-white font-black text-[9.5px] rounded-full border-2 border-white dark:border-[#0D0D0D] shadow-xs leading-none">
                        {totalUnreadWhatsApp > 99 ? '99+' : totalUnreadWhatsApp}
                      </span>
                    </span>
                  )}

                  {item.id === 'agenda' && todayAppointmentsCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center z-20">
                      <span className="relative inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-blue-600 text-white font-black text-[9.5px] rounded-full border-2 border-white dark:border-[#0D0D0D] shadow-xs leading-none">
                        {todayAppointmentsCount}
                      </span>
                    </span>
                  )}

                  {/* Tooltip Lateral Elevado (Sobrepõe qualquer sub-sidebar) */}
                  <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900/95 dark:bg-black/95 border border-white/10 text-white text-xs font-bold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 whitespace-nowrap z-[70] flex items-center gap-1.5 backdrop-blur-md">
                    <span>{item.label}</span>
                    <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-slate-950" />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: Sair */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Botão de Logout */}
          <button
            onClick={logout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-500/10 transition-all relative group"
          >
            <IconLogout className="w-5 h-5" />
            <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-rose-950/95 border border-rose-500/30 text-rose-200 text-xs font-bold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 whitespace-nowrap z-[70] flex items-center gap-1.5 backdrop-blur-md">
              <span>Sair do Sistema</span>
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-rose-950" />
            </div>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* BARRA DE NAVEGAÇÃO INFERIOR (BOTTOM NAVIGATION) - MOBILE      */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-black border-t border-slate-200/80 dark:border-white/10 z-40 flex items-center justify-around px-4 rounded-t-2xl shadow-lg md:hidden transition-colors duration-300">
        <button
          onClick={() => { setActiveTab('dashboard'); setShowMoreMenu(false); }}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-[#196BFB] dark:text-white font-bold' : 'text-slate-500 dark:text-white/50'}`}
          style={activeTab === 'dashboard' ? { color: currentTheme.secondary_color } : {}}
        >
          <IconLayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Início</span>
        </button>

        <button
          onClick={() => { setActiveTab('crm'); setShowMoreMenu(false); }}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === 'crm' ? 'text-[#196BFB] dark:text-white font-bold' : 'text-slate-500 dark:text-white/50'}`}
          style={activeTab === 'crm' ? { color: currentTheme.secondary_color } : {}}
        >
          <IconLayoutKanban className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Jornada</span>
        </button>

        <button
          onClick={() => { setActiveTab('pacientes'); setShowMoreMenu(false); }}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === 'pacientes' ? 'text-[#196BFB] dark:text-white font-bold' : 'text-slate-500 dark:text-white/50'}`}
          style={activeTab === 'pacientes' ? { color: currentTheme.secondary_color } : {}}
        >
          <IconUsers className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Fichas</span>
        </button>

        <button
          onClick={() => { setActiveTab('agenda'); setShowMoreMenu(false); }}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === 'agenda' ? 'text-[#196BFB] dark:text-white font-bold' : 'text-slate-500 dark:text-white/50'}`}
          style={activeTab === 'agenda' ? { color: currentTheme.secondary_color } : {}}
        >
          <IconCalendar className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Agenda</span>
        </button>

        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${showMoreMenu ? 'text-[#196BFB] dark:text-white font-bold' : 'text-slate-500 dark:text-white/50'}`}
          style={showMoreMenu ? { color: currentTheme.secondary_color } : {}}
        >
          <IconPlus className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Mais</span>
        </button>
      </div>

      {/* Menu suspenso do botão "Mais" no mobile */}
      {showMoreMenu && (
        <>
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-45 md:hidden" onClick={() => setShowMoreMenu(false)} />
          <div className="fixed bottom-20 left-4 right-4 bg-white dark:bg-black border border-slate-200/80 dark:border-white/10 p-4 rounded-3xl shadow-2xl z-50 md:hidden animate-in slide-in-from-bottom duration-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Outros Módulos</h4>
            <div className="grid grid-cols-2 gap-2">
              {allowedMenuItems.filter(item => !['dashboard', 'crm', 'pacientes', 'agenda'].includes(item.id)).map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setShowMoreMenu(false); }}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all border ${isActive ? 'border-transparent text-white font-bold' : 'bg-slate-100 dark:bg-black/20 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300'}`}
                    style={isActive ? { backgroundColor: currentTheme.secondary_color } : {}}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-bold truncate">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => { logout(); setShowMoreMenu(false); }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 col-span-2 mt-1"
              >
                <IconLogout className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold">Sair do Sistema</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function SubSidebar({
  activeTab,
  collapsed,
  setCollapsed,
  selectedLead,
  setSelectedLead,
  selectedPatient,
  setSelectedPatient,
  selectedAppointment,
  setSelectedAppointment,
  agendaDate,
  setAgendaDate,
  selectedChairs,
  setSelectedChairs,
  selectedDentists,
  setSelectedDentists,
  agendaViewMode,
  setAgendaViewMode,
  onOpenWhatsApp
}) {
  const { themeMode, currentTheme } = useTheme();
  const { patients, appointments, crmLeads, addCrmLead, chairs, dentists, addChair, addDentist } = useClinic();

  const [crmSearch, setCrmSearch] = useState('');
  const [crmPriority, setCrmPriority] = useState('');
  const [crmStageFilter, setCrmStageFilter] = useState('all');
  const [patientSearch, setPatientSearch] = useState('');
  const [showAddLeadSidebar, setShowAddLeadSidebar] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadProcedure, setNewLeadProcedure] = useState('');
  const [newLeadBudget, setNewLeadBudget] = useState('');
  const [newLeadPriority, setNewLeadPriority] = useState('medium');

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone) return;

    const created = await addCrmLead({
      name: newLeadName,
      phone: newLeadPhone,
      procedure_name: newLeadProcedure || 'Consulta Geral',
      budget_amount: newLeadBudget ? parseFloat(newLeadBudget) : null,
      priority: newLeadPriority,
      status: 'NOVO'
    });

    if (created && setSelectedLead) {
      setSelectedLead(created);
    }

    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadProcedure('');
    setNewLeadBudget('');
    setNewLeadPriority('medium');
    setShowAddLeadSidebar(false);
  };

  // Mini Calendário (Agenda)
  const [miniCalDate, setMiniCalDate] = useState(new Date());

  const navigateMiniCal = (direction) => {
    setMiniCalDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + direction);
      return next;
    });
  };

  // Gerador de Dias do Mini Calendário
  const getMiniCalDays = () => {
    const year = miniCalDate.getFullYear();
    const month = miniCalDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Dias do mês anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= totalDaysInMonth; i++) {
      days.push({
        day: i,
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Dias do próximo mês para completar grade de 42 posições (6 semanas)
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        day: i,
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const miniCalDays = getMiniCalDays();

  const columnsList = [
    'Novo Paciente', 'Primeiro Contato', 'Avaliação Agendada', 'Confirmado', 
    'Compareceu', 'Orçamento', 'Negociação', 'Fechado', 
    'Tratamento', 'Retorno', 'Concluído', 'Perdido'
  ];

  const totalLeadsCount = crmLeads.length;
  const newLeadsCount = crmLeads.filter(l => (l.stage || 0) <= 1).length;
  const inNegotiationCount = crmLeads.filter(l => (l.stage || 0) >= 2 && (l.stage || 0) <= 6).length;
  const closedCount = crmLeads.filter(l => (l.stage || 0) >= 7 || l.is_patient).length;

  const filteredLeads = crmLeads.filter(lead => {
    const matchSearch = lead.name.toLowerCase().includes(crmSearch.toLowerCase()) || 
                        (lead.procedure_name && lead.procedure_name.toLowerCase().includes(crmSearch.toLowerCase()));
    const matchPriority = !crmPriority || lead.priority === crmPriority;
    
    let matchStage = true;
    if (crmStageFilter === 'new') matchStage = (lead.stage || 0) <= 1;
    else if (crmStageFilter === 'negotiating') matchStage = (lead.stage || 0) >= 2 && (lead.stage || 0) <= 6;
    else if (crmStageFilter === 'closed') matchStage = (lead.stage || 0) >= 7 || lead.is_patient;

    return matchSearch && matchPriority && matchStage;
  });

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
    (patient.phone && patient.phone.includes(patientSearch))
  );

  const hasSubSidebar = ['crm', 'pacientes', 'agenda'].includes(activeTab);

  if (!hasSubSidebar) return null;

  if (collapsed) {
    return (
      <aside 
        className="w-16 border-r border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#080808] flex flex-col items-center h-full py-3 shrink-0 z-30 transition-all duration-300 gap-3 text-left"
        style={themeMode === 'clinic' ? { backgroundColor: currentTheme.sidebar_bg_2 } : undefined}
      >
        {/* Botão de Expandir Painel (Alinhado no topo) */}
        <button
          onClick={() => setCollapsed(false)}
          className="w-10 h-10 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all shadow-2xs flex items-center justify-center cursor-pointer shrink-0"
          title="Expandir Lista de Pacientes"
        >
          <IconChevronRight className="w-4 h-4 font-bold" />
        </button>

        <div className="w-8 border-b border-slate-200/80 dark:border-white/10 shrink-0 my-0.5" />

        {/* Lista Vertical de Fotos dos Pacientes com Anéis de Status */}
        <div className="flex-1 overflow-y-auto w-full px-2 space-y-3 scrollbar-none flex flex-col items-center">
          {activeTab === 'pacientes' && filteredPatients.map((patient, idx) => {
            const isActive = selectedPatient?.id === patient.id;
            const photo = patient.photoUrl || patient.avatar_url;

            let mh = patient.medical_history;
            if (typeof mh === 'string') {
              try { mh = JSON.parse(mh); } catch (e) { mh = {}; }
            }
            const tags = mh?.tags || [];

            // Cor do Anel do Status Operacional
            let ringColor = 'ring-emerald-500';
            let statusLabel = 'Em Tratamento';
            let dotBg = 'bg-emerald-500';
            if (tags.includes('Em Atraso') || tags.includes('Inadimplente') || idx % 5 === 3) {
              ringColor = 'ring-rose-500';
              statusLabel = 'Inadimplente';
              dotBg = 'bg-rose-500';
            } else if (tags.includes('Consulta Hoje') || idx % 5 === 1) {
              ringColor = 'ring-blue-500';
              statusLabel = 'Consulta Hoje';
              dotBg = 'bg-blue-500';
            } else if (tags.includes('VIP') || tags.includes('Avaliação') || idx % 5 === 2) {
              ringColor = 'ring-amber-500';
              statusLabel = 'Avaliação Pendente';
              dotBg = 'bg-amber-500';
            } else if (tags.includes('Ortodontia') || tags.includes('Manutenção') || idx % 5 === 4) {
              ringColor = 'ring-purple-500';
              statusLabel = 'Manutenção';
              dotBg = 'bg-purple-500';
            }

            return (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={`relative group w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  isActive 
                    ? `ring-2 ${ringColor} ring-offset-2 ring-offset-white dark:ring-offset-[#080808] scale-105 shadow-md` 
                    : 'hover:scale-105 opacity-85 hover:opacity-100'
                }`}
                title={`${patient.name} (${statusLabel})`}
              >
                {photo ? (
                  <img src={photo} alt={patient.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl font-black text-xs">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Dot Indicador de Status Operacional */}
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#080808] ${dotBg}`} />
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Backdrop overlay para tablet/mobile */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        onClick={() => setCollapsed(true)}
      />
      <aside 
        className="fixed inset-y-0 left-0 z-50 w-80 lg:static lg:z-auto lg:w-64 xl:w-72 border-r border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#080808] flex flex-col h-full overflow-hidden flex-shrink-0 shadow-2xl lg:shadow-none transition-all duration-300"
        style={themeMode === 'clinic' ? { backgroundColor: currentTheme.sidebar_bg_2 } : undefined}
      >
      {/* HEADER DA SUB-SIDEBAR (SLIM E UNIFICADO NO CARD PRINCIPAL) */}
      <div className="h-14 px-4 border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between flex-shrink-0 bg-white dark:bg-[#0D0D0D] transition-colors duration-300">
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
          {activeTab === 'crm' && "Filtros & Pacientes (CRM)"}
          {activeTab === 'pacientes' && "Lista de Pacientes"}
          {activeTab === 'agenda' && "Agenda do Dia"}
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          title="Recolher painel"
        >
          <IconChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

          {/* CONTEÚDO CONTEXTUAL */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
            
            {/* 1. MÓDULO CRM LEADS */}
            {activeTab === 'crm' && (
              <>
                {/* Grid 2x2 de métricas rápidas e interativas no topo */}
                <div className="grid grid-cols-2 gap-2 text-slate-800 dark:text-white">
                  <button 
                    onClick={() => setCrmStageFilter('all')}
                    className={`p-2.5 rounded-xl flex flex-col justify-between transition-all text-left border cursor-pointer ${
                      crmStageFilter === 'all'
                        ? 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/40 text-blue-600 dark:text-blue-400 font-extrabold shadow-xs'
                        : 'bg-white dark:bg-[#0D0D0D] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-2xs'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total</span>
                    <span className="text-lg font-black font-title mt-1 text-slate-800 dark:text-white">{totalLeadsCount}</span>
                  </button>

                  <button 
                    onClick={() => setCrmStageFilter('new')}
                    className={`p-2.5 rounded-xl flex flex-col justify-between transition-all text-left border cursor-pointer ${
                      crmStageFilter === 'new'
                        ? 'bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/40 text-sky-600 dark:text-sky-400 font-extrabold shadow-xs'
                        : 'bg-white dark:bg-[#0D0D0D] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-2xs'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Novos</span>
                    <span className="text-lg font-black font-title mt-1 text-sky-600 dark:text-sky-400">{newLeadsCount}</span>
                  </button>

                  <button 
                    onClick={() => setCrmStageFilter('negotiating')}
                    className={`p-2.5 rounded-xl flex flex-col justify-between transition-all text-left border cursor-pointer ${
                      crmStageFilter === 'negotiating'
                        ? 'bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/40 text-purple-600 dark:text-purple-400 font-extrabold shadow-xs'
                        : 'bg-white dark:bg-[#0D0D0D] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-2xs'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Negociando</span>
                    <span className="text-lg font-black font-title mt-1 text-purple-600 dark:text-violet-400">{inNegotiationCount}</span>
                  </button>

                  <button 
                    onClick={() => setCrmStageFilter('closed')}
                    className={`p-2.5 rounded-xl flex flex-col justify-between transition-all text-left border cursor-pointer ${
                      crmStageFilter === 'closed'
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-xs'
                        : 'bg-white dark:bg-[#0D0D0D] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-2xs'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Fechados</span>
                    <span className="text-lg font-black font-title mt-1 text-emerald-600 dark:text-emerald-400">{closedCount}</span>
                  </button>
                </div>

                {/* Filtros e Ações */}
                <div className="space-y-2">
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar paciente por nome..."
                      value={crmSearch}
                      onChange={(e) => setCrmSearch(e.target.value)}
                      className="w-full bg-white dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 dark:text-white focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs dark:shadow-none"
                    />
                  </div>

                  <div className="flex gap-1.5">
                    <select
                      value={crmPriority}
                      onChange={(e) => setCrmPriority(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-2 text-xs text-slate-700 dark:text-slate-400 focus:outline-none cursor-pointer shadow-2xs dark:shadow-none font-bold"
                    >
                      <option value="">Todas prioridades</option>
                      <option value="high">Alta</option>
                      <option value="medium">Média</option>
                      <option value="low">Baixa</option>
                    </select>

                    <button
                      onClick={() => setShowAddLeadSidebar(true)}
                      className="p-2 hover:opacity-90 rounded-xl text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
                      style={{ backgroundColor: currentTheme.secondary_color }}
                      title="Adicionar Novo Paciente na Jornada"
                    >
                      <IconPlus className="w-4 h-4 font-bold" />
                    </button>
                  </div>
                </div>

                {/* Lista de Leads */}
                <div className="space-y-2.5 pt-2">
                  {filteredLeads.map(lead => {
                    const isActive = selectedLead?.id === lead.id;
                    return (
                      <div
                        key={lead.id}
                        onClick={() => {
                          setSelectedLead(lead);
                          if (window.innerWidth < 768) {
                            setCollapsed(true);
                          }
                        }}
                        className={`p-3 rounded-xl cursor-pointer relative transition-all border group text-left ${
                          isActive 
                            ? 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold ring-1 ring-blue-500/20' 
                            : 'bg-white dark:bg-[#0D0D0D] hover:bg-slate-100 dark:hover:bg-[#18181B] border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-2xs hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        {/* Header do Card (Nome, Procedimento, Seta) */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${
                              isActive ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                            }`}>
                              {lead.avatar && lead.avatar !== '👤' ? lead.avatar : <IconUser className="w-4 h-4" />}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className={`text-xs font-bold truncate ${isActive ? 'text-blue-700 dark:text-white font-black' : 'text-slate-800 dark:text-white'}`}>
                                {lead.name}
                              </h4>
                              <p className="text-[10px] truncate text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                {lead.procedure_name || 'Consulta Geral'}
                              </p>
                            </div>
                          </div>

                          {isActive && (
                            <IconArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400 font-bold shrink-0" />
                          )}
                        </div>

                        {/* Badges do Estágio e Prioridade */}
                        <div className="mt-2.5 flex items-center justify-between gap-1 text-[9px] font-bold">
                          <span className={`px-2 py-0.5 rounded-md truncate max-w-[120px] ${
                            isActive
                              ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                              : 'bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                          }`}>
                            {columnsList[lead.stage || 0]}
                          </span>

                          <span className={`px-2 py-0.5 rounded-md ${
                            lead.priority === 'high' 
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                              : lead.priority === 'medium'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {lead.priority === 'high' ? 'Alta' : lead.priority === 'medium' ? 'Média' : 'Baixa'}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {filteredLeads.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-xs font-bold">
                      <span>Nenhum paciente encontrado</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 2. MÓDULO PACIENTES */}
            {activeTab === 'pacientes' && (
              <>
                <div className="flex gap-1.5 items-center">
                  <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar paciente..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full bg-white dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 dark:text-white focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm dark:shadow-none"
                    />
                  </div>

                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="p-2 hover:opacity-90 rounded-xl text-white flex items-center justify-center transition-all flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: currentTheme.secondary_color }}
                    title="Cadastrar Novo Paciente"
                  >
                    <IconPlus className="w-4 h-4 font-bold" />
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {filteredPatients.map((patient, idx) => {
                    const isActive = selectedPatient?.id === patient.id;
                    const photo = patient.photoUrl || patient.avatar_url;
                    const patientCode = patient.id ? `ID: #${String(patient.id).substring(0, 8).toUpperCase()}` : 'Prontuário Ativo';

                    // Extrator do status operacional do paciente (Sem gradientes - Soft Tint Sólido)
                    let mh = patient.medical_history;
                    if (typeof mh === 'string') {
                      try { mh = JSON.parse(mh); } catch (e) { mh = {}; }
                    }
                    const tags = mh?.tags || [];

                    let statusInfo = {
                      label: 'Em Tratamento',
                      bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20 hover:bg-emerald-500/15',
                      borderClass: 'border-emerald-500/30',
                      badgeClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    };

                    if (tags.includes('Em Atraso') || tags.includes('Inadimplente') || idx % 5 === 3) {
                      statusInfo = {
                        label: 'Inadimplente',
                        bgClass: 'bg-rose-500/10 dark:bg-rose-500/20 hover:bg-rose-500/15',
                        borderClass: 'border-rose-500/30',
                        badgeClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      };
                    } else if (tags.includes('Consulta Hoje') || idx % 5 === 1) {
                      statusInfo = {
                        label: 'Consulta Hoje',
                        bgClass: 'bg-blue-500/10 dark:bg-blue-500/20 hover:bg-blue-500/15',
                        borderClass: 'border-blue-500/30',
                        badgeClass: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                      };
                    } else if (tags.includes('VIP') || tags.includes('Avaliação') || idx % 5 === 2) {
                      statusInfo = {
                        label: 'Avaliação Pendente',
                        bgClass: 'bg-amber-500/10 dark:bg-amber-500/20 hover:bg-amber-500/15',
                        borderClass: 'border-amber-500/30',
                        badgeClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      };
                    } else if (tags.includes('Ortodontia') || tags.includes('Manutenção') || idx % 5 === 4) {
                      statusInfo = {
                        label: 'Manutenção',
                        bgClass: 'bg-purple-500/10 dark:bg-purple-500/20 hover:bg-purple-500/15',
                        borderClass: 'border-purple-500/30',
                        badgeClass: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                      };
                    }

                    return (
                      <div
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatient(patient);
                          if (window.innerWidth < 768) {
                            setCollapsed(true);
                          }
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-2.5 text-left border ${statusInfo.bgClass} ${
                          isActive 
                            ? `${statusInfo.borderClass} ring-2 ring-blue-500/40 shadow-sm font-extrabold` 
                            : `${statusInfo.borderClass} opacity-90 hover:opacity-100`
                        }`}
                      >
                        {/* Foto do Paciente ou Avatar Vetorial */}
                        <div className="w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-white/20 dark:border-white/10 shadow-2xs">
                          {photo ? (
                            <img src={photo} alt={patient.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/40 dark:bg-black/40 text-slate-700 dark:text-slate-200">
                              <IconUser className="w-4.5 h-4.5 stroke-[2]" />
                            </div>
                          )}
                        </div>

                        <div className="overflow-hidden flex-1 space-y-1">
                          {/* Nome do Paciente (Com largura total para nao truncar) */}
                          <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white leading-tight">
                            {patient.name}
                          </h4>

                          {/* Tag de Status Operacional Posicionada Abaixo do Nome */}
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider ${statusInfo.badgeClass}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredPatients.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-xs font-bold">
                      <span>Nenhum paciente cadastrado</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 3. MÓDULO AGENDA (MINI CALENDÁRIO, CADEIRAS, DENTISTAS & BACKUP) */}
            {activeTab === 'agenda' && (
              <div className="space-y-4">
                
                {/* 3a. Mini Calendário (DatePicker) */}
                <div className="p-3 bg-white dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-none transition-colors duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-white capitalize font-title pl-1">
                      {monthNames[miniCalDate.getMonth()]} {miniCalDate.getFullYear()}
                    </span>
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => navigateMiniCal(-1)} 
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <IconChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => navigateMiniCal(1)} 
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <IconChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dias da semana */}
                  <div className="grid grid-cols-7 text-center text-slate-400 dark:text-slate-500 font-bold text-[9px] mb-1">
                    {weekdaysMin.map((w, idx) => (
                      <div key={idx} className="py-0.5">{w}</div>
                    ))}
                  </div>

                  {/* Dias do mês */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-bold gap-0.5">
                    {miniCalDays.map((day, idx) => {
                      const isSelected = agendaDate && day.date.toDateString() === new Date(agendaDate).toDateString();
                      const isToday = day.date.toDateString() === new Date().toDateString();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAgendaDate(day.date);
                            if (window.innerWidth < 768) {
                              setCollapsed(true);
                            }
                          }}
                          className={`py-1 rounded-md transition-all font-semibold ${
                            isSelected 
                              ? 'bg-[#196BFB] text-white shadow-sm font-bold' 
                              : isToday
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                                : day.isCurrentMonth
                                  ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                                  : 'text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                          style={isSelected ? { backgroundColor: currentTheme.secondary_color } : {}}
                        >
                          {day.day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3b. Seção Cadeiras */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center pl-1 pr-1.5">
                    <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest font-title">
                      Cadeiras
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        const name = prompt('Digite o nome da nova cadeira:');
                        if (name && name.trim()) {
                          await addChair(name.trim());
                        }
                      }}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Adicionar Cadeira"
                    >
                      <IconPlus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1 bg-white dark:bg-[#0D0D0D] p-2 border border-slate-200/80 dark:border-white/5 rounded-2xl max-h-40 overflow-y-auto scrollbar-none shadow-sm dark:shadow-none transition-colors duration-300">
                    {/* Opção Todas */}
                    <button
                      type="button"
                      onClick={() => setSelectedChairs([])}
                      className={`w-full text-left px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-between ${
                        selectedChairs.length === 0 
                          ? 'bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-white font-black' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>Todas as Cadeiras</span>
                      {selectedChairs.length === 0 && <span className="text-secondary" style={{ color: currentTheme.secondary_color }}>✓</span>}
                    </button>

                    {chairs.map(c => {
                      const isChecked = selectedChairs.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedChairs(prev => 
                              prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                            );
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-between ${
                            isChecked 
                              ? 'bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-white font-black' 
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <span>{c.name}</span>
                          {isChecked && <span className="text-secondary" style={{ color: currentTheme.secondary_color }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3c. Seção Agendas (Profissionais) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center pl-1 pr-1.5">
                    <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest font-title">
                      Agendas (Dentistas)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const name = prompt('Digite o nome do novo profissional:');
                        if (name && name.trim()) {
                          addDentist(name.trim());
                        }
                      }}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Adicionar Profissional"
                    >
                      <IconPlus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1 bg-white dark:bg-[#0D0D0D] p-2 border border-slate-200/80 dark:border-white/5 rounded-2xl max-h-40 overflow-y-auto scrollbar-none shadow-sm dark:shadow-none transition-colors duration-300">
                    {/* Opção Todos */}
                    <button
                      type="button"
                      onClick={() => setSelectedDentists([])}
                      className={`w-full text-left px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-between ${
                        selectedDentists.length === 0 
                          ? 'bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-white font-black' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>Todos Dentistas</span>
                      {selectedDentists.length === 0 && <span className="text-secondary" style={{ color: currentTheme.secondary_color }}>✓</span>}
                    </button>

                    {dentists.map(d => {
                      const isChecked = selectedDentists.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setSelectedDentists(prev => 
                              prev.includes(d.id) ? prev.filter(id => id !== d.id) : [...prev, d.id]
                            );
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-between ${
                            isChecked 
                              ? 'bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-white font-black' 
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <span>{d.full_name}</span>
                          {isChecked && <span className="text-secondary" style={{ color: currentTheme.secondary_color }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        </aside>

      {/* ========================================================================= */}
      {/* MODAL INTEGRADO DE CADASTRO DE LEAD (SIDEBAR)                            */}
      {/* ========================================================================= */}
      {showAddLeadSidebar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
          <div className="my-auto bg-white dark:bg-[#0D0D0D] rounded-[28px] max-w-sm w-full p-5 sm:p-6 shadow-xl dark:shadow-2xl border border-slate-200/80 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200 text-left text-slate-800 dark:text-white transition-colors duration-300 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <h3 className="text-sm font-bold font-title flex items-center gap-1.5">
                <IconSparkles className="w-4 h-4 text-secondary" style={{ color: currentTheme.secondary_color }} />
                Adicionar à Jornada (Captação)
              </h3>
              <button 
                onClick={() => setShowAddLeadSidebar(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <IconChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do paciente"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 text-slate-800 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Celular / WhatsApp</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="ex: (83) 99999-8888"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(formatPhone(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 text-slate-800 dark:text-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Procedimento</label>
                  <input
                    type="text"
                    placeholder="ex: Implante"
                    value={newLeadProcedure}
                    onChange={(e) => setNewLeadProcedure(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 text-slate-800 dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Previsão (R$)</label>
                  <input
                    type="number"
                    placeholder="ex: 3500"
                    value={newLeadBudget}
                    onChange={(e) => setNewLeadBudget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 text-slate-800 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Prioridade</label>
                <select
                  value={newLeadPriority}
                  onChange={(e) => setNewLeadPriority(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 text-slate-800 dark:text-white cursor-pointer transition-colors"
                >
                  <option value="high">Alta (Urgente)</option>
                  <option value="medium">Média (Normal)</option>
                  <option value="low">Baixa</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg mt-2 transition-all"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Salvar Paciente
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

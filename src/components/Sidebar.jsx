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
  IconSparkles,
  IconUser
} from '@tabler/icons-react';

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
  const { patients, appointments, crmLeads, addCrmLead, chairs, dentists, addChair, addDentist } = useClinic();

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

  // Modal rápido de inclusão de paciente na jornada
  const [showAddLeadSidebar, setShowAddLeadSidebar] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadProcedure, setNewLeadProcedure] = useState('');
  const [newLeadBudget, setNewLeadBudget] = useState('');
  const [newLeadPriority, setNewLeadPriority] = useState('medium');

  // Menu móvel
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone) return;

    await addCrmLead({
      name: newLeadName,
      phone: newLeadPhone,
      procedure_name: newLeadProcedure || 'Consulta Geral',
      budget_amount: newLeadBudget ? parseFloat(newLeadBudget) : null,
      priority: newLeadPriority,
      status: 'NOVO'
    });

    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadProcedure('');
    setNewLeadBudget('');
    setNewLeadPriority('medium');
    setShowAddLeadSidebar(false);
  };

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

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
    (patient.phone && patient.phone.includes(patientSearch))
  );

  return (
    <div className="flex h-full select-none gap-4 relative">
      
      {/* ========================================================================= */}
      {/* COLUNA 1: BARRA DE ÍCONES DE NAVEGAÇÃO (FIXA 80px NO DESKTOP)              */}
      {/* ========================================================================= */}
      <aside 
        className="flex w-20 border border-slate-200/80 dark:border-white/5 flex-col justify-between items-center pb-4 flex-shrink-0 h-full rounded-[24px] shadow-2xl relative bg-white dark:bg-[#0B1220] transition-colors duration-300 z-30 overflow-hidden"
        style={themeMode === 'clinic' ? { backgroundColor: currentTheme.sidebar_bg_1 } : undefined}
      >
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo compacta - DentalFlow Symbol com Alinhamento h-16 (32px center) */}
          <div className="h-16 w-full flex items-center justify-center border-b border-slate-200/80 dark:border-white/5 flex-shrink-0 bg-white dark:bg-slate-950/20">
            <div 
              className="h-12 w-12 flex items-center justify-center cursor-pointer group relative" 
              onClick={() => setActiveTab('dashboard')}
            >
              <Logo collapsed={true} className="h-10 w-10 text-slate-800 dark:text-white transition-all duration-300 transform group-hover:scale-110 drop-shadow-[0_2px_10px_rgba(25,107,251,0.25)]" />
              {/* Tooltip */}
              <div className="absolute left-20 bg-slate-900 dark:bg-slate-950 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-2xl whitespace-nowrap z-50">
                DentalFlow
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
                  
                  {isWhatsApp && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                  )}

                  {/* Tooltip Lateral */}
                  <div className="absolute left-20 bg-slate-900 dark:bg-slate-950 text-white text-xs font-semibold px-3 py-2 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl whitespace-nowrap z-50">
                    {item.label}
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
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Sair do Sistema"
          >
            <IconLogout className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* COLUNA 2: SUB-SIDEBAR CONTEXTUAL (OPCIONAL E COLAPSÁVEL, 260px)           */}
      {/* ========================================================================= */}
      {hasSubSidebar && !collapsed && (
        <>
          {/* Backdrop escuro para fechar ao clicar fora (Mobile/Tablet) */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-35 md:hidden"
            onClick={() => setCollapsed(true)}
          />
          <aside 
            className={`border border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-[#111827] flex flex-col h-full rounded-[24px] shadow-2xl overflow-hidden animate-in slide-in-from-left duration-250 z-40 md:z-10 transition-colors duration-300 ${
              collapsed ? 'hidden' : 'fixed inset-4 w-[calc(100vw-32px)] md:relative md:inset-auto md:w-64'
            }`} 
            style={themeMode === 'clinic' ? { backgroundColor: currentTheme.sidebar_bg_2 } : undefined}
          >
          
          {/* HEADER DA SUB-SIDEBAR (TÍTULO E BOTÃO DE RECOLHER) */}
          <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-900/40 flex items-center justify-between flex-shrink-0 bg-slate-100/50 dark:bg-slate-950/5 transition-colors duration-300">
            <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-title pl-1">
              {activeTab === 'crm' && "Jornada do Paciente"}
              {activeTab === 'pacientes' && "Pacientes"}
              {activeTab === 'agenda' && "Agenda do Dia"}
            </span>
            {/* Toggle de Fechamento */}
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors flex-shrink-0"
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
                    className={`p-3 rounded-2xl flex flex-col justify-between transition-all text-left border cursor-pointer ${
                      crmStageFilter === 'all'
                        ? 'bg-[#196BFB]/10 border-[#196BFB] shadow-sm ring-1 ring-[#196BFB]/30'
                        : 'bg-white dark:bg-[#0B1220]/60 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total</span>
                    <span className="text-xl font-bold font-title mt-1 text-slate-800 dark:text-white">{totalLeadsCount}</span>
                  </button>

                  <button 
                    onClick={() => setCrmStageFilter('new')}
                    className={`p-3 rounded-2xl flex flex-col justify-between transition-all text-left border cursor-pointer ${
                      crmStageFilter === 'new'
                        ? 'bg-sky-500/10 border-sky-500 shadow-sm ring-1 ring-sky-400/30'
                        : 'bg-white dark:bg-[#0B1220]/60 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Novos</span>
                    <span className="text-xl font-bold font-title mt-1 text-sky-600 dark:text-sky-400">{newLeadsCount}</span>
                  </button>

                  <button 
                    onClick={() => setCrmStageFilter('negotiating')}
                    className={`p-3 rounded-2xl flex flex-col justify-between transition-all text-left border cursor-pointer ${
                      crmStageFilter === 'negotiating'
                        ? 'bg-purple-500/10 border-purple-500 shadow-sm ring-1 ring-purple-400/30'
                        : 'bg-white dark:bg-[#0B1220]/60 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Negociando</span>
                    <span className="text-xl font-bold font-title mt-1 text-purple-600 dark:text-violet-400">{inNegotiationCount}</span>
                  </button>

                  <button 
                    onClick={() => setCrmStageFilter('closed')}
                    className={`p-3 rounded-2xl flex flex-col justify-between transition-all text-left border cursor-pointer ${
                      crmStageFilter === 'closed'
                        ? 'bg-emerald-500/10 border-emerald-500 shadow-sm ring-1 ring-emerald-400/30'
                        : 'bg-white dark:bg-[#0B1220]/60 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Fechados</span>
                    <span className="text-xl font-bold font-title mt-1 text-emerald-600 dark:text-emerald-400">{closedCount}</span>
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
                      className="w-full bg-white dark:bg-[#0B1220]/60 border border-slate-200/80 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 dark:text-white focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm dark:shadow-none"
                    />
                  </div>

                  <div className="flex gap-1.5">
                    <select
                      value={crmPriority}
                      onChange={(e) => setCrmPriority(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#0B1220]/60 border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-2 text-xs text-slate-700 dark:text-slate-400 focus:outline-none cursor-pointer shadow-sm dark:shadow-none font-bold"
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
                        className={`p-3 rounded-2xl cursor-pointer relative transition-all border group ${
                          isActive 
                            ? 'bg-slate-900 dark:bg-[#151c2c] border-slate-800 dark:border-slate-700 text-white shadow-xl ring-2 ring-slate-700/60 dark:ring-white/10 scale-[1.01]' 
                            : 'bg-white hover:bg-slate-100 dark:bg-[#0B1220]/60 dark:hover:bg-[#1A2333]/60 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none hover:-translate-y-0.5'
                        }`}
                      >
                        {/* Indicador de Prioridade */}
                        <span className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-lg ${
                          lead.priority === 'high' ? 'bg-[#FF5B60]' : lead.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`} />

                        {/* Seta no topo direito se ativo */}
                        {isActive && (
                          <IconArrowUpRight className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-300 dark:text-slate-400" />
                        )}

                        <div className="flex items-center gap-2.5 pl-1.5">
                          <span className="text-xl flex-shrink-0 flex items-center justify-center text-slate-400">
                            {lead.avatar && lead.avatar !== '👤' ? lead.avatar : <IconUser className="w-5 h-5" />}
                          </span>
                          <div className="overflow-hidden flex-1">
                            <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white font-black' : 'text-slate-800 dark:text-white'}`}>
                              {lead.name}
                            </h4>
                            <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                              {lead.procedure_name || 'Consulta Geral'}
                            </p>
                          </div>
                        </div>

                        {/* Rodapé do Card (Design Minimalista) */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/60 dark:border-slate-800/80 flex justify-between items-center text-[10px] pl-1.5 gap-1">
                          {/* Badge do Estágio do Funil */}
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold truncate max-w-[110px] ${
                            isActive 
                              ? 'bg-slate-800 dark:bg-white/10 text-slate-200 border border-slate-700 dark:border-white/10 font-extrabold' 
                              : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                          }`}>
                            {columnsList[lead.stage || 0]}
                          </span>

                          {/* Badge de Prioridade */}
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                            isActive 
                              ? 'bg-slate-800 dark:bg-white/10 text-slate-200 border border-slate-700 dark:border-white/10 font-extrabold' 
                              : lead.priority === 'high' ? 'bg-[#FF5B60]/10 text-[#FF5B60]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
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
                      className="w-full bg-white dark:bg-[#0B1220]/60 border border-slate-200/80 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 dark:text-white focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm dark:shadow-none"
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
                  {filteredPatients.map(patient => {
                    const isActive = selectedPatient?.id === patient.id;
                    return (
                      <div
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatient(patient);
                          if (window.innerWidth < 768) {
                            setCollapsed(true);
                          }
                        }}
                        className={`p-3 rounded-xl cursor-pointer transition-all border text-left ${
                          isActive 
                            ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-white shadow-md' 
                            : 'bg-white hover:bg-slate-100 dark:bg-[#1A2333]/60 dark:hover:bg-[#1A2333] border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none'
                        }`}
                      >
                        <h4 className={`text-xs font-bold font-title ${isActive ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-800 dark:text-white'}`}>
                          {patient.name}
                        </h4>
                        <p className={`text-[10px] mt-0.5 truncate font-medium ${isActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                          Tel: {patient.phone || 'Sem celular'}
                        </p>
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
                <div className="p-3 bg-white dark:bg-[#0B1220]/60 border border-slate-200/80 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-none transition-colors duration-300">
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

                  <div className="space-y-1 bg-white dark:bg-[#0B1220]/60 p-2 border border-slate-200/80 dark:border-white/5 rounded-2xl max-h-40 overflow-y-auto scrollbar-none shadow-sm dark:shadow-none transition-colors duration-300">
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

                  <div className="space-y-1 bg-white dark:bg-[#0B1220]/60 p-2 border border-slate-200/80 dark:border-white/5 rounded-2xl max-h-40 overflow-y-auto scrollbar-none shadow-sm dark:shadow-none transition-colors duration-300">
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
      </>
    )}

      {/* ========================================================================= */}
      {/* MODAL INTEGRADO DE CADASTRO DE LEAD (SIDEBAR)                            */}
      {/* ========================================================================= */}
      {showAddLeadSidebar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] rounded-[28px] max-w-sm w-full p-6 shadow-xl dark:shadow-2xl border border-slate-200/80 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200 text-left text-slate-800 dark:text-white transition-colors duration-300">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <h3 className="text-sm font-bold font-title flex items-center gap-1.5">
                <IconSparkles className="w-4 h-4 text-secondary" style={{ color: currentTheme.secondary_color }} />
                Adicionar à Jornada (Captação)
              </h3>
              <button 
                onClick={() => setShowAddLeadSidebar(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
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
                  className="w-full bg-slate-50 dark:bg-[#0B1220]/60 border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 text-slate-800 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Celular / WhatsApp</label>
                <input
                  type="text"
                  required
                  placeholder="ex: 5511999999999"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B1220]/60 border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 text-slate-800 dark:text-white transition-colors"
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
                    className="w-full bg-slate-50 dark:bg-[#0B1220]/60 border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 text-slate-800 dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Previsão (R$)</label>
                  <input
                    type="number"
                    placeholder="ex: 3500"
                    value={newLeadBudget}
                    onChange={(e) => setNewLeadBudget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0B1220]/60 border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 text-slate-800 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Prioridade</label>
                <select
                  value={newLeadPriority}
                  onChange={(e) => setNewLeadPriority(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B1220]/60 border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 text-slate-800 dark:text-white cursor-pointer transition-colors"
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

      {/* Botão Flutuante de Expansão (Maximizar) - Visível somente quando a segunda sidebar está recolhida */}
      {hasSubSidebar && collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute left-[72px] top-6 w-6 h-12 bg-white dark:bg-[#0A173B] hover:bg-slate-100 dark:hover:bg-[#12245C] border border-slate-200/80 dark:border-slate-800 border-l-transparent rounded-r-xl flex items-center justify-center text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-all shadow-md z-40 group hover:w-7 active:scale-95"
          title="Expandir painel"
        >
          <IconChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DRAWER / SHEET "MAIS" PARA DISPOSITIVOS MÓVEIS               */}
      {/* ------------------------------------------------------------- */}
      {showMoreMenu && (
        <>
          {/* Backdrop para fechar o menu */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-45 md:hidden"
            onClick={() => setShowMoreMenu(false)}
          />
          {/* Menu de mais opções */}
          <div className="fixed bottom-20 left-4 right-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-white/10 rounded-[32px] p-5 shadow-2xl z-50 animate-in slide-in-from-bottom duration-250 text-left md:hidden max-h-[70vh] overflow-y-auto text-slate-800 dark:text-white transition-colors duration-300">
            <div className="flex justify-between items-center mb-4 pl-1">
              <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest font-title">
                Mais Opções
              </span>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="text-[10px] font-bold text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {menuItems.filter(item => !['dashboard', 'crm', 'pacientes', 'agenda'].includes(item.id)).map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                       setActiveTab(item.id);
                       setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all border ${
                      isActive 
                        ? 'border-transparent text-white font-bold' 
                        : 'bg-slate-100 dark:bg-black/20 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    style={isActive ? { backgroundColor: currentTheme.secondary_color } : {}}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-bold truncate">{item.label}</span>
                  </button>
                );
              })}

              {/* Logout no mobile */}
              <button
                onClick={() => {
                  logout();
                  setShowMoreMenu(false);
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:text-red-500 col-span-2 mt-1"
              >
                <IconLogout className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold">Sair do Sistema</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BARRA DE NAVEGAÇÃO INFERIOR (BOTTOM NAVIGATION) - MOBILE      */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-white/10 z-40 flex items-center justify-around px-4 rounded-t-2xl shadow-lg md:hidden transition-colors duration-300">
        {/* Item 1: Dashboard */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setShowMoreMenu(false);
          }}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-[#196BFB] dark:text-white font-bold' : 'text-slate-500 dark:text-white/50'
          }`}
          style={activeTab === 'dashboard' ? { color: currentTheme.secondary_color } : {}}
        >
          <IconLayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Início</span>
        </button>

        {/* Item 2: CRM */}
        <button
          onClick={() => {
            setActiveTab('crm');
            setShowMoreMenu(false);
          }}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeTab === 'crm' ? 'text-[#196BFB] dark:text-white font-bold' : 'text-slate-500 dark:text-white/50'
          }`}
          style={activeTab === 'crm' ? { color: currentTheme.secondary_color } : {}}
        >
          <IconLayoutKanban className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Jornada</span>
        </button>

        {/* Item 3: Pacientes */}
        <button
          onClick={() => {
            setActiveTab('pacientes');
            setShowMoreMenu(false);
          }}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeTab === 'pacientes' ? 'text-[#196BFB] dark:text-white font-bold' : 'text-slate-500 dark:text-white/50'
          }`}
          style={activeTab === 'pacientes' ? { color: currentTheme.secondary_color } : {}}
        >
          <IconUsers className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Fichas</span>
        </button>

        {/* Item 4: Agenda */}
        <button
          onClick={() => {
            setActiveTab('agenda');
            setShowMoreMenu(false);
          }}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeTab === 'agenda' ? 'text-[#196BFB] dark:text-white font-bold' : 'text-slate-500 dark:text-white/50'
          }`}
          style={activeTab === 'agenda' ? { color: currentTheme.secondary_color } : {}}
        >
          <IconCalendar className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Agenda</span>
        </button>

        {/* Item 5: Mais */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            showMoreMenu ? 'text-[#196BFB] dark:text-white font-bold' : 'text-slate-500 dark:text-white/50'
          }`}
          style={showMoreMenu ? { color: currentTheme.secondary_color } : {}}
        >
          <IconPlus className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Mais</span>
        </button>
      </div>

    </div>
  );
}

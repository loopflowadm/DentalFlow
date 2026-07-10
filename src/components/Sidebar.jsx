import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useClinic } from '../context/ClinicContext';
import Logo from './Logo';
import { 
  LayoutDashboard, Kanban, Users, Calendar, MessageSquare, 
  Bot, Zap, Megaphone, DollarSign, BarChart3, Settings, 
  LogOut, ChevronLeft, ChevronRight, Sparkles, Search, 
  Plus, CheckSquare, Clock, ArrowUpRight, Phone, AlertCircle
} from 'lucide-react';

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
  setSelectedAppointment
}) {
  const { user, logout, clinic } = useAuth();
  const { currentTheme } = useTheme();
  const { patients, appointments, crmLeads, addCrmLead } = useClinic();

  // Estados dos filtros da segunda sidebar
  const [crmSearch, setCrmSearch] = useState('');
  const [crmPriority, setCrmPriority] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [appointmentSearch, setAppointmentSearch] = useState('');

  // Controlar exibição do modal de Novo Lead a partir da sidebar
  const [showAddLeadSidebar, setShowAddLeadSidebar] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadProcedure, setNewLeadProcedure] = useState('Consulta Geral');
  const [newLeadBudget, setNewLeadBudget] = useState('');
  const [newLeadPriority, setNewLeadPriority] = useState('medium');

  // Mapeamento de Cargo para Itens Permitidos (RBAC)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'CLINIC_OWNER', 'RECEPTIONIST', 'DOCTOR', 'FINANCIAL'] },
    { id: 'crm', label: 'Jornada do Paciente', icon: Kanban, roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'CLINIC_OWNER', 'RECEPTIONIST', 'DOCTOR'] },
    { id: 'pacientes', label: 'Pacientes', icon: Users, roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'CLINIC_OWNER', 'RECEPTIONIST', 'DOCTOR', 'FINANCIAL'] },
    { id: 'agenda', label: 'Agenda', icon: Calendar, roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'CLINIC_OWNER', 'RECEPTIONIST', 'DOCTOR'] },
    { id: 'whatsapp', label: 'Central WhatsApp', icon: MessageSquare, roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'CLINIC_OWNER', 'RECEPTIONIST'] },
    { id: 'ai', label: 'Inteligência Artificial', icon: Bot, roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'CLINIC_OWNER', 'DOCTOR'] },
    { id: 'automacoes', label: 'Automações', icon: Zap, roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'CLINIC_OWNER', 'RECEPTIONIST'] },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'CLINIC_OWNER', 'FINANCIAL'] },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3, roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'CLINIC_OWNER', 'FINANCIAL'] },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'CLINIC_OWNER', 'RECEPTIONIST', 'DOCTOR', 'FINANCIAL'] }
  ];

  const userRole = user?.role || 'CLINIC_ADMIN';
  const allowedMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  // Verificar se o tab ativo possui uma segunda sidebar contextual
  const hasSubSidebar = ['crm', 'pacientes', 'agenda'].includes(activeTab);

  // Filtragem dos dados contextuais
  const filteredLeads = crmLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(crmSearch.toLowerCase()) || 
                          (lead.procedure_name && lead.procedure_name.toLowerCase().includes(crmSearch.toLowerCase()));
    const matchesPriority = crmPriority ? lead.priority === crmPriority : true;
    return matchesSearch && matchesPriority;
  });

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    (patient.phone && patient.phone.includes(patientSearch))
  );

  const filteredAppointments = appointments.filter(app => {
    const pat = patients.find(p => p.id === app.patient_id);
    const patName = pat ? pat.name.toLowerCase() : '';
    const procName = app.procedure_name ? app.procedure_name.toLowerCase() : '';
    const q = appointmentSearch.toLowerCase();
    return patName.includes(q) || procName.includes(q);
  });

  // Handler para cadastrar novo lead
  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone) return;
    
    const lead = addCrmLead({
      name: newLeadName,
      phone: newLeadPhone,
      procedure_name: newLeadProcedure,
      budget_amount: parseFloat(newLeadBudget) || 0,
      priority: newLeadPriority
    });

    // Reset formulário
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadBudget('');
    setShowAddLeadSidebar(false);
    
    // Selecionar o lead criado automaticamente
    if (lead) {
      setSelectedLead(lead);
    }
  };

  // Contadores rápidos para o CRM (Worklist)
  const totalLeadsCount = crmLeads.length;
  const newLeadsCount = crmLeads.filter(l => l.stage === 0).length;
  const inNegotiationCount = crmLeads.filter(l => l.stage === 6).length;
  const closedCount = crmLeads.filter(l => l.stage === 7).length;

  return (
    <div className="flex h-full select-none gap-4 relative">
      
      {/* ========================================================================= */}
      {/* COLUNA 1: BARRA DE ÍCONES DE NAVEGAÇÃO (FIXA 80px)                        */}
      {/* ========================================================================= */}
      <aside className="w-20 border border-slate-900/60 flex flex-col justify-between items-center py-5 flex-shrink-0 h-full rounded-[24px] shadow-2xl relative" style={{ backgroundColor: currentTheme.sidebar_bg_1 }}>
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo compacta - DentalFlow Symbol */}
          <div 
            className="h-12 w-12 flex items-center justify-center cursor-pointer group relative" 
            onClick={() => setActiveTab('dashboard')}
          >
            <Logo collapsed={true} className="h-8 w-8 text-white transition-transform hover:scale-105" />
            {/* Tooltip */}
            <div className="absolute left-20 bg-slate-950 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-2xl whitespace-nowrap z-50">
              DentalFlow
            </div>
          </div>

          {/* Lista de Ícones de Módulos */}
          <nav className="flex flex-col items-center gap-3 w-full px-2">
            {allowedMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center relative group transition-all duration-300 ${
                      isActive 
                        ? 'text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900/40'
                    }`}
                    style={isActive ? { backgroundColor: currentTheme.secondary_color, boxShadow: `0 4px 15px ${currentTheme.secondary_color}40` } : {}}
                  >
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white font-bold' : ''}`} />
                  
                  {/* Tooltip Lateral */}
                  <div className="absolute left-20 bg-slate-950 text-white text-xs font-semibold px-3 py-2 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl whitespace-nowrap z-50">
                    {item.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: Perfil & Sair */}
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Botão de Logout */}
          <button
            onClick={logout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
            title="Sair do Sistema"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* COLUNA 2: SUB-SIDEBAR CONTEXTUAL (OPCIONAL E COLAPSÁVEL, 260px)           */}
      {/* ========================================================================= */}
      {hasSubSidebar && !collapsed && (
        <aside className="w-64 border border-slate-900/60 flex flex-col h-full rounded-[24px] shadow-2xl overflow-hidden animate-in slide-in-from-left duration-250" style={{ backgroundColor: currentTheme.sidebar_bg_2 }}>
          
          {/* HEADER DA SUB-SIDEBAR (TÍTULO E BOTÃO DE RECOLHER) */}
          <div className="px-4 py-3 border-b border-slate-900/40 flex items-center justify-between flex-shrink-0 bg-slate-950/5">
            <span className="text-xs font-black text-white uppercase tracking-wider font-title pl-1">
              {activeTab === 'crm' && "Jornada do Paciente"}
              {activeTab === 'pacientes' && "Pacientes"}
              {activeTab === 'agenda' && "Agenda do Dia"}
            </span>
            {/* Toggle de Fechamento */}
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-900/60 transition-colors flex-shrink-0"
              title="Recolher painel"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CONTEÚDO CONTEXTUAL */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
            
            {/* 1. MÓDULO CRM LEADS */}
            {activeTab === 'crm' && (
              <>
                {/* Grid 2x2 de métricas rápidas no topo */}
                <div className="grid grid-cols-2 gap-2 text-white">
                  <div className="p-3 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                    <span className="text-xl font-bold font-title mt-1">{totalLeadsCount}</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Novos</span>
                    <span className="text-xl font-bold font-title mt-1 text-sky-400">{newLeadsCount}</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Negociando</span>
                    <span className="text-xl font-bold font-title mt-1 text-violet-400">{inNegotiationCount}</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fechados</span>
                    <span className="text-xl font-bold font-title mt-1 text-emerald-400">{closedCount}</span>
                  </div>
                </div>

                {/* Filtros e Ações */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar paciente por nome..."
                      value={crmSearch}
                      onChange={(e) => setCrmSearch(e.target.value)}
                      className="w-full bg-black/35 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors placeholder:text-slate-500"
                    />
                  </div>

                  <div className="flex gap-1.5">
                    <select
                      value={crmPriority}
                      onChange={(e) => setCrmPriority(e.target.value)}
                      className="flex-1 bg-black/35 border border-white/10 rounded-xl py-2 px-2 text-xs text-slate-400 focus:outline-none cursor-pointer"
                    >
                      <option value="">Todas prioridades</option>
                      <option value="high">Alta</option>
                      <option value="medium">Média</option>
                      <option value="low">Baixa</option>
                    </select>

                    <button
                      onClick={() => setShowAddLeadSidebar(true)}
                      className="p-2 hover:opacity-90 rounded-xl text-white flex items-center justify-center transition-all"
                      style={{ backgroundColor: currentTheme.secondary_color }}
                      title="Adicionar Novo Paciente"
                    >
                      <Plus className="w-4 h-4 font-bold" />
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
                        onClick={() => setSelectedLead(lead)}
                        className={`p-3 rounded-2xl cursor-pointer relative transition-all border group ${
                          isActive 
                            ? 'border-transparent text-white shadow-md' 
                            : 'bg-black/25 hover:bg-black/45 border-white/5 text-slate-300 hover:text-white'
                        }`}
                        style={isActive ? { backgroundColor: currentTheme.secondary_color, boxShadow: `0 4px 15px ${currentTheme.secondary_color}20` } : {}}
                      >
                        {/* Indicador de Prioridade */}
                        <span className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-lg ${
                          lead.priority === 'high' ? 'bg-[#FF5B60]' : lead.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`} />

                        {/* Seta no topo direito se ativo */}
                        {isActive && (
                          <ArrowUpRight className="w-3.5 h-3.5 absolute right-3 top-3 text-white" />
                        )}

                        <div className="flex items-center gap-2.5 pl-1.5">
                          <span className="text-xl flex-shrink-0">{lead.avatar || '👤'}</span>
                          <div className="overflow-hidden flex-1">
                            <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white font-black' : 'text-white'}`}>
                              {lead.name}
                            </h4>
                            <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                              {lead.procedure_name || 'Consulta Geral'}
                            </p>
                          </div>
                        </div>

                        {/* Orçamento e Status */}
                        <div className="mt-3.5 pt-2.5 border-t border-slate-800/10 dark:border-slate-800/20 flex justify-between items-center text-[10px] pl-1.5">
                          <span className={`font-extrabold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                            {lead.budget_amount ? `R$ ${lead.budget_amount}` : 'Sem Orçam.'}
                          </span>
                          
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : lead.priority === 'high' ? 'bg-[#FF5B60]/10 text-[#FF5B60]' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {lead.priority === 'high' ? 'Alta' : lead.priority === 'medium' ? 'Média' : 'Baixa'}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {filteredLeads.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-xs">
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
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar paciente..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full bg-black/35 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors placeholder:text-slate-500"
                    />
                  </div>

                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="p-2 hover:opacity-90 rounded-xl text-white flex items-center justify-center transition-all flex-shrink-0"
                    style={{ backgroundColor: currentTheme.secondary_color }}
                    title="Cadastrar Novo Paciente"
                  >
                    <Plus className="w-4 h-4 font-bold" />
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {filteredPatients.map(patient => {
                    const isActive = selectedPatient?.id === patient.id;
                    return (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                          isActive 
                            ? 'border-transparent text-white shadow-md' 
                            : 'bg-black/25 hover:bg-black/45 border-white/5 text-slate-300'
                        }`}
                        style={isActive ? { backgroundColor: currentTheme.secondary_color, boxShadow: `0 4px 15px ${currentTheme.secondary_color}20` } : {}}
                      >
                        <h4 className={`text-xs font-bold ${isActive ? 'text-white font-black' : 'text-white'}`}>
                          {patient.name}
                        </h4>
                        <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                          Tel: {patient.phone || 'Sem celular'}
                        </p>
                      </div>
                    );
                  })}

                  {filteredPatients.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      <span>Nenhum paciente cadastrado</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 3. MÓDULO AGENDA (CONSULTAS DO DIA) */}
            {activeTab === 'agenda' && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filtrar por paciente..."
                    value={appointmentSearch}
                    onChange={(e) => setAppointmentSearch(e.target.value)}
                    className="w-full bg-black/35 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2.5 pt-2">
                  {filteredAppointments.map(app => {
                    const isActive = selectedAppointment?.id === app.id;
                    const pat = patients.find(p => p.id === app.patient_id);
                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedAppointment(app)}
                        className={`p-3 rounded-2xl cursor-pointer transition-all border relative ${
                          isActive 
                            ? 'border-transparent text-white shadow-md' 
                            : 'bg-black/25 hover:bg-black/45 border-white/5 text-slate-300'
                        }`}
                        style={isActive ? { backgroundColor: currentTheme.secondary_color, boxShadow: `0 4px 15px ${currentTheme.secondary_color}20` } : {}}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-extrabold ${isActive ? 'text-white font-black' : 'text-slate-200'}`}>
                            {app.time || '14:00'}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                            isActive ? 'bg-white/20 text-white' : (app.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400')
                          }`}>
                            {app.status === 'confirmed' ? 'Confir.' : 'Pendente'}
                          </span>
                        </div>

                        <h4 className={`text-xs font-bold mt-2 truncate ${isActive ? 'text-white font-black' : 'text-white'}`}>
                          {pat?.name || 'Paciente'}
                        </h4>
                        
                        <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                          {app.procedure_name || 'Consulta'}
                        </p>
                      </div>
                    );
                  })}

                  {filteredAppointments.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      <span>Nenhuma consulta agendada</span>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* MODAL INTEGRADO DE CADASTRO DE LEAD (SIDEBAR)                            */}
      {/* ========================================================================= */}
      {showAddLeadSidebar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-850 rounded-[28px] max-w-sm w-full p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-left text-white">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold font-title flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-secondary" style={{ color: currentTheme.secondary_color }} />
                Adicionar à Jornada (Captação)
              </h3>
              <button 
                onClick={() => setShowAddLeadSidebar(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do paciente"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Celular / WhatsApp</label>
                <input
                  type="text"
                  required
                  placeholder="ex: 5511999999999"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Procedimento</label>
                  <input
                    type="text"
                    placeholder="ex: Implante"
                    value={newLeadProcedure}
                    onChange={(e) => setNewLeadProcedure(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Previsão (R$)</label>
                  <input
                    type="number"
                    placeholder="ex: 3500"
                    value={newLeadBudget}
                    onChange={(e) => setNewLeadBudget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prioridade</label>
                <select
                  value={newLeadPriority}
                  onChange={(e) => setNewLeadPriority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-slate-700 text-white cursor-pointer"
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
          className="absolute left-[72px] top-6 w-6 h-12 bg-[#0A173B] hover:bg-[#12245C] border border-y-slate-850 border-r-slate-850 border-l-transparent rounded-r-xl flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-md z-40 group hover:w-7 active:scale-95"
          title="Expandir painel"
        >
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}

    </div>
  );
}

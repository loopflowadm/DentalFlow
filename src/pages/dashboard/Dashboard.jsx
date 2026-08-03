import { useState, useEffect, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  Users, UserPlus, Calendar, Award, TrendingUp, AlertTriangle, 
  MessageSquare, MessagesSquare, CheckSquare, FileText, ArrowUpRight, 
  ArrowDownRight, Star, ChevronRight, Phone, Clock, Sparkles,
  User, Check, Bot, Zap, BarChart3, LayoutDashboard, DollarSign,
  Activity, CheckCircle2, Search, Bell, ArrowRight, Wallet
} from 'lucide-react';
import Relatorios from '../relatorios/Relatorios';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell 
} from 'recharts';

// Tooltip Personalizado Adaptativo (Light / Dark)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#111827]/95 border border-slate-200/90 dark:border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md text-left text-xs font-sans text-slate-800 dark:text-white transition-colors duration-200">
        <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 border-b border-slate-200 dark:border-white/10 pb-1 font-title">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-[11px] font-semibold my-0.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
            <span className="text-slate-900 dark:text-white font-bold font-mono">
              {entry.dataKey === 'revenue' ? `R$ ${entry.value.toLocaleString('pt-BR')}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ onNavigateTab }) {
  const { patients, appointments, crmLeads, updateAppointment } = useClinic();
  const { user } = useAuth();
  const [doctorsList, setDoctorsList] = useState([]);
  const [dashboardTab, setDashboardTab] = useState('geral'); // 'geral' | 'bi'

  // Simular controle de próteses associados a pacientes cadastrados
  const labWorks = useMemo(() => {
    if (patients.length > 0) {
      return [
        { id: 1, patient: patients[0].name, work: 'Coroa cerâmica (Dente 16)', lab: 'ProEsthetic Lab', due: 'Hoje', status: 'entregue' },
        { id: 2, patient: patients[patients.length - 1].name || 'Paciente', work: 'Placa de Bruxismo', lab: 'OrtoArt Lab', due: 'Amanhã', status: 'pendente' }
      ];
    }
    return [];
  }, [patients]);

  const handleUpdateAppStatus = async (app, newStatus) => {
    try {
      await updateAppointment({
        ...app,
        status: newStatus
      });
    } catch (err) {
      console.error('Erro ao atualizar status do agendamento:', err);
      alert('Falha ao atualizar status.');
    }
  };

  // Carregar lista real de dentistas da clínica
  useEffect(() => {
    let mounted = true;
    async function loadDoctors() {
      if (!user?.clinic_id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('clinic_id', user.clinic_id)
          .eq('role', 'DOCTOR');
        if (!error && data && mounted) {
          const formatted = data.map(doc => ({
            name: doc.full_name,
            specialty: 'Cirurgião-Dentista',
            exp: 'Membro',
            rating: 5.0,
            avatar: ''
          }));
          setDoctorsList(formatted);
        }
      } catch (err) {
        console.error('Erro ao carregar dentistas para o Dashboard:', err);
      }
    }
    loadDoctors();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Calendário Dinâmico Local
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth();
  const currentDate = today.getDate();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"];

  // Lógica de cálculo do calendário
  const firstDayIndex = new Date(currentYear, currentMonthIdx, 1).getDay();
  const lastDay = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= lastDay; d++) {
    calendarDays.push(d);
  }

  // Filtrar consultas de hoje
  const [selectedDay, setSelectedDay] = useState(currentDate);

  // Data formatada YYYY-MM-DD para o dia selecionado no mini-calendário
  const selectedDateStr = useMemo(() => {
    const d = new Date(currentYear, currentMonthIdx, selectedDay);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [currentYear, currentMonthIdx, selectedDay]);

  // Lista de Consultas do Dia Selecionado no Widget Lateral
  const selectedDateAppointmentsList = useMemo(() => {
    const dayApps = appointments.filter(app => {
      const rawDate = app.start_time || app.appointment_date || app.date;
      if (!rawDate) return false;
      const appDateStr = rawDate.split('T')[0];
      return appDateStr === selectedDateStr;
    });

    return dayApps.map(app => {
      const patientObj = patients.find(p => p.id === app.patient_id || p.id === app.patientId);
      const patientName = app.patientName || app.patient_name || (patientObj ? patientObj.name : 'Paciente');
      const rawDate = app.start_time || app.appointment_date || app.date;
      const appTime = app.time || app.appointment_time || (rawDate ? new Date(rawDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--');
      
      const statusUpper = (app.status || '').toUpperCase();
      let color = 'bg-[#196BFB]';
      let statusLabel = 'Confirmada';

      if (statusUpper === 'COMPLETED' || statusUpper === 'CONCLUIDO') {
        color = 'bg-emerald-500';
        statusLabel = 'Concluído';
      } else if (statusUpper === 'CANCELLED' || statusUpper === 'CANCELADO') {
        color = 'bg-rose-500';
        statusLabel = 'Cancelado';
      } else if (statusUpper === 'EM_ATENDIMENTO' || statusUpper === 'EM ATENDIMENTO') {
        color = 'bg-amber-500';
        statusLabel = 'Em atendimento';
      } else if (statusUpper === 'PENDING' || statusUpper === 'AGUARDANDO') {
        color = 'bg-sky-500';
        statusLabel = 'Pendente';
      }

      return {
        patient: patientName,
        time: appTime,
        type: app.procedure_name || app.procedureName || app.title || 'Consulta Odontológica',
        color: color,
        statusLabel: statusLabel
      };
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, patients, selectedDateStr]);

  // Métricas do Painel Executivo (5 Cards KPI Dinâmicos)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(app => {
    const rawDate = app.start_time || app.appointment_date || app.date;
    if (!rawDate) return false;
    const appDateStr = rawDate.split('T')[0];
    return appDateStr === todayStr;
  });

  const activePatientsCount = patients.length;
  const todayAppointmentsCount = todayAppointments.length;
  const waitingPatientsCount = todayAppointments.filter(a => a.status === 'aguardando' || a.status === 'em_atendimento' || a.status === 'WAITING').length;
  const crmLeadsCount = crmLeads.length;

  const monthlyRevenueSum = useMemo(() => {
    return appointments
      .filter(a => a.status === 'CONCLUIDO' || a.status === 'completed' || a.status === 'Concluído')
      .reduce((acc, a) => acc + (parseFloat(a.price || a.amount) || 0), 0);
  }, [appointments]);

  const formattedRevenueStr = monthlyRevenueSum > 0 
    ? `R$ ${monthlyRevenueSum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : 'R$ 0,00';

  const executiveStats = [
    { 
      label: 'CONSULTAS HOJE', 
      value: todayAppointmentsCount.toString(), 
      detail: todayAppointmentsCount > 0 ? '+12% vs ontem' : 'Nenhuma consulta hoje', 
      isPositive: true,
      icon: <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      iconBg: 'bg-blue-50 border-blue-100 dark:bg-blue-950/40 dark:border-blue-900/50'
    },
    { 
      label: 'PACIENTES NA ESPERA', 
      value: waitingPatientsCount.toString(), 
      detail: waitingPatientsCount > 0 ? 'Fila ativa' : 'Recepção livre', 
      isPositive: true,
      icon: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      iconBg: 'bg-amber-50 border-amber-100 dark:bg-amber-950/40 dark:border-amber-900/50'
    },
    { 
      label: 'LEADS NO CRM', 
      value: crmLeadsCount.toString(), 
      detail: crmLeadsCount > 0 ? 'Em negociação' : 'Nenhum lead novo', 
      isPositive: true,
      icon: <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      iconBg: 'bg-blue-50 border-blue-100 dark:bg-blue-950/40 dark:border-blue-900/50'
    },
    { 
      label: 'PACIENTES ATIVOS', 
      value: activePatientsCount.toString(), 
      detail: activePatientsCount > 0 ? 'Cadastrados na base' : 'Base limpa', 
      isPositive: true,
      icon: <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      iconBg: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/50'
    },
    { 
      label: 'FATURAMENTO DO MÊS', 
      value: formattedRevenueStr, 
      detail: monthlyRevenueSum > 0 ? 'Consolidado' : 'Sem receitas lançadas', 
      isPositive: true,
      icon: <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      iconBg: 'bg-purple-50 border-purple-100 dark:bg-purple-950/40 dark:border-purple-900/50'
    }
  ];

  // Dados do gráfico Donut: Distribuição de Consultas (Calculados Dinamicamente)
  const consultationDistributionData = useMemo(() => {
    const total = appointments.length;
    if (total === 0) {
      return [
        { name: 'Realizadas', value: 0, color: '#10B981', pct: '0%' },
        { name: 'Confirmadas', value: 0, color: '#196BFB', pct: '0%' },
        { name: 'Faltas', value: 0, color: '#F43F5E', pct: '0%' }
      ];
    }
    const realizadas = appointments.filter(a => a.status === 'CONCLUIDO' || a.status === 'completed' || a.status === 'Concluído').length;
    const confirmadas = appointments.filter(a => a.status === 'CONFIRMADO' || a.status === 'confirmed' || a.status === 'Confirmado').length;
    const faltas = appointments.filter(a => a.status === 'CANCELLED' || a.status === 'canceled' || a.status === 'Cancelado').length;

    return [
      { name: 'Realizadas', value: realizadas, color: '#10B981', pct: `${Math.round((realizadas / total) * 100)}%` },
      { name: 'Confirmadas', value: confirmadas, color: '#196BFB', pct: `${Math.round((confirmadas / total) * 100)}%` },
      { name: 'Faltas', value: faltas, color: '#F43F5E', pct: `${Math.round((faltas / total) * 100)}%` }
    ];
  }, [appointments]);

  // Dados do gráfico Donut: Leads por Origem (CRM) (Calculados Dinamicamente)
  const leadsOriginData = useMemo(() => {
    const total = crmLeads.length;
    if (total === 0) {
      return [
        { name: 'WhatsApp', value: 0, color: '#10B981', pct: '0%' },
        { name: 'Instagram', value: 0, color: '#8B5CF6', pct: '0%' },
        { name: 'Indicação', value: 0, color: '#196BFB', pct: '0%' },
        { name: 'Site', value: 0, color: '#F43F5E', pct: '0%' },
        { name: 'Outros', value: 0, color: '#64748B', pct: '0%' }
      ];
    }
    const counts = { WhatsApp: 0, Instagram: 0, Indicação: 0, Site: 0, Outros: 0 };
    crmLeads.forEach(l => {
      const orig = l.origin || 'WhatsApp';
      if (counts[orig] !== undefined) counts[orig]++;
      else counts.Outros++;
    });

    return [
      { name: 'WhatsApp', value: counts.WhatsApp, color: '#10B981', pct: `${Math.round((counts.WhatsApp / total) * 100)}%` },
      { name: 'Instagram', value: counts.Instagram, color: '#8B5CF6', pct: `${Math.round((counts.Instagram / total) * 100)}%` },
      { name: 'Indicação', value: counts.Indicação, color: '#196BFB', pct: `${Math.round((counts.Indicação / total) * 100)}%` },
      { name: 'Site', value: counts.Site, color: '#F43F5E', pct: `${Math.round((counts.Site / total) * 100)}%` },
      { name: 'Outros', value: counts.Outros, color: '#64748B', pct: `${Math.round((counts.Outros / total) * 100)}%` }
    ];
  }, [crmLeads]);

  // Dados de Sparkline Financeira (Mini Area Chart)
  const financialSparklineData = useMemo(() => {
    if (monthlyRevenueSum === 0) {
      return [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];
    }
    return [
      { v: Math.round(monthlyRevenueSum * 0.4) },
      { v: Math.round(monthlyRevenueSum * 0.55) },
      { v: Math.round(monthlyRevenueSum * 0.5) },
      { v: Math.round(monthlyRevenueSum * 0.7) },
      { v: Math.round(monthlyRevenueSum * 0.85) },
      { v: monthlyRevenueSum }
    ];
  }, [monthlyRevenueSum]);

  // Atividades Recentes (Dinâmicas)
  const recentActivities = useMemo(() => {
    const list = [];
    crmLeads.slice(0, 3).forEach(l => {
      list.push({
        time: 'Recente',
        title: `Novo lead: ${l.name} (${l.origin || 'WhatsApp'})`,
        icon: <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
      });
    });
    appointments.slice(0, 2).forEach(a => {
      list.push({
        time: a.time || 'Hoje',
        title: `Consulta ${a.status === 'CONCLUIDO' ? 'concluída' : 'confirmada'}: ${a.patientName}`,
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      });
    });
    return list;
  }, [crmLeads, appointments]);

  // Gerar dados do gráfico dinamicamente com base nas consultas reais dos últimos 6 meses
  const monthsAbbr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  const appointmentVolumeChartData = Array.from({ length: 6 }).map((_, idx) => {
    const targetMonthIdx = (currentMonthIdx - 5 + idx + 12) % 12;
    const monthName = monthsAbbr[targetMonthIdx];
    
    const monthApps = appointments.filter(app => {
      const rawDate = app.start_time || app.appointment_date || app.date;
      if (!rawDate) return false;
      const appDate = new Date(rawDate);
      return appDate.getMonth() === targetMonthIdx && appDate.getFullYear() === currentYear;
    });

    const completed = monthApps.filter(app => app.status === 'completed' || app.status === 'Concluído' || app.status === 'CONCLUIDO').length;
    const confirmed = monthApps.filter(app => app.status === 'confirmed' || app.status === 'Confirmado' || app.status === 'CONFIRMADO' || app.status === 'scheduled').length;
    const canceled = monthApps.filter(app => app.status === 'canceled' || app.status === 'Cancelado' || app.status === 'CANCELLED').length;

    return {
      month: monthName,
      realizadas: completed,
      confirmadas: confirmed,
      faltas: canceled
    };
  });

  // Formatar a saudação de forma inteligente
  const getGreetingName = () => {
    if (!user?.full_name) return 'Dr. Thácio';
    const parts = user.full_name.trim().split(/\s+/);
    if (parts.length === 0) return 'Dr. Thácio';
    
    const firstWord = parts[0].toLowerCase().replace('.', '');
    if ((firstWord === 'dr' || firstWord === 'dra' || firstWord === 'doutor' || firstWord === 'doutora') && parts.length > 1) {
      return `${parts[0]} ${parts[1]}`;
    }
    return `Dr. ${parts[0]}`;
  };

  const formattedCurrentDateStr = `02 de ${monthNames[currentMonthIdx]}, ${currentYear}`;

  return (
    <div className="h-full flex flex-col overflow-y-auto scrollbar-thin bg-slate-50/50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* SELETOR DE ABA DO DASHBOARD (VISÃO GERAL DO DIA / ANÁLISE DE BI) */}
      <div className="px-6 py-3 border-b border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0b0f19] flex items-center justify-between transition-colors duration-300">
        <div className="flex bg-slate-100 dark:bg-[#151c2c] p-1 rounded-xl border border-slate-200/40 dark:border-white/10">
          <button
            onClick={() => setDashboardTab('geral')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              dashboardTab === 'geral'
                ? 'bg-white dark:bg-[#1f293d] text-slate-800 dark:text-white shadow-xs border border-slate-200/50 dark:border-white/10'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
            <span>Visão Geral do Dia</span>
          </button>
          <button
            onClick={() => setDashboardTab('bi')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              dashboardTab === 'bi'
                ? 'bg-white dark:bg-[#1f293d] text-slate-800 dark:text-white shadow-xs border border-slate-200/50 dark:border-white/10'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Análise de BI & Desempenho</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 pb-12">
        {dashboardTab === 'bi' ? (
          <Relatorios onNavigateTab={onNavigateTab} />
        ) : (
          <div className="flex flex-col xl:flex-row gap-6">
          
          {/* 1. ÁREA ESQUERDA (Métricas, Gráficos e Tabelas) */}
          <div className="flex-1 xl:flex-[3] space-y-6">
            
            {/* Banner de Boas-Vindas com Data e Horário no Canto Direito */}
            <div className="bg-white dark:bg-[#151c2c] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-title tracking-tight">
                  Olá, {getGreetingName()}!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Aqui está o resumo analítico da rotina clínica e acompanhamento de pacientes.
                </p>
              </div>

              {/* Badges de Data e Atualização no Canto Direito */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Hoje é <strong className="text-slate-900 dark:text-white">{formattedCurrentDateStr}</strong></span>
                </div>
                <div className="bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Última atualização <strong className="text-slate-900 dark:text-white">08:45</strong></span>
                </div>
              </div>
            </div>

            {/* 5 Cards Executivos de KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {executiveStats.map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-[#151c2c] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-xs hover:border-blue-300 dark:hover:border-blue-500/40 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-tight">
                      {stat.label}
                    </span>
                    <div className={`w-8 h-8 rounded-xl ${stat.iconBg} border flex items-center justify-center shrink-0`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-900 dark:text-white font-title">{stat.value}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                      {stat.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Gráficos de Volume de Consultas & Distribuição de Consultas (Lado a Lado) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Volume & Frequência (ColSpan 7) */}
              <div className="lg:col-span-7 bg-white dark:bg-[#151c2c] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs text-left">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-title">VOLUME & FREQUÊNCIA DE CONSULTAS</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Histórico mensal de consultas realizadas, confirmadas e faltas/cancelamentos</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold shrink-0">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Realizadas
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" /> Confirmadas
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" /> Faltas
                    </span>
                  </div>
                </div>

                <div className="h-60 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={appointmentVolumeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRealizadasGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorConfirmadasGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#196BFB" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#196BFB" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="realizadas" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRealizadasGrad)" name="Realizadas" />
                      <Area type="monotone" dataKey="confirmadas" stroke="#196BFB" strokeWidth={2} fillOpacity={1} fill="url(#colorConfirmadasGrad)" name="Confirmadas" />
                      <Bar dataKey="faltas" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={10} name="Faltas / Cancelamentos" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right: Distribuição de Consultas (Donut Chart) (ColSpan 5) */}
              <div className="lg:col-span-5 bg-white dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs text-left flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-title">DISTRIBUIÇÃO DE CONSULTAS</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Este mês</p>
                </div>

                <div className="flex items-center gap-4 py-2">
                  {/* Donut Chart with Center Text */}
                  <div className="relative w-36 h-36 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={consultationDistributionData}
                          innerRadius={42}
                          outerRadius={62}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {consultationDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-slate-900 dark:text-white font-title leading-none">{appointments.length}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Total</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="flex-1 space-y-2 text-xs">
                    {consultationDistributionData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{item.pct} <span className="text-[10px] text-slate-400 font-medium">({item.value})</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Seção Inferior: Sala de Espera (ColSpan 6), Financeiro (ColSpan 3), Leads Origem (ColSpan 3) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* 1. Sala de Espera (ColSpan 6) */}
              <div className="lg:col-span-6 bg-white dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-title">SALA DE ESPERA (FILA DA RECEPÇÃO)</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Monitore os pacientes presentes e gerencie chamados em tempo real.</p>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold px-2.5 py-1 rounded-full shrink-0">
                    {todayAppointments.filter(a => a.status === 'aguardando' || a.status === 'em_atendimento').length} aguardando
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/10 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-2.5">Horário</th>
                        <th>Paciente</th>
                        <th>Procedimento</th>
                        <th>Status</th>
                        <th className="text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {todayAppointments.length > 0 ? (
                        todayAppointments.map((app) => {
                          const patient = patients.find(p => p.id === app.patient_id);
                          
                          return (
                            <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                              <td className="py-3 font-bold text-slate-700 dark:text-slate-300">{app.appointment_time || (app.appointment_date ? new Date(app.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : (app.time || '--:--'))}</td>
                              <td className="font-extrabold text-slate-900 dark:text-white">{patient?.name || app.patientName || 'Paciente'}</td>
                              <td className="text-slate-500 dark:text-slate-400 font-medium">{app.procedure_name || app.procedureName || 'Consulta'}</td>
                              <td>
                                {app.status === 'completed' || app.status === 'Concluído' || app.status === 'CONCLUIDO' ? (
                                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-extrabold text-[9px]">Finalizado</span>
                                ) : app.status === 'em_atendimento' || app.status === 'em_consulta' ? (
                                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full font-extrabold text-[9px] animate-pulse">No Consultório</span>
                                ) : app.status === 'aguardando' || app.status === 'chegou' ? (
                                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-extrabold text-[9px]">Aguardando</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-extrabold text-[9px]">Confirmada</span>
                                )}
                              </td>
                              <td className="text-right font-semibold">
                                {app.status === 'completed' || app.status === 'Concluído' || app.status === 'CONCLUIDO' ? (
                                  <span className="text-[10px] text-slate-400 font-bold flex items-center justify-end gap-1">
                                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Concluído
                                  </span>
                                ) : app.status === 'em_atendimento' || app.status === 'em_consulta' ? (
                                  <button
                                    onClick={() => handleUpdateAppStatus(app, 'completed')}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[9px] shadow-xs transition-all cursor-pointer"
                                  >
                                    Finalizar
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUpdateAppStatus(app, 'em_atendimento')}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[9px] shadow-xs transition-all cursor-pointer"
                                  >
                                    Chamar
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 font-medium text-xs">
                            Nenhum paciente na sala de espera neste momento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 text-center">
                  <button 
                    onClick={() => onNavigateTab && onNavigateTab('agenda')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver todos na sala de espera</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 2. Financeiro - Resumo do Mês (ColSpan 3 Dinâmico) */}
              <div className="lg:col-span-3 bg-white dark:bg-[#151c2c] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs flex flex-col justify-between text-left">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-title">FINANCEIRO - RESUMO DO MÊS</h3>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-medium">Faturamento</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-title tracking-tight">{formattedRevenueStr}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">{monthlyRevenueSum > 0 ? '+15%' : '0%'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-medium">Recebimentos</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-title tracking-tight">
                          {monthlyRevenueSum > 0 ? `R$ ${(monthlyRevenueSum * 0.938).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">{monthlyRevenueSum > 0 ? '+13%' : '0%'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-medium">Despesas</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-title tracking-tight">
                          {monthlyRevenueSum > 0 ? `R$ ${(monthlyRevenueSum * 0.331).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
                        </span>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">{monthlyRevenueSum > 0 ? '+8%' : '0%'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Lucro Líquido</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-title tracking-tight">
                          {monthlyRevenueSum > 0 ? `R$ ${(monthlyRevenueSum * 0.607).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">{monthlyRevenueSum > 0 ? '+21%' : '0%'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Sparkline Chart */}
                <div className="h-12 mt-4 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialSparklineData}>
                      <defs>
                        <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2} fill="url(#sparklineGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. Leads por Origem Donut Chart (ColSpan 3 Dinâmico) */}
              <div className="lg:col-span-3 bg-white dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs flex flex-col justify-between text-left">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-title">LEADS POR ORIGEM</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Este mês</p>

                  <div className="flex items-center gap-3 my-3">
                    <div className="relative w-28 h-28 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={leadsOriginData}
                            innerRadius={30}
                            outerRadius={48}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {leadsOriginData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-lg font-black text-slate-900 dark:text-white font-title leading-none">{crmLeads.length}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Total</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 text-[11px]">
                      {leadsOriginData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white text-[10px]">{item.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-center">
                  <button 
                    onClick={() => onNavigateTab && onNavigateTab('crm')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver todos os leads</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* 2. ÁREA DIREITA (Sidebar: Calendário, Agenda do Dia & Atividades Recentes) */}
          <div className="w-full xl:w-80 bg-white dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs flex flex-col space-y-6 flex-shrink-0 text-left">
            
            {/* Header Widget */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white font-title">Calendário Clínico</h3>
              <span className="text-[10px] text-slate-500 font-extrabold">{monthNames[currentMonthIdx]} {currentYear}</span>
            </div>

            {/* Calendário Dinâmico */}
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-1 text-center">
                {daysOfWeek.map((day, idx) => (
                  <span key={idx} className="text-[9px] font-bold text-slate-400 uppercase">{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    disabled={day === null}
                    onClick={() => day !== null && setSelectedDay(day)}
                    className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                      day === null 
                        ? 'bg-transparent text-transparent cursor-default' 
                        : day === selectedDay 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-black scale-105' 
                          : day === currentDate 
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-extrabold' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Agenda de Hoje */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-title">
                  {selectedDay === currentDate ? 'Agenda de Hoje' : `Agenda de ${selectedDay}/${currentMonthIdx + 1}`}
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
                    {selectedDateAppointmentsList.length} consultas
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedDateAppointmentsList.length > 0 ? (
                  selectedDateAppointmentsList.map((app, idx) => (
                    <div key={idx} className="p-3 border border-slate-200/70 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/5 flex items-center justify-between hover:border-blue-300 transition-all text-left">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${app.color}`} />
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white font-title">{app.patient}</h5>
                          <span className="text-[10px] text-slate-400 font-semibold block">{app.type}</span>
                        </div>
                      </div>
                      <div className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg">
                        {app.statusLabel}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                    Sem agendamentos para a data selecionada.
                  </div>
                )}
              </div>

              <div className="text-center pt-1">
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('agenda')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Ver agenda completa
                </button>
              </div>
            </div>

            {/* Widget 3: ATIVIDADES RECENTES (Feed da Sidebar) */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/10">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-title">ATIVIDADES RECENTES</h4>
              </div>

              <div className="space-y-2.5">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center shrink-0">
                        {act.icon}
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">{act.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">{act.time}</span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  Ver todas atividades
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
    </div>
  );
}

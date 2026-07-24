import { useState, useEffect, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  Users, UserPlus, Calendar, Award, TrendingUp, AlertTriangle, 
  MessageSquare, MessagesSquare, CheckSquare, FileText, ArrowUpRight, 
  ArrowDownRight, Star, ChevronRight, Phone, Clock, Sparkles,
  User, Check, Bot, Zap, BarChart3
} from 'lucide-react';
import Relatorios from '../relatorios/Relatorios';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Cell 
} from 'recharts';

// Tooltip Personalizado nos Padrões Obsidian Midnight (#111827)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827]/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md text-left text-xs font-sans">
        <p className="font-bold text-slate-200 mb-1.5 border-b border-white/10 pb-1 font-title">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-[11px] font-semibold my-0.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-bold font-mono">
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
    async function loadDoctors() {
      if (!user?.clinic_id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('clinic_id', user.clinic_id)
          .eq('role', 'DOCTOR');
        if (!error && data) {
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
      if (!app.appointment_date) return false;
      const appDateStr = app.appointment_date.split('T')[0];
      return appDateStr === selectedDateStr;
    });

    return dayApps.map(app => {
      const patientObj = patients.find(p => p.id === app.patient_id);
      const patientName = patientObj ? patientObj.name : 'Paciente';
      const appTime = app.appointment_time || (app.appointment_date ? new Date(app.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--');
      
      let color = 'bg-blue-500';
      if (app.status === 'completed' || app.status === 'Concluído') color = 'bg-emerald-500';
      else if (app.status === 'canceled' || app.status === 'Cancelado') color = 'bg-red-500';
      else if (app.status === 'confirmed' || app.status === 'Confirmado') color = 'bg-indigo-500';
      
      return {
        patient: patientName,
        time: appTime,
        type: app.procedure_name || 'Consulta Odontológica',
        color: color
      };
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, patients, selectedDateStr]);

  // Métricas do Painel Executivo
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(app => {
    if (!app.appointment_date) return false;
    const appDateStr = app.appointment_date.split('T')[0];
    return appDateStr === todayStr;
  });

  const activePatientsCount = patients.length;
  const completedAppointmentsCount = appointments.filter(app => app.status === 'completed' || app.status === 'Concluído').length;

  const todayRevenue = todayAppointments
    .filter(app => app.status === 'completed' || app.status === 'Concluído')
    .reduce((acc, app) => acc + (parseFloat(app.price) || 0), 0);

  const executiveStats = [
    { label: 'Faturamento de Hoje', value: `R$ ${todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, detail: 'tempo real', isPositive: true },
    { label: 'Consultas Realizadas', value: completedAppointmentsCount.toString(), detail: 'acumulado', isPositive: true },
    { label: 'Pacientes Ativos', value: activePatientsCount.toString(), detail: 'no sistema', isPositive: true },
    { label: 'Leads no CRM', value: crmLeads.length.toString(), detail: 'em captação', isPositive: true }
  ];

  // Gerar dados do gráfico dinamicamente com base nas consultas dos últimos 6 meses
  const monthsAbbr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  const revenueChartData = Array.from({ length: 6 }).map((_, idx) => {
    const targetMonthIdx = (currentMonthIdx - 5 + idx + 12) % 12;
    const monthName = monthsAbbr[targetMonthIdx];
    
    const monthApps = appointments.filter(app => {
      if (!app.appointment_date) return false;
      const appDate = new Date(app.appointment_date);
      return appDate.getMonth() === targetMonthIdx && appDate.getFullYear() === currentYear;
    });

    const appointmentsCount = monthApps.length;
    const surgeriesCount = monthApps.filter(app => app.procedure_name?.toLowerCase().includes('cirurgia') || app.procedure_name?.toLowerCase().includes('implante')).length;
    const revenue = monthApps
      .filter(app => app.status === 'completed' || app.status === 'Concluído')
      .reduce((acc, app) => acc + (parseFloat(app.price) || 0), 0);

    return {
      month: monthName,
      appointments: appointmentsCount,
      surgeries: surgeriesCount,
      revenue: revenue
    };
  });

  // Formatar a saudação de forma inteligente (Ex: "Dr. Thácio" ou "Thácio")
  const getGreetingName = () => {
    if (!user?.full_name) return 'Doutor';
    const parts = user.full_name.trim().split(/\s+/);
    if (parts.length === 0) return 'Doutor';
    
    const firstWord = parts[0].toLowerCase().replace('.', '');
    if ((firstWord === 'dr' || firstWord === 'dra' || firstWord === 'doutor' || firstWord === 'doutora') && parts.length > 1) {
      return `${parts[0]} ${parts[1]}`;
    }
    return parts[0];
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-1 pb-10 scrollbar-thin">
      
      {/* Seletor de Abas do Dashboard (Visão Geral vs BI) */}
      <div className="flex items-center justify-between bg-white dark:bg-[#0D0D0D] p-2 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 pl-2">
          <span className="text-xs font-bold text-slate-800 dark:text-white font-title">Painel Inteligente</span>
        </div>

        <div className="flex bg-slate-100 dark:bg-black p-1 rounded-xl border border-slate-200/40 dark:border-white/10">
          <button
            onClick={() => setDashboardTab('geral')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
              dashboardTab === 'geral'
                ? 'bg-white dark:bg-[#18181B] text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Visão Geral do Dia
          </button>
          <button
            onClick={() => setDashboardTab('bi')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
              dashboardTab === 'bi'
                ? 'bg-white dark:bg-[#18181B] text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-secondary" />
            Análise de BI & Desempenho
          </button>
        </div>
      </div>

      {dashboardTab === 'bi' ? (
        <Relatorios onNavigateTab={onNavigateTab} />
      ) : (
        <div className="flex flex-col xl:flex-row gap-6">
          {/* 1. ÁREA ESQUERDA (Métricas e Painéis Analíticos) - ColSpan 3 */}
          <div className="flex-1 xl:flex-[3] space-y-6">
            
            {/* Banner de Boas-Vindas */}
            <div className="bg-gradient-to-r from-secondary/10 to-primary/5 dark:from-secondary/10 dark:to-primary/5 border border-secondary/20 rounded-3xl p-5 flex items-center shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur">
              <div>
                <h2 className="text-md font-black text-slate-800 dark:text-white font-title flex items-center gap-1.5">
                  Olá, {getGreetingName()}!
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Aqui está o resumo analítico de performance e automação da sua clínica.</p>
              </div>
            </div>


        {/* Executivos Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {executiveStats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-[#0D0D0D] border border-slate-200/50 dark:border-white/10 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between hover:border-secondary/30 transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-tight max-w-[80%]">
                  {stat.label}
                </span>
                <span className="text-[10px] font-extrabold text-secondary dark:text-secondary bg-secondary/5 dark:bg-secondary/10 px-2 py-0.5 rounded-md">
                  {stat.detail.split(' ')[0]}
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-800 dark:text-white font-title">{stat.value}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500">{stat.detail.replace(stat.detail.split(' ')[0], '')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico Principal de Receita e Consultas */}
        <div className="bg-white dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm dark:shadow-2xl backdrop-blur-md text-left transition-colors duration-300">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-title">Faturamento & Volume de Consultas</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Histórico mensal de receita e consultas realizadas</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Faturamento (R$)
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full" /> Volume Consultas
              </span>
            </div>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#196BFB" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#196BFB" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#196BFB" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueGrad)" name="Faturamento" />
                <Bar dataKey="appointments" fill="#06B6D4" radius={[4, 4, 0, 0]} barSize={10} name="Consultas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sala de Espera (Fila da Recepção) */}
        <div className="bg-white dark:bg-[#0D0D0D] border border-slate-200/50 dark:border-white/10 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Sala de Espera (Fila da Recepção)</h3>
              <p className="text-[9px] text-slate-450 dark:text-slate-400 mt-0.5">Monitore os pacientes presentes no consultório e gerencie os chamados em tempo real.</p>
            </div>
            <span className="text-[9px] bg-amber-500/10 text-amber-500 font-extrabold px-2 py-0.5 rounded-full">
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
                  <th>Status Recepção</th>
                  <th className="text-right">Ação Clínica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((app) => {
                    const patient = patients.find(p => p.id === app.patient_id);
                    
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 font-bold text-slate-550">{app.appointment_time || (app.appointment_date ? new Date(app.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--')}</td>
                        <td className="font-extrabold text-slate-800 dark:text-white">{patient?.name || 'Paciente'}</td>
                        <td className="text-slate-450 font-medium">{app.procedure_name || 'Consulta'}</td>
                        <td>
                          {app.status === 'completed' || app.status === 'Concluído' ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full font-extrabold text-[9px]">Finalizado</span>
                          ) : app.status === 'em_atendimento' || app.status === 'em_consulta' ? (
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full font-extrabold text-[9px] animate-pulse">No Consultório</span>
                          ) : app.status === 'aguardando' || app.status === 'chegou' ? (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full font-extrabold text-[9px]">Aguardando Recepção</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-450 rounded-full font-extrabold text-[9px]">Não Chegou</span>
                          )}
                        </td>
                        <td className="text-right font-semibold">
                          {app.status === 'completed' || app.status === 'Concluído' ? (
                            <span className="text-[10px] text-slate-400 font-bold flex items-center justify-end gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-500" /> Concluído
                            </span>
                          ) : app.status === 'em_atendimento' || app.status === 'em_consulta' ? (
                            <button
                              onClick={() => handleUpdateAppStatus(app, 'completed')}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[9px] shadow-sm transition-all"
                            >
                              Finalizar Consulta
                            </button>
                          ) : app.status === 'aguardando' || app.status === 'chegou' ? (
                            <button
                              onClick={() => handleUpdateAppStatus(app, 'em_atendimento')}
                              className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-650 text-white rounded-lg font-bold text-[9px] shadow-sm transition-all"
                            >
                              Chamar Consultório
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateAppStatus(app, 'aguardando')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-[9px] transition-all"
                            >
                              Registrar Chegada
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Nenhum agendamento para hoje na fila.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dentistas Ativos da Clínica */}
        <div className="bg-white dark:bg-[#0D0D0D] border border-slate-200/50 dark:border-white/10 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">Dentistas Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doctorsList.length > 0 ? (
              doctorsList.map((doc, idx) => (
                <div key={idx} className="border border-slate-200/40 dark:border-white/10 rounded-2xl p-4 bg-slate-50/30 dark:bg-white/5 flex items-center justify-between hover:border-secondary/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl bg-white dark:bg-[#18181B] w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100 dark:border-white/10 shadow-sm">
                      {doc.avatar}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{doc.name}</h4>
                      <span className="text-[10px] text-slate-400 block">{doc.specialty} • {doc.exp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white dark:bg-[#18181B] px-2 py-0.5 rounded-lg border border-slate-100 dark:border-white/10">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-350">{doc.rating}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-6 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                Nenhum dentista cadastrado na equipe. Vá em Configurações para adicionar.
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="bg-white dark:bg-[#0D0D0D] border border-slate-200/50 dark:border-white/10 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">Estatísticas Gerais</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 border-r border-slate-100 dark:border-white/10">
              <span className="text-[10px] text-slate-450 block font-semibold mb-1">Pacientes Cadastrados</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">{patients.length}</span>
            </div>
            <div className="p-3 border-r border-slate-100 dark:border-white/10">
              <span className="text-[10px] text-slate-450 block font-semibold mb-1">Consultas na Agenda</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">{appointments.length}</span>
            </div>
            <div className="p-3 border-r border-slate-100 dark:border-white/10">
              <span className="text-[10px] text-slate-450 block font-semibold mb-1">Leads Comercial (CRM)</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">{crmLeads.length}</span>
            </div>
            <div className="p-3">
              <span className="text-[10px] text-slate-450 block font-semibold mb-1">Taxa de Conversão</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">
                {crmLeads.length + patients.length > 0 
                  ? `${Math.round((patients.length / (crmLeads.length + patients.length)) * 100)}%` 
                  : '0%'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. ÁREA DIREITA (Widget do Calendário e Agenda de Hoje) - ColSpan 1 */}
      <div className="w-full xl:w-80 bg-white dark:bg-[#0D0D0D] border border-slate-200/50 dark:border-white/10 rounded-3xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.015)] flex flex-col space-y-6 flex-shrink-0">
        
        {/* Header Widget */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white font-title">Calendário Clínico</h3>
          <span className="text-[10px] text-slate-400 font-extrabold">{monthNames[currentMonthIdx]} {currentYear}</span>
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

        {/* Consultas do Dia Selecionado */}
        <div className="space-y-4 flex-1">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">
              {selectedDay === currentDate ? 'Agenda de Hoje' : `Agenda de ${selectedDay}/${currentMonthIdx + 1}`}
            </h4>
            <div className="flex items-center gap-1.5">
              {selectedDay !== currentDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDay(currentDate)}
                  className="text-[9px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Hoje
                </button>
              )}
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                {selectedDateAppointmentsList.length} ativ.
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {selectedDateAppointmentsList.length > 0 ? (
              selectedDateAppointmentsList.map((app, idx) => (
                <div key={idx} className="p-3 border border-slate-150/40 dark:border-slate-800/80 rounded-2xl bg-slate-50/20 dark:bg-slate-900/10 flex items-center justify-between hover:-translate-y-0.5 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <span className={`w-1.5 h-6 rounded-full ${app.color}`} />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-white">{app.patient}</h5>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">{app.type}</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-extrabold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {app.time}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {selectedDay === currentDate 
                  ? 'Nenhuma consulta agendada para hoje' 
                  : `Nenhuma consulta em ${selectedDay}/${currentMonthIdx + 1}`}
              </div>
            )}
          </div>
        </div>

        {/* Controle de Próteses & Laboratórios */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <h4 className="text-xs font-bold text-slate-850 dark:text-white">Trabalhos de Protético</h4>
            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-2 py-0.5 rounded-full">
              {labWorks.length} pend.
            </span>
          </div>

          <div className="space-y-2">
            {labWorks.length > 0 ? (
              labWorks.map((work) => (
                <div key={work.id} className="p-3 border border-slate-150/40 dark:border-slate-800/80 rounded-2xl bg-slate-50/20 dark:bg-slate-900/10 space-y-1.5 hover:-translate-y-0.5 transition-all text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-white truncate max-w-[130px]">{work.patient}</h5>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">{work.work}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-extrabold text-[8px] uppercase tracking-wider ${
                      work.status === 'entregue' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-amber-500/10 text-amber-500 animate-pulse'
                    }`}>
                      {work.status === 'entregue' ? 'Entregue' : 'Aguardando'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold pt-1.5 border-t border-slate-100/50 dark:border-slate-800/50">
                    <span>{work.lab}</span>
                    <span className={work.due === 'Hoje' ? 'text-rose-500' : ''}>Prazo: {work.due}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                Nenhum trabalho de prótese pendente
              </div>
            )}
          </div>
        </div>

        {/* Plantão do Dia / Médico de Plantão */}
        {doctorsList.length > 0 ? (
          <div className="bg-secondary border border-secondary/10 text-white rounded-2xl p-4 shadow-md shadow-secondary/10">
            <div className="flex items-center gap-3">
              <span className="bg-white/20 w-9 h-9 rounded-xl flex items-center justify-center border border-white/10">
                <User className="w-5 h-5 text-white" />
              </span>
              <div>
                <h5 className="text-xs font-bold">{doctorsList[0].name}</h5>
                <span className="text-[10px] text-white/80 block mt-0.5">Médico Responsável Hoje</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] bg-black/10 px-2.5 py-1 rounded-xl w-fit">
              <Clock className="w-3.5 h-3.5" />
              <span>Plantão Ativo</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Nenhum plantonista ativo hoje
          </div>
        )}

      </div>
    </div>
  )}
</div>
  );
}

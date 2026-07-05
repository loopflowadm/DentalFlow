import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, UserPlus, Calendar, Award, TrendingUp, AlertTriangle, 
  MessageSquare, MessagesSquare, CheckSquare, FileText, ArrowUpRight, 
  ArrowDownRight, Star, ChevronRight, Phone, Clock, Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Cell 
} from 'recharts';

export default function Dashboard() {
  const { patients, appointments, crmLeads } = useClinic();
  const { user } = useAuth();

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

  // Estatísticas Principais (Painel Executivo)
  const executiveStats = [
    { label: 'Faturamento de Hoje', value: 'R$ 9.900', detail: '+20% este mês', isPositive: true, sparkData: [3, 5, 4, 8, 7, 9] },
    { label: 'Consultas Realizadas', value: '230', detail: '+30 este mês', isPositive: true, sparkData: [2, 3, 5, 4, 6, 7] },
    { label: 'Pacientes Ativos', value: '660', detail: '+40 este mês', isPositive: true, sparkData: [5, 6, 6, 8, 7, 9] },
    { label: 'Confirmação de IA', value: '92%', detail: '+5% vs ontem', isPositive: true, sparkData: [8, 8.5, 9, 8.8, 9.1, 9.2] }
  ];

  // Gráficos de Faturamento e Agendamentos
  const revenueChartData = [
    { month: 'Jan', appointments: 120, surgeries: 45, revenue: 4500 },
    { month: 'Fev', appointments: 150, surgeries: 60, revenue: 5800 },
    { month: 'Mar', appointments: 180, surgeries: 55, revenue: 6200 },
    { month: 'Abr', appointments: 160, surgeries: 70, revenue: 7900 },
    { month: 'Mai', appointments: 220, surgeries: 95, revenue: 9100 },
    { month: 'Jun', appointments: 250, surgeries: 110, revenue: 9900 },
    { month: 'Jul', appointments: 210, surgeries: 85, revenue: 8400 }
  ];

  // Médicos em Destaque
  const doctorsList = [
    { name: 'Dr. Lillie Kennedy', specialty: 'Periodontista', exp: '9 anos', rating: 5.0, avatar: '👩‍⚕️' },
    { name: 'Dr. Kerri Myers', specialty: 'Endodontista', exp: '6 anos', rating: 4.9, avatar: '👨‍⚕️' },
    { name: 'Dr. Tobias Wong', specialty: 'Ortodontista', exp: '8 anos', rating: 4.8, avatar: '👨‍⚕️' }
  ];

  // Lista de Próximas Consultas do Widget Lateral
  const upcomingAppointments = [
    { patient: 'Kitty Miller', time: '08:00', type: 'Consulta Geral', color: 'bg-red-500' },
    { patient: 'Anne Wallace', time: '09:00', type: 'Aplicação de Botox', color: 'bg-emerald-500' },
    { patient: 'Lesley Chaney', time: '11:00', type: 'Canal Dente 16', color: 'bg-amber-500' },
    { patient: 'Darcy May', time: '14:30', type: 'Urgência Extração', color: 'bg-blue-500' }
  ];

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6 overflow-y-auto pr-1 pb-10">
      {/* 1. ÁREA ESQUERDA (Métricas e Painéis Analíticos) - ColSpan 3 */}
      <div className="flex-1 xl:flex-[3] space-y-6">
        
        {/* Banner de Boas-Vindas */}
        <div className="bg-gradient-to-r from-secondary/10 to-primary/5 dark:from-secondary/10 dark:to-primary/5 border border-secondary/20 rounded-3xl p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur">
          <div>
            <h2 className="text-md font-black text-slate-800 dark:text-white font-title flex items-center gap-1.5">
              Olá, {user?.full_name?.split(' ')[0] || 'Doutor'}! <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Aqui está o resumo analítico de performance e automação da sua clínica.</p>
          </div>
          <span className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 font-bold px-3 py-1.5 rounded-xl shadow-sm">
            Fase de Operação: <span className="text-secondary font-extrabold">CRM + IA Sofia</span>
          </span>
        </div>

        {/* Executivos Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {executiveStats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between hover:border-secondary/30 transition-all duration-300">
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
        <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Faturamento & Volume de Consultas</h3>
            <div className="flex items-center gap-1.5 text-[9px] font-bold">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 bg-secondary rounded-full" /> Consultas
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 bg-primary rounded-full" /> Cirurgias
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#196BFB" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#196BFB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/50" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#196BFB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" name="Faturamento" />
                <Bar dataKey="appointments" fill="#03269A" radius={[4, 4, 0, 0]} barSize={8} name="Consultas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dentistas Ativos da Clínica */}
        <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">Dentistas Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doctorsList.map((doc, idx) => (
              <div key={idx} className="border border-slate-200/40 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/30 dark:bg-slate-900/10 flex items-center justify-between hover:border-secondary/20 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl bg-white dark:bg-slate-850 w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700/40 shadow-sm">
                    {doc.avatar}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{doc.name}</h4>
                    <span className="text-[10px] text-slate-400 block">{doc.specialty} • {doc.exp}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-350">{doc.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas de Pacientes */}
        <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">Métricas de Atração e Retenção</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 border-r border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-450 block font-semibold mb-1">Novos Pacientes</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">2.000</span>
              <span className="text-[9px] text-emerald-500 font-extrabold block mt-0.5">▲ 20.2%</span>
            </div>
            <div className="p-3 border-r border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-450 block font-semibold mb-1">Pacientes que Retornaram</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">6.000</span>
              <span className="text-[9px] text-emerald-500 font-extrabold block mt-0.5">▲ 22.8%</span>
            </div>
            <div className="p-3 border-r border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-450 block font-semibold mb-1">Público Masculino</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">3.000</span>
              <span className="text-[9px] text-secondary font-extrabold block mt-0.5">38.9% total</span>
            </div>
            <div className="p-3">
              <span className="text-[10px] text-slate-450 block font-semibold mb-1">Público Feminino</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">4.000</span>
              <span className="text-[9px] text-secondary font-extrabold block mt-0.5">61.1% total</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. ÁREA DIREITA (Widget do Calendário e Agenda de Hoje) - ColSpan 1 */}
      <div className="w-full xl:w-80 bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.015)] flex flex-col space-y-6 flex-shrink-0">
        
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
              <div 
                key={idx} 
                className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  day === null ? 'bg-transparent text-transparent' :
                  day === currentDate ? 'bg-secondary text-white shadow-md shadow-secondary/20' :
                  'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Consultas de Hoje */}
        <div className="space-y-4 flex-1">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">Agenda de Hoje</h4>
            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-2 py-0.5 rounded-full">
              {upcomingAppointments.length} ativ.
            </span>
          </div>

          <div className="space-y-2">
            {upcomingAppointments.map((app, idx) => (
              <div key={idx} className="p-3 border border-slate-150/40 dark:border-slate-800/80 rounded-2xl bg-slate-50/20 dark:bg-slate-900/10 flex items-center justify-between hover:-translate-y-0.5 transition-all">
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
            ))}
          </div>
        </div>

        {/* Plantão do Dia / Médico de Plantão */}
        <div className="bg-secondary border border-secondary/10 text-white rounded-2xl p-4 shadow-md shadow-secondary/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl bg-white/20 w-9 h-9 rounded-xl flex items-center justify-center border border-white/10">
              👨‍⚕️
            </span>
            <div>
              <h5 className="text-xs font-bold">Dr. Tobias Wong</h5>
              <span className="text-[10px] text-white/80 block mt-0.5">Médico Responsável Hoje</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] bg-black/10 px-2.5 py-1 rounded-xl w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>Segunda, 20 - das 09h às 14h</span>
          </div>
        </div>

      </div>
    </div>
  );
}

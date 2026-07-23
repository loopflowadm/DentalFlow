import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, Line 
} from 'recharts';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Plus, Inbox } from 'lucide-react';
import Card from '../../components/ui/Card';

// Tooltip Personalizado nos Padrões Obsidian Midnight / Light Adaptive
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#111827]/95 border border-slate-200 dark:border-white/10 rounded-xl p-3 shadow-xl dark:shadow-2xl backdrop-blur-md text-left text-xs font-sans text-slate-800 dark:text-white transition-colors duration-300">
        <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 border-b border-slate-200 dark:border-white/10 pb-1 font-title">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-[11px] font-semibold my-0.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
            <span className="text-slate-900 dark:text-white font-bold font-mono">
              {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Relatorios({ onNavigateTab }) {
  const { patients, appointments, dentists, financeTransactions } = useClinic();
  
  // Estados locais de filtro
  const [dateRange, setDateRange] = useState('30d');
  const [insuranceFilter, setInsuranceFilter] = useState('');

  // 1. CÁLCULOS DINÂMICOS BASEADOS NOS DADOS REAIS
  const completedAppointments = useMemo(() => {
    return appointments.filter(app => 
      app.status === 'completed' || app.status === 'Concluído'
    );
  }, [appointments]);

  const totalRevenue = useMemo(() => {
    const appRevenue = completedAppointments.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);
    const transRevenue = financeTransactions
      .filter(t => t.type === 'receita' || t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    return Math.max(appRevenue, transRevenue);
  }, [completedAppointments, financeTransactions]);

  const ticketMedio = useMemo(() => {
    if (completedAppointments.length === 0) return 0;
    return totalRevenue / completedAppointments.length;
  }, [totalRevenue, completedAppointments]);

  // 3 KPIs Principais
  const biMetrics = [
    { 
      label: 'Faturamento Total', 
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      desc: 'Faturamento bruto acumulado da clínica', 
      icon: DollarSign, 
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20'
    },
    { 
      label: 'Ticket Médio por Consulta', 
      value: `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      desc: `${completedAppointments.length} consultas concluídas no período`, 
      icon: TrendingUp, 
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    { 
      label: 'Novos Pacientes', 
      value: `${patients.length}`, 
      desc: 'Pacientes ativos na base de dados', 
      icon: Users, 
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    }
  ];

  // Gráfico 1: Top Procedimentos por Faturamento
  const topProceduresData = useMemo(() => {
    const procMap = {};
    const colors = ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#A855F7'];

    completedAppointments.forEach((app) => {
      const name = app.procedure_name || app.procedure || 'Consulta Geral';
      const price = parseFloat(app.price) || 0;
      if (!procMap[name]) {
        procMap[name] = { name, quantidade: 0, faturamento: 0 };
      }
      procMap[name].quantidade += 1;
      procMap[name].faturamento += price;
    });

    const result = Object.values(procMap);
    return result.map((item, idx) => ({
      ...item,
      color: colors[idx % colors.length]
    })).slice(0, 5);
  }, [completedAppointments]);

  // Gráfico 2: Faturamento / Produção por Dentista
  const dentistRevenueData = useMemo(() => {
    if (dentists.length === 0) return [];

    return dentists.map((d) => {
      const docApps = completedAppointments.filter(app => 
        app.doctor_id === d.id || app.doctor_name === d.full_name
      );
      const docRev = docApps.reduce((acc, app) => acc + (parseFloat(app.price) || 0), 0);
      return {
        name: d.full_name || 'Cirurgião-Dentista',
        faturamento: docRev
      };
    });
  }, [dentists, completedAppointments]);

  return (
    <div className="space-y-6 pb-10 font-body text-left">
      
      {/* Header & Filtros do BI */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 dark:text-white font-title tracking-tight">Análise de Desempenho Clínico</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Métricas financeiras e consolidação em tempo real da sua clínica</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-100 dark:bg-[#0B1220] border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500/50 cursor-pointer font-bold transition-colors"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="12m">Últimos 12 meses</option>
          </select>

          <select
            value={insuranceFilter}
            onChange={(e) => setInsuranceFilter(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-100 dark:bg-[#0B1220] border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500/50 cursor-pointer font-bold transition-colors"
          >
            <option value="">Todos Convênios</option>
            <option value="particular">Particular</option>
            <option value="amil">Amil Dental</option>
            <option value="unimed">Unimed Odonto</option>
          </select>
        </div>
      </Card>

      {/* 3 KPIs Principais em Grid Reduzido e Minimalista */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {biMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} hoverable className="flex items-center gap-4 p-5">
              <div className={`w-12 h-12 rounded-2xl ${m.bgColor} border flex items-center justify-center shrink-0 ${m.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">{m.label}</span>
                <span className={`text-2xl font-black font-title block tracking-tight my-0.5 ${m.color}`}>{m.value}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">{m.desc}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 2 Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1: Faturamento por Procedimento */}
        <Card className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-title">Faturamento por Procedimento</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Top procedimentos concluídos no período selecionado</p>
            </div>
          </div>

          <div className="h-64 pt-2 flex items-center justify-center">
            {topProceduresData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProceduresData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    {topProceduresData.map((entry, idx) => (
                      <linearGradient key={`grad-${idx}`} id={`procGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.2} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip content={<CustomTooltip formatter={(val) => `R$ ${val.toLocaleString('pt-BR')}`} />} />
                  <Bar dataKey="faturamento" radius={[6, 6, 0, 0]} barSize={32}>
                    {topProceduresData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#procGrad-${index})`} stroke={entry.color} strokeWidth={1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum procedimento registrado ainda</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">Agende e conclua procedimentos na agenda para acompanhar o faturamento por tratamento.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('agenda')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Ir para Agenda
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* GRÁFICO 2: Faturamento / Produção por Dentista */}
        <Card className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-title">Produção por Dentista</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Produção acumulada por cirurgião-dentista da equipe</p>
            </div>
          </div>

          <div className="h-64 pt-2 flex items-center justify-center">
            {dentistRevenueData.length > 0 && dentistRevenueData.some(d => d.faturamento > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dentistRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dentistGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip content={<CustomTooltip formatter={(val) => `R$ ${val.toLocaleString('pt-BR')}`} />} />
                  <Bar dataKey="faturamento" fill="url(#dentistGrad)" stroke="#06B6D4" strokeWidth={1} radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum faturamento por dentista no período</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">Ao finalizar consultas atribuídas aos dentistas, o gráfico atualizará automaticamente.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('pacientes')}
                  className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ver Pacientes
                </button>
              </div>
            )}
          </div>
        </Card>

      </div>

    </div>
  );
}

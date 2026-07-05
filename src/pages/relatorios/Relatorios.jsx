import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { BarChart3, TrendingUp, Users, DollarSign, Target, Award, Filter, ShieldAlert } from 'lucide-react';

export default function Relatorios() {
  const { patients, appointments } = useClinic();
  
  // Estados locais
  const [dateRange, setDateRange] = useState('30d');
  const [insuranceFilter, setInsuranceFilter] = useState('');

  // Indicadores Principais (Métricas BI)
  const biMetrics = [
    { label: 'Ticket Médio', value: 'R$ 1.450', desc: 'Faturamento por paciente', icon: DollarSign, color: 'text-secondary' },
    { label: 'Custo Aquisição (CAC)', value: 'R$ 48,20', desc: 'Gasto marketing por lead convertido', icon: Target, color: 'text-red-400' },
    { label: 'Lifetime Value (LTV)', value: 'R$ 4.200', desc: 'Faturamento histórico médio', icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Retorno Investimento (ROI)', value: '380%', desc: 'Lucro de campanhas de atração', icon: Award, color: 'text-emerald-500' }
  ];

  // Procedimentos mais Vendidos Data
  const topProceduresData = [
    { name: 'Implante Dentário', quantidade: 48, faturamento: 120000, fill: '#ec4899' },
    { name: 'Tratamento de Canal', quantidade: 32, faturamento: 25600, fill: '#f59e0b' },
    { name: 'Clareamento Dental', quantidade: 64, faturamento: 57600, fill: '#06b6d4' },
    { name: 'Limpeza e Profilaxia', quantidade: 120, faturamento: 18000, fill: '#10b981' },
    { name: 'Aparelho Estético', quantidade: 15, faturamento: 22500, fill: '#196BFB' }
  ];

  // Faturamento por Dentista Data
  const dentistRevenueData = [
    { name: 'Dr. Pedro Ramos', faturamento: 84500 },
    { name: 'Dra. Ana Paula', faturamento: 62000 },
    { name: 'Dr. Carlos Souza', faturamento: 45000 }
  ];

  // Evolução LTV vs CAC Data
  const ltvCacData = [
    { name: 'Jan', CAC: 40, LTV: 3100 },
    { name: 'Fev', CAC: 45, LTV: 3300 },
    { name: 'Mar', CAC: 42, LTV: 3500 },
    { name: 'Abr', CAC: 50, LTV: 3800 },
    { name: 'Mai', CAC: 48, LTV: 4000 },
    { name: 'Jun', CAC: 48, LTV: 4200 }
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* Filtros Relatórios */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/40 dark:border-slate-800/60 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-secondary" />
          <h2 className="text-sm font-bold font-title">Business Intelligence & Relatórios</h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl py-2 px-3 text-xs text-slate-650 focus:outline-none cursor-pointer font-bold"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="12m">Últimos 12 meses</option>
          </select>

          <select
            value={insuranceFilter}
            onChange={(e) => setInsuranceFilter(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl py-2 px-3 text-xs text-slate-650 focus:outline-none cursor-pointer font-bold"
          >
            <option value="">Todos Convênios</option>
            <option value="particular">Particular</option>
            <option value="amil">Amil Dental</option>
            <option value="unimed">Unimed Odonto</option>
          </select>
        </div>
      </div>

      {/* BI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {biMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div 
              key={i} 
              className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left flex justify-between items-center"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{m.label}</span>
                <span className={`text-xl font-extrabold font-title block mt-1.5 ${m.color}`}>{m.value}</span>
                <span className="text-[9px] text-slate-400 font-semibold block mt-1">{m.desc}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-550">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          );
        })}
      </div>

      {/* BI Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Procedimentos mais Vendidos */}
        <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm text-left">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Procedimentos por Faturamento (R$)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProceduresData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Faturamento']} />
                <Bar dataKey="faturamento" radius={[4, 4, 0, 0]}>
                  {topProceduresData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Faturamento por Dentista */}
        <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm text-left">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Faturamento por Dentista (R$)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dentistRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Faturamento']} />
                <Bar dataKey="faturamento" fill="#196BFB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evolução LTV vs CAC */}
        <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm text-left lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Histórico Comparativo: LTV vs CAC (R$)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ltvCacData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line yAxisId={0} type="monotone" dataKey="LTV" stroke="#10b981" strokeWidth={3} name="LTV (Eixo Esquerdo)" />
                <Line yAxisId={0} type="monotone" dataKey="CAC" stroke="#ef4444" strokeWidth={2} name="CAC (Eixo Direito)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

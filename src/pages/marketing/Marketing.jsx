import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Megaphone, Plus, ExternalLink, Copy, Check, Eye, 
  Settings, UserCheck, TrendingUp, Sparkles, Layout, FileText, 
  Trash2, X, AlertCircle 
} from 'lucide-react';

export default function Marketing() {
  const { marketingCampaigns } = useClinic();
  const { currentTheme } = useTheme();

  // Estados locais
  const [activeSubTab, setActiveSubTab] = useState('campanhas'); // 'campanhas' | 'lps' | 'forms'
  const [showBuilder, setShowBuilder] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  // Mock de Landing Pages
  const [landingPages, setLandingPages] = useState([
    { id: 'lp-1', name: 'Implante Sorriso Rápido', status: 'PUBLISHED', views: 350, conversion: '22%', url: 'https://sorriso.loopflow.com/implantes' },
    { id: 'lp-2', name: 'Clareamento Dental Express', status: 'PUBLISHED', views: 820, conversion: '15%', url: 'https://sorriso.loopflow.com/clareamento' },
    { id: 'lp-3', name: 'Alinhadores Invisíveis Estéticos', status: 'DRAFT', views: 0, conversion: '0%', url: 'https://sorriso.loopflow.com/alinhadores' }
  ]);

  // Mock de Formulários
  const [forms, setForms] = useState([
    { id: 'f-1', name: 'Captura Leads - Instagram', fields: ['Nome', 'WhatsApp', 'Desejo'], submissions: 98 },
    { id: 'f-2', name: 'Agendamento Prévio - Site', fields: ['Nome', 'WhatsApp', 'E-mail', 'Horário'], submissions: 45 }
  ]);

  const handleCopyLink = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Tab Switcher & Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/40 dark:border-slate-800/60 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Megaphone className="w-5 h-5 text-violet-500" />
          <h2 className="text-sm font-bold font-title">Módulo de Atração & Marketing</h2>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/30 dark:border-slate-700/30">
          {[
            { id: 'campanhas', label: 'Campanhas Ativas' },
            { id: 'lps', label: 'Landing Pages' },
            { id: 'forms', label: 'Formulários' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setShowBuilder(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-ABA: CAMPANHAS */}
      {activeSubTab === 'campanhas' && (
        <div className="space-y-6">
          {/* Métricas Topo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Gasto das Campanhas', value: 'R$ 1.000,00', color: 'text-slate-800 dark:text-white' },
              { label: 'Leads Capturados', value: '134', color: 'text-violet-500' },
              { label: 'Custo por Lead (CPL)', value: 'R$ 7,46', color: 'text-emerald-500' },
              { label: 'Retorno sobre Investimento', value: 'ROI 4.5x', color: 'text-emerald-500' }
            ].map((metric, i) => (
              <div key={i} className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{metric.label}</span>
                <span className={`text-lg font-extrabold font-title block mt-1.5 ${metric.color}`}>{metric.value}</span>
              </div>
            ))}
          </div>

          {/* Listagem de Campanhas */}
          <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-500 border-b border-slate-200/40 dark:border-slate-800">
                  <th className="py-3 px-4 font-bold">Campanha</th>
                  <th className="py-3 px-4 font-bold">Visualizações</th>
                  <th className="py-3 px-4 font-bold">Leads Capturados</th>
                  <th className="py-3 px-4 font-bold">Investimento</th>
                  <th className="py-3 px-4 font-bold">Conversão</th>
                  <th className="py-3 px-4 font-bold">Origem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                {marketingCampaigns.map(camp => (
                  <tr key={camp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">{camp.name}</td>
                    <td className="py-3 px-4 font-semibold">{camp.views}</td>
                    <td className="py-3 px-4 font-bold text-violet-500">{camp.leads}</td>
                    <td className="py-3 px-4 font-bold">R$ {camp.budget}</td>
                    <td className="py-3 px-4 font-bold text-emerald-500">{camp.conversion}%</td>
                    <td className="py-3 px-4 font-medium">{camp.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA: LANDING PAGES */}
      {activeSubTab === 'lps' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {landingPages.map(lp => (
              <div 
                key={lp.id} 
                className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between h-48 text-left relative group hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-400">
                      <Layout className="w-4 h-4" />
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      lp.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200/50 text-slate-450'
                    }`}>
                      {lp.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-850 dark:text-white font-title text-sm mt-3 truncate">{lp.name}</h4>
                  
                  <div className="flex gap-4 text-[10px] text-slate-400 font-bold mt-2">
                    <span>Visitas: <b>{lp.views}</b></span>
                    <span>Conversão: <b className="text-emerald-500">{lp.conversion}</b></span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex-shrink-0">
                  <button
                    onClick={() => handleCopyLink(lp.id, lp.url)}
                    className="flex-1 py-1.5 bg-slate-555/5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-250 font-bold rounded-lg border border-slate-200/40 dark:border-slate-750 text-[10px] flex items-center justify-center gap-1.5"
                  >
                    {copiedId === lp.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === lp.id ? 'Copiado!' : 'Copiar URL'}
                  </button>
                  <button className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200/45 dark:border-slate-750">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-ABA: FORMULÁRIOS */}
      {activeSubTab === 'forms' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forms.map(form => (
              <div 
                key={form.id} 
                className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-400">
                      <FileText className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] text-slate-450 font-bold">Submissões: <b>{form.submissions}</b></span>
                  </div>

                  <h4 className="font-bold text-slate-850 dark:text-white font-title text-sm mt-3">{form.name}</h4>
                  
                  {/* Campos do Form */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {form.fields.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-750 rounded text-[9px] font-bold text-slate-500">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-4">
                  <button className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-350 font-bold rounded-lg border border-slate-200/40 dark:border-slate-750 text-[10px] flex items-center justify-center gap-1.5">
                    <Settings className="w-3.5 h-3.5" /> Editar Form
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

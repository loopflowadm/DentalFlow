import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  LayoutDashboard, 
  FileCheck, 
  Smile, 
  ClipboardList, 
  Activity, 
  FileText, 
  CreditCard 
} from 'lucide-react';

export default function PatientTabsNav({ activeTab, setActiveTab }) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  const tabs = [
    { id: 'visao_geral', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'anamnese', label: 'Anamnese', icon: FileCheck },
    { id: 'odontograma', label: 'Odontograma', icon: Smile },
    { id: 'orcamentos', label: 'Plano de Tratamento', icon: ClipboardList },
    { id: 'evolucao', label: 'Evoluções', icon: Activity },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard }
  ];

  return (
    <div className={`w-full backdrop-blur-md rounded-2xl border px-3 py-1.5 mb-4 overflow-x-auto custom-scrollbar transition-all ${
      isDarkMode 
        ? 'bg-[#111726]/90 border-white/10 shadow-lg text-white' 
        : 'bg-white border-slate-200 shadow-xs text-slate-800'
    }`}>
      <div className="flex items-center gap-1.5 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                isActive
                  ? isDarkMode
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-md'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-extrabold'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`} />
              <span className={isActive ? (isDarkMode ? 'text-blue-400 font-extrabold' : 'text-blue-700 font-black') : (isDarkMode ? 'text-slate-400' : 'text-slate-700 font-bold')}>
                {tab.label}
              </span>

              {/* Indicador inferior iluminado para aba ativa */}
              {isActive && (
                <div className={`absolute bottom-0 left-3 right-3 h-[2px] rounded-full ${
                  isDarkMode ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-blue-600'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

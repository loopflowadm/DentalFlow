import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { motion } from 'framer-motion';
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
    <div className="w-full bg-white dark:bg-[#0D0D0D] border-b border-slate-200/80 dark:border-white/5 px-6 py-2 overflow-x-auto custom-scrollbar transition-colors duration-300">
      <div className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                isActive
                  ? isDarkMode
                    ? 'bg-blue-600/25 text-blue-300 border border-blue-500/40 shadow-md font-extrabold'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-black'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`} />
              <span className={isActive ? (isDarkMode ? 'text-blue-300 font-extrabold' : 'text-blue-700 font-black') : (isDarkMode ? 'text-slate-400' : 'text-slate-700 font-bold')}>
                {tab.label}
              </span>

              {/* Indicador inferior animado com Framer Motion */}
              {isActive && (
                <motion.div 
                  layoutId="activeTabGlow"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className={`absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full ${
                    isDarkMode ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]' : 'bg-blue-600'
                  }`} 
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

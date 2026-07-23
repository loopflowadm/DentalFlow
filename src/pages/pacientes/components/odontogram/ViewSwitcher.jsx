import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';

export default function ViewSwitcher({ activeView, setActiveView, isDeciduo, setIsDeciduo }) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  const views = [
    { id: 'Padrao', label: 'Padrão' },
    { id: 'Oclusal', label: 'Oclusal' },
    { id: 'Vestibular', label: 'Vestibular' },
    { id: 'Lingual', label: 'Lingual' },
    { id: 'Raiz', label: 'Raiz' }
  ];

  return (
    <div className={`flex items-center justify-between gap-4 backdrop-blur-md rounded-2xl border px-4 py-2 mt-4 transition-all ${
      isDarkMode 
        ? 'bg-[#111726]/90 border-white/10 shadow-lg text-white' 
        : 'bg-white border-slate-200 shadow-xs text-slate-800'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold mr-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Vista:</span>
        <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeView === v.id
                  ? 'bg-blue-600 text-white shadow'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alternador Permanentes vs Decíduos (Crianças) */}
      <button
        onClick={() => setIsDeciduo(!isDeciduo)}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
          isDeciduo 
            ? 'bg-purple-600/30 border-purple-500/50 text-purple-600' 
            : isDarkMode
              ? 'bg-slate-800/60 border-white/10 text-slate-400 hover:text-white'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
        }`}
      >
        {isDeciduo ? '👶 Arcada Decídua (Infantil)' : '🦷 Arcada Permanente (Adulto)'}
      </button>
    </div>
  );
}

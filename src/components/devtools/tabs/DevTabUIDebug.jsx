import React from 'react';
import { Eye, Layers, Palette, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export default function DevTabUIDebug({ showBreakpointBadge, setShowBreakpointBadge, setMessage }) {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <div className="space-y-4 font-sans text-left">
      {/* Breakpoint Badge Toggle */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Badge de Breakpoint Tailwind</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Exibe um indicador flutuante no canto da tela (XS, SM, MD, LG, XL, 2XL).
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const next = !showBreakpointBadge;
            setShowBreakpointBadge(next);
            setMessage({ text: next ? 'Badge de breakpoint ativado na tela.' : 'Badge de breakpoint desativado.', type: 'info' });
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            showBreakpointBadge
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
          }`}
        >
          {showBreakpointBadge ? 'Ativado' : 'Desativado'}
        </button>
      </div>

      {/* Força de Modo de Tema */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-2">
        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-amber-500" />
          Alternador de Tema Visual
        </h4>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => setThemeMode('light')}
            className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              themeMode === 'light' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Claro</span>
          </button>
          <button
            onClick={() => setThemeMode('dark')}
            className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              themeMode === 'dark' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Escuro</span>
          </button>
          <button
            onClick={() => setThemeMode('clinic')}
            className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              themeMode === 'clinic' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Clínica</span>
          </button>
        </div>
      </div>
    </div>
  );
}

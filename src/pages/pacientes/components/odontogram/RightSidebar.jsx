import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { Check, Clock, FileText, Info } from 'lucide-react';

export default function RightSidebar({ 
  notes, 
  setNotes, 
  selectedTooth, 
  toothHistory = [],
  isSavingNotes,
  onOpenLegend
}) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  const selectedToothEvents = selectedTooth 
    ? toothHistory.filter(ev => String(ev.toothNumber) === String(selectedTooth))
    : [];

  return (
    <div className={`w-56 sm:w-60 shrink-0 min-w-[210px] backdrop-blur-md rounded-2xl border p-3 flex flex-col gap-3 transition-all overflow-y-auto custom-scrollbar ${
      isDarkMode 
        ? 'bg-[#0D0D0D]/90 border-white/10 shadow-xl text-white' 
        : 'bg-white border-slate-200 shadow-xs text-slate-800'
    }`}>
      {/* 1. BOTÃO DE LEGENDA DE CORES */}
      <button
        onClick={onOpenLegend}
        className={`w-full p-2 rounded-xl border flex items-center justify-between text-[11px] font-bold transition-all cursor-pointer ${
          isDarkMode 
            ? 'bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white' 
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Legenda de Cores
        </span>
        <span className="text-[9px] text-slate-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded-lg shrink-0">
          Guia
        </span>
      </button>

      {/* 2. OBSERVAÇÕES CLÍNICAS */}
      <div className="flex flex-col flex-1 min-h-[160px]">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            OBSERVAÇÕES CLÍNICAS
          </h3>
          <span className="text-[9px] text-slate-500 flex items-center gap-1">
            {isSavingNotes ? (
              <>
                <Clock className="w-2.5 h-2.5 animate-spin text-blue-500" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-2.5 h-2.5 text-emerald-500" />
                Salva
              </>
            )}
          </span>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anotações clínicas gerais, alergias, sintomas..."
          className={`w-full flex-1 border rounded-xl p-2.5 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none ${
            isDarkMode 
              ? 'bg-slate-900/80 border-white/10 text-slate-200 placeholder-slate-500' 
              : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 font-medium'
          }`}
        />
      </div>

      {/* 3. HISTÓRICO DO DENTE SELECIONADO */}
      <div className={`border-t pt-2.5 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <h3 className={`text-[9px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <FileText className="w-3 h-3 text-blue-500 shrink-0" />
          HISTÓRICO {selectedTooth ? `#${selectedTooth}` : ''}
        </h3>

        {!selectedTooth ? (
          <div className={`p-2.5 rounded-xl border text-center ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Clique em um dente na arcada.
            </p>
          </div>
        ) : selectedToothEvents.length === 0 ? (
          <div className={`p-2.5 rounded-xl border text-center ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Nenhum procedimento no dente #{selectedTooth}.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5 custom-scrollbar">
            {selectedToothEvents.map((ev, idx) => (
              <div key={idx} className={`p-2 rounded-xl border text-[10px] ${isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`flex items-center justify-between font-semibold mb-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                  <span className="capitalize truncate">{ev.conditionLabel || ev.condition}</span>
                  <span className="text-[9px] text-slate-500 shrink-0">{ev.date || 'Hoje'}</span>
                </div>
                <p className={`text-[9px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Escopo: <span className="text-blue-400 font-mono font-bold uppercase">{ev.face || 'Inteiro'}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

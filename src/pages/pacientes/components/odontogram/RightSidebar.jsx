import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { CONDITION_COLORS } from './TeethSVGRegistry';
import { Check, Clock, Calendar, FileText } from 'lucide-react';

export default function RightSidebar({ 
  notes, 
  setNotes, 
  selectedTooth, 
  toothHistory = [],
  isSavingNotes
}) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  const legendItems = Object.keys(CONDITION_COLORS).map(key => ({
    id: key,
    ...CONDITION_COLORS[key]
  }));

  // Filtrar histórico do dente selecionado
  const selectedToothEvents = selectedTooth 
    ? toothHistory.filter(ev => String(ev.toothNumber) === String(selectedTooth))
    : [];

  return (
    <div className={`w-72 backdrop-blur-md rounded-2xl border p-4 flex flex-col gap-5 transition-all overflow-y-auto custom-scrollbar ${
      isDarkMode 
        ? 'bg-[#111726]/90 border-white/10 shadow-xl text-white' 
        : 'bg-white border-slate-200 shadow-xs text-slate-800'
    }`}>
      {/* 1. LEGENDA DE PROCEDIMENTOS */}
      <div>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          LEGENDA
        </h3>
        <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {legendItems.map(item => (
            <div key={item.id} className={`flex items-center gap-2.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
              {item.id === 'ausente' ? (
                <span className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-400 shrink-0" />
              ) : item.id === 'extraido' ? (
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-400 shrink-0" />
              ) : (
                <span 
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" 
                  style={{ backgroundColor: item.fill }} 
                />
              )}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. OBSERVAÇÕES CLÍNICAS */}
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            OBSERVAÇÕES
          </h3>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            {isSavingNotes ? (
              <>
                <Clock className="w-3 h-3 animate-spin text-blue-500" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                Salva automaticamente
              </>
            )}
          </span>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas clínicas, sintomas, histórico de dor, alergias ou observações específicas..."
          className={`w-full h-28 border rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none ${
            isDarkMode 
              ? 'bg-slate-900/80 border-white/10 text-slate-200 placeholder-slate-500' 
              : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 font-medium'
          }`}
        />
      </div>

      {/* 3. HISTÓRICO DO DENTE SELECIONADO */}
      <div className={`border-t pt-4 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <FileText className="w-3.5 h-3.5 text-blue-500" />
          HISTÓRICO DO DENTE {selectedTooth ? `#${selectedTooth}` : ''}
        </h3>

        {!selectedTooth ? (
          <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Selecione um dente para visualizar o histórico de eventos.
            </p>
          </div>
        ) : selectedToothEvents.length === 0 ? (
          <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Nenhum procedimento registrado para o dente {selectedTooth}.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
            {selectedToothEvents.map((ev, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`flex items-center justify-between font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                  <span className="capitalize">{ev.conditionLabel || ev.condition}</span>
                  <span className="text-[10px] text-slate-500">{ev.date || 'Hoje'}</span>
                </div>
                <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Superfície: <span className="text-blue-500 font-mono font-bold uppercase">{ev.face || 'Dente Inteiro'}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { MousePointer, Hand, Undo, Trash2 } from 'lucide-react';
import { CONDITION_COLORS } from './TeethSVGRegistry';

export default function ToolsSidebar({ 
  mode, 
  setMode, 
  activeCondition, 
  setActiveCondition,
  onUndo,
  onClear,
  canUndo
}) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  const toolsList = Object.keys(CONDITION_COLORS).map(key => ({
    id: key,
    ...CONDITION_COLORS[key]
  }));

  return (
    <div className={`w-64 backdrop-blur-md rounded-2xl border p-4 flex flex-col justify-between transition-all ${
      isDarkMode 
        ? 'bg-[#111726]/90 border-white/10 shadow-xl text-white' 
        : 'bg-white border-slate-200 shadow-xs text-slate-800'
    }`}>
      <div>
        {/* Título do Painel */}
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          FERRAMENTAS
        </h3>

        {/* Modo de Seleção */}
        <div className="mb-4">
          <label className={`text-[11px] font-semibold mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Seleção
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('select')}
              className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all text-xs font-semibold cursor-pointer ${
                mode === 'select' 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : isDarkMode
                    ? 'bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <MousePointer className="w-4 h-4" />
              Ponteiro
            </button>
            <button
              onClick={() => setMode('hand')}
              className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all text-xs font-semibold cursor-pointer ${
                mode === 'hand' 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : isDarkMode
                    ? 'bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Hand className="w-4 h-4" />
              Mão
            </button>
          </div>
        </div>

        {/* Marcar Dente / Pincel de Condições */}
        <div className="space-y-1">
          <label className={`text-[11px] font-semibold mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Marcar Dente
          </label>

          <div className="max-h-[380px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
            {toolsList.map(item => {
              const isSelected = activeCondition === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setMode('paint');
                    setActiveCondition(item.id);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected && mode === 'paint'
                      ? isDarkMode
                        ? 'bg-white/10 text-white border border-white/20 shadow'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-2xs'
                      : isDarkMode
                        ? 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  {/* Ponto / Indicador de Cor */}
                  {item.id === 'ausente' ? (
                    <span className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-400 inline-block shrink-0" />
                  ) : item.id === 'extraido' ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-400 inline-block shrink-0" />
                  ) : (
                    <span 
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" 
                      style={{ backgroundColor: item.fill }} 
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Botões do Rodapé: Desfazer e Limpar */}
      <div className={`pt-4 mt-3 border-t grid grid-cols-2 gap-2 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            canUndo
              ? isDarkMode
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              : 'opacity-40 cursor-not-allowed border-transparent'
          }`}
        >
          <Undo className="w-3.5 h-3.5" />
          Desfazer
        </button>
        <button
          onClick={onClear}
          className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            isDarkMode
              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/20'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Limpar
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { MousePointer, Undo, Trash2, Link, GitCommit, Stethoscope, Sparkles, Layers, SlidersHorizontal } from 'lucide-react';
import { DENTAL_CONDITIONS } from './TeethSVGRegistry';

export default function ToolsSidebar({ 
  mode, 
  setMode, 
  activeCondition, 
  setActiveCondition,
  activeStatus,
  setActiveStatus,
  isDeciduo,
  setIsDeciduo,
  isBridgeModeActive,
  onToggleBridgeMode,
  orthoConfig = {},
  onChangeOrthoConfig,
  onBatchAction,
  onUndo,
  onClear,
  canUndo,
  showPrices = true
}) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Estado da aba principal de navegação de ferramentas
  const [activeMainSection, setActiveMainSection] = useState('procedimentos'); // 'procedimentos' | 'ortho' | 'lote'
  const [activeCategoryTab, setActiveCategoryTab] = useState('Restauração & Prevenção');

  const handleToggleOrthoArch = (arch) => {
    if (arch === 'upper') {
      onChangeOrthoConfig({ ...orthoConfig, upperActive: !orthoConfig.upperActive });
    } else {
      onChangeOrthoConfig({ ...orthoConfig, lowerActive: !orthoConfig.lowerActive });
    }
  };

  const categoriesList = ['Restauração & Prevenção', 'Prótese & Reabilitação', 'Cirurgia & Diagnóstico'];
  const filteredProcedures = DENTAL_CONDITIONS.filter(c => c.category === activeCategoryTab);

  const elasticColors = [
    { name: 'Azul', hex: '#2563EB' },
    { name: 'Rosa', hex: '#EC4899' },
    { name: 'Prata', hex: '#94A3B8' },
    { name: 'Cristal', hex: '#E2E8F0' },
    { name: 'Vermelho', hex: '#EF4444' },
    { name: 'Verde', hex: '#10B981' },
    { name: 'Roxo', hex: '#8B5CF6' }
  ];

  return (
    <div className={`w-60 sm:w-64 shrink-0 min-w-[220px] backdrop-blur-md rounded-2xl border p-3 flex flex-col gap-3 transition-all ${
      isDarkMode 
        ? 'bg-[#111726]/95 border-white/10 shadow-2xl text-white' 
        : 'bg-white border-slate-200 shadow-sm text-slate-800'
    }`}>
      {/* 1. MODO E STATUS DO PROCEDIMENTO */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={`text-[9px] font-extrabold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Controles Clínicos
          </span>
        </div>

        {/* Status: Realizado vs Planejado */}
        <div className={`grid grid-cols-2 gap-1 p-0.5 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveStatus('existente')}
            className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer truncate ${
              activeStatus === 'existente'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Realizado
          </button>
          <button
            onClick={() => setActiveStatus('planejado')}
            className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer truncate ${
              activeStatus === 'planejado'
                ? 'bg-amber-600 text-white shadow-sm'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Planejado
          </button>
        </div>

        {/* Dentição & Seleção */}
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setIsDeciduo(!isDeciduo)}
            className={`py-1.5 px-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              isDeciduo 
                ? 'bg-purple-600/20 border-purple-500/50 text-purple-400 font-extrabold' 
                : isDarkMode ? 'bg-slate-900 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <Layers className="w-3 h-3 shrink-0 text-purple-400" />
            {isDeciduo ? 'Decídua' : 'Permanente'}
          </button>

          <button
            onClick={() => setMode(mode === 'select' ? 'paint' : 'select')}
            className={`py-1.5 px-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              mode === 'select'
                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                : isDarkMode ? 'bg-slate-900 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <MousePointer className="w-3 h-3 shrink-0" /> {mode === 'select' ? 'Seleção' : 'Pincel'}
          </button>
        </div>
      </div>

      {/* 2. NAVEGAÇÃO DE ABAS DE FERRAMENTAS (SEM ACCORDIONS SOBREPOSTOS) */}
      <div className={`p-0.5 rounded-xl border grid grid-cols-3 gap-0.5 text-[9px] font-extrabold ${
        isDarkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          onClick={() => setActiveMainSection('procedimentos')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeMainSection === 'procedimentos'
              ? 'bg-blue-600 text-white shadow-sm'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-3 h-3 shrink-0" />
          <span>Proced.</span>
        </button>

        <button
          onClick={() => setActiveMainSection('ortho')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeMainSection === 'ortho'
              ? 'bg-purple-600 text-white shadow-sm'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitCommit className="w-3 h-3 shrink-0" />
          <span>Ortho</span>
        </button>

        <button
          onClick={() => setActiveMainSection('lote')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeMainSection === 'lote'
              ? 'bg-amber-600 text-white shadow-sm'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3 h-3 shrink-0" />
          <span>Lote</span>
        </button>
      </div>

      {/* CONTEÚDO DAS FERRAMENTAS POR ABA */}
      <div className="flex-1 min-h-[220px] flex flex-col">

        {/* SECTION: PROCEDIMENTOS */}
        {activeMainSection === 'procedimentos' && (
          <div className="space-y-2 flex-1 flex flex-col">
            {/* Sub-abas de Categoria */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryTab(cat)}
                  className={`px-2 py-1 rounded-md text-[9px] font-extrabold shrink-0 transition-all cursor-pointer ${
                    activeCategoryTab === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDarkMode ? 'bg-slate-900 text-slate-400 border border-white/5' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Lista de Procedimentos */}
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-0.5 custom-scrollbar flex-1">
              {filteredProcedures.map(item => {
                const isSelected = activeCondition === item.id && mode === 'paint';
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMode('paint');
                      setActiveCondition(item.id);
                    }}
                    className={`w-full p-2 rounded-xl text-left text-[11px] font-bold flex items-center justify-between border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md ring-1 ring-blue-400'
                        : isDarkMode
                          ? 'bg-slate-950/60 border-white/10 text-slate-200 hover:bg-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-3 h-3 rounded-full border border-black/10 dark:border-white/20 shrink-0 shadow-xs" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.price > 0 && showPrices && (
                      <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded shrink-0 ml-1 border ${
                        isSelected
                          ? 'bg-white/20 border-white/30 text-white'
                          : isDarkMode
                            ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                            : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      }`}>
                        R${item.price}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION: PRÓTESE & ORTHO */}
        {activeMainSection === 'ortho' && (
          <div className="space-y-3 flex-1 text-[10px]">
            <div className={`p-2.5 rounded-xl border space-y-2 ${isDarkMode ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[9px] font-extrabold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Reabilitação Fixa
              </span>

              <button
                onClick={onToggleBridgeMode}
                className={`w-full p-2 rounded-xl border font-bold flex items-center justify-between transition-all cursor-pointer ${
                  isBridgeModeActive
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-500 shadow-sm'
                    : isDarkMode ? 'bg-slate-900 border-white/10 text-amber-400' : 'bg-white border-slate-200 text-amber-600'
                }`}
              >
                <span className="flex items-center gap-1.5"><Link className="w-3.5 h-3.5" /> Modo Ponte Fixa</span>
                <span className="text-[9px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-white font-bold">{isBridgeModeActive ? 'LIGADO' : 'DESL.'}</span>
              </button>
            </div>

            <div className={`p-2.5 rounded-xl border space-y-2.5 ${isDarkMode ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[9px] font-extrabold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Aparelho Ortodôntico
              </span>

              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                <button
                  onClick={() => handleToggleOrthoArch('upper')}
                  className={`py-1.5 rounded-lg font-extrabold border transition-all ${
                    orthoConfig.upperActive 
                      ? 'bg-purple-600 text-white border-purple-500 shadow-xs' 
                      : isDarkMode ? 'bg-slate-900 text-slate-400 border-white/10' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Arco Sup. {orthoConfig.upperActive ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => handleToggleOrthoArch('lower')}
                  className={`py-1.5 rounded-lg font-extrabold border transition-all ${
                    orthoConfig.lowerActive 
                      ? 'bg-purple-600 text-white border-purple-500 shadow-xs' 
                      : isDarkMode ? 'bg-slate-900 text-slate-400 border-white/10' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Arco Inf. {orthoConfig.lowerActive ? 'On' : 'Off'}
                </button>
              </div>

              <div>
                <label className={`text-[9px] font-bold block mb-1 uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tipo de Braquete</label>
                <select
                  value={orthoConfig.bracketType || 'metal'}
                  onChange={(e) => onChangeOrthoConfig({ ...orthoConfig, bracketType: e.target.value })}
                  className={`w-full text-xs rounded-xl p-2 font-bold border focus:outline-none ${isDarkMode ? 'bg-slate-900 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  <option value="metal">Metálico Convencional</option>
                  <option value="safira">Estético / Safira</option>
                  <option value="autoligavel">Autoligável Passivo</option>
                  <option value="attachment">Attachment Alinhador</option>
                </select>
              </div>

              <div>
                <label className={`text-[9px] font-bold block mb-1 uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cor da Ligadura / Elástico</label>
                <div className="flex items-center justify-between gap-1 pt-1">
                  {elasticColors.map(c => (
                    <button
                      key={c.hex}
                      title={c.name}
                      onClick={() => onChangeOrthoConfig({ ...orthoConfig, elasticColor: c.hex })}
                      className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 cursor-pointer ${
                        orthoConfig.elasticColor === c.hex ? 'ring-2 ring-blue-500 scale-110 shadow-sm' : 'border-slate-300 dark:border-white/20'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: AÇÕES EM LOTE */}
        {activeMainSection === 'lote' && (
          <div className="space-y-2 flex-1 text-[10px]">
            <span className={`text-[9px] font-extrabold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Lançamentos Globais em 1 Clique
            </span>

            <div className="grid grid-cols-1 gap-1.5">
              <button 
                onClick={() => onBatchAction('profilaxia', 'upper')} 
                className={`p-2.5 rounded-xl font-bold border text-left flex items-center justify-between transition-all ${
                  isDarkMode ? 'bg-slate-950 text-slate-200 border-white/10 hover:bg-slate-900' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Profilaxia Completa (Arcada Sup.)</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </button>

              <button 
                onClick={() => onBatchAction('profilaxia', 'lower')} 
                className={`p-2.5 rounded-xl font-bold border text-left flex items-center justify-between transition-all ${
                  isDarkMode ? 'bg-slate-950 text-slate-200 border-white/10 hover:bg-slate-900' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Profilaxia Completa (Arcada Inf.)</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </button>

              <button 
                onClick={() => onBatchAction('clareamento', 'upper')} 
                className={`p-2.5 rounded-xl font-bold border text-left flex items-center justify-between transition-all ${
                  isDarkMode ? 'bg-slate-950 text-slate-200 border-white/10 hover:bg-slate-900' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Clareamento Laser (Arcada Sup.)</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </button>

              <button 
                onClick={() => onBatchAction('clareamento', 'lower')} 
                className={`p-2.5 rounded-xl font-bold border text-left flex items-center justify-between transition-all ${
                  isDarkMode ? 'bg-slate-950 text-slate-200 border-white/10 hover:bg-slate-900' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Clareamento Laser (Arcada Inf.)</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3. RODAPÉ FIXO DESFAZER E LIMPAR */}
      <div className={`pt-2 grid grid-cols-2 gap-2 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 text-[10px] font-extrabold transition-all ${
            canUndo 
              ? isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10 cursor-pointer shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 cursor-pointer shadow-xs'
              : 'opacity-40 cursor-not-allowed border-transparent'
          }`}
        >
          <Undo className="w-3.5 h-3.5" /> Desfazer
        </button>
        <button
          onClick={onClear}
          className="py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 text-[10px] font-extrabold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border-rose-500/20 transition-all cursor-pointer shadow-xs"
        >
          <Trash2 className="w-3.5 h-3.5" /> Limpar
        </button>
      </div>
    </div>
  );
}

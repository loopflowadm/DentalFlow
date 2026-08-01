import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { AnatomicalToothSVG } from './TeethSVGRegistry';
import { Link } from 'lucide-react';

export default function DentalArch({ 
  teethData = {}, 
  selectedTooth, 
  onSelectTooth, 
  onSurfaceClick,
  onRootClick,
  activeTool,
  activeView,
  isDeciduo,
  isBridgeModeActive,
  bridgeFirstTooth,
  fixedBridges = [],
  orthoConfig = {}
}) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Numeração FDI Permanente:
  const upperPermanent = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerPermanent = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  // Numeração FDI Decídua:
  const upperDeciduous = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
  const lowerDeciduous = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

  const upperTeeth = isDeciduo ? upperDeciduous : upperPermanent;
  const lowerTeeth = isDeciduo ? lowerDeciduous : lowerPermanent;

  const upperQ1 = upperTeeth.slice(0, upperTeeth.length / 2);
  const upperQ2 = upperTeeth.slice(upperTeeth.length / 2);

  const lowerQ4 = lowerTeeth.slice(0, lowerTeeth.length / 2);
  const lowerQ3 = lowerTeeth.slice(lowerTeeth.length / 2);

  const hasUpperOrtho = !!orthoConfig.upperActive;
  const hasLowerOrtho = !!orthoConfig.lowerActive;

  const getBridgeInfo = (toothNum) => {
    return fixedBridges.find(b => Number(b.fromTooth) === Number(toothNum) || Number(b.toTooth) === Number(toothNum));
  };

  const [quadrantFilter, setQuadrantFilter] = React.useState('all'); // 'all' | 'upper' | 'lower'
  const [zoomScale, setZoomScale] = React.useState(1); // 1 | 1.25

  return (
    <div className={`flex-1 min-w-0 rounded-2xl border p-3.5 flex flex-col justify-between overflow-x-auto custom-scrollbar transition-all relative ${
      isDarkMode 
        ? 'bg-[#0b0f19]/95 border-white/10 shadow-2xl text-white' 
        : 'bg-white border-slate-200 shadow-xs text-slate-800'
    }`}>
      {/* BARRA DE FERRAMENTAS TOUCH / QUADRANTES PARA MOBILE */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-white/5 gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-black p-0.5 rounded-xl border border-slate-200/60 dark:border-white/10">
          <button
            onClick={() => setQuadrantFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all ${
              quadrantFilter === 'all'
                ? 'bg-white dark:bg-[#196BFB] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Todas Arcadas
          </button>
          <button
            onClick={() => setQuadrantFilter('upper')}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all ${
              quadrantFilter === 'upper'
                ? 'bg-white dark:bg-[#196BFB] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Sup (Q1/Q2)
          </button>
          <button
            onClick={() => setQuadrantFilter('lower')}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all ${
              quadrantFilter === 'lower'
                ? 'bg-white dark:bg-[#196BFB] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Inf (Q3/Q4)
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomScale(prev => prev === 1 ? 1.25 : 1)}
            className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[9px] font-extrabold uppercase active:scale-95 transition-all"
            title="Alternar Zoom para facilidade de toque"
          >
            {zoomScale === 1 ? 'Zoom 1.25x' : 'Zoom 1x'}
          </button>
        </div>
      </div>

      {/* ARCADA SUPERIOR */}
      {(quadrantFilter === 'all' || quadrantFilter === 'upper') && (
      <div className="flex flex-col items-center relative space-y-1 mb-4" style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}>
        <div className="flex items-center justify-between w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          <span>Arcada Superior</span>
          <span className="text-[9px] text-slate-500">Vestibular / Oclusal / Palatina</span>
        </div>

        <div className={`relative flex items-center justify-center gap-0.5 sm:gap-1 py-3 px-2 rounded-2xl border min-h-[180px] w-full overflow-x-auto ${
          isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50/80 border-slate-200'
        }`}>
          {/* Linha de Divisão Central */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-blue-500/20 border-r border-dashed border-blue-500/40 pointer-events-none z-10" />

          {/* Camada SVG do Fio Ortodôntico Superior */}
          {hasUpperOrtho && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
              <path 
                d="M 15 75 Q 300 62 580 75" 
                fill="none" 
                stroke="#94A3B8" 
                strokeWidth="2" 
                strokeLinecap="round" 
                className="filter drop-shadow-[0_0_3px_rgba(148,163,184,0.8)]"
              />
            </svg>
          )}

          {/* Quadrantes 1 e 2 */}
          <div className="flex items-center gap-0.5 sm:gap-1 z-30">
            {upperQ1.map(num => {
              const bridge = getBridgeInfo(num);
              return (
                <div key={num} className="relative flex flex-col items-center">
                  {bridge && (
                    <span className="absolute -top-3.5 z-40 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[7px] font-mono px-0.5 rounded flex items-center gap-0.5 truncate">
                      <Link className="w-2 h-2" /> #{bridge.fromTooth}-{bridge.toTooth}
                    </span>
                  )}
                  <AnatomicalToothSVG
                    toothNumber={num}
                    surfaces={teethData[num] || {}}
                    activeTool={activeTool}
                    viewMode={activeView}
                    isSelected={selectedTooth === String(num) || bridgeFirstTooth === num}
                    hasOrtho={hasUpperOrtho}
                    orthoBracketType={orthoConfig.bracketType}
                    orthoElasticColor={orthoConfig.elasticColor}
                    onToothClick={(e, tNum) => onSelectTooth(tNum)}
                    onSurfaceClick={(tNum, face) => {
                      onSelectTooth(tNum);
                      onSurfaceClick(tNum, face);
                    }}
                    onRootClick={onRootClick}
                  />
                </div>
              );
            })}
          </div>

          <div className="w-[1px] h-24 bg-blue-500/20 border-r border-dashed border-blue-500/40 mx-0.5 z-30" />

          <div className="flex items-center gap-0.5 sm:gap-1 z-30">
            {upperQ2.map(num => {
              const bridge = getBridgeInfo(num);
              return (
                <div key={num} className="relative flex flex-col items-center">
                  {bridge && (
                    <span className="absolute -top-3.5 z-40 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[7px] font-mono px-0.5 rounded flex items-center gap-0.5 truncate">
                      <Link className="w-2 h-2" /> #{bridge.fromTooth}-{bridge.toTooth}
                    </span>
                  )}
                  <AnatomicalToothSVG
                    toothNumber={num}
                    surfaces={teethData[num] || {}}
                    activeTool={activeTool}
                    viewMode={activeView}
                    isSelected={selectedTooth === String(num) || bridgeFirstTooth === num}
                    hasOrtho={hasUpperOrtho}
                    orthoBracketType={orthoConfig.bracketType}
                    orthoElasticColor={orthoConfig.elasticColor}
                    onToothClick={(e, tNum) => onSelectTooth(tNum)}
                    onSurfaceClick={(tNum, face) => {
                      onSelectTooth(tNum);
                      onSurfaceClick(tNum, face);
                    }}
                    onRootClick={onRootClick}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Divisor da Linha Média Central */}
      {quadrantFilter === 'all' && (
        <div className={`w-full my-2 border-b relative ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`px-3 text-[9px] uppercase font-bold tracking-widest font-mono ${
              isDarkMode ? 'bg-[#0b0f19] text-slate-500' : 'bg-white text-slate-400'
            }`}>
              Linha Oclusal Central • Dir | Linha Média | Esq
            </span>
          </div>
        </div>
      )}

      {/* ARCADA INFERIOR */}
      {(quadrantFilter === 'all' || quadrantFilter === 'lower') && (
      <div className="flex flex-col items-center relative space-y-1" style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}>
        <div className="flex items-center justify-between w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          <span>Arcada Inferior</span>
          <span className="text-[9px] text-slate-500">Lingual / Oclusal / Vestibular</span>
        </div>

        <div className={`relative flex items-center justify-center gap-0.5 sm:gap-1 py-3 px-2 rounded-2xl border min-h-[180px] w-full overflow-x-auto ${
          isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className="absolute inset-y-0 left-1/2 w-px bg-blue-500/20 border-r border-dashed border-blue-500/40 pointer-events-none z-10" />

          {/* Camada SVG do Fio Ortodôntico Inferior */}
          {hasLowerOrtho && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
              <path 
                d="M 15 22 Q 300 35 580 22" 
                fill="none" 
                stroke="#94A3B8" 
                strokeWidth="2" 
                strokeLinecap="round" 
                className="filter drop-shadow-[0_0_3px_rgba(148,163,184,0.8)]"
              />
            </svg>
          )}

          {/* Quadrantes 4 e 3 */}
          <div className="flex items-center gap-0.5 sm:gap-1 z-30">
            {lowerQ4.map(num => {
              const bridge = getBridgeInfo(num);
              return (
                <div key={num} className="relative flex flex-col items-center">
                  {bridge && (
                    <span className="absolute -top-3.5 z-40 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[7px] font-mono px-0.5 rounded flex items-center gap-0.5 truncate">
                      <Link className="w-2 h-2" /> #{bridge.fromTooth}-{bridge.toTooth}
                    </span>
                  )}
                  <AnatomicalToothSVG
                    toothNumber={num}
                    surfaces={teethData[num] || {}}
                    activeTool={activeTool}
                    viewMode={activeView}
                    isSelected={selectedTooth === String(num) || bridgeFirstTooth === num}
                    hasOrtho={hasLowerOrtho}
                    orthoBracketType={orthoConfig.bracketType}
                    orthoElasticColor={orthoConfig.elasticColor}
                    onToothClick={(e, tNum) => onSelectTooth(tNum)}
                    onSurfaceClick={(tNum, face) => {
                      onSelectTooth(tNum);
                      onSurfaceClick(tNum, face);
                    }}
                    onRootClick={onRootClick}
                  />
                </div>
              );
            })}
          </div>

          <div className="w-[1px] h-24 bg-blue-500/20 border-r border-dashed border-blue-500/40 mx-0.5 z-30" />

          <div className="flex items-center gap-0.5 sm:gap-1 z-30">
            {lowerQ3.map(num => {
              const bridge = getBridgeInfo(num);
              return (
                <div key={num} className="relative flex flex-col items-center">
                  {bridge && (
                    <span className="absolute -top-3.5 z-40 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[7px] font-mono px-0.5 rounded flex items-center gap-0.5 truncate">
                      <Link className="w-2 h-2" /> #{bridge.fromTooth}-{bridge.toTooth}
                    </span>
                  )}
                  <AnatomicalToothSVG
                    toothNumber={num}
                    surfaces={teethData[num] || {}}
                    activeTool={activeTool}
                    viewMode={activeView}
                    isSelected={selectedTooth === String(num) || bridgeFirstTooth === num}
                    hasOrtho={hasLowerOrtho}
                    orthoBracketType={orthoConfig.bracketType}
                    orthoElasticColor={orthoConfig.elasticColor}
                    onToothClick={(e, tNum) => onSelectTooth(tNum)}
                    onSurfaceClick={(tNum, face) => {
                      onSelectTooth(tNum);
                      onSurfaceClick(tNum, face);
                    }}
                    onRootClick={onRootClick}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

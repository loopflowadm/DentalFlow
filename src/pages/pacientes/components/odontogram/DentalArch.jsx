import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { AnatomicalToothSVG } from './TeethSVGRegistry';

export default function DentalArch({ 
  teethData = {}, 
  selectedTooth, 
  onSelectTooth, 
  onSurfaceClick,
  activeTool,
  activeView,
  isDeciduo
}) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Numeração FDI Permanente:
  // Superior: Quadrante 1 (18 ao 11) e Quadrante 2 (21 ao 28)
  // Inferior: Quadrante 4 (48 ao 41) e Quadrante 3 (31 ao 38)
  const upperPermanentQ1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperPermanentQ2 = [21, 22, 23, 24, 25, 26, 27, 28];

  const lowerPermanentQ4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerPermanentQ3 = [31, 32, 33, 34, 35, 36, 37, 38];

  // Numeração FDI Decídua:
  // Superior: Quadrante 5 (55 ao 51) e Quadrante 6 (61 ao 65)
  // Inferior: Quadrante 8 (85 ao 81) e Quadrante 7 (71 ao 75)
  const upperDeciduousQ5 = [55, 54, 53, 52, 51];
  const upperDeciduousQ6 = [61, 62, 63, 64, 65];

  const lowerDeciduousQ8 = [85, 84, 83, 82, 81];
  const lowerDeciduousQ7 = [71, 72, 73, 74, 75];

  const upperQ1 = isDeciduo ? upperDeciduousQ5 : upperPermanentQ1;
  const upperQ2 = isDeciduo ? upperDeciduousQ6 : upperPermanentQ2;
  const lowerQ4 = isDeciduo ? lowerDeciduousQ8 : lowerPermanentQ4;
  const lowerQ3 = isDeciduo ? lowerDeciduousQ7 : lowerPermanentQ3;

  return (
    <div className={`flex-1 rounded-2xl border p-6 flex flex-col justify-between overflow-x-auto custom-scrollbar transition-all ${
      isDarkMode 
        ? 'bg-[#0b0f19]/95 border-white/10 shadow-2xl text-white' 
        : 'bg-white border-slate-200 shadow-xs text-slate-800'
    }`}>
      {/* ARCADA SUPERIOR */}
      <div className="flex flex-col items-center">
        <h4 className={`text-xs font-extrabold uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          ARCADA SUPERIOR
        </h4>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quadrante 1 (Direita do Paciente / Esquerda na Tela) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {upperQ1.map(num => (
              <AnatomicalToothSVG
                key={num}
                toothNumber={num}
                surfaces={teethData[num] || {}}
                activeTool={activeTool}
                viewMode={activeView}
                isSelected={selectedTooth === String(num)}
                onSurfaceClick={(tNum, face) => {
                  onSelectTooth(tNum);
                  onSurfaceClick(tNum, face);
                }}
              />
            ))}
          </div>

          {/* Divisor da Linha Média Superior */}
          <div className="w-[1px] h-28 bg-blue-500/20 border-r border-dashed border-blue-500/40 mx-2" />

          {/* Quadrante 2 (Esquerda do Paciente / Direita na Tela) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {upperQ2.map(num => (
              <AnatomicalToothSVG
                key={num}
                toothNumber={num}
                surfaces={teethData[num] || {}}
                activeTool={activeTool}
                viewMode={activeView}
                isSelected={selectedTooth === String(num)}
                onSurfaceClick={(tNum, face) => {
                  onSelectTooth(tNum);
                  onSurfaceClick(tNum, face);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Divisor Central entre Arcada Superior e Inferior */}
      <div className={`w-full my-6 border-b relative ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`px-3 text-[10px] uppercase font-bold tracking-wider ${
            isDarkMode ? 'bg-[#0b0f19] text-slate-500' : 'bg-white text-slate-500'
          }`}>
            Linha Oclusal Central
          </span>
        </div>
      </div>

      {/* ARCADA INFERIOR */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quadrante 4 (Direita do Paciente / Esquerda na Tela) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {lowerQ4.map(num => (
              <AnatomicalToothSVG
                key={num}
                toothNumber={num}
                surfaces={teethData[num] || {}}
                activeTool={activeTool}
                viewMode={activeView}
                isSelected={selectedTooth === String(num)}
                onSurfaceClick={(tNum, face) => {
                  onSelectTooth(tNum);
                  onSurfaceClick(tNum, face);
                }}
              />
            ))}
          </div>

          {/* Divisor da Linha Média Inferior */}
          <div className="w-[1px] h-28 bg-blue-500/20 border-r border-dashed border-blue-500/40 mx-2" />

          {/* Quadrante 3 (Esquerda do Paciente / Direita na Tela) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {lowerQ3.map(num => (
              <AnatomicalToothSVG
                key={num}
                toothNumber={num}
                surfaces={teethData[num] || {}}
                activeTool={activeTool}
                viewMode={activeView}
                isSelected={selectedTooth === String(num)}
                onSurfaceClick={(tNum, face) => {
                  onSelectTooth(tNum);
                  onSurfaceClick(tNum, face);
                }}
              />
            ))}
          </div>
        </div>

        <h4 className={`text-xs font-extrabold uppercase tracking-widest mt-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          ARCADA INFERIOR
        </h4>
      </div>
    </div>
  );
}

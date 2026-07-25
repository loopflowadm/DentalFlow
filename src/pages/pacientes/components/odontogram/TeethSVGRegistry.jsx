import React from 'react';

/**
 * TeethSVGRegistry
 * Biblioteca de Componentes SVG para o Odontograma Clínico FDI Mapeado.
 * Anatomia realista baseada no padrão FDI (viewBox 0 0 58 120).
 * - Arcada Superior: Raiz no topo, Coroa/Oclusal embaixo.
 * - Arcada Inferior: Coroa/Oclusal no topo, Raiz embaixo.
 */

// Catálogo completo de Condições Odontológicas com Preços Médios TUSS e Categorias
export const DENTAL_CONDITIONS = [
  { id: 'carie', name: 'Cárie Dental', color: '#EF4444', stroke: '#DC2626', price: 150, type: 'surface', category: 'Restauração & Prevenção' },
  { id: 'resina', name: 'Restauração Resina', color: '#3B82F6', stroke: '#2563EB', price: 220, type: 'surface', category: 'Restauração & Prevenção' },
  { id: 'amalgama', name: 'Restauração Amálgama', color: '#64748B', stroke: '#475569', price: 180, type: 'surface', category: 'Restauração & Prevenção' },
  { id: 'selante', name: 'Selante Oclusal', color: '#06B6D4', stroke: '#0891B2', price: 100, type: 'surface', category: 'Restauração & Prevenção' },
  { id: 'coroa', name: 'Coroa Total / Prótese', color: '#EAB308', stroke: '#CA8A04', price: 1400, type: 'whole', category: 'Prótese & Reabilitação' },
  { id: 'faceta', name: 'Faceta / Lente Cerâmica', color: '#A855F7', stroke: '#9333EA', price: 1800, type: 'whole', category: 'Prótese & Reabilitação' },
  { id: 'implante', name: 'Implante Osseointegrado', color: '#0EA5E9', stroke: '#0284C7', price: 2800, type: 'whole', category: 'Prótese & Reabilitação' },
  { id: 'endo', name: 'Endodontia (Trat. Canal)', color: '#22C55E', stroke: '#16A34A', price: 750, type: 'root', category: 'Prótese & Reabilitação' },
  { id: 'extraido', name: 'Dente Extraído', color: '#F43F5E', stroke: '#E11D48', price: 0, type: 'whole', category: 'Cirurgia & Diagnóstico' },
  { id: 'ausente', name: 'Dente Ausente / Agenesia', color: '#475569', stroke: '#334155', price: 0, type: 'whole', category: 'Cirurgia & Diagnóstico' },
  { id: 'fratura', name: 'Fratura Coronária', color: '#F97316', stroke: '#EA580C', price: 200, type: 'whole', category: 'Cirurgia & Diagnóstico' },
  { id: 'cervical', name: 'Lesão Cervical / Abfracção', color: '#D97706', stroke: '#B45309', price: 160, type: 'surface', category: 'Restauração & Prevenção' },
  { id: 'saudavel', name: 'Higienizado / Saudável', color: '#10B981', stroke: '#059669', price: 0, type: 'whole', category: 'Cirurgia & Diagnóstico' }
];

export const CONDITION_COLORS = {
  carie: { fill: '#EF4444', label: 'Cárie Dental', stroke: '#DC2626' },
  resina: { fill: '#3B82F6', label: 'Restauração Resina', stroke: '#2563EB' },
  restauracao_resina: { fill: '#3B82F6', label: 'Restauração Resina', stroke: '#2563EB' },
  amalgama: { fill: '#64748B', label: 'Restauração Amálgama', stroke: '#475569' },
  restauracao_amalgama: { fill: '#64748B', label: 'Restauração Amálgama', stroke: '#475569' },
  selante: { fill: '#06B6D4', label: 'Selante Oclusal', stroke: '#0891B2' },
  coroa: { fill: '#EAB308', label: 'Coroa Total', stroke: '#CA8A04' },
  faceta: { fill: '#A855F7', label: 'Faceta Cerâmica', stroke: '#9333EA' },
  implante: { fill: '#0EA5E9', label: 'Implante Titânio', stroke: '#0284C7' },
  endo: { fill: '#22C55E', label: 'Endodontia', stroke: '#16A34A' },
  endodontia: { fill: '#22C55E', label: 'Endodontia', stroke: '#16A34A' },
  extraido: { fill: '#F43F5E', label: 'Dente Extraído', stroke: '#E11D48' },
  ausente: { fill: 'transparent', label: 'Dente Ausente', stroke: '#475569' },
  fratura: { fill: '#F97316', label: 'Fratura Coronária', stroke: '#EA580C' },
  cervical: { fill: '#D97706', label: 'Lesão Cervical', stroke: '#B45309' },
  lesao_cervical: { fill: '#D97706', label: 'Lesão Cervical', stroke: '#B45309' },
  saudavel: { fill: '#10B981', label: 'Saudável', stroke: '#059669' }
};

export const ToothGradients = () => (
  <svg style={{ height: 0, width: 0, position: 'absolute' }} aria-hidden="true">
    <defs>
      <linearGradient id="implantScrewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>

      <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>

      <linearGradient id="facetaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#7e22ce" />
      </linearGradient>
    </defs>
  </svg>
);

export const BracketSVG = ({ isUpper, bracketType = 'metal', elasticColor = '#2563EB' }) => {
  if (bracketType === 'attachment') {
    return (
      <g transform="translate(22, 54)">
        <polygon points="7,0 14,7 7,14 0,7" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
      </g>
    );
  }

  if (bracketType === 'safira') {
    return (
      <g transform="translate(18, 50)">
        <rect x="0" y="0" width="20" height="20" rx="4" fill="rgba(241, 245, 249, 0.45)" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="10" y1="0" x2="10" y2="20" stroke="#94A3B8" strokeWidth="1" />
        <line x1="0" y1="10" x2="20" y2="10" stroke="#94A3B8" strokeWidth="1" />
      </g>
    );
  }

  if (bracketType === 'autoligavel') {
    return (
      <g transform="translate(18, 50)">
        <rect x="0" y="0" width="20" height="20" rx="4" fill="#64748B" stroke="#94A3B8" strokeWidth="1.5" />
        <rect x="4" y="4" width="12" height="12" rx="2" fill="#E2E8F0" />
      </g>
    );
  }

  // Metálico Convencional
  return (
    <g transform="translate(18, 50)">
      <rect x="0" y="0" width="22" height="22" rx="4" fill={elasticColor} opacity="0.9" />
      <rect x="3" y="3" width="16" height="16" rx="2" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
      <line x1="0" y1="11" x2="22" y2="11" stroke="#1E293B" strokeWidth="2.5" />
    </g>
  );
};

export const AnatomicalToothSVG = ({ 
  toothNumber, 
  surfaces = {}, 
  activeTool, 
  onSurfaceClick,
  onToothClick,
  onRootClick,
  isSelected,
  viewMode = 'Padrao',
  hasOrtho = false,
  orthoBracketType = 'metal',
  orthoElasticColor = '#2563EB'
}) => {
  const num = parseInt(toothNumber, 10);
  const isUpper = (num >= 11 && num <= 28) || (num >= 51 && num <= 65);
  const digit = num % 10;
  const isDeciduous = num >= 51 && num <= 85;
  const isMolar = isDeciduous ? (digit === 4 || digit === 5) : (digit >= 6);

  const toothData = typeof surfaces === 'object' && surfaces !== null ? surfaces : {};
  const surfaceState = toothData.surfaces || toothData;

  const isImplante = toothData.whole === 'implante' || toothData.root === 'implante' || surfaceState.full === 'implante';
  const isExtraido = toothData.whole === 'extraido' || surfaceState.full === 'extraido';
  const isAusente = toothData.whole === 'ausente' || surfaceState.full === 'ausente';
  const isCoroa = toothData.whole === 'coroa' || surfaceState.full === 'coroa';
  const isFaceta = toothData.whole === 'faceta' || surfaceState.full === 'faceta';
  const isEndo = toothData.root === 'endo' || toothData.root === 'endodontia' || surfaceState.root === 'endodontia';
  const isPlanned = toothData.status === 'planejado';

  const showRoot = viewMode === 'Padrao' || viewMode === 'Raiz' || viewMode === 'padrao' || viewMode === 'raiz';
  const showOcclusal = viewMode === 'Padrao' || viewMode === 'Oclusal' || viewMode === 'padrao' || viewMode === 'oclusal';

  // Cor de fundo padrão do esmalte dental (Branco / Marfim em Light Mode, Slate 800 em Dark Mode)
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const defaultEnamelColor = isDarkMode ? '#1F2937' : '#FFFFFF';
  const defaultStrokeColor = isDarkMode ? '#64748B' : '#94A3B8';

  const getSurfaceFill = (surfKey) => {
    if (isExtraido || isAusente) return 'transparent';
    if (isCoroa) return '#EAB308';
    if (isFaceta) return '#A855F7';

    const keyMap = { V: 'vestibular', L: 'lingual', M: 'mesial', D: 'distal', O: 'occlusal', root: 'root' };
    const mappedKey = keyMap[surfKey] || surfKey;
    const condId = surfaceState[surfKey] || surfaceState[mappedKey];

    if (condId) {
      const cond = DENTAL_CONDITIONS.find(c => c.id === condId) || CONDITION_COLORS[condId];
      if (cond) return cond.color || cond.fill;
    }
    return defaultEnamelColor;
  };

  const getSurfaceOpacity = (surfKey) => {
    if (isCoroa || isFaceta) return 0.35;
    const keyMap = { V: 'vestibular', L: 'lingual', M: 'mesial', D: 'distal', O: 'occlusal', root: 'root' };
    const mappedKey = keyMap[surfKey] || surfKey;
    const condId = surfaceState[surfKey] || surfaceState[mappedKey];
    return condId ? 1 : (isDarkMode ? 0.4 : 1);
  };

  const getSurfaceStroke = (surfKey) => {
    const keyMap = { V: 'vestibular', L: 'lingual', M: 'mesial', D: 'distal', O: 'occlusal', root: 'root' };
    const mappedKey = keyMap[surfKey] || surfKey;
    const condId = surfaceState[surfKey] || surfaceState[mappedKey];

    if (condId) {
      const cond = DENTAL_CONDITIONS.find(c => c.id === condId) || CONDITION_COLORS[condId];
      if (cond) return cond.stroke || defaultStrokeColor;
    }
    return '#475569';
  };

  const handleFaceClick = (e, face) => {
    e.stopPropagation();
    if (onSurfaceClick) {
      onSurfaceClick(num, face);
    }
  };

  const handleToothContainerClick = (e) => {
    if (onToothClick) {
      onToothClick(e, num);
    }
  };

  const handleRootAreaClick = (e) => {
    e.stopPropagation();
    if (onRootClick) {
      onRootClick(e, num);
    } else if (onSurfaceClick) {
      onSurfaceClick(num, 'root');
    }
  };

  // Caminhos de Raízes Curvas Anatômicas
  let rootPath = '';
  if (isUpper) {
    rootPath = isMolar
      ? "M 8 58 C 8 36, 12 16, 18 4 C 21 18, 24 36, 28 44 C 30 26, 34 10, 40 4 C 46 20, 50 38, 52 58 Z"
      : "M 14 58 C 16 26, 22 6, 28 2 C 34 6, 40 26, 42 58 Z";
  } else {
    rootPath = isMolar
      ? "M 8 4 C 8 30, 12 52, 18 66 C 24 50, 27 30, 29 18 C 31 30, 35 50, 40 66 C 47 52, 52 30, 52 4 Z"
      : "M 14 4 C 16 28, 22 50, 28 68 C 34 50, 40 28, 42 4 Z";
  }

  let rootStrokeAttrs = isEndo 
    ? 'stroke="#22C55E" stroke-width="2" fill="rgba(34, 197, 94, 0.3)"'
    : `stroke="${defaultStrokeColor}" stroke-width="1.3" fill="${defaultEnamelColor}"`;

  return (
    <div 
      id={`tooth-card-${num}`}
      className={`relative flex flex-col items-center select-none cursor-pointer transition-all duration-200 shrink-0 ${
        isSelected ? 'scale-105 filter drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]' : 'hover:scale-102'
      } ${isAusente ? 'opacity-25' : ''}`}
      onClick={handleToothContainerClick}
    >
      {/* Rótulo do Dente Superior */}
      {isUpper && (
        <span className={`text-[10px] font-mono font-bold mb-1.5 px-1.5 py-0.5 rounded transition-colors z-40 ${
          isSelected ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
        } ${isPlanned ? 'border border-dashed border-amber-500/60 text-amber-500' : ''}`}>
          {toothNumber}
        </span>
      )}

      {/* SVG do Dente Anatômico FDI Proporcional (46x110, viewBox 0 0 58 120) */}
      <div className="relative w-10 sm:w-11 h-[114px] flex items-center justify-center">
        <svg 
          width="46" 
          height="110" 
          viewBox="0 0 58 120" 
          className="overflow-visible drop-shadow-xs"
        >
          {isUpper ? (
            /* DENTE SUPERIOR (RAIZ NO TOPO, COROA/OCLUSAL EMBAIXO) */
            <g>
              {showRoot && (
                isImplante ? (
                  <g className="implant-group" onClick={handleRootAreaClick}>
                    <path d="M 20 6 L 36 6 L 32 56 L 24 56 Z" fill="#06B6D4" fillOpacity="0.3" stroke="#06B6D4" strokeWidth="1.8"/>
                    <line x1="21" y1="16" x2="35" y2="16" stroke="#06B6D4" strokeWidth="1.5"/>
                    <line x1="22" y1="26" x2="34" y2="26" stroke="#06B6D4" strokeWidth="1.5"/>
                    <line x1="23" y1="36" x2="33" y2="36" stroke="#06B6D4" strokeWidth="1.5"/>
                  </g>
                ) : (
                  <path 
                    d={rootPath} 
                    fill={getSurfaceFill('root')}
                    stroke={getSurfaceStroke('root')}
                    strokeWidth="1.3"
                    onClick={handleRootAreaClick}
                    className="root-path cursor-pointer transition-colors hover:brightness-110" 
                  />
                )
              )}

              <g transform="translate(0, 60)">
                {isCoroa && <rect x="6" y="2" width="44" height="38" rx="6" fill="#EAB308" fillOpacity="0.35" stroke="#EAB308" strokeWidth="1.8"/>}
                {isFaceta && <path d="M 8 4 Q 28 -2 48 4 L 44 38 Q 28 42 12 38 Z" fill="#A855F7" fillOpacity="0.35" stroke="#A855F7" strokeWidth="1.8"/>}

                {showOcclusal && (
                  <g transform="translate(6, 2)">
                    {/* Face Oclusal / Incisal (Centro) */}
                    <polygon 
                      points="12,12 32,12 32,32 12,32" 
                      fill={getSurfaceFill('O')} 
                      fillOpacity={getSurfaceOpacity('O')}
                      stroke={getSurfaceStroke('O')} 
                      strokeWidth="1" 
                      onClick={(e) => handleFaceClick(e, 'O')}
                      className="surface-poly cursor-pointer hover:brightness-110" 
                    />

                    {/* Face Vestibular (Topo) */}
                    <polygon 
                      points="2,2 42,2 32,12 12,12" 
                      fill={getSurfaceFill('V')} 
                      fillOpacity={getSurfaceOpacity('V')}
                      stroke={getSurfaceStroke('V')} 
                      strokeWidth="1" 
                      onClick={(e) => handleFaceClick(e, 'V')}
                      className="surface-poly cursor-pointer hover:brightness-110" 
                    />

                    {/* Face Palatina/Lingual (Base) */}
                    <polygon 
                      points="12,32 32,32 42,42 2,42" 
                      fill={getSurfaceFill('L')} 
                      fillOpacity={getSurfaceOpacity('L')}
                      stroke={getSurfaceStroke('L')} 
                      strokeWidth="1" 
                      onClick={(e) => handleFaceClick(e, 'L')}
                      className="surface-poly cursor-pointer hover:brightness-110" 
                    />

                    {/* Face Mesial (Esquerda) */}
                    <polygon 
                      points="2,2 12,12 12,32 2,42" 
                      fill={getSurfaceFill('M')} 
                      fillOpacity={getSurfaceOpacity('M')}
                      stroke={getSurfaceStroke('M')} 
                      strokeWidth="1" 
                      onClick={(e) => handleFaceClick(e, 'M')}
                      className="surface-poly cursor-pointer hover:brightness-110" 
                    />

                    {/* Face Distal (Direita) */}
                    <polygon 
                      points="32,12 42,2 42,42 32,32" 
                      fill={getSurfaceFill('D')} 
                      fillOpacity={getSurfaceOpacity('D')}
                      stroke={getSurfaceStroke('D')} 
                      strokeWidth="1" 
                      onClick={(e) => handleFaceClick(e, 'D')}
                      className="surface-poly cursor-pointer hover:brightness-110" 
                    />
                  </g>
                )}
              </g>
            </g>
          ) : (
            /* DENTE INFERIOR (COROA/OCLUSAL NO TOPO, RAIZ EMBAIXO) */
            <g>
              <g transform="translate(0, 4)">
                {isCoroa && <rect x="6" y="2" width="44" height="38" rx="6" fill="#EAB308" fillOpacity="0.35" stroke="#EAB308" strokeWidth="1.8"/>}
                {isFaceta && <path d="M 8 4 Q 28 -2 48 4 L 44 38 Q 28 42 12 38 Z" fill="#A855F7" fillOpacity="0.35" stroke="#A855F7" strokeWidth="1.8"/>}

                {showOcclusal && (
                  <g transform="translate(6, 2)">
                    {/* Face Oclusal / Incisal (Centro) */}
                    <polygon 
                      points="12,12 32,12 32,32 12,32" 
                      fill={getSurfaceFill('O')} 
                      fillOpacity={getSurfaceOpacity('O')}
                      stroke={getSurfaceStroke('O')} 
                      strokeWidth="1" 
                      onClick={(e) => handleFaceClick(e, 'O')}
                      className="surface-poly cursor-pointer hover:brightness-110" 
                    />

                    {/* Face Vestibular (Topo) */}
                    <polygon 
                      points="2,2 42,2 32,12 12,12" 
                      fill={getSurfaceFill('V')} 
                      fillOpacity={getSurfaceOpacity('V')}
                      stroke={getSurfaceStroke('V')} 
                      strokeWidth="1" 
                      onClick={(e) => handleFaceClick(e, 'V')}
                      className="surface-poly cursor-pointer hover:brightness-110" 
                    />

                    {/* Face Lingual (Base) */}
                    <polygon 
                      points="12,32 32,32 42,42 2,42" 
                      fill={getSurfaceFill('L')} 
                      fillOpacity={getSurfaceOpacity('L')}
                      stroke={getSurfaceStroke('L')} 
                      strokeWidth="1" 
                      onClick={(e) => handleFaceClick(e, 'L')}
                      className="surface-poly cursor-pointer hover:brightness-110" 
                    />

                    {/* Face Mesial (Esquerda) */}
                    <polygon 
                      points="2,2 12,12 12,32 2,42" 
                      fill={getSurfaceFill('M')} 
                      fillOpacity={getSurfaceOpacity('M')}
                      stroke={getSurfaceStroke('M')} 
                      strokeWidth="1" 
                      onClick={(e) => handleFaceClick(e, 'M')}
                      className="surface-poly cursor-pointer hover:brightness-110" 
                    />

                    {/* Face Distal (Direita) */}
                    <polygon 
                      points="32,12 42,2 42,42 32,32" 
                      fill={getSurfaceFill('D')} 
                      fillOpacity={getSurfaceOpacity('D')}
                      stroke={getSurfaceStroke('D')} 
                      strokeWidth="1" 
                      onClick={(e) => handleFaceClick(e, 'D')}
                      className="surface-poly cursor-pointer hover:brightness-110" 
                    />
                  </g>
                )}
              </g>

              {showRoot && (
                <g transform="translate(0, 46)">
                  {isImplante ? (
                    <g className="implant-group" onClick={handleRootAreaClick}>
                      <path d="M 20 6 L 36 6 L 32 56 L 24 56 Z" fill="#06B6D4" fillOpacity="0.3" stroke="#06B6D4" strokeWidth="1.8"/>
                      <line x1="21" y1="16" x2="35" y2="16" stroke="#06B6D4" strokeWidth="1.5"/>
                      <line x1="22" y1="26" x2="34" y2="26" stroke="#06B6D4" strokeWidth="1.5"/>
                      <line x1="23" y1="36" x2="33" y2="36" stroke="#06B6D4" strokeWidth="1.5"/>
                    </g>
                  ) : (
                    <path 
                      d={rootPath} 
                      fill={getSurfaceFill('root')}
                      stroke={getSurfaceStroke('root')}
                      strokeWidth="1.3"
                      onClick={handleRootAreaClick}
                      className="root-path cursor-pointer transition-colors hover:brightness-110" 
                    />
                  )}
                </g>
              )}
            </g>
          )}

          {hasOrtho && !isExtraido && !isAusente && (
            <BracketSVG isUpper={isUpper} bracketType={orthoBracketType} elasticColor={orthoElasticColor} />
          )}

          {isExtraido && (
            <g className="extracted-mark">
              <line x1="6" y1="8" x2="50" y2="112" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
              <line x1="50" y1="8" x2="6" y2="112" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
            </g>
          )}

          {isAusente && (
            <circle cx="29" cy="60" r="22" fill="none" stroke="#64748B" strokeWidth="2" strokeDasharray="4 4" />
          )}
        </svg>
      </div>

      {/* Rótulo do Dente Inferior */}
      {!isUpper && (
        <span className={`text-[10px] font-mono font-bold mt-1.5 px-1.5 py-0.5 rounded transition-colors z-40 ${
          isSelected ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
        } ${isPlanned ? 'border border-dashed border-amber-500/60 text-amber-500' : ''}`}>
          {toothNumber}
        </span>
      )}
    </div>
  );
};

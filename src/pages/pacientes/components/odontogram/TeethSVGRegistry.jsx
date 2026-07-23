import React from 'react';

/**
 * TeethSVGRegistry
 * Biblioteca de Componentes SVG para o Odontograma FDI (Dentes 11-48 e Decíduos 51-85).
 * Cada dente renderiza uma anatomia realista e detalhada dividida em sub-elementos SVG:
 * - root (raiz)
 * - occlusal / incisal (centro de oclusão)
 * - vestibular (topo/externo)
 * - lingual (base/interno)
 * - mesial (esquerda/linha média)
 * - distal (direita/lateral)
 */

// Estilos de degradês para profundidade realista (macOS Depth UI)
export const ToothGradients = () => (
  <svg style={{ height: 0, width: 0, position: 'absolute' }} aria-hidden="true">
    <defs>
      {/* Degradê padrão para o corpo do dente */}
      <linearGradient id="toothBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2a354c" />
        <stop offset="100%" stopColor="#192233" />
      </linearGradient>

      {/* Degradê do implante de titânio (cyan metallic glow) */}
      <linearGradient id="implantScrewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>

      {/* Degradê da Coroa de Ouro / Cerâmica */}
      <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>

      {/* Degradê da Faceta de Cerâmica */}
      <linearGradient id="facetaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#7e22ce" />
      </linearGradient>

      {/* Efeito Glow para dente selecionado */}
      <filter id="toothGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  </svg>
);

// Mapeamento de Cores para os Procedimentos
export const CONDITION_COLORS = {
  carie: { fill: '#ef4444', label: 'Cárie', stroke: '#dc2626' },
  restauracao_resina: { fill: '#3b82f6', label: 'Restauração Resina', stroke: '#2563eb' },
  restauracao_amalgama: { fill: '#64748b', label: 'Restauração Amálgama', stroke: '#475569' },
  coroa: { fill: '#eab308', label: 'Coroa', stroke: '#ca8a04' },
  faceta: { fill: '#a855f7', label: 'Faceta', stroke: '#9333ea' },
  implante: { fill: '#06b6d4', label: 'Implante', stroke: '#0891b2' },
  endodontia: { fill: '#22c55e', label: 'Endodontia', stroke: '#16a34a' },
  selante: { fill: '#14b8a6', label: 'Selante', stroke: '#0d9488' },
  extraido: { fill: '#ffffff', label: 'Extraído', stroke: '#cbd5e1' },
  ausente: { fill: 'transparent', label: 'Ausente', stroke: '#64748b' },
  fratura: { fill: '#f97316', label: 'Fratura', stroke: '#ea580c' },
  lesao_cervical: { fill: '#b45309', label: 'Lesão Cervical', stroke: '#92400e' },
  outros: { fill: '#0d9488', label: 'Outros / Obs.', stroke: '#0f766e' },
  saudavel: { fill: '#10b981', label: 'Saudável', stroke: '#059669' }
};

/**
 * AnatomicalToothSVG
 * Renderiza a anatomia vetorial completa de um dente (Molar, Pré-Molar, Canino ou Incisivo)
 * com 5 superfícies interativas e raiz.
 */
export const AnatomicalToothSVG = ({ 
  toothNumber, 
  surfaces = {}, 
  activeTool, 
  onSurfaceClick,
  isSelected,
  viewMode = 'Padrao'
}) => {
  const num = parseInt(toothNumber, 10);
  const isUpper = (num >= 11 && num <= 28) || (num >= 51 && num <= 65);
  const isMolar = [18, 17, 16, 26, 27, 28, 48, 47, 46, 36, 37, 38, 55, 54, 64, 65, 85, 84, 74, 75].includes(num);
  const isPremolar = [15, 14, 24, 25, 45, 44, 34, 35].includes(num);

  const isImplante = surfaces.full === 'implante';
  const isExtraido = surfaces.full === 'extraido';
  const isAusente = surfaces.full === 'ausente';
  const isCoroa = surfaces.full === 'coroa';
  const isFaceta = surfaces.full === 'faceta';

  // Obter cor da superfície
  const getSurfaceFill = (surfaceName) => {
    if (isExtraido || isAusente) return 'transparent';
    if (isCoroa) return 'url(#crownGrad)';
    if (isFaceta) return 'url(#facetaGrad)';
    const cond = surfaces[surfaceName];
    if (cond && CONDITION_COLORS[cond]) {
      return CONDITION_COLORS[cond].fill;
    }
    return '#1e293b'; // Tom escuro neutro da face
  };

  const getSurfaceStroke = (surfaceName) => {
    if (surfaces[surfaceName]) {
      return CONDITION_COLORS[surfaces[surfaceName]]?.stroke || '#475569';
    }
    return '#475569';
  };

  const handleFaceClick = (e, face) => {
    e.stopPropagation();
    if (onSurfaceClick) {
      onSurfaceClick(toothNumber, face);
    }
  };

  return (
    <div 
      className={`relative flex flex-col items-center select-none cursor-pointer transition-all duration-200 ${
        isSelected ? 'scale-105 filter drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]' : 'hover:scale-102'
      } ${isAusente ? 'opacity-30' : ''}`}
      onClick={(e) => handleFaceClick(e, 'full')}
    >
      {/* Número do dente acima (se for arcada superior) */}
      {isUpper && (
        <span className={`text-[11px] font-extrabold mb-1 px-1.5 py-0.5 rounded transition-colors ${
          isSelected ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
        }`}>
          {toothNumber}
        </span>
      )}

      {/* Container SVG do Dente */}
      <div className="relative w-11 h-24 flex items-center justify-center">
        <svg 
          viewBox="0 0 100 200" 
          className="w-full h-full overflow-visible drop-shadow-md"
        >
          {/* Se for IMPLANTE, renderizar o parafuso de titânio 3D */}
          {isImplante ? (
            <g className="animate-fade-in" onClick={(e) => handleFaceClick(e, 'full')}>
              {/* Parafuso de Titânio */}
              <rect x="35" y="30" width="30" height="130" rx="6" fill="url(#implantScrewGrad)" stroke="#38bdf8" strokeWidth="3" />
              <line x1="30" y1="50" x2="70" y2="50" stroke="#0284c7" strokeWidth="3" />
              <line x1="30" y1="70" x2="70" y2="70" stroke="#0284c7" strokeWidth="3" />
              <line x1="30" y1="90" x2="70" y2="90" stroke="#0284c7" strokeWidth="3" />
              <line x1="30" y1="110" x2="70" y2="110" stroke="#0284c7" strokeWidth="3" />
              <line x1="30" y1="130" x2="70" y2="130" stroke="#0284c7" strokeWidth="3" />
              {/* Conector Hexagonal do Implante */}
              <polygon points="50,10 65,22 65,30 35,30 35,22" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
            </g>
          ) : (
            <g className={isUpper ? '' : 'rotate-180 transform origin-center'}>
              {/* 1. RAÍZES (ANATOMIA VETORIAL) */}
              <g id="root-group" onClick={(e) => handleFaceClick(e, 'root')}>
                {isMolar ? (
                  // Três/Duas Raízes para Molares
                  <path 
                    d="M 25 110 C 20 60, 10 30, 20 10 C 32 10, 38 40, 48 95 C 58 40, 68 10, 80 10 C 90 30, 80 60, 75 110 Z" 
                    fill={getSurfaceFill('root')} 
                    stroke={getSurfaceStroke('root')} 
                    strokeWidth="2.5"
                    className="transition-colors hover:brightness-125 cursor-pointer"
                  />
                ) : isPremolar ? (
                  // Duas Raízes para Pré-Molares
                  <path 
                    d="M 30 110 C 25 65, 20 20, 35 10 C 45 25, 55 25, 65 10 C 80 20, 75 65, 70 110 Z" 
                    fill={getSurfaceFill('root')} 
                    stroke={getSurfaceStroke('root')} 
                    strokeWidth="2.5"
                    className="transition-colors hover:brightness-125 cursor-pointer"
                  />
                ) : (
                  // Uma Raiz Anatômica para Canino/Incisivo
                  <path 
                    d="M 32 110 C 30 60, 35 10, 50 5 C 65 10, 70 60, 68 110 Z" 
                    fill={getSurfaceFill('root')} 
                    stroke={getSurfaceStroke('root')} 
                    strokeWidth="2.5"
                    className="transition-colors hover:brightness-125 cursor-pointer"
                  />
                )}
                {/* Linha de Endodontia / Tratamento de Canal */}
                {surfaces.root === 'endodontia' && (
                  <path d="M 50 15 L 50 105" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" />
                )}
              </g>

              {/* 2. COROA E FACES INTERATIVAS (Oclusal, Vestibular, Lingual, Mesial, Distal) */}
              <g id="crown-faces-group" transform="translate(0, 110)">
                {/* Contorno Geral da Coroa */}
                <rect 
                  x="12" y="5" width="76" height="75" rx="14" 
                  fill="#151c2c" 
                  stroke={isCoroa ? 'url(#crownGrad)' : isFaceta ? 'url(#facetaGrad)' : '#475569'} 
                  strokeWidth={isCoroa || isFaceta ? "4" : "2"}
                />

                {/* Face VESTIBULAR (Topo) */}
                <path 
                  d="M 16 9 L 84 9 L 72 26 L 28 26 Z" 
                  fill={getSurfaceFill('vestibular')} 
                  stroke={viewMode === 'Vestibular' ? '#38bdf8' : getSurfaceStroke('vestibular')} 
                  strokeWidth={viewMode === 'Vestibular' ? "3" : "1.5"}
                  onClick={(e) => handleFaceClick(e, 'vestibular')}
                  className={`transition-all hover:opacity-80 cursor-pointer ${viewMode === 'Vestibular' ? 'filter drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]' : ''}`}
                />

                {/* Face LINGUAL / PALATINA (Base) */}
                <path 
                  d="M 28 58 L 72 58 L 84 75 L 16 75 Z" 
                  fill={getSurfaceFill('lingual')} 
                  stroke={viewMode === 'Lingual' ? '#38bdf8' : getSurfaceStroke('lingual')} 
                  strokeWidth={viewMode === 'Lingual' ? "3" : "1.5"}
                  onClick={(e) => handleFaceClick(e, 'lingual')}
                  className={`transition-all hover:opacity-80 cursor-pointer ${viewMode === 'Lingual' ? 'filter drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]' : ''}`}
                />

                {/* Face MESIAL (Esquerda) */}
                <path 
                  d="M 16 9 L 28 26 L 28 58 L 16 75 Z" 
                  fill={getSurfaceFill('mesial')} 
                  stroke={getSurfaceStroke('mesial')} 
                  strokeWidth="1.5"
                  onClick={(e) => handleFaceClick(e, 'mesial')}
                  className="transition-all hover:opacity-80 cursor-pointer"
                />

                {/* Face DISTAL (Direita) */}
                <path 
                  d="M 84 9 L 84 75 L 72 58 L 72 26 Z" 
                  fill={getSurfaceFill('distal')} 
                  stroke={getSurfaceStroke('distal')} 
                  strokeWidth="1.5"
                  onClick={(e) => handleFaceClick(e, 'distal')}
                  className="transition-all hover:opacity-80 cursor-pointer"
                />

                {/* Face OCLUSAL / INCISAL (Centro) */}
                <polygon 
                  points="28,26 72,26 72,58 28,58" 
                  fill={getSurfaceFill('occlusal')} 
                  stroke={viewMode === 'Oclusal' ? '#38bdf8' : getSurfaceStroke('occlusal')} 
                  strokeWidth={viewMode === 'Oclusal' ? "3" : "1.5"}
                  onClick={(e) => handleFaceClick(e, 'occlusal')}
                  className={`transition-all hover:opacity-80 cursor-pointer ${viewMode === 'Oclusal' ? 'filter drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]' : ''}`}
                />

              </g>

              {/* OVERLAY DE EXTRAÇÃO (X Vermelho/Branco) */}
              {isExtraido && (
                <g>
                  <line x1="15" y1="15" x2="85" y2="175" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
                  <line x1="85" y1="15" x2="15" y2="175" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
                </g>
              )}

              {/* OVERLAY DE AUSENTE (Pontilhado Circular) */}
              {isAusente && (
                <circle cx="50" cy="100" r="45" fill="none" stroke="#64748b" strokeWidth="3" strokeDasharray="6 6" />
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Número do dente abaixo (se for arcada inferior) */}
      {!isUpper && (
        <span className={`text-[11px] font-extrabold mt-1 px-1.5 py-0.5 rounded transition-colors ${
          isSelected ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
        }`}>
          {toothNumber}
        </span>
      )}
    </div>
  );
};

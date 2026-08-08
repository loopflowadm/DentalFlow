import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { DENTAL_CONDITIONS } from './TeethSVGRegistry';
import { FileSpreadsheet, DollarSign, CheckCircle2, Clock, Trash2, Eye, EyeOff, PlusCircle } from 'lucide-react';

export default function TreatmentPlanView({ 
  teethData = {}, 
  fixedBridges = [],
  onRemoveToothCondition,
  onToggleConditionStatus,
  showPrices = true,
  onTogglePriceVisibility
}) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Extrair todos os procedimentos do teethData
  const treatmentItems = [];

  Object.keys(teethData).forEach(toothNum => {
    const data = teethData[toothNum];
    if (!data) return;

    const status = data.status || 'existente';

    // Procedimentos de dente inteiro (coroa, faceta, implante, extraido, ausente, fratura)
    if (data.whole) {
      const cond = DENTAL_CONDITIONS.find(c => c.id === data.whole);
      if (cond && cond.id !== 'saudavel') {
        treatmentItems.push({
          id: `${toothNum}-whole-${data.whole}`,
          toothNumber: toothNum,
          conditionId: data.whole,
          name: cond.name,
          category: cond.category,
          faces: 'Dente Inteiro',
          status: status,
          price: cond.price,
          color: cond.color
        });
      }
    }

    // Procedimentos de raiz (endo)
    if (data.root) {
      const cond = DENTAL_CONDITIONS.find(c => c.id === data.root || c.id === 'endo');
      if (cond) {
        treatmentItems.push({
          id: `${toothNum}-root-${data.root}`,
          toothNumber: toothNum,
          conditionId: data.root,
          name: cond.name,
          category: cond.category,
          faces: 'Raiz / Canal',
          status: status,
          price: cond.price,
          color: cond.color
        });
      }
    }

    // Procedimentos por superfícies
    const surfaces = data.surfaces || {};
    const groupedSurfaces = {};
    Object.keys(surfaces).forEach(face => {
      const condId = surfaces[face];
      if (condId && condId !== 'saudavel') {
        if (!groupedSurfaces[condId]) groupedSurfaces[condId] = [];
        groupedSurfaces[condId].push(face);
      }
    });

    Object.keys(groupedSurfaces).forEach(condId => {
      const cond = DENTAL_CONDITIONS.find(c => c.id === condId);
      if (cond) {
        const facesList = groupedSurfaces[condId].join(', ');
        treatmentItems.push({
          id: `${toothNum}-surface-${condId}`,
          toothNumber: toothNum,
          conditionId: condId,
          name: cond.name,
          category: cond.category,
          faces: `Faces: ${facesList}`,
          status: status,
          price: cond.price,
          color: cond.color
        });
      }
    });
  });

  // Adicionar Pontes Fixas ao orçamento
  fixedBridges.forEach((bridge, idx) => {
    treatmentItems.push({
      id: `bridge-${idx}`,
      toothNumber: `${bridge.fromTooth} ↔ ${bridge.toTooth}`,
      conditionId: 'ponte',
      name: 'Ponte Fixa Prótese',
      category: 'Prótese & Reabilitação',
      faces: 'Elemento Protético Intermediário',
      status: bridge.status || 'planejado',
      price: 1600,
      color: '#F59E0B'
    });
  });

  // Totais financeiros
  const totalPlanejado = treatmentItems
    .filter(i => i.status === 'planejado')
    .reduce((acc, curr) => acc + curr.price, 0);

  const totalRealizado = treatmentItems
    .filter(i => i.status === 'existente' || i.status === 'realizado')
    .reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="space-y-4">
      {/* Header do Orçamento & Totais */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#0D0D0D]/90 border-white/10 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-600 dark:text-amber-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-base font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Plano de Tratamento e Orçamento Clínico</h2>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Resumo de procedimentos mapeados no Odontograma por dente e escopo</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <button
            onClick={onTogglePriceVisibility}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isDarkMode ? 'bg-slate-800 border-white/10 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200/90 text-slate-800'
            }`}
          >
            {showPrices ? <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            {showPrices ? 'Valores: Visíveis' : 'Valores: Ocultos'}
          </button>

          <div className="text-right">
            <span className={`text-[10px] uppercase font-bold tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Planejado</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {showPrices ? `R$ ${totalPlanejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ***'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabela do Plano de Tratamento */}
      <div className={`rounded-2xl border overflow-hidden transition-all ${
        isDarkMode ? 'bg-[#0D0D0D] border-white/10 shadow-2xl' : 'bg-white border-slate-200/90 shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`text-[10px] font-extrabold uppercase tracking-wider border-b ${
              isDarkMode ? 'bg-slate-950 text-slate-400 border-white/10' : 'bg-slate-100/90 text-slate-700 border-slate-200'
            }`}>
              <tr>
                <th className="p-3.5">Dente / Região</th>
                <th className="p-3.5">Procedimento / Condição</th>
                <th className="p-3.5">Faces / Escopo</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Valor Estimado</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-sans text-xs ${isDarkMode ? 'divide-white/5 text-slate-300' : 'divide-slate-200/80 text-slate-700'}`}>
              {treatmentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">
                    Nenhum procedimento registrado no odontograma para este paciente.
                  </td>
                </tr>
              ) : (
                treatmentItems.map(item => (
                  <tr key={item.id} className={isDarkMode ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50/80'}>
                    <td className="p-3.5 font-mono font-black text-blue-600 dark:text-blue-400">
                      #{item.toothNumber}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-3 h-3 rounded-full shrink-0 shadow-xs border border-black/10 dark:border-white/20" style={{ backgroundColor: item.color }} />
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                          isDarkMode 
                            ? 'bg-blue-950/60 text-blue-300 border-blue-800/60' 
                            : 'bg-blue-50 text-blue-700 border-blue-200/90'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                    </td>

                    <td className={`p-3.5 font-mono text-[11px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.faces}
                    </td>

                    <td className="p-3.5">
                      {item.status === 'planejado' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Planejado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Realizado
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {showPrices ? `R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ***'}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onToggleConditionStatus && onToggleConditionStatus(item.toothNumber, item.conditionId)}
                          title="Alternar Status Realizado/Planejado"
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isDarkMode
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveToothCondition && onRemoveToothCondition(item.toothNumber, item.conditionId)}
                          title="Remover procedimento"
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isDarkMode
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

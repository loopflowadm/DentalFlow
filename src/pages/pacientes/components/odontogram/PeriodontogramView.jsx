import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { Activity, AlertCircle, Droplets, ShieldCheck } from 'lucide-react';

export default function PeriodontogramView({ 
  perioData = {}, 
  onChangePerioData, 
  isDeciduo = false 
}) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Numeração FDI
  const teethList = isDeciduo
    ? [55,54,53,52,51, 61,62,63,64,65, 85,84,83,82,81, 71,72,73,74,75]
    : [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28, 48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38];

  const handleCellChange = (num, field, val) => {
    const currentTooth = perioData[num] || { vm: 2, vc: 2, vd: 2, lm: 2, lc: 2, ld: 2, bop: false, mobility: '0', furca: '0' };
    const updated = {
      ...perioData,
      [num]: {
        ...currentTooth,
        [field]: val
      }
    };
    onChangePerioData(updated);
  };

  // Cálculo de estatísticas
  let totalDeepSites = 0;
  let totalBopSites = 0;
  const totalTeeth = teethList.length;

  teethList.forEach(num => {
    const t = perioData[num];
    if (t) {
      ['vm', 'vc', 'vd', 'lm', 'lc', 'ld'].forEach(k => {
        const depth = parseInt(t[k], 10) || 0;
        if (depth > 3) totalDeepSites++;
      });
      if (t.bop) totalBopSites++;
    }
  });

  const bopPercentage = Math.round((totalBopSites / totalTeeth) * 100) || 0;

  return (
    <div className="space-y-4">
      {/* Cards de Métricas do Periodontograma */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDarkMode ? 'bg-[#111726]/90 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
        }`}>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Dentes Examinados</span>
            <span className="text-xl font-black font-mono text-blue-400">{totalTeeth} Dentes</span>
          </div>
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDarkMode ? 'bg-[#111726]/90 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
        }`}>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bolsas &gt; 3mm (Alerta)</span>
            <span className={`text-xl font-black font-mono ${totalDeepSites > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {totalDeepSites} Sítios
            </span>
          </div>
          <div className={`p-2.5 rounded-xl border ${totalDeepSites > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDarkMode ? 'bg-[#111726]/90 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
        }`}>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sangramento (BOP)</span>
            <span className={`text-xl font-black font-mono ${bopPercentage > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {bopPercentage}%
            </span>
          </div>
          <div className={`p-2.5 rounded-xl border ${bopPercentage > 20 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
            <Droplets className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabela do Periodontograma em 6 Pontos */}
      <div className={`rounded-2xl border overflow-hidden transition-all ${
        isDarkMode ? 'bg-[#0b0f19] border-white/10 shadow-2xl' : 'bg-white border-slate-200/90 shadow-xs'
      }`}>
        <div className={`p-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-white/10 bg-slate-950/40' : 'border-slate-200/80 bg-slate-50/50'
        }`}>
          <div>
            <h2 className={`text-sm font-extrabold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Activity className="w-4 h-4 text-emerald-500" /> Sondagem Periodontal Clínica em 6 Pontos (FDI)
            </h2>
            <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              VM (Vestibulo-Mesial), VC (Vestibulo-Central), VD (Vestibulo-Distal), LM (Linguo-Mesial)...
            </p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className={`sticky top-0 z-20 text-[10px] font-extrabold uppercase tracking-wider border-b ${
              isDarkMode ? 'bg-slate-950 text-slate-400 border-white/10' : 'bg-slate-100/90 text-slate-700 border-slate-200'
            }`}>
              <tr>
                <th className="p-3 text-center">Dente</th>
                <th className="p-2 text-center text-blue-600 dark:text-blue-400 font-extrabold">VM (mm)</th>
                <th className="p-2 text-center text-blue-600 dark:text-blue-400 font-extrabold">VC (mm)</th>
                <th className="p-2 text-center text-blue-600 dark:text-blue-400 font-extrabold">VD (mm)</th>
                <th className="p-2 text-center text-purple-600 dark:text-purple-400 font-extrabold">LM (mm)</th>
                <th className="p-2 text-center text-purple-600 dark:text-purple-400 font-extrabold">LC (mm)</th>
                <th className="p-2 text-center text-purple-600 dark:text-purple-400 font-extrabold">LD (mm)</th>
                <th className="p-2 text-center text-rose-600 dark:text-rose-400 font-extrabold">Sangramento (BOP)</th>
                <th className="p-2 text-center">Mobilidade</th>
                <th className="p-2 text-center">Furca</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-mono text-xs ${isDarkMode ? 'divide-white/5 text-slate-300' : 'divide-slate-200/80 text-slate-700'}`}>
              {teethList.map(num => {
                const data = perioData[num] || { vm: 2, vc: 2, vd: 2, lm: 2, lc: 2, ld: 2, bop: false, mobility: '0', furca: '0' };
                return (
                  <tr key={num} className={isDarkMode ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50'}>
                    <td className={`p-2.5 font-extrabold font-mono text-center transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-900/60 text-blue-400 border-r border-white/10' 
                        : 'bg-blue-50/80 text-blue-700 font-black border-r border-slate-200/80'
                    }`}>
                      #{num}
                    </td>

                    {/* 6 Pontos de Sondagem (VM, VC, VD, LM, LC, LD) */}
                    {['vm', 'vc', 'vd', 'lm', 'lc', 'ld'].map(k => {
                      const val = data[k] !== undefined ? data[k] : 2;
                      const isDeep = parseInt(val, 10) > 3;
                      return (
                        <td key={k} className="p-1 text-center">
                          <input 
                            type="number" 
                            min="0" 
                            max="12"
                            value={val}
                            onChange={(e) => handleCellChange(num, k, e.target.value)}
                            className={`w-10 text-center rounded-xl py-1 text-xs font-black font-mono focus:outline-none transition-all ${
                              isDeep 
                                ? 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/50' 
                                : isDarkMode 
                                  ? 'bg-slate-900 border border-white/10 text-slate-200 focus:border-blue-500' 
                                  : 'bg-slate-100 border border-slate-300/80 text-slate-800 focus:border-blue-600'
                            }`}
                          />
                        </td>
                      );
                    })}

                    {/* BOP - Sangramento à Sondagem */}
                    <td className="p-2 text-center">
                      <input 
                        type="checkbox"
                        checked={!!data.bop}
                        onChange={(e) => handleCellChange(num, 'bop', e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                      />
                    </td>

                    {/* Mobilidade */}
                    <td className="p-1 text-center">
                      <select 
                        value={data.mobility || '0'}
                        onChange={(e) => handleCellChange(num, 'mobility', e.target.value)}
                        className={`text-[11px] rounded-lg p-1 font-sans focus:outline-none ${
                          isDarkMode ? 'bg-slate-900 border border-white/10 text-slate-300' : 'bg-slate-100 border border-slate-300 text-slate-800'
                        }`}
                      >
                        <option value="0">Grau 0</option>
                        <option value="1">Grau I</option>
                        <option value="2">Grau II</option>
                        <option value="3">Grau III</option>
                      </select>
                    </td>

                    {/* Furca */}
                    <td className="p-1 text-center">
                      <select 
                        value={data.furca || '0'}
                        onChange={(e) => handleCellChange(num, 'furca', e.target.value)}
                        className={`text-[11px] rounded-lg p-1 font-sans focus:outline-none ${
                          isDarkMode ? 'bg-slate-900 border border-white/10 text-slate-300' : 'bg-slate-100 border border-slate-300 text-slate-800'
                        }`}
                      >
                        <option value="0">Ausente</option>
                        <option value="1">Classe I</option>
                        <option value="2">Classe II</option>
                        <option value="3">Classe III</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

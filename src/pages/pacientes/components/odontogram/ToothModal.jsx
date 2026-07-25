import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Check, Sparkles, FileText, Activity } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';

export default function ToothModal({
  isOpen,
  toothNumber,
  toothData = {},
  onClose,
  onSave,
  onClearTooth
}) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  const [notes, setNotes] = useState('');
  const [vitaShade, setVitaShade] = useState('');
  const [mobility, setMobility] = useState('0');

  useEffect(() => {
    if (toothData) {
      setNotes(toothData.notes || '');
      setVitaShade(toothData.vitaShade || '');
      setMobility(toothData.mobility || '0');
    } else {
      setNotes('');
      setVitaShade('');
      setMobility('0');
    }
  }, [toothNumber, toothData]);

  if (!isOpen || !toothNumber) return null;

  const handleSave = () => {
    onSave(toothNumber, {
      ...(toothData || {}),
      notes,
      vitaShade,
      mobility
    });
    onClose();
  };

  const handleClear = () => {
    onClearTooth(toothNumber);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`max-w-lg w-full rounded-2xl border p-5 space-y-4 shadow-2xl ${
            isDarkMode 
              ? 'bg-[#111726] border-white/10 text-white' 
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b pb-3 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="bg-blue-600 text-white font-mono text-base font-extrabold px-3 py-1 rounded-xl shadow-md">
                #{toothNumber}
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Inspeção Detalhada do Dente</h3>
                <p className="text-[11px] text-slate-400">Escala de Cor Vita, Mobilidade & Anotações Clínicas</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold mb-1.5 text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" /> Observações e Anotações Clínicas:
              </label>
              <textarea 
                rows="3" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione sintomas, histórico de dor, especificações do dente..."
                className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all ${
                  isDarkMode 
                    ? 'bg-slate-900/80 border-white/10 text-slate-200 placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1.5 text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Escala de Cor Vita:
                </label>
                <select 
                  value={vitaShade}
                  onChange={(e) => setVitaShade(e.target.value)}
                  className={`w-full border rounded-xl p-2.5 focus:outline-none focus:border-blue-500 transition-all ${
                    isDarkMode 
                      ? 'bg-slate-900/80 border-white/10 text-slate-200' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="">Não Especificada</option>
                  <option value="A1">A1 (Muito Claro)</option>
                  <option value="A2">A2 (Padrão Natural)</option>
                  <option value="A3">A3 (Padrão Médio)</option>
                  <option value="A3.5">A3.5 (Escuro)</option>
                  <option value="B1">B1 (Branco Intenso)</option>
                  <option value="B2">B2 (Amarelado Claro)</option>
                  <option value="C1">C1 (Acinzentado)</option>
                  <option value="Bleach">Bleach / Clareado Premium</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-400" /> Mobilidade Dental:
                </label>
                <select 
                  value={mobility}
                  onChange={(e) => setMobility(e.target.value)}
                  className={`w-full border rounded-xl p-2.5 focus:outline-none focus:border-blue-500 transition-all ${
                    isDarkMode 
                      ? 'bg-slate-900/80 border-white/10 text-slate-200' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="0">Grau 0 (Fisiológica)</option>
                  <option value="1">Grau I (Horizontal ≤ 1mm)</option>
                  <option value="2">Grau II (Horizontal &gt; 1mm)</option>
                  <option value="3">Grau III (Vertical / Intrusão)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t pt-3.5 border-white/10">
            <button 
              onClick={handleClear} 
              className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar Dente
            </button>
            <div className="flex items-center gap-2">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" /> Salvar Alterações
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

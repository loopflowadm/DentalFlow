import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, HelpCircle } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { DENTAL_CONDITIONS } from './TeethSVGRegistry';

export default function LegendModal({ isOpen, onClose, showPrices = true }) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  if (!isOpen) return null;

  // Agrupar condições por categoria
  const categories = {};
  DENTAL_CONDITIONS.forEach(item => {
    const cat = item.category || 'Geral';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={`my-auto max-w-xl w-full rounded-2xl border p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin ${
            isDarkMode 
              ? 'bg-[#111726] border-white/10 text-white' 
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-3 border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Legenda de Cores & Procedimentos</h3>
                <p className="text-[11px] text-slate-400">Guia de identificação clínica para marcação do odontograma</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categorias da Legenda */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {Object.keys(categories).map(catName => (
              <div key={catName} className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block border-b border-white/5 pb-1">
                  {catName}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories[catName].map(item => (
                    <div 
                      key={item.id} 
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isDarkMode ? 'bg-slate-900/70 border-white/5' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span 
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-white/20" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <span className="font-semibold text-slate-200 truncate">{item.name}</span>
                      </div>
                      {item.price > 0 && showPrices && (
                        <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded shrink-0">
                          R$ {item.price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé */}
          <div className="border-t pt-3 border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

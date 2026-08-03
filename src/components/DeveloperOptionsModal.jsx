import React, { useState } from 'react';
import { 
  Wrench, Rocket, Trash2, RefreshCw, X, Check, Code, Database, Sparkles, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export default function DeveloperOptionsModal({ isOpen, onClose }) {
  const { seedDemoData, clearAllData, loadData, isDevToolsEnabled, setDevToolsEnabled } = useClinic();
  const [loadingAction, setLoadingAction] = useState(null);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleSeed = async () => {
    setLoadingAction('seed');
    setMessage({ text: 'Semeando dados de demonstração no banco...', type: 'info' });
    try {
      if (seedDemoData) {
        await seedDemoData();
      }
      setMessage({ text: 'Sistema preenchido com sucesso com dados de demonstração completos! 🎉', type: 'success' });
    } catch (err) {
      console.error('Erro ao semear dados:', err);
      setMessage({ text: 'Erro ao semear dados de demonstração.', type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleClear = async () => {
    setLoadingAction('clear');
    setMessage({ text: 'Limpando dados da clínica...', type: 'info' });
    try {
      if (clearAllData) {
        await clearAllData();
      }
      setMessage({ text: 'Dados da clínica limpos com sucesso. Sistema em estado limpo.', type: 'success' });
    } catch (err) {
      console.error('Erro ao limpar dados:', err);
      setMessage({ text: 'Erro ao limpar dados da clínica.', type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReload = async () => {
    setLoadingAction('reload');
    try {
      if (loadData) {
        await loadData();
      }
      setMessage({ text: 'Dados da clínica recarregados!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Falha ao recarregar dados.', type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0D0D0D] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden text-left font-sans">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white font-title flex items-center gap-2">
                Opções de Desenvolvedor
                <span className="text-[10px] font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Dev Mode
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Ferramentas para preenchimento e reset de dados em desenvolvimento.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">

          {/* Feedback Message */}
          {message && (
            <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300' :
              message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300' :
              'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300'
            }`}>
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="opacity-60 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action 1: Preencher com Dados Mockados */}
          <div className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Preencher Sistema com Dados Demo</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Insere 10+ Pacientes, 18+ Agendamentos, 12+ Leads de CRM, Transações Financeiras e Conversas no WhatsApp.
                </p>
              </div>
            </div>
            <button
              onClick={handleSeed}
              disabled={loadingAction !== null}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loadingAction === 'seed' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Preencher Sistema com Dados de Demonstração</span>
            </button>
          </div>

          {/* Action 2: Limpar Dados da Clínica */}
          <div className="p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Limpar Todos os Dados da Clínica</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Remove os dados de teste da clínica e redefine para o estado limpo zerado.
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              disabled={loadingAction !== null}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loadingAction === 'clear' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>Limpar Todos os Dados (Reset Clean Slate)</span>
            </button>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 text-xs">
            <button
              onClick={handleReload}
              disabled={loadingAction !== null}
              className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'reload' ? 'animate-spin' : ''}`} />
              <span>Sincronizar Supabase</span>
            </button>

            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              Menu visível em desenvolvimento
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-[#111111] px-6 py-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-200 dark:bg-white/10 hover:bg-slate-300 text-slate-800 dark:text-white font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Rocket, Trash2, Sparkles, UserPlus, CalendarPlus, DollarSign, MessageSquare, Flame, CheckCircle, RefreshCw
} from 'lucide-react';
import { useClinic } from '../../../context/ClinicContext';

export default function DevTabMockData({ setMessage }) {
  const { seedDemoData, clearAllData, loadData } = useClinic();
  const [loadingAction, setLoadingAction] = useState(null);

  const handleSeedAll = async () => {
    setLoadingAction('seed-all');
    setMessage({ text: 'Semeando todos os módulos da clínica no banco de dados...', type: 'info' });
    try {
      if (seedDemoData) await seedDemoData();
      setMessage({ text: 'Sistema populado com dados de demonstração completos! 🎉', type: 'success' });
    } catch (err) {
      console.error('Erro ao semear dados:', err);
      setMessage({ text: 'Erro ao semear dados de demonstração.', type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleClearAll = async () => {
    setLoadingAction('clear-all');
    setMessage({ text: 'Limpando dados da clínica...', type: 'info' });
    try {
      if (clearAllData) await clearAllData();
      setMessage({ text: 'Dados da clínica limpos com sucesso. Estado limpo ativado.', type: 'success' });
    } catch (err) {
      console.error('Erro ao limpar dados:', err);
      setMessage({ text: 'Erro ao limpar dados da clínica.', type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleQuickAdd = async (moduleName) => {
    setLoadingAction(`quick-${moduleName}`);
    try {
      if (loadData) await loadData();
      setMessage({ text: `Registro mock de ${moduleName} gerado com sucesso!`, type: 'success' });
    } catch (err) {
      setMessage({ text: `Falha ao adicionar registro de ${moduleName}.`, type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-4 font-sans text-left">
      {/* Bloco 1: Ações Globais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20 flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Seed Completo (Tudo)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Popula 10+ Pacientes, 18+ Agendamentos, CRM, Financeiro e Conversas do WhatsApp.
              </p>
            </div>
          </div>
          <button
            onClick={handleSeedAll}
            disabled={loadingAction !== null}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loadingAction === 'seed-all' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Preencher Sistema Completo</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20 flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Reset Limpo (Clear All)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Remove os dados de teste da clínica e retorna o ambiente ao estado limpo.
              </p>
            </div>
          </div>
          <button
            onClick={handleClearAll}
            disabled={loadingAction !== null}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loadingAction === 'clear-all' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Limpar Todos os Dados</span>
          </button>
        </div>
      </div>

      {/* Bloco 2: +1 Quick Item Generator */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Gerador Rápido (+1 Item Mock)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleQuickAdd('Paciente')}
            disabled={loadingAction !== null}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-left transition-all text-xs font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>+1 Paciente</span>
          </button>
          <button
            onClick={() => handleQuickAdd('Consulta Hoje')}
            disabled={loadingAction !== null}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-left transition-all text-xs font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4 text-blue-500 shrink-0" />
            <span>+1 Consulta</span>
          </button>
          <button
            onClick={() => handleQuickAdd('Lead CRM')}
            disabled={loadingAction !== null}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-left transition-all text-xs font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-500 shrink-0" />
            <span>+1 Lead CRM</span>
          </button>
          <button
            onClick={() => handleQuickAdd('Lançamento Financeiro')}
            disabled={loadingAction !== null}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-left transition-all text-xs font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <DollarSign className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>+1 Financeiro</span>
          </button>
        </div>
      </div>
    </div>
  );
}

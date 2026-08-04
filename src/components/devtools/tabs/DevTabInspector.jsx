import React, { useState } from 'react';
import { Database, Key, HardDrive, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { isSupabaseConfigured } from '../../../lib/supabase';

export default function DevTabInspector({ setMessage }) {
  const { user, clinic, supabaseActive } = useAuth();
  const [clearingStorage, setClearingStorage] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const handleClearLocalStorage = () => {
    setClearingStorage(true);
    try {
      localStorage.clear();
      sessionStorage.clear();
      setMessage({ text: 'LocalStorage e SessionStorage limpos com sucesso!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Falha ao limpar armazenamento local.', type: 'error' });
    } finally {
      setClearingStorage(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-left">
      {/* Supabase Connection Status */}
      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            Conexão Supabase
          </span>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
            isConfigured ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
          }`}>
            {isConfigured ? 'CONECTADO / ATIVO' : 'MODO MOCK LOCAL'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
          <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-black/40">
            <div className="text-[9px] text-slate-500 uppercase font-sans font-bold">User ID:</div>
            <div className="truncate text-slate-800 dark:text-slate-200" title={user?.id}>{user?.id || 'd-1 (mock)'}</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-black/40">
            <div className="text-[9px] text-slate-500 uppercase font-sans font-bold">Clinic ID:</div>
            <div className="truncate text-slate-800 dark:text-slate-200" title={clinic?.id}>{clinic?.id || 'clinic-demo'}</div>
          </div>
        </div>
      </div>

      {/* Armazenamento Local */}
      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-amber-500" />
            Armazenamento do Navegador
          </span>
          <button
            onClick={handleClearLocalStorage}
            disabled={clearingStorage}
            className="text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Limpar LocalStorage
          </button>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Remove tokens salvos, preferências de tema e caches mantidos localmente no navegador.
        </p>
      </div>
    </div>
  );
}

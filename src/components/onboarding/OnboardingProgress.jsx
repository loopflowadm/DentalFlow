import React from 'react';
import { Check } from 'lucide-react';

export default function OnboardingProgress({ currentStep, totalSteps = 4 }) {
  const steps = [
    { id: 1, label: 'Clínica' },
    { id: 2, label: 'Equipe' },
    { id: 3, label: 'WhatsApp' },
    { id: 4, label: 'Pronto' }
  ];

  return (
    <div className="w-full max-w-md mx-auto mb-8 select-none">
      {/* Indicador Numérico Discreto */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 font-mono">
        <span className="uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
          Progresso da Configuração
        </span>
        <span className="bg-slate-200/80 dark:bg-white/10 px-2.5 py-0.5 rounded-full text-slate-700 dark:text-slate-200 font-bold">
          {currentStep} de {totalSteps}
        </span>
      </div>

      {/* Barra de Progresso Suave */}
      <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-[#196BFB] transition-all duration-300 ease-out rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Rótulos dos 4 Passos */}
      <div className="grid grid-cols-4 gap-1 text-center">
        {steps.map((s) => {
          const isDone = s.id < currentStep;
          const isCurrent = s.id === currentStep;

          return (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                isDone 
                  ? 'bg-emerald-500 text-white' 
                  : isCurrent 
                  ? 'bg-[#196BFB] text-white ring-4 ring-blue-500/20' 
                  : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500'
              }`}>
                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : s.id}
              </div>
              <span className={`text-[11px] font-medium transition-colors ${
                isCurrent 
                  ? 'text-slate-900 dark:text-white font-bold' 
                  : isDone 
                  ? 'text-slate-600 dark:text-slate-400' 
                  : 'text-slate-400 dark:text-slate-600'
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

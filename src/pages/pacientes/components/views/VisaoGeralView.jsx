import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { 
  ClipboardList, User, Phone, Mail, Calendar, MapPin, 
  ShieldAlert, Activity, ArrowRight, Plus, CheckCircle2, 
  Clock, Tag, AlertTriangle, Gift, Copy, Sparkles, DollarSign, Smile
} from 'lucide-react';
import { AnatomicalToothSVG } from '../odontogram/TeethSVGRegistry';
import { formatPhone, formatCPF, formatRG } from '../../../../lib/formatters';

export default function VisaoGeralView({ 
  patient, 
  history = {}, 
  appointments = [], 
  medicalRecords = [], 
  onNavigateToTab,
  onOpenEditModal,
  onOpenWhatsApp
}) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  if (!patient) return null;

  const odontogramTeethData = history?.odontogram?.teethData || patient?.odontogram_data || {};
  const toothHistoryEvents = history?.odontogram?.toothHistory || [];
  const anamnese = history?.anamnese_estruturada || {};

  // Alertas de saúde críticos
  const healthAlerts = [];
  if (anamnese.has_alergia === 'Sim') healthAlerts.push({ type: 'danger', text: anamnese.has_alergia_detail ? `Alergia: ${anamnese.has_alergia_detail}` : 'Alergia Medicamentosa' });
  if (anamnese.has_pressao_alta === 'Sim') healthAlerts.push({ type: 'warning', text: 'Hipertensão Arterial' });
  if (anamnese.has_diabetes === 'Sim') healthAlerts.push({ type: 'warning', text: 'Diabetes Mellitus' });
  if (anamnese.has_alteracao_cardio === 'Sim') healthAlerts.push({ type: 'danger', text: 'Alteração Cardíaca' });
  if (anamnese.is_gestante === 'Sim') healthAlerts.push({ type: 'info', text: 'Paciente Gestante' });

  // Filtrar tarefas do paciente
  const patientTasks = appointments.filter(a => a.patient_id === patient.id && a.type === 'TAREFA');

  // Arcadas para preview resumido
  const upperTeethQ1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperTeethQ2 = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeethQ4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerTeethQ3 = [31, 32, 33, 34, 35, 36, 37, 38];

  // Contagem de dentes com condições registradas
  const markedTeethCount = Object.keys(odontogramTeethData).filter(tNum => {
    const tData = odontogramTeethData[tNum];
    return tData && (tData.whole || tData.root || (tData.surfaces && Object.keys(tData.surfaces).length > 0));
  }).length;

  const cardBgClass = isDarkMode 
    ? 'bg-gradient-to-br from-[#151c2c] via-[#0b0f19] to-[#111726] border border-blue-500/20 shadow-xl text-white' 
    : 'bg-white border border-slate-200 shadow-sm text-slate-800';

  const subCardBgClass = isDarkMode
    ? 'bg-slate-900/90 border border-white/10 text-white'
    : 'bg-slate-50 border border-slate-200 text-slate-900';

  const labelClass = isDarkMode ? 'text-slate-400' : 'text-slate-500 font-bold';
  const valueClass = isDarkMode ? 'text-white font-extrabold' : 'text-slate-900 font-black';

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* 1. BANNER DE ALERTAS MÉDICOS CRÍTICOS (Se houver) */}
      {healthAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/60 border border-rose-500/30 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-300">Atenção Clínica Crítica</h3>
              <p className="text-[11px] text-slate-300 font-medium">Condições e restrições de saúde identificadas na anamnese do paciente</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {healthAlerts.map((alt, idx) => (
              <span 
                key={idx}
                className={`text-[10px] font-extrabold px-3 py-1 rounded-xl border flex items-center gap-1.5 uppercase tracking-wider shadow-sm ${
                  alt.type === 'danger'
                    ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                    : alt.type === 'warning'
                      ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                      : 'bg-purple-500/20 text-purple-200 border-purple-500/40'
                }`}
              >
                <AlertTriangle className="w-3 h-3" /> {alt.text}
              </span>
            ))}
          </div>
        </div>
      )}



      {/* 3. GRID PRINCIPAL (DUAS COLUNAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: TAREFAS & OBSERVAÇÕES CLÍNICAS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* WIDGET: TAREFAS DO PACIENTE */}
          <div className={`backdrop-blur-md rounded-2xl border p-5 space-y-3 transition-all ${cardBgClass}`}>
            <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
              <h4 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <ClipboardList className="w-4 h-4 text-blue-500" /> 
                Tarefas do Paciente
              </h4>
              <button 
                onClick={() => alert('Use a aba Agenda para criar novas tarefas vinculadas.')}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Nova
              </button>
            </div>

            <div className="space-y-2">
              {patientTasks.map(task => (
                <div key={task.id} className={`p-3 rounded-xl border flex items-center justify-between ${subCardBgClass}`}>
                  <div>
                    <h5 className={`text-xs font-bold ${valueClass}`}>{task.title}</h5>
                    <p className={`text-[11px] ${labelClass}`}>{task.observations || 'Sem detalhes'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                    {task.label || 'Pendente'}
                  </span>
                </div>
              ))}

              {patientTasks.length === 0 && (
                <div className={`py-6 text-center rounded-xl border ${subCardBgClass}`}>
                  <p className={`text-xs font-medium ${labelClass}`}>Nenhuma tarefa pendente cadastrada.</p>
                </div>
              )}
            </div>
          </div>

          {/* WIDGET: OBSERVAÇÕES CLÍNICAS */}
          <div className={`backdrop-blur-md rounded-2xl border p-5 space-y-3 transition-all ${cardBgClass}`}>
            <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
              <h4 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <User className="w-4 h-4 text-blue-500" />
                Observações Clínicas Gerais
              </h4>
              <button
                onClick={onOpenEditModal}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                Editar
              </button>
            </div>

            <p className={`font-medium p-3 rounded-xl border leading-relaxed text-xs ${subCardBgClass}`}>
              {history.notes || 'Nenhuma observação clínica lançada.'}
            </p>
          </div>

        </div>

        {/* COLUNA DIREITA: RESUMO VETORIAL DO ODONTOGRAMA & ÚLTIMAS EVOLUÇÕES */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* WIDGET: RESUMO DO ODONTOGRAMA (VETORIAL SVG) */}
          <div className={`backdrop-blur-md rounded-2xl border p-5 space-y-4 transition-all ${cardBgClass}`}>
            <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
              <h4 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <Activity className="w-4 h-4 text-blue-500" />
                Preview do Odontograma Clínico
              </h4>

              <button
                onClick={() => onNavigateToTab && onNavigateToTab('odontograma')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Abrir Odontograma Completo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Arcada Vetorial de Resumo */}
            <div className={`p-4 rounded-2xl border flex flex-col items-center gap-4 overflow-x-auto custom-scrollbar transition-all ${
              isDarkMode ? 'bg-[#0b0f19] border-white/5' : 'bg-slate-50 border-slate-200 shadow-2xs'
            }`}>
              {/* Arcada Superior */}
              <div className="flex flex-col items-center">
                <span className={`text-[9px] font-extrabold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Arcada Superior</span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {upperTeethQ1.map(num => (
                    <div 
                      key={num}
                      onClick={() => onNavigateToTab && onNavigateToTab('odontograma')}
                      className="cursor-pointer hover:scale-110 transition-transform"
                      title={`Dente ${num} - Clique para abrir no odontograma`}
                    >
                      <AnatomicalToothSVG toothNumber={num} surfaces={odontogramTeethData[num] || {}} />
                    </div>
                  ))}
                  <div className="w-[1px] h-16 bg-blue-500/20 border-r border-dashed border-blue-500/30 mx-1" />
                  {upperTeethQ2.map(num => (
                    <div 
                      key={num}
                      onClick={() => onNavigateToTab && onNavigateToTab('odontograma')}
                      className="cursor-pointer hover:scale-110 transition-transform"
                      title={`Dente ${num} - Clique para abrir no odontograma`}
                    >
                      <AnatomicalToothSVG toothNumber={num} surfaces={odontogramTeethData[num] || {}} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Divisor Central */}
              <div className={`w-full border-b my-1 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`} />

              {/* Arcada Inferior */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {lowerTeethQ4.map(num => (
                    <div 
                      key={num}
                      onClick={() => onNavigateToTab && onNavigateToTab('odontograma')}
                      className="cursor-pointer hover:scale-110 transition-transform"
                      title={`Dente ${num} - Clique para abrir no odontograma`}
                    >
                      <AnatomicalToothSVG toothNumber={num} surfaces={odontogramTeethData[num] || {}} />
                    </div>
                  ))}
                  <div className="w-[1px] h-16 bg-blue-500/20 border-r border-dashed border-blue-500/30 mx-1" />
                  {lowerTeethQ3.map(num => (
                    <div 
                      key={num}
                      onClick={() => onNavigateToTab && onNavigateToTab('odontograma')}
                      className="cursor-pointer hover:scale-110 transition-transform"
                      title={`Dente ${num} - Clique para abrir no odontograma`}
                    >
                      <AnatomicalToothSVG toothNumber={num} surfaces={odontogramTeethData[num] || {}} />
                    </div>
                  ))}
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mt-2">Arcada Inferior</span>
              </div>
            </div>
          </div>

          {/* WIDGET: ÚLTIMAS EVOLUÇÕES CLÍNICAS */}
          <div className={`backdrop-blur-md rounded-2xl border p-5 space-y-4 transition-all ${cardBgClass}`}>
            <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
              <h4 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <Activity className="w-4 h-4 text-blue-500" />
                Últimas Evoluções Clínicas
              </h4>

              <button
                onClick={() => onNavigateToTab && onNavigateToTab('evolucao')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                + Adicionar Evolução
              </button>
            </div>

            <div className="space-y-3">
              {toothHistoryEvents.length > 0 ? (
                toothHistoryEvents.slice(0, 4).map((ev, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border flex items-center justify-between ${subCardBgClass}`}>
                    <div>
                      <h5 className={`text-xs font-bold ${valueClass}`}>
                        Dente #{ev.toothNumber} - {ev.conditionLabel || ev.condition}
                      </h5>
                      <span className={`text-[11px] block mt-0.5 ${labelClass}`}>
                        Escopo / Face: <span className="text-blue-400 uppercase font-mono font-bold">{ev.face || 'Dente Inteiro'}</span>
                      </span>
                    </div>
                    <span className={`text-[10px] font-semibold ${labelClass}`}>{ev.date || 'Hoje'}</span>
                  </div>
                ))
              ) : (
                <div className={`py-6 text-center rounded-xl border ${subCardBgClass}`}>
                  <p className={`text-xs font-medium ${labelClass}`}>Nenhuma evolução registrada recentemente.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

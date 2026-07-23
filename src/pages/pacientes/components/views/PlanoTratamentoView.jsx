import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { 
  CheckCircle2, Clock, Play, FileText, Plus, Calendar, 
  DollarSign, BarChart3, Paperclip, ChevronRight, X, Eye 
} from 'lucide-react';
import { AnatomicalToothSVG, ToothGradients } from '../odontogram/TeethSVGRegistry';

export default function PlanoTratamentoView({ patient, onSavePatientData }) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  // Estado local para o plano de tratamento carregado do paciente
  const [treatmentPlan, setTreatmentPlan] = useState(() => {
    return patient?.medical_history?.treatment_plan || {
      activeStepId: 2,
      steps: [
        { id: 1, title: 'Avaliação e Diagnóstico', status: 'completed', completionDate: '10/05/2024' },
        { id: 2, title: 'Urgências', status: 'active', procedures: [
          { dente: '15', nome: 'Tratamento de Canal', status: 'Em andamento', dentista: 'Dra. Juliana', data: '15/05/2024', valor: 600 },
          { dente: '33', nome: 'Restauração em Resina', status: 'Agendado', dentista: 'Dra. Juliana', data: '22/05/2024', valor: 350 },
          { dente: '27', nome: 'Restauração em Resina', status: 'Agendado', dentista: 'Dra. Juliana', data: '22/05/2024', valor: 350 }
        ]},
        { id: 3, title: 'Restaurador', status: 'pending', procedures: [] },
        { id: 4, title: 'Reabilitação', status: 'pending', procedures: [] },
        { id: 5, title: 'Estética', status: 'pending', procedures: [] },
        { id: 6, title: 'Manutenção', status: 'pending', procedures: [] }
      ],
      attachments: [
        { id: 1, name: 'Radiografia Panorâmica', date: '10/05/2024', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800' },
        { id: 2, name: 'Periapical 14 e 15', date: '10/05/2024', url: 'https://images.unsplash.com/photo-1559811814-e2c57b5e69df?w=800' },
        { id: 3, name: 'Fotos Intraorais', date: '10/05/2024', url: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800' }
      ],
      generalNotes: 'Paciente apresenta sensibilidade em dentes posteriores superiores esquerdos. Manter acompanhamento periódico.',
      financialSummary: {
        total: 3450,
        paid: 1200
      }
    };
  });

  const [activeStepId, setActiveStepId] = useState(treatmentPlan.activeStepId || 2);
  const [showAddProcedure, setShowAddProcedure] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  // Arrays de dentes da arcada
  const upperTeethQ1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperTeethQ2 = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeethQ4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerTeethQ3 = [31, 32, 33, 34, 35, 36, 37, 38];

  // Form states for new procedure
  const [newDente, setNewDente] = useState('11');
  const [newProcName, setNewProcName] = useState('Limpeza');

  const [newDentist, setNewDentist] = useState('Dra. Juliana');
  const [newDate, setNewDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [newPrice, setNewPrice] = useState('350');
  const [newStatus, setNewStatus] = useState('Agendado');

  // Sync state if patient changes
  useEffect(() => {
    if (patient?.medical_history?.treatment_plan) {
      setTreatmentPlan(patient.medical_history.treatment_plan);
      setActiveStepId(patient.medical_history.treatment_plan.activeStepId || 2);
    }
  }, [patient?.id]);

  // Persistir dados no Supabase via componente pai
  const persistPlanData = async (updatedPlan) => {
    setTreatmentPlan(updatedPlan);
    if (patient && onSavePatientData) {
      const updatedPatient = {
        ...patient,
        medical_history: {
          ...(patient.medical_history || {}),
          treatment_plan: updatedPlan
        }
      };
      await onSavePatientData(updatedPatient);
    }
  };

  // Alterar etapa ativa localmente
  const selectStep = (stepId) => {
    setActiveStepId(stepId);
  };

  // Adicionar novo procedimento
  const handleAddProcedureSubmit = (e) => {
    e.preventDefault();
    const freshProc = {
      dente: newDente,
      nome: newProcName,
      status: newStatus,
      dentista: newDentist,
      data: newDate,
      valor: parseFloat(newPrice) || 0
    };

    const updatedSteps = treatmentPlan.steps.map(step => {
      if (step.id === activeStepId) {
        return {
          ...step,
          procedures: [...(step.procedures || []), freshProc],
          status: step.status === 'pending' ? 'active' : step.status
        };
      }
      return step;
    });

    const newTotal = treatmentPlan.financialSummary.total + (freshProc.valor);
    const updatedPlan = {
      ...treatmentPlan,
      steps: updatedSteps,
      financialSummary: {
        ...treatmentPlan.financialSummary,
        total: newTotal
      }
    };

    persistPlanData(updatedPlan);
    setShowAddProcedure(false);
  };

  // Adicionar anexo de teste
  const handleAddAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const dummyUrl = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800';
        const newAttach = {
          id: Date.now(),
          name: file.name.split('.')[0],
          date: new Date().toLocaleDateString('pt-BR'),
          url: dummyUrl
        };
        const updatedPlan = {
          ...treatmentPlan,
          attachments: [...(treatmentPlan.attachments || []), newAttach]
        };
        persistPlanData(updatedPlan);
      }
    };
    input.click();
  };

  // Obter dentes marcados na etapa ativa para o mini-odontograma
  const activeStep = treatmentPlan.steps.find(s => s.id === activeStepId) || {};
  const activeStepProcedures = activeStep.procedures || [];

  // Mapear procedimentos para formato esperado pelo TeethSVGRegistry
  const stepOdontogramData = {};
  activeStepProcedures.forEach(proc => {
    // Escolhe cor com base no tipo de procedimento
    let condition = 'restauracao_resina';
    const nameLower = proc.nome.toLowerCase();
    if (nameLower.includes('canal') || nameLower.includes('endo')) {
      condition = 'endodontia';
    } else if (nameLower.includes('implante')) {
      condition = 'implante';
    } else if (nameLower.includes('coroa')) {
      condition = 'coroa';
    } else if (nameLower.includes('extra')) {
      condition = 'extraido';
    }

    if (condition === 'endodontia') {
      stepOdontogramData[proc.dente] = { root: 'endodontia' };
    } else if (condition === 'implante' || condition === 'extraido') {
      stepOdontogramData[proc.dente] = { full: condition };
    } else {
      stepOdontogramData[proc.dente] = { occlusal: condition };
    }
  });

  // Métricas do plano
  const totalSteps = treatmentPlan.steps.length;
  const completedSteps = treatmentPlan.steps.filter(s => s.status === 'completed').length;
  const activeSteps = treatmentPlan.steps.filter(s => s.status === 'active').length;
  const pendingSteps = treatmentPlan.steps.filter(s => s.status === 'pending').length;

  const totalInvestment = treatmentPlan.financialSummary.total;
  const paidAmount = treatmentPlan.financialSummary.paid;
  const remainingAmount = totalInvestment - paidAmount;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className={`flex flex-col h-full gap-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
      <ToothGradients />

      <div className="flex flex-col lg:flex-row gap-4 items-stretch min-h-[580px]">
        {/* COLUNA ESQUERDA: ETAPAS DO TRATAMENTO & ANEXOS */}
        <div className={`w-full lg:w-64 backdrop-blur-md rounded-2xl border p-4 flex flex-col justify-between transition-all ${
          isDarkMode 
            ? 'bg-[#111726]/90 border-white/10 shadow-xl text-white' 
            : 'bg-white border-slate-200 shadow-xs text-slate-800'
        }`}>
          <div className="space-y-6">
            {/* Bloco 1: Etapas */}
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 pl-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                ETAPAS DO TRATAMENTO
              </h3>
              <div className="space-y-1">
                {treatmentPlan.steps.map(step => {
                  const isActive = step.id === activeStepId;
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'active';

                  return (
                    <button
                      key={step.id}
                      onClick={() => selectStep(step.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? isDarkMode
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md shadow-blue-500/5'
                            : 'bg-blue-50 border-blue-200 text-blue-700 shadow-2xs font-extrabold'
                          : isDarkMode
                            ? 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {/* Indicador visual de status */}
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                            {step.id}
                          </div>
                        ) : (
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ${
                            isDarkMode ? 'border-slate-600 text-slate-500' : 'border-slate-300 text-slate-400'
                          }`}>
                            {step.id}
                          </div>
                        )}
                        <div className="truncate">
                          <span className={`text-xs font-bold block ${isActive ? (isDarkMode ? 'text-white' : 'text-blue-900') : ''}`}>{step.title}</span>
                          <span className={`text-[10px] ${isDarkMode ? 'opacity-70' : 'text-slate-500'}`}>
                            {isCompleted ? `Concluído em ${step.completionDate}` : isCurrent ? 'Em andamento' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? 'text-blue-500' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bloco 2: Anexos */}
            <div className={`border-t pt-4 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 pl-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                ANEXOS DO PLANO
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {treatmentPlan.attachments.map(att => (
                  <div 
                    key={att.id}
                    onClick={() => setSelectedAttachment(att)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer group transition-all border ${
                      isDarkMode 
                        ? 'bg-slate-900/60 hover:bg-slate-900 border-white/5' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip className={`w-3.5 h-3.5 shrink-0 group-hover:text-blue-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                      <div className="truncate text-left">
                        <span className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{att.name}</span>
                        <span className="text-[9px] text-slate-500 block">{att.date}</span>
                      </div>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddAttachment}
                className={`w-full mt-3 py-2 px-3 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-800/80 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                + Adicionar Anexo
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA CENTRAL: MINI-ODONTOGRAMA DA ETAPA & TABELA */}
        <div className={`flex-1 rounded-2xl border p-5 flex flex-col justify-between shadow-xs overflow-y-auto custom-scrollbar transition-all ${
          isDarkMode 
            ? 'bg-[#0b0f19]/95 border-white/10 shadow-2xl text-white' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="space-y-5">
            {/* Header da etapa */}
            <div className="flex items-center gap-3">
              <h2 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Etapa {activeStepId} - {activeStep.title}
              </h2>
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                activeStep.status === 'completed' 
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                  : activeStep.status === 'active'
                  ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                  : isDarkMode ? 'bg-slate-800 text-slate-400 border border-white/5' : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {activeStep.status === 'completed' ? 'Concluída' : activeStep.status === 'active' ? 'Em andamento' : 'Pendente'}
              </span>
            </div>

            {/* Mini-odontograma anatômico da etapa (Adaptado ao Tema) */}
            <div className={`p-4 rounded-2xl border flex flex-col items-center gap-3 overflow-x-auto custom-scrollbar transition-all ${
              isDarkMode ? 'bg-[#080d16] border-white/5' : 'bg-slate-50 border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center gap-1.5">
                {upperTeethQ1.map(num => (
                  <AnatomicalToothSVG key={num} toothNumber={num} surfaces={stepOdontogramData[num] || {}} />
                ))}
                <div className="w-[1px] h-20 bg-blue-500/20 border-r border-dashed border-blue-500/30 mx-1.5" />
                {upperTeethQ2.map(num => (
                  <AnatomicalToothSVG key={num} toothNumber={num} surfaces={stepOdontogramData[num] || {}} />
                ))}
              </div>
              <div className={`w-full border-b my-1 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`} />
              <div className="flex items-center gap-1.5">
                {lowerTeethQ4.map(num => (
                  <AnatomicalToothSVG key={num} toothNumber={num} surfaces={stepOdontogramData[num] || {}} />
                ))}
                <div className="w-[1px] h-20 bg-blue-500/10 border-r border-dashed border-blue-500/20 mx-1.5" />
                {lowerTeethQ3.map(num => (
                  <AnatomicalToothSVG key={num} toothNumber={num} surfaces={stepOdontogramData[num] || {}} />
                ))}
              </div>
            </div>

            {/* Tabela de procedimentos */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  PROCEDIMENTOS DA ETAPA
                </h3>
                <button
                  onClick={() => setShowAddProcedure(true)}
                  className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-[11px] font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  + Adicionar procedimento
                </button>
              </div>

              <div className={`overflow-x-auto border rounded-xl ${isDarkMode ? 'border-white/5 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className={`border-b uppercase text-[10px] font-bold ${
                      isDarkMode ? 'bg-slate-950/60 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      <th className="p-3">Dente</th>
                      <th className="p-3">Procedimento</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Profissional</th>
                      <th className="p-3">Data</th>
                      <th className="p-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-white/5 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                    {activeStepProcedures.map((proc, index) => (
                      <tr key={index} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100/80'}`}>
                        <td className="p-3 font-mono font-extrabold text-blue-500">{proc.dente}</td>
                        <td className={`p-3 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{proc.nome}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            proc.status === 'Concluído'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : proc.status === 'Em andamento'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-purple-500/10 text-purple-500'
                          }`}>
                            {proc.status}
                          </span>
                        </td>
                        <td className={`p-3 font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{proc.dentista}</td>
                        <td className={`p-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{proc.data}</td>
                        <td className={`p-3 text-right font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {proc.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      </tr>
                    ))}

                    {activeStepProcedures.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">
                          Nenhum procedimento cadastrado para esta etapa.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: RESUMO DO PLANO, PROGRESSO & NOTAS */}
        <div className={`w-full lg:w-72 backdrop-blur-md rounded-2xl border p-4 flex flex-col gap-5 transition-all shadow-xs ${
          isDarkMode 
            ? 'bg-[#111726]/90 border-white/10 shadow-xl text-white' 
            : 'bg-white border-slate-200 shadow-xs text-slate-800'
        }`}>
          {/* Resumo Financeiro */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              RESUMO DO PLANO
            </h3>
            
            <div className={`grid grid-cols-2 gap-4 pb-4 border-b mb-4 text-left ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Etapas</span>
                <span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalSteps}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Concluídas</span>
                <span className="text-lg font-black text-emerald-500">{completedSteps}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Em andamento</span>
                <span className="text-lg font-black text-blue-500">{activeSteps}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Pendentes</span>
                <span className={`text-lg font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{pendingSteps}</span>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <div>
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest">Investimento Total</span>
                <span className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {totalInvestment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest">Pago até o momento</span>
                <span className="text-sm font-black text-emerald-500">
                  {paidAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest">Saldo Restante</span>
                <span className="text-sm font-black text-blue-500">
                  {remainingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>

          {/* Progresso do plano */}
          <div className={`border-t pt-4 text-left ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              PROGRESO DO PLANO
            </h3>
            <div className={`w-full rounded-full h-2.5 overflow-hidden border relative flex items-center ${
              isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-slate-100 border-slate-200'
            }`}>
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-bold block mt-1.5">{progressPercent}% concluído</span>
          </div>

          {/* Próxima consulta */}
          <div className={`border-t pt-4 text-left ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              PRÓXIMA CONSULTA
            </h3>
            
            <div className={`p-3 rounded-xl flex gap-3 items-center border ${
              isDarkMode ? 'bg-slate-900/60 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-500/30 flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none">MAI</span>
                <span className={`text-lg font-black leading-none mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>22</span>
              </div>
              <div className="text-left overflow-hidden">
                <span className={`text-xs font-extrabold block truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Quarta-feira, 22/05/2024</span>
                <span className="text-[10px] text-slate-500 block">14:00 • Procedimentos: 2</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigateToTab && onNavigateToTab('consultas')}
              className="text-[10px] text-blue-500 hover:text-blue-600 font-bold block mt-2 hover:underline cursor-pointer"
            >
              Ver agenda completa
            </button>
          </div>

          {/* Observações gerais */}
          <div className={`border-t pt-4 text-left flex-1 flex flex-col ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              OBSERVAÇÕES GERAIS
            </h3>
            <p className={`text-xs p-3 rounded-xl border leading-relaxed flex-1 whitespace-pre-wrap ${
              isDarkMode 
                ? 'text-slate-300 bg-slate-900/60 border-white/5' 
                : 'text-slate-700 bg-slate-50 border-slate-200'
            }`}>
              {treatmentPlan.generalNotes || 'Nenhuma observação cadastrada.'}
            </p>
            <button
              onClick={() => {
                const updatedNotes = prompt('Editar Observações Gerais:', treatmentPlan.generalNotes);
                if (updatedNotes !== null) {
                  persistPlanData({ ...treatmentPlan, generalNotes: updatedNotes });
                }
              }}
              className={`mt-2 text-[10px] font-bold flex items-center justify-center gap-1.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'text-blue-400 bg-slate-800/80 hover:bg-slate-800 border-white/5' 
                  : 'text-blue-600 bg-slate-100 hover:bg-slate-200 border-slate-200'
              }`}
            >
              Editar observações
            </button>
          </div>
        </div>
      </div>

      {/* MODAL LIGHTBOX PARA ANEXOS */}
      {selectedAttachment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className={`border rounded-2xl p-4 max-w-2xl w-full relative flex flex-col gap-4 shadow-2xl ${
            isDarkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`flex justify-between items-center border-b pb-2.5 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider">{selectedAttachment.name}</h4>
                <span className="text-[10px] text-slate-500">{selectedAttachment.date}</span>
              </div>
              <button 
                onClick={() => setSelectedAttachment(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="w-full aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative border border-white/5">
              <img 
                src={selectedAttachment.url} 
                alt={selectedAttachment.name} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ADICIONAR PROCEDIMENTO */}
      {showAddProcedure && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in">
          <form 
            onSubmit={handleAddProcedureSubmit}
            className={`border rounded-2xl p-5 max-w-sm w-full relative flex flex-col gap-4 shadow-2xl text-left ${
              isDarkMode ? 'bg-[#111726] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`flex justify-between items-center border-b pb-2.5 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <h4 className="text-sm font-black uppercase tracking-wider">Adicionar Procedimento</h4>
              <button 
                type="button"
                onClick={() => setShowAddProcedure(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dente (FDI)</label>
                  <input
                    type="number"
                    min="11"
                    max="48"
                    value={newDente}
                    onChange={(e) => setNewDente(e.target.value)}
                    className={`w-full border rounded-xl p-2 focus:outline-none focus:border-blue-500 font-mono ${
                      isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className={`w-full border rounded-xl p-2 focus:outline-none focus:border-blue-500 ${
                      isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome do Procedimento</label>
                <select
                  value={newProcName}
                  onChange={(e) => setNewProcName(e.target.value)}
                  className={`w-full border rounded-xl p-2 focus:outline-none focus:border-blue-500 ${
                    isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Tratamento de Canal">Tratamento de Canal</option>
                  <option value="Restauração em Resina">Restauração em Resina</option>
                  <option value="Implante de Titânio">Implante de Titânio</option>
                  <option value="Coroa Provisória">Coroa Provisória</option>
                  <option value="Extração Dentária">Extração Dentária</option>
                  <option value="Selante de Fóssulas">Selante de Fóssulas</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Profissional Responsável</label>
                <input
                  type="text"
                  value={newDentist}
                  onChange={(e) => setNewDentist(e.target.value)}
                  className={`w-full border rounded-xl p-2 focus:outline-none focus:border-blue-500 ${
                    isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={`w-full border rounded-xl p-2 focus:outline-none focus:border-blue-500 ${
                    isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Agendado">Agendado</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluído">Concluído</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-blue-600/25 transition-all mt-2 cursor-pointer"
            >
              Confirmar Procedimento
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

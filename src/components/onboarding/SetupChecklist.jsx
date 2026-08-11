import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, Circle, ArrowRight, X, UserPlus, 
  Calendar, Target, Compass, ChevronDown, ListTodo
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export default function SetupChecklist({ onNavigateTab, onOpenNewPatientModal, onOpenNewAppointmentModal }) {
  const { patients = [], appointments = [], clinic = {} } = useClinic();
  
  // Estado para controlar se o widget flutuante está expandido ou minimizado
  const [isOpen, setIsOpen] = useState(false);

  // Estado para ignorar totalmente se o usuário fechar definitivamente
  const [isPermanentlyClosed, setIsPermanentlyClosed] = useState(() => {
    return localStorage.getItem('df_checklist_permanently_closed') === 'true';
  });

  // Cálculo das tarefas concluídas
  const checklistItems = useMemo(() => {
    const hasClinicData = Boolean(clinic?.name);
    const hasWhatsapp = Boolean(clinic?.phone);
    const hasPatient = patients.length > 0;
    const hasAppointment = appointments.length > 0;
    const hasTeam = Boolean(clinic?.staff_count || clinic?.chairs_count);

    return [
      { id: 'clinic', label: 'Dados da clínica', completed: hasClinicData, tab: 'configuracoes' },
      { id: 'whatsapp', label: 'WhatsApp da clínica', completed: hasWhatsapp, tab: 'whatsapp' },
      { id: 'patient', label: 'Cadastrar primeiro paciente', completed: hasPatient, action: 'new_patient' },
      { id: 'appointment', label: 'Criar primeiro agendamento', completed: hasAppointment, action: 'new_appointment' },
      { id: 'team', label: 'Configurar equipe', completed: hasTeam, tab: 'configuracoes' }
    ];
  }, [clinic, patients, appointments]);

  const completedCount = useMemo(() => {
    return checklistItems.filter(i => i.completed).length;
  }, [checklistItems]);

  const progressPercentage = useMemo(() => {
    return Math.round((completedCount / checklistItems.length) * 100);
  }, [completedCount, checklistItems.length]);

  const handleClosePermanently = (e) => {
    e.stopPropagation();
    setIsPermanentlyClosed(true);
    localStorage.setItem('df_checklist_permanently_closed', 'true');
  };

  const handleItemClick = (item) => {
    if (item.action === 'new_patient' && onOpenNewPatientModal) {
      onOpenNewPatientModal();
    } else if (item.action === 'new_appointment' && onOpenNewAppointmentModal) {
      onOpenNewAppointmentModal();
    } else if (item.tab && onNavigateTab) {
      onNavigateTab(item.tab);
    }
  };

  if (isPermanentlyClosed) return null;

  const hasFirstPatient = patients.length > 0;
  const hasFirstAppointment = appointments.length > 0;

  return (
    <div className="fixed bottom-6 right-6 z-[90] select-none font-sans">
      
      {/* ------------------------------------------------------------- */}
      {/* PAINEL EXPANDIDO (FLOATING CARD ANCORADO NO CANTO INFERIOR)   */}
      {/* ------------------------------------------------------------- */}
      {isOpen ? (
        <div className="w-80 sm:w-96 bg-[#0D0D0D] border border-white/15 rounded-2xl p-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 zoom-in-95 duration-200 text-left space-y-4 relative overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold font-title text-white flex items-center gap-2">
                  <span>Comece por aqui</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Sua clínica está <span className="text-blue-400 font-bold">{progressPercentage}%</span> configurada
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Minimizar"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={handleClosePermanently}
                className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Fechar permanentemente"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Barra de Progresso Suave */}
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#196BFB] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Lista de Itens do Checklist */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5 scrollbar-thin">
            {checklistItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                  item.completed
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 font-semibold'
                    : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className={item.completed ? 'text-emerald-200' : 'text-slate-200'}>{item.label}</span>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 ${item.completed ? 'text-emerald-400/60' : 'text-slate-500'}`} />
              </button>
            ))}
          </div>

          {/* PRIMEIRA AÇÃO RECOMENDADA (Design B2B SaaS Limpo) */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Ação Recomendada</span>
            </div>

            {!hasFirstPatient ? (
              <>
                <h4 className="text-xs font-bold text-white">
                  Cadastre seu primeiro paciente
                </h4>
                <button
                  onClick={() => {
                    if (onOpenNewPatientModal) onOpenNewPatientModal();
                    else if (onNavigateTab) onNavigateTab('pacientes');
                  }}
                  className="w-full h-9 bg-[#196BFB] hover:bg-[#155bd8] text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Cadastrar paciente →</span>
                </button>
              </>
            ) : !hasFirstAppointment ? (
              <>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Paciente cadastrado</span>
                </div>
                <button
                  onClick={() => {
                    if (onOpenNewAppointmentModal) onOpenNewAppointmentModal();
                    else if (onNavigateTab) onNavigateTab('agenda');
                  }}
                  className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar consulta →</span>
                </button>
              </>
            ) : (
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sua clínica está pronta e operacional!</span>
              </p>
            )}
          </div>

        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* BOTAO FLUTUANTE DISCRETO NO CANTO INFERIOR DIREITO            */
        /* ------------------------------------------------------------- */
        <button
          onClick={() => setIsOpen(true)}
          className="h-11 px-4 bg-[#0D0D0D] border border-white/15 hover:border-white/30 text-white rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer group"
          title="Abrir guia de início rápido"
        >
          <div className="relative flex items-center justify-center">
            <Target className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            {progressPercentage < 100 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-xs font-bold font-title">Comece por aqui</span>
          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full">
            {progressPercentage}%
          </span>
        </button>
      )}

    </div>
  );
}

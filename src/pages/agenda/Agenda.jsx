import { useState, useEffect, useRef } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeModuleSync } from '../../hooks/useRealtimeModuleSync';
import { formatPhone } from '../../lib/formatters';
import {
  Plus, Calendar as CalIcon, ChevronLeft, ChevronRight,
  Clock, MapPin, Check, X, ShieldAlert, ArrowLeftRight,
  Phone, User, Edit, Copy, CheckSquare, AlertCircle, FileText,
  ClipboardList, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Agenda({
  selectedAppointment,
  setSelectedAppointment,
  currentDate,
  setCurrentDate,
  selectedChairs,
  setSelectedChairs,
  selectedDentists,
  setSelectedDentists,
  view,
  setView,
  setActiveTab,
  setSelectedPatient,
  prefilledLeadData,
  setPrefilledLeadData
}) {
  const {
    appointments,
    addAppointment,
    updateAppointment,
    patients,
    procedures,
    checkPatientInadimplente,
    chairs,
    dentists,
    addPatient,
    fetchClinicData,
    clinicHours,
    dentistSchedules,
    holidays
  } = useClinic();
  const { currentTheme } = useTheme();
  const { user } = useAuth();

  // Escutar atualizações de consultas em tempo real (Cascata Zero-UI)
  const { isHighlighted } = useRealtimeModuleSync('appointments', user?.clinic_id, () => {
    if (fetchClinicData) fetchClinicData();
  });

  // Refs e Helpers para Autocomplete e Conflitos
  const autocompleteRef = useRef(null);
  const taskAutocompleteRef = useRef(null);

  const normalizeString = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const getSchedulingConflict = (dateStr, timeStr, durationMin, doctorId, chairId, excludeAppId = null) => {
    if (!dateStr || !timeStr || !durationMin) return null;

    const start = new Date(`${dateStr}T${timeStr}:00`);
    const end = new Date(start.getTime() + durationMin * 60 * 1000);

    // Filtrar agendamentos ativos na mesma data
    const dateApps = appointments.filter(app => {
      if (app.id === excludeAppId) return false;
      if (app.status === 'CANCELLED') return false;

      const appStart = new Date(app.start_time);
      return appStart.getFullYear() === start.getFullYear() &&
        appStart.getMonth() === start.getMonth() &&
        appStart.getDate() === start.getDate();
    });

    for (const app of dateApps) {
      const appStart = new Date(app.start_time);
      const appEnd = new Date(app.end_time);

      // Sobreposição de intervalos
      const isOverlapping = (start < appEnd) && (end > appStart);

      if (isOverlapping) {
        if (chairId && app.chair_id === chairId) {
          return {
            type: 'CHAIR',
            message: `A Cadeira ${chairs.find(c => c.id === chairId)?.name || ''} já está ocupada por ${app.patientName || app.title || 'Consulta'} neste horário (${appStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${appEnd.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}).`
          };
        }
        if (doctorId && app.doctor_id === doctorId) {
          const docName = dentists.find(d => d.id === doctorId)?.full_name || 'Dentista';
          return {
            type: 'DOCTOR',
            message: `O(A) Dr(a). ${docName} já possui um compromisso neste horário (${appStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${appEnd.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}).`
          };
        }
      }
    }
    return null;
  };

  // Diálogos
  const [showAddApp, setShowAddApp] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('consulta'); // 'consulta' | 'compromisso' | 'tarefa'
  const [editingApp, setEditingApp] = useState(null);

  // Fechar autocomplete ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (taskAutocompleteRef.current && !taskAutocompleteRef.current.contains(event.target)) {
        setShowTaskPatientSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Consumir dados de Lead vindo do CRM para preenchimento
  useEffect(() => {
    if (prefilledLeadData) {
      setActiveModalTab('consulta');
      setShowAddApp(true);
      setShowQuickPatientForm(true);
      setQuickPatientName(prefilledLeadData.name || '');
      setQuickPatientPhone(prefilledLeadData.phone || '');
      if (setPrefilledLeadData) {
        setPrefilledLeadData(null);
      }
    }
  }, [prefilledLeadData, setPrefilledLeadData]);

  // Sincronizar com agendamento selecionado da sidebar
  useEffect(() => {
    if (selectedAppointment) {
      Promise.resolve().then(() => {
        setSelectedApp(selectedAppointment);
      });
    }
  }, [selectedAppointment]);

  // Forçar visualização "Dia" no mobile (abaixo de 640px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && view !== 'day' && view !== 'month') {
        setView('day');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view, setView]);

  // Relógio do tempo real da agenda
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Posicionamento percentual da Linha do Tempo Atual (07:00 as 19:00)
  const getCurrentTimeTopPercentage = () => {
    const hours = nowTime.getHours();
    const minutes = nowTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 7 * 60;  // 07:00
    const endMinutes = 19 * 60;   // 19:00

    if (totalMinutes < startMinutes || totalMinutes > endMinutes) return null;
    return ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
  };

  const currentTimeTop = getCurrentTimeTopPercentage();

  // Renderizador de Card de Agendamento (Com Cor de Fundo Completa, Foto Garantida e Nome Único)
  const renderAgendaCard = (app, isCompact = false) => {
    const pat = app.patient_id ? patients.find(p => p.id === app.patient_id) : null;
    let rawName = pat?.name || app.patientName || app.patient_name || 'Paciente';

    // Tratamento estrito de duplicação caso a string venha repetida (ex: "John DoeJohn Doe")
    if (rawName && rawName.length > 4 && rawName.length % 2 === 0) {
      const half = rawName.length / 2;
      if (rawName.substring(0, half) === rawName.substring(half)) {
        rawName = rawName.substring(0, half);
      }
    }
    const patName = rawName;

    // Foto do paciente ou avatar default foto de alta definição
    const defaultAvatarPhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
    const patPhoto = pat?.photoUrl || pat?.avatar_url || app.photoUrl || app.avatar_url || defaultAvatarPhoto;

    const doc = app.doctor_id ? dentists.find(d => d.id === app.doctor_id) : null;
    const docName = doc ? (doc.full_name.startsWith('Dr') ? doc.full_name : `Dr(a). ${doc.full_name}`) : null;

    const chair = app.chair_id ? chairs.find(c => c.id === app.chair_id) : null;
    const chairName = chair ? chair.name : (app.room || 'Cadeira 01');

    const isConsulta = app.type === 'CONSULTA' || (!app.type && (app.patient_id || app.patientName));

    // Formatador da Cadeira (Sem cortes truncados e com tooltip)
    const formattedChairName = chairName ? (chairName.includes(' - ') ? chairName.split(' - ')[0] : chairName) : 'Cadeira 01';

    // Estilização dos Cards da Agenda (Soft-Tint Sólido com Borda Lateral Indicadora de 4px)
    const getCardStyleInfo = () => {
      const statusUpper = (app.status || 'PENDING').toUpperCase();

      if (app.type === 'COMPROMISSO') {
        return {
          bgClass: 'bg-slate-100 dark:bg-black/90 hover:bg-slate-200/80',
          borderClass: 'border-slate-300 dark:border-slate-700 border-l-4 border-l-slate-500',
          badgeClass: 'bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
          badgeText: 'Compromisso',
          textTitle: 'text-slate-900 dark:text-white',
          textSub: 'text-slate-600 dark:text-slate-400'
        };
      }

      if (app.type === 'TAREFA') {
        return {
          bgClass: 'bg-purple-500/10 dark:bg-purple-500/20 hover:bg-purple-500/15',
          borderClass: 'border-purple-500/30 border-l-4 border-l-purple-500',
          badgeClass: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30',
          badgeText: app.label || 'Tarefa',
          textTitle: 'text-purple-950 dark:text-purple-100',
          textSub: 'text-purple-700 dark:text-purple-300'
        };
      }

      // Status das Consultas
      if (statusUpper === 'CONFIRMED' || statusUpper === 'CONFIRMADO') {
        return {
          bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20 hover:bg-emerald-500/15',
          borderClass: 'border-emerald-500/30 border-l-4 border-l-emerald-500',
          badgeClass: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40',
          badgeText: 'CONFIRMADO',
          nextStatus: 'EM_ATENDIMENTO',
          textTitle: 'text-emerald-950 dark:text-emerald-100',
          textSub: 'text-emerald-700 dark:text-emerald-300'
        };
      }

      if (statusUpper === 'COMPLETED' || statusUpper === 'CONCLUIDO' || statusUpper === 'ATENDIDO') {
        return {
          bgClass: 'bg-violet-500/10 dark:bg-violet-500/20 hover:bg-violet-500/15',
          borderClass: 'border-violet-500/30 border-l-4 border-l-violet-500',
          badgeClass: 'bg-violet-500/20 hover:bg-violet-500/30 text-violet-700 dark:text-violet-300 border border-violet-500/40',
          badgeText: 'CONCLUÍDO',
          nextStatus: 'PENDING',
          textTitle: 'text-violet-950 dark:text-violet-100',
          textSub: 'text-violet-700 dark:text-violet-300'
        };
      }

      if (statusUpper === 'CANCELLED' || statusUpper === 'CANCELADO') {
        return {
          bgClass: 'bg-rose-500/10 dark:bg-rose-500/20 hover:bg-rose-500/15',
          borderClass: 'border-rose-500/30 border-l-4 border-l-rose-500',
          badgeClass: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-500/40',
          badgeText: 'CANCELADO',
          nextStatus: 'PENDING',
          textTitle: 'text-rose-950 dark:text-rose-100',
          textSub: 'text-rose-700 dark:text-rose-300'
        };
      }

      if (statusUpper === 'EM_ATENDIMENTO' || statusUpper === 'EM ATENDIMENTO') {
        return {
          bgClass: 'bg-amber-500/10 dark:bg-amber-500/20 hover:bg-amber-500/15',
          borderClass: 'border-amber-500/30 border-l-4 border-l-amber-500',
          badgeClass: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40',
          badgeText: 'EM ATENDIMENTO',
          nextStatus: 'COMPLETED',
          textTitle: 'text-amber-950 dark:text-amber-100',
          textSub: 'text-amber-700 dark:text-amber-300'
        };
      }

      // PENDING / Agendado / Pendente
      return {
        bgClass: 'bg-blue-500/10 dark:bg-blue-500/20 hover:bg-blue-500/15',
        borderClass: 'border-blue-500/30 border-l-4 border-l-blue-500',
        badgeClass: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 border border-blue-500/40',
        badgeText: 'PENDENTE',
        nextStatus: 'CONFIRMED',
        textTitle: 'text-blue-950 dark:text-blue-100',
        textSub: 'text-blue-700 dark:text-blue-300'
      };
    };

    if (app.type === 'TAREFA') {
      const isCompleted = app.status === 'COMPLETED';
      const styleInfo = getCardStyleInfo();

      return (
        <div
          key={app.id}
          draggable
          onDragStart={(e) => handleDragStart(e, app.id)}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedApp(app);
          }}
          className={`rounded-2xl border text-left flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 hover:shadow-md ${styleInfo.bgClass} ${styleInfo.borderClass} ${
            isCompact ? 'w-full max-h-[85px] text-[10px] p-2' : 'h-full max-h-[100px] min-w-[210px] w-64 text-[10px] p-2.5'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1 overflow-hidden">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <CheckSquare className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <h4 className={`font-extrabold truncate text-[11px] ${styleInfo.textTitle} ${isCompleted ? 'line-through opacity-70' : ''}`}>
                  {app.title || 'Tarefa'}
                </h4>
              </div>
              <span className={`px-1.5 py-0.5 rounded-md text-[7.5px] font-black uppercase tracking-wider shrink-0 ${styleInfo.badgeClass}`}>
                {app.label || 'Tarefa'}
              </span>
            </div>

            {app.observations && (
              <p className={`text-[9px] truncate font-medium pl-0.5 ${styleInfo.textSub}`}>
                {app.observations}
              </p>
            )}

            {pat && (
              <p className="text-[8.5px] truncate font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-md inline-block">
                👤 {pat.name}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center text-[8.5px] font-bold pt-1 border-t border-purple-500/20 mt-1">
            <span className={`flex items-center gap-1 text-[8px] ${styleInfo.textSub}`}>
              <Clock className="w-2.5 h-2.5" />
              {new Date(app.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(app.id, isCompleted ? 'PENDING' : 'COMPLETED');
              }}
              className={`px-2 py-0.5 rounded-md text-[7.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30'
              }`}
            >
              {isCompleted ? '✓ Concluída' : '○ Marcar Concluída'}
            </button>
          </div>
        </div>
      );
    }

    const styleInfo = getCardStyleInfo();

    return (
      <div
        key={app.id}
        draggable
        onDragStart={(e) => handleDragStart(e, app.id)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedApp(app);
        }}
        className={`rounded-2xl border text-left flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 hover:shadow-md ${styleInfo.bgClass} ${styleInfo.borderClass} ${
          isCompact ? 'w-full max-h-[85px] text-[10px] p-2' : 'h-full max-h-[100px] min-w-[210px] w-64 text-[10px] p-2.5'
        }`}
      >
        <div className="space-y-1">
          {/* Header com Foto de Perfil + Nome do Paciente (Nome Único) */}
          <div className="flex items-center gap-2 overflow-hidden">
            {isConsulta && (
              <div className="w-6 h-6 min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px] rounded-full overflow-hidden bg-slate-200 dark:bg-white/5 shrink-0 border border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-2xs">
                <img src={patPhoto} alt={patName} className="w-full h-full object-cover rounded-full shrink-0" />
              </div>
            )}
            <h4 className={`font-extrabold truncate leading-tight flex-1 text-[11px] ${styleInfo.textTitle}`}>
              {isConsulta ? patName : app.title}
            </h4>
          </div>

          {/* Subtítulo / Procedimento */}
          <p className={`text-[9.5px] truncate font-semibold pl-0.5 ${styleInfo.textSub}`}>
            {isConsulta ? (app.procedureName || 'Consulta Geral') : (app.type === 'TAREFA' ? `Tarefa: ${app.observations}` : 'Compromisso')}
          </p>

          {/* Doutor Atendente */}
          {docName && (
            <p className={`text-[8.5px] truncate font-medium flex items-center gap-1 pl-0.5 ${styleInfo.textSub}`}>
              <User className="w-2.5 h-2.5 shrink-0 inline opacity-90" />
              <span className="truncate">{docName}</span>
            </p>
          )}
        </div>

        {/* Rodapé: Cadeira Exibida Completa & Pílula de Troca Rápida de Status (1 Clique) */}
        <div className="flex justify-between items-center text-[8.5px] font-bold pt-1 border-t border-slate-200/50 dark:border-white/10 mt-1 gap-1">
          <span className={`flex items-center gap-1 shrink-0 ${styleInfo.textSub}`} title={chairName}>
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span className="font-extrabold text-[9px] whitespace-nowrap">{formattedChairName}</span>
          </span>

          {/* Pílula com Troca Rápida de Status em 1 Clique (Pendente -> Confirmado -> Em Atendimento -> Concluído) */}
          <button
            type="button"
            title={`Clique para avançar status para: ${styleInfo.nextStatus || 'Agendado'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (styleInfo.nextStatus) {
                handleStatusChange(app.id, styleInfo.nextStatus);
              }
            }}
            className={`px-1.5 py-0.5 rounded-md text-[7.5px] font-black uppercase tracking-wider shrink-0 transition-transform active:scale-95 cursor-pointer shadow-2xs ${styleInfo.badgeClass}`}
          >
            {styleInfo.badgeText}
          </button>
        </div>
      </div>
    );
  };

  // ==========================================
  // ESTADOS DOS FORMULÁRIOS
  // ==========================================

  // 1. Aba Consulta
  const [appPatientId, setAppPatientId] = useState('');
  const [appProcedureId, setAppProcedureId] = useState('');
  const [appDate, setAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [appTime, setAppTime] = useState('09:00');
  const [appChairId, setAppChairId] = useState('');
  const [appDoctorId, setAppDoctorId] = useState('');
  const [appDuration, setAppDuration] = useState(30);
  const [appObservations, setAppObservations] = useState('');
  const [appSendConfirmation, setAppSendConfirmation] = useState(true);
  const [appReturnDays, setAppReturnDays] = useState('');
  const [appLabel, setAppLabel] = useState('Agendada');

  // Paciente Autocomplete
  const [patientSearch, setPatientSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showQuickPatientForm, setShowQuickPatientForm] = useState(false);
  const [quickPatientName, setQuickPatientName] = useState('');
  const [quickPatientPhone, setQuickPatientPhone] = useState('');

  // 2. Aba Compromisso
  const [compDoctorId, setCompDoctorId] = useState('');
  const [compTitle, setCompTitle] = useState('');
  const [compStartDate, setCompStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [compStartTime, setCompStartTime] = useState('08:00');
  const [compEndDate, setCompEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [compEndTime, setCompEndTime] = useState('08:30');
  const [compIsRecurring, setCompIsRecurring] = useState(false);

  // 3. Aba Tarefa
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDueTime, setTaskDueTime] = useState('08:15');
  const [taskList, setTaskList] = useState('Entrada');
  const [taskPatientId, setTaskPatientId] = useState('');
  const [taskPatientSearch, setTaskPatientSearch] = useState('');
  const [showTaskPatientSuggestions, setShowTaskPatientSuggestions] = useState(false);
  const [taskSendReminder, setTaskSendReminder] = useState(true);

  // Inicializar IDs padrões no modal ao abrir
  useEffect(() => {
    if (showAddApp) {
      Promise.resolve().then(() => {
        if (chairs && chairs.length > 0 && !appChairId) {
          setAppChairId(chairs[0].id);
        }
        if (dentists && dentists.length > 0 && !appDoctorId) {
          setAppDoctorId(dentists[0].id);
          setCompDoctorId(dentists[0].id);
        }
      });
    }
  }, [showAddApp, chairs, dentists, appChairId, appDoctorId]);

  // Filtro de consultas
  const filteredApps = appointments.filter(app => {
    const matchesDentist = selectedDentists.length > 0 ? selectedDentists.includes(app.doctor_id) : true;
    const matchesChair = selectedChairs.length > 0
      ? (selectedChairs.includes(app.chair_id) || selectedChairs.includes(app.room))
      : true;
    return matchesDentist && matchesChair;
  });

  // Slots de Horários (07:00 às 18:00)
  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const formatTimeLabel = (timeStr) => {
    const hour = timeStr.split(':')[0];
    return `${hour}h`;
  };

  const renderCellSubSlots = (date, timeStr, onClickExtra = () => { }) => {
    const hour = timeStr.split(':')[0];
    return (
      <div className="absolute inset-0 flex flex-col pointer-events-auto z-0">
        {/* Top half (00 min) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setAppDate(date.toISOString().split('T')[0]);
            setAppTime(`${hour}:00`);
            onClickExtra();
            setActiveModalTab('consulta');
            setShowAddApp(true);
          }}
          className="h-1/2 w-full relative group/sub cursor-pointer"
        >
          <div className="absolute inset-x-2 top-1 bottom-0.5 border border-sky-500/20 bg-sky-500/5 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg flex items-center px-3 text-[10px] font-bold opacity-0 group-hover/sub:opacity-100 transition-opacity pointer-events-none">
            {hour}:00
          </div>
        </div>
        {/* Bottom half (30 min) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setAppDate(date.toISOString().split('T')[0]);
            setAppTime(`${hour}:30`);
            onClickExtra();
            setActiveModalTab('consulta');
            setShowAddApp(true);
          }}
          className="h-1/2 w-full relative group/sub cursor-pointer"
        >
          <div className="absolute inset-x-2 top-0.5 bottom-1 border border-sky-500/20 bg-sky-500/5 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg flex items-center px-3 text-[10px] font-bold opacity-0 group-hover/sub:opacity-100 transition-opacity pointer-events-none">
            {hour}:30
          </div>
        </div>
      </div>
    );
  };

  // Obter dias da semana corrente
  const getWeekDates = (date) => {
    const dates = [];
    const temp = new Date(date);
    const day = temp.getDay();
    temp.setDate(temp.getDate() - day); // Mover para domingo da semana corrente

    for (let i = 0; i < 7; i++) {
      dates.push(new Date(temp));
      temp.setDate(temp.getDate() + 1);
    }
    return dates;
  };

  // Parser seguro para garantir um objeto Date válido independente do tipo de entrada
  const parseDate = (d) => {
    if (!d) return new Date();
    if (d instanceof Date) return isNaN(d.getTime()) ? new Date() : d;
    if (typeof d === 'string') {
      const parts = d.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  };

  const activeDate = parseDate(currentDate);
  const weekDates = getWeekDates(activeDate);

  const activeDateIsoStr = activeDate.toISOString().split('T')[0];

  const activeDayHolidays = (holidays || []).filter(h => {
    if (h.date !== activeDateIsoStr) return false;
    if (h.type === 'CLINIC') return true;
    if (h.type === 'DENTIST' && selectedDentists && selectedDentists.length > 0) {
      return selectedDentists.includes(h.dentist_id);
    }
    return true;
  });

  const isTimeSlotInactive = (timeStr, dateObj) => {
    const targetDate = dateObj ? parseDate(dateObj) : activeDate;
    const dayOfWeek = targetDate.getDay();
    const clinicWorkDays = clinicHours?.workDays || [1, 2, 3, 4, 5, 6];

    if (!clinicWorkDays.includes(dayOfWeek)) return true;

    const [hStr] = timeStr.split(':');
    const hour = parseInt(hStr, 10);
    const startHour = parseInt((clinicHours?.start || '08:00').split(':')[0], 10);
    const endHour = parseInt((clinicHours?.end || '18:00').split(':')[0], 10);

    if (hour < startHour || hour >= endHour) return true;

    // Checar Pausa de Almoço da clínica
    if (clinicHours?.hasLunchBreak !== false) {
      const lStart = parseInt((clinicHours?.lunchStart || '12:00').split(':')[0], 10);
      const lEnd = parseInt((clinicHours?.lunchEnd || '14:00').split(':')[0], 10);
      if (hour >= lStart && hour < lEnd) return true;
    }

    if (selectedDentists && selectedDentists.length === 1) {
      const docId = selectedDentists[0];
      const sched = dentistSchedules?.[docId];
      if (sched) {
        if (!sched.workDays?.[dayOfWeek]) return true;
        const docStartHour = parseInt((sched.start || '08:00').split(':')[0], 10);
        const docEndHour = parseInt((sched.end || '18:00').split(':')[0], 10);
        if (hour < docStartHour || hour >= docEndHour) return true;
      }
    }

    return false;
  };

  const navigateDate = (direction) => {
    const temp = new Date(activeDate);
    if (view === 'day' || view === 'chair') {
      temp.setDate(temp.getDate() + direction);
    } else if (view === 'week') {
      temp.setDate(temp.getDate() + (direction * 7));
    } else if (view === 'month') {
      temp.setMonth(temp.getMonth() + direction);
    }
    setCurrentDate(temp);
  };

  // Abrir o formulário de agendamento em modo de edição
  const handleStartEditApp = (app) => {
    setEditingApp(app);
    setSelectedApp(null); // fecha o popover de detalhes

    // Configura a aba do modal baseada no tipo do agendamento
    if (app.type === 'CONSULTA') {
      setActiveModalTab('consulta');
      setAppPatientId(app.patient_id || '');
      const pat = patients.find(p => p.id === app.patient_id);
      setPatientSearch(pat ? pat.name : (app.patientName || ''));
      setAppProcedureId(app.procedure_id || '');

      const startDate = new Date(app.start_time);
      const tzOffset = startDate.getTimezoneOffset() * 60000;
      const localStart = new Date(startDate.getTime() - tzOffset);
      const isoStart = localStart.toISOString();
      const [startDateStr, startTimeStr] = isoStart.split('T');
      setAppDate(startDateStr || '');
      setAppTime((startTimeStr || '09:00:00').substring(0, 5));
      setAppChairId(app.chair_id || '');
      setAppDoctorId(app.doctor_id || '');
      setAppDuration(app.duration || 30);
      setAppObservations(app.observations || '');
      setAppSendConfirmation(app.send_confirmation !== false);
      setAppReturnDays(app.return_days ? String(app.return_days) : '');
      setAppLabel(app.label || 'Agendada');

    } else if (app.type === 'COMPROMISSO') {
      setActiveModalTab('compromisso');
      setCompDoctorId(app.doctor_id || '');
      setCompTitle(app.title || '');
      const start = new Date(app.start_time);
      const end = new Date(app.end_time);
      const tzOffset = start.getTimezoneOffset() * 60000;
      const localStart = new Date(start.getTime() - tzOffset);
      const localEnd = new Date(end.getTime() - tzOffset);
      const [compStartD, compStartT] = localStart.toISOString().split('T');
      const [compEndD, compEndT] = localEnd.toISOString().split('T');
      setCompStartDate(compStartD || '');
      setCompStartTime((compStartT || '09:00:00').substring(0, 5));
      setCompEndDate(compEndD || '');
      setCompEndTime((compEndT || '09:00:00').substring(0, 5));
      setCompIsRecurring(app.is_recurring || false);

    } else if (app.type === 'TAREFA') {
      setActiveModalTab('tarefa');
      setTaskTitle(app.title || '');
      setTaskDescription(app.observations || '');
      const start = new Date(app.start_time);
      const tzOffset = start.getTimezoneOffset() * 60000;
      const localStart = new Date(start.getTime() - tzOffset);
      const [taskD, taskT] = localStart.toISOString().split('T');
      setTaskDueDate(taskD || '');
      setTaskDueTime((taskT || '09:00:00').substring(0, 5));
      setTaskList(app.label || 'Entrada');
      setTaskPatientId(app.patient_id || '');
      const pat = patients.find(p => p.id === app.patient_id);
      setTaskPatientSearch(pat ? pat.name : '');
    }

    setShowAddApp(true);
  };

  // Submissão do novo agendamento
  const handleAddAppSubmit = async (e) => {
    e.preventDefault();

    if (activeModalTab === 'consulta') {
      let targetPatientId = appPatientId;

      // Se o usuário digitou o nome do paciente sem clicar na sugestão da lista, busca automaticamente pelo nome
      if (!targetPatientId && patientSearch) {
        const matchedByName = patients.find(p =>
          p.name.toLowerCase().trim() === patientSearch.toLowerCase().trim() ||
          p.name.toLowerCase().includes(patientSearch.toLowerCase().trim())
        );
        if (matchedByName) {
          targetPatientId = matchedByName.id;
          setAppPatientId(matchedByName.id);
        }
      }

      if (!targetPatientId) {
        alert('⚠️ ATENÇÃO: Por favor, selecione um paciente na lista de sugestões ou clique em "+ Cadastrar" para adicionar um novo paciente.');
        return;
      }

      if (!appProcedureId) {
        alert('⚠️ ATENÇÃO: Por favor, selecione o procedimento da consulta.');
        return;
      }

      const matchedPat = patients.find(p => p.id === targetPatientId);
      const matchedProc = procedures.find(p => p.id === appProcedureId);
      const matchedChair = chairs.find(c => c.id === appChairId);

      // RN-001 de Contas a Receber: Bloqueio de Prontuário por Inadimplência
      // Apenas bloquear se for um novo agendamento ou se o paciente tiver sido alterado durante a edição
      const shouldCheckInadimplente = !editingApp || editingApp.patient_id !== targetPatientId;
      if (shouldCheckInadimplente && checkPatientInadimplente(targetPatientId)) {
        const isEmergency = matchedProc?.name?.toLowerCase().includes('urgência') ||
          matchedProc?.name?.toLowerCase().includes('canal') ||
          matchedProc?.name?.toLowerCase().includes('dor');

        if (!isEmergency) {
          alert(`❌ AGENDAMENTO BLOQUEADO!\n\nO paciente ${matchedPat?.name} está INADIMPLENTE (parcelas vencidas há mais de 30 dias). Agendamentos eletivos (como "${matchedProc?.name}") estão bloqueados. Por favor, direcione o paciente ao setor financeiro.`);
          return;
        } else {
          const confirmEmergency = window.confirm(`⚠️ AVISO DE INADIMPLÊNCIA\n\nO paciente ${matchedPat?.name} está inadimplente, mas o procedimento solicitado é emergencial ("${matchedProc?.name}"). Deseja autorizar o agendamento de urgência?`);
          if (!confirmEmergency) return;
        }
      }

      const start = new Date(`${appDate}T${appTime}:00`);
      const end = new Date(start.getTime() + appDuration * 60 * 1000);

      const appData = {
        patient_id: targetPatientId,
        patientName: matchedPat?.name || 'Paciente Novo',
        patientPhone: matchedPat?.phone || '',
        procedure_id: appProcedureId,
        procedureName: matchedProc?.name || 'Procedimento',
        color: matchedProc?.color || '#3b82f6',
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        chair_id: appChairId,
        room: matchedChair ? matchedChair.name : 'Cadeira',
        doctor_id: appDoctorId,
        duration: appDuration,
        observations: appObservations,
        send_confirmation: appSendConfirmation,
        return_days: appReturnDays ? parseInt(appReturnDays) : null,
        label: appLabel,
        type: 'CONSULTA'
      };

      if (editingApp) {
        await updateAppointment({
          ...editingApp,
          ...appData
        });
        alert('Agendamento atualizado com sucesso!');
      } else {
        await addAppointment({
          ...appData,
          status: 'PENDING'
        });
        alert('Agendamento cadastrado com sucesso!');
      }

      // Limpar formulário
      setAppPatientId('');
      setAppProcedureId('');
      setPatientSearch('');
      setAppObservations('');
      setAppReturnDays('');

    } else if (activeModalTab === 'compromisso') {
      if (!compTitle) return;

      const start = new Date(`${compStartDate}T${compStartTime}:00`);
      const end = new Date(`${compEndDate}T${compEndTime}:00`);

      const compData = {
        title: compTitle,
        doctor_id: compDoctorId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        type: 'COMPROMISSO',
        is_recurring: compIsRecurring
      };

      if (editingApp) {
        await updateAppointment({
          ...editingApp,
          ...compData
        });
        alert('Compromisso atualizado com sucesso!');
      } else {
        await addAppointment({
          ...compData,
          status: 'CONFIRMED'
        });
        alert('Compromisso cadastrado com sucesso!');
      }

      setCompTitle('');
      setCompIsRecurring(false);

    } else if (activeModalTab === 'tarefa') {
      if (!taskTitle) return;

      const start = new Date(`${taskDueDate}T${taskDueTime}:00`);
      const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min padrão

      const taskData = {
        title: taskTitle,
        observations: taskDescription,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        patient_id: taskPatientId || null,
        label: taskList,
        send_reminder: taskSendReminder,
        type: 'TAREFA'
      };

      if (editingApp) {
        await updateAppointment({
          ...editingApp,
          ...taskData
        });
        alert('Tarefa atualizada com sucesso!');
      } else {
        await addAppointment({
          ...taskData,
          status: 'PENDING'
        });

        if (taskSendReminder) {
          const pat = taskPatientId ? patients.find(p => p.id === taskPatientId) : null;
          if (pat && pat.phone) {
            alert(`✅ Tarefa criada com sucesso!\n\n🔔 Lembrete agendado para o sistema e notificação via WhatsApp para ${pat.name} (${pat.phone}) no dia ${taskDueDate} às ${taskDueTime}.`);
          } else {
            alert(`✅ Tarefa criada com sucesso!\n\n🔔 Notificação de lembrete agendada no sistema para ${taskDueDate} às ${taskDueTime}.`);
          }
        } else {
          alert('Tarefa criada com sucesso!');
        }
      }

      setTaskTitle('');
      setTaskDescription('');
      setTaskPatientId('');
      setTaskPatientSearch('');
    }

    setEditingApp(null);
    setShowAddApp(false);
  };

  // Cadastro de paciente rápido
  const handleQuickPatientSave = async (e) => {
    e.preventDefault();
    if (!quickPatientName || !quickPatientPhone) return;

    try {
      const newPat = await addPatient({
        name: quickPatientName,
        phone: quickPatientPhone
      });

      if (newPat) {
        setAppPatientId(newPat.id);
        setPatientSearch(newPat.name);
        setShowQuickPatientForm(false);
        setQuickPatientName('');
        setQuickPatientPhone('');
      }
    } catch (err) {
      console.error('Erro ao cadastrar paciente rápido:', err);
      alert('Não foi possível cadastrar o paciente. Tente novamente.');
    }
  };

  // Drag and Drop
  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('text/plain', appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, slotTime, slotDate, chairId = null) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain');
    const app = appointments.find(a => a.id === appId);

    if (app) {
      const year = slotDate.getFullYear();
      const month = String(slotDate.getMonth() + 1).padStart(2, '0');
      const day = String(slotDate.getDate()).padStart(2, '0');

      const newStart = new Date(`${year}-${month}-${day}T${slotTime}:00`);
      const durationMin = app.duration || 60;
      const newEnd = new Date(newStart.getTime() + durationMin * 60 * 1000);

      const matchedChair = chairId ? chairs.find(c => c.id === chairId) : null;
      const targetChairId = chairId || app.chair_id || app.chairId;

      const updated = {
        ...app,
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
        chair_id: targetChairId,
        chairId: targetChairId,
        room: matchedChair ? matchedChair.name : (app.room || 'Cadeira')
      };
      updateAppointment(updated);
    }
  };

  const handleStatusChange = (appId, newStatus) => {
    const app = appointments.find(a => a.id === appId);
    if (app) {
      if (newStatus === 'CANCELLED') {
        const confirmCancel = window.confirm(`⚠️ Tem certeza de que deseja CANCELAR a consulta de ${app.patientName}?`);
        if (!confirmCancel) return;
      }
      updateAppointment({ ...app, status: newStatus });
      setSelectedApp(null);
      if (selectedAppointment) {
        setSelectedAppointment(null);
      }
    }
  };

  // Confirmar WhatsApp
  const handleConfirmWhatsapp = (app) => {
    handleStatusChange(app.id, 'CONFIRMED');
    alert(`Mensagem de confirmação enviada para o WhatsApp do paciente ${app.patientName}!`);
  };

  // Duplicar agendamento
  const handleDuplicateApp = async (app) => {
    const start = new Date(app.start_time);
    const end = new Date(app.end_time);

    // Avança 1 dia para simular a duplicação
    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() + 1);

    await addAppointment({
      ...app,
      id: undefined,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      created_at: undefined
    });
    alert('Agendamento duplicado para o próximo dia útil com sucesso!');
    setSelectedApp(null);
  };

  // Navegar para prontuário
  const handleOpenPatientRecord = (patientId) => {
    const pat = patients.find(p => p.id === patientId);
    if (pat) {
      setSelectedPatient(pat);
      setActiveTab('pacientes');
    }
    setSelectedApp(null);
    if (selectedAppointment) {
      setSelectedAppointment(null);
    }
  };

  // Filtrar pacientes autocomplete
  const filteredPatients = patients.filter(p => {
    const term = normalizeString(patientSearch);
    if (!term) return true;
    return normalizeString(p.name).includes(term) || (p.phone && p.phone.includes(term)) || (p.cpf && p.cpf.includes(term));
  });

  const filteredTaskPatients = patients.filter(p => {
    const term = normalizeString(taskPatientSearch);
    if (!term) return true;
    return normalizeString(p.name).includes(term) || (p.phone && p.phone.includes(term));
  });

  return (
    <div className="h-full flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">

      {/* ========================================================================= */}
      {/* PAINEL UNIFICADO DA AGENDA (CONTROLES + GRADE DE HORÁRIOS)                */}
      {/* ========================================================================= */}
      <div className="flex-1 bg-white dark:bg-[#0D0D0D] overflow-hidden flex flex-col transition-colors duration-300">

        {/* CONTROLES SUPERIORES (BARRA DE NAVEGAÇÃO DA AGENDA) */}
        <div className="min-h-[56px] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 bg-white dark:bg-[#0D0D0D] px-3 sm:px-6 py-2 sm:py-0 border-b border-slate-200/80 dark:border-white/5 flex-shrink-0 transition-colors duration-300">

          {/* Date Navigator */}
          <div className="flex items-center gap-3">
            <CalIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 hidden sm:block" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateDate(-1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white w-44 text-center font-title">
                {(view === 'day' || view === 'chair') && activeDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                {view === 'week' && `Semana de ${weekDates[0].toLocaleDateString('pt-BR', { day: 'numeric' })} a ${weekDates[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`}
                {view === 'month' && activeDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => navigateDate(1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Toggle */}
            <div className="bg-slate-100 dark:bg-[#0D0D0D] p-1 rounded-xl flex border border-slate-200/80 dark:border-white/5">
              {['day', 'week', 'month', 'chair'].map(v => {
                if (window.innerWidth < 640 && (v === 'week' || v === 'chair')) return null;
                return (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${view === v
                        ? 'bg-white dark:bg-[#196BFB] text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                  >
                    {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : v === 'month' ? 'Mês' : 'Cadeira'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveModalTab('consulta');
                setShowAddApp(true);
              }}
              className="w-full sm:w-auto px-4 py-2 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98] hover:opacity-95 flex items-center justify-center gap-1.5 border border-white/10"
              style={{ backgroundColor: currentTheme.secondary_color }}
            >
              <Plus className="w-4 h-4" />
              Agendar
            </button>
          </div>
        </div>

        {/* BANNER DE FERIADO / FOLGA */}
        {activeDayHolidays.length > 0 && (
          <div className="mx-6 my-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>
                <strong>BLOQUEIO NA AGENDA:</strong> {activeDayHolidays.map(h => `${h.type === 'CLINIC' ? 'Feriado Clínico' : 'Folga Profissional'}: ${h.title}`).join(' | ')}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-[9px] uppercase tracking-wider font-extrabold text-rose-500">
              Agenda Suspensa
            </span>
          </div>
        )}

        {/* VIEW: SEMANA */}
        {view === 'week' && (() => {
          const sundayDate = weekDates.find(d => d.getDay() === 0);
          const hasSundayApps = sundayDate ? filteredApps.some(app => {
            const appStart = new Date(app.start_time);
            return appStart.getDate() === sundayDate.getDate() &&
              appStart.getMonth() === sundayDate.getMonth() &&
              appStart.getFullYear() === sundayDate.getFullYear();
          }) : false;

          const weekGridTemplate = `48px ${hasSundayApps ? 'minmax(140px, 1fr)' : '40px'} repeat(6, minmax(0, 1fr))`;

          return (
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div
                className="grid border-b border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-[#0D0D0D] text-center py-2.5 sticky top-0 z-10 flex-shrink-0 text-slate-600 dark:text-slate-400 font-semibold text-[10px] uppercase tracking-wider transition-all duration-300"
                style={{ gridTemplateColumns: weekGridTemplate }}
              >
                <div className="flex items-center justify-center border-r border-slate-200/80 dark:border-white/5 font-black text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-tight">Horário</div>
                {weekDates.map((date, idx) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSunday = date.getDay() === 0;
                  return (
                    <div key={idx} className={`flex flex-col items-center justify-center transition-all ${isSunday && !hasSundayApps ? 'opacity-35 text-slate-400' : ''} ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                      <span className={`${isSunday && !hasSundayApps ? 'text-[7.5px]' : 'text-[8.5px]'} tracking-wider font-bold uppercase`}>
                        {weekdays[date.getDay()].substring(0, 3)}
                      </span>
                      <span className={`font-extrabold font-title mt-0.5 ${isSunday && !hasSundayApps ? 'text-xs' : 'text-sm'} ${isToday ? 'bg-[#196BFB] text-white w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-sm text-xs' : ''}`}>
                        {date.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex-grow divide-y divide-slate-100 dark:divide-slate-800/80 relative">
                {/* Linha do Tempo em Tempo Real (Indicador de Horário Atual) */}
                {currentTimeTop !== null && (
                  <div
                    className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                    style={{ top: `${currentTimeTop}%` }}
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-md border-2 border-white dark:border-slate-900 -ml-1 shrink-0 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-white animate-ping" />
                    </div>
                    <div className="flex-1 h-[2px] bg-red-500/90 shadow-sm" />
                    <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full shadow-md mr-2 font-mono">
                      {nowTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {timeSlots.map((time, slotIdx) => (
                  <div
                    key={slotIdx}
                    className="grid min-h-[70px]"
                    style={{ gridTemplateColumns: weekGridTemplate }}
                  >
                    <div className="border-r border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 select-none">
                      {formatTimeLabel(time)}
                    </div>

                    {weekDates.map((date, dayIdx) => {
                      const hour = parseInt(time.split(':')[0]);
                      const isSunday = date.getDay() === 0;
                      const isInactive = isTimeSlotInactive(time, date) || (isSunday && !hasSundayApps);
                      const matchedApps = filteredApps.filter(app => {
                        const appStart = new Date(app.start_time);
                        return appStart.getDate() === date.getDate() &&
                          appStart.getMonth() === date.getMonth() &&
                          appStart.getFullYear() === date.getFullYear() &&
                          appStart.getHours() === hour;
                      });

                      return (
                        <div
                          key={dayIdx}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, time, date)}
                          className={`p-1 border-r border-slate-100 dark:border-slate-800/40 relative transition-colors ${isSunday && !hasSundayApps ? 'bg-slate-100/30 dark:bg-black/15' : (isInactive ? 'bg-slate-100/60 dark:bg-black/40' : '')
                            }`}
                        >
                          {matchedApps.length === 0 && renderCellSubSlots(date, time)}
                          {matchedApps.map((app) => renderAgendaCard(app, true))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* VIEW: DIA */}
        {view === 'day' && (
          <div className="flex-grow flex flex-col overflow-y-auto">
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-black/30 text-center py-4 flex-shrink-0 text-slate-600 font-semibold text-xs">
              <h4 className="font-title font-extrabold text-sm text-slate-800 dark:text-white">
                {weekdays[activeDate.getDay()]}
              </h4>
            </div>

            <div className="flex-grow divide-y divide-slate-100 dark:divide-slate-800/80 relative">
              {/* Linha do Tempo em Tempo Real (Indicador de Horário Atual) */}
              {currentTimeTop !== null && (
                <div
                  className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                  style={{ top: `${currentTimeTop}%` }}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-md border-2 border-white dark:border-slate-900 -ml-1 shrink-0 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white animate-ping" />
                  </div>
                  <div className="flex-1 h-[2px] bg-red-500/90 shadow-sm" />
                  <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full shadow-md mr-2 font-mono">
                    {nowTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {timeSlots.map((time, slotIdx) => {
                const hour = parseInt(time.split(':')[0]);
                const dayApps = filteredApps.filter(app => {
                  const appStart = new Date(app.start_time);
                  return appStart.getDate() === activeDate.getDate() &&
                    appStart.getMonth() === activeDate.getMonth() &&
                    appStart.getFullYear() === activeDate.getFullYear() &&
                    appStart.getHours() === hour;
                });

                return (
                  <div key={slotIdx} className="grid grid-cols-12 min-h-[75px] items-stretch">
                    <div className="col-span-2 border-r border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center text-[10px] font-bold text-slate-400 select-none">
                      {formatTimeLabel(time)}
                    </div>

                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, time, currentDate)}
                      className="col-span-10 p-2 relative transition-colors flex gap-2 overflow-x-auto"
                    >
                      {dayApps.length === 0 && renderCellSubSlots(currentDate, time)}
                      {dayApps.map(app => renderAgendaCard(app, false))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW: MÊS */}
        {view === 'month' && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-black/30 text-center py-2.5 text-slate-600 font-bold text-[10px] uppercase tracking-wider flex-shrink-0">
              {weekdays.map((day, idx) => <div key={idx}>{day.substring(0, 3)}</div>)}
            </div>

            <div className="grid grid-cols-7 grid-rows-5 flex-grow divide-x divide-y divide-slate-100 dark:divide-slate-800/80 border-b border-r border-slate-100 dark:border-slate-800/80">
              {(() => {
                const days = [];
                const startMonth = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1);
                const startDay = startMonth.getDay();

                for (let i = 0; i < startDay; i++) {
                  days.push(<div key={`prev-${i}`} className="bg-slate-50/50 dark:bg-black/10 min-h-[90px]" />);
                }

                const totalDays = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0).getDate();
                for (let d = 1; d <= totalDays; d++) {
                  const cellDate = new Date(activeDate.getFullYear(), activeDate.getMonth(), d);
                  const matchedApps = filteredApps.filter(app => {
                    const appStart = new Date(app.start_time);
                    return appStart.getDate() === d && appStart.getMonth() === activeDate.getMonth() && appStart.getFullYear() === activeDate.getFullYear();
                  });

                  days.push(
                    <div
                      key={`curr-${d}`}
                      onClick={() => {
                        setAppDate(cellDate.toISOString().split('T')[0]);
                        setAppTime('09:00');
                        setActiveModalTab('consulta');
                        setShowAddApp(true);
                      }}
                      className="p-1.5 min-h-[90px] hover:bg-slate-50/30 dark:hover:bg-white/10 transition-all text-left flex flex-col justify-between cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-slate-400 select-none block mb-1">
                        {d}
                      </span>

                      <div className="flex-1 overflow-y-auto space-y-1">
                        {matchedApps.slice(0, 3).map(app => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApp(app);
                            }}
                            className={`w-full text-left truncate px-1.5 py-0.5 rounded text-[8px] font-bold leading-tight border transition-all ${
                              app.status === 'CONFIRMED'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                : app.status === 'COMPLETED'
                                  ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30'
                                  : app.status === 'CANCELLED'
                                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30'
                                    : 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30'
                            }`}
                          >
                            {app.type === 'CONSULTA' ? `${app.patientName.split(' ')[0]}: ${app.procedureName}` : app.title}
                          </button>
                        ))}
                        {matchedApps.length > 3 && (
                          <span className="text-[8px] font-extrabold text-violet-500 block text-center">
                            +{matchedApps.length - 3} mais
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return days;
              })()}
            </div>
          </div>
        )}

        {/* VIEW: CADEIRA */}
        {view === 'chair' && (
          <div className="flex-grow flex flex-col overflow-y-auto">
            {/* Headers de Cadeiras */}
            <div className="grid grid-cols-12 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-black/30 text-center py-3 sticky top-0 z-10 flex-shrink-0 text-slate-600 font-semibold text-[10px] uppercase tracking-wider">
              <div className="col-span-2 flex items-center justify-center border-r border-slate-200/50 dark:border-slate-800/50">Horário</div>
              <div className="col-span-10 grid" style={{ gridTemplateColumns: `repeat(${selectedChairs.length > 0 ? selectedChairs.length : (chairs.length || 2)}, minmax(0, 1fr))` }}>
                {(selectedChairs.length > 0 ? chairs.filter(c => selectedChairs.includes(c.id)) : chairs).map((chair, idx) => (
                  <div key={idx} className="flex items-center justify-center text-xs font-bold text-slate-850 dark:text-white border-r last:border-r-0 border-slate-200/45 dark:border-slate-800/55">
                    {chair.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Linhas de Horário por Cadeira */}
            <div className="flex-grow divide-y divide-slate-100 dark:divide-slate-800/80 relative">
              {/* Linha do Tempo em Tempo Real (Indicador de Horário Atual) */}
              {currentTimeTop !== null && (
                <div
                  className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                  style={{ top: `${currentTimeTop}%` }}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-md border-2 border-white dark:border-slate-900 -ml-1 shrink-0 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white animate-ping" />
                  </div>
                  <div className="flex-1 h-[2px] bg-red-500/90 shadow-sm" />
                  <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full shadow-md mr-2 font-mono">
                    {nowTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {timeSlots.map((time, slotIdx) => {
                const hour = parseInt(time.split(':')[0]);
                const activeChairs = selectedChairs.length > 0 ? chairs.filter(c => selectedChairs.includes(c.id)) : chairs;

                return (
                  <div key={slotIdx} className="grid grid-cols-12 min-h-[75px] items-stretch">
                    {/* Time Slot cell */}
                    <div className="col-span-2 border-r border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center text-[10px] font-bold text-slate-400 select-none">
                      {formatTimeLabel(time)}
                    </div>

                    {/* Columns for each chair */}
                    <div className="col-span-10 grid" style={{ gridTemplateColumns: `repeat(${activeChairs.length}, minmax(0, 1fr))` }}>
                      {activeChairs.map((chair, cIdx) => {
                        const chairApps = filteredApps.filter(app => {
                          const appStart = new Date(app.start_time);
                          const matchesDate = appStart.getDate() === activeDate.getDate() &&
                            appStart.getMonth() === activeDate.getMonth() &&
                            appStart.getFullYear() === activeDate.getFullYear();
                          const matchesHour = appStart.getHours() === hour;
                          const matchesChair = app.chair_id === chair.id || app.room === chair.name;
                          return matchesDate && matchesHour && matchesChair;
                        });

                        return (
                          <div
                            key={cIdx}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, time, activeDate, chair.id)}
                            className="p-1 border-r last:border-r-0 border-slate-100 dark:border-slate-800/40 relative transition-colors"
                          >
                            {chairApps.length === 0 && renderCellSubSlots(activeDate, time, () => setAppChairId(chair.id))}
                            {chairApps.map(app => renderAgendaCard(app, true))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* DIÁLOGO: DETALHES DA CONSULTA (POPOVER ESTILO macOS DEPTH UI)             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className="my-auto bg-white dark:bg-[#0D0D0D] rounded-[28px] max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-slate-850 dark:text-white max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              {/* Fechar */}
              <button
                onClick={() => {
                  setSelectedApp(null);
                  if (selectedAppointment) {
                    selectedAppointment(null);
                  }
                }}
                className="absolute right-5 top-5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Corpo */}
              <div className="space-y-5 text-xs text-left">
                {/* Header Paciente / Título */}
                <div className="flex items-center gap-3.5 pr-6">
                  {(() => {
                    const pat = selectedApp.patient_id ? patients.find(p => p.id === selectedApp.patient_id) : null;
                    const photo = pat?.photoUrl || pat?.avatar_url || selectedApp.photoUrl || selectedApp.avatar_url;
                    return (
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md border border-white/20">
                        {photo ? (
                          <img src={photo} alt={selectedApp.patientName} className="w-full h-full object-cover" />
                        ) : (
                          selectedApp.type === 'CONSULTA' ? <User className="w-6 h-6 text-white" /> : (selectedApp.type === 'TAREFA' ? <ClipboardList className="w-6 h-6 text-white" /> : <Lock className="w-6 h-6 text-white" />)
                        )}
                      </div>
                    );
                  })()}
                  <div className="overflow-hidden">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate font-title leading-tight">
                      {selectedApp.type === 'CONSULTA' ? selectedApp.patientName : selectedApp.title}
                    </h3>
                    {selectedApp.type === 'CONSULTA' && (
                      <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                        <span className="font-semibold">{selectedApp.patientPhone || 'Sem telefone'}</span>
                        {selectedApp.patientPhone && (
                          <button
                            onClick={() => handleConfirmWhatsapp(selectedApp)}
                            className="flex items-center gap-1 text-[10px] text-emerald-500 hover:text-emerald-400 font-bold hover:underline transition-colors ml-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Confirmar consulta</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações Rápidas (Apenas se Consulta) */}
                {selectedApp.type === 'CONSULTA' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenPatientRecord(selectedApp.patient_id)}
                      className="py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-850 dark:text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/40 dark:border-white/5 active:scale-[0.98] transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Abrir prontuário
                    </button>
                    <button
                      onClick={() => handleOpenPatientRecord(selectedApp.patient_id)}
                      className="py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-850 dark:text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/40 dark:border-white/5 active:scale-[0.98] transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-violet-500" />
                      Adicionar evolução
                    </button>
                  </div>
                )}

                {/* Botão de Edição */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartEditApp(selectedApp)}
                    className="flex-1 py-2.5 bg-secondary text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(var(--color-secondary),0.3)] hover:opacity-95 active:scale-[0.98] border border-white/10 transition-all text-xs"
                    style={{ backgroundColor: currentTheme.secondary_color }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {selectedApp.type === 'CONSULTA' ? 'Editar agendamento' : 'Editar compromisso'}
                  </button>
                  <button
                    onClick={() => handleDuplicateApp(selectedApp)}
                    className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-white rounded-xl flex items-center justify-center border border-slate-200/30 dark:border-white/5 shadow-sm transition-all"
                    title="Duplicar"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Listagem de Detalhes */}
                <div className="space-y-2.5 bg-slate-50 dark:bg-black/30 p-3 rounded-2xl border border-slate-200/20 dark:border-slate-800/60 text-slate-500 dark:text-slate-400">
                  {/* Profissional / Cadeira */}
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>
                      {selectedApp.type === 'CONSULTA'
                        ? `${dentists.find(d => d.id === selectedApp.doctor_id)?.full_name || 'Profissional'} · ${selectedApp.room || 'Cadeira'}`
                        : `${dentists.find(d => d.id === selectedApp.doctor_id)?.full_name || 'Bloqueio geral'}`
                      }
                    </span>
                  </div>

                  {/* Data */}
                  <div className="flex items-center gap-2">
                    <CalIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="capitalize">
                      {new Date(selectedApp.start_time).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Hora */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>
                      {new Date(selectedApp.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedApp.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      {selectedApp.duration && ` (${selectedApp.duration} min)`}
                    </span>
                  </div>

                  {/* Observação / Descrição */}
                  {selectedApp.observations && (
                    <div className="flex items-start gap-2 pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                      <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{selectedApp.observations}</span>
                    </div>
                  )}
                </div>

                {/* Status Dropdown */}
                {selectedApp.type === 'CONSULTA' && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Status da Consulta</label>
                    <div className="relative">
                      <select
                        value={selectedApp.status}
                        onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-8 text-xs font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-secondary/30 focus:border-secondary cursor-pointer appearance-none"
                      >
                        <option value="PENDING">Agendada</option>
                        <option value="CONFIRMED">Confirmada</option>
                        <option value="COMPLETED">Atendido</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                      <span className={`absolute left-3 top-[11px] w-2.5 h-2.5 rounded-full ${selectedApp.status === 'CONFIRMED'
                          ? 'bg-emerald-500'
                          : selectedApp.status === 'PENDING'
                            ? 'bg-blue-500'
                            : selectedApp.status === 'COMPLETED'
                              ? 'bg-violet-500'
                              : 'bg-red-500'
                        }`} />
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: NOVO AGENDAMENTO MULTI-ABAS (MAC STYLE)                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddApp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="my-auto bg-white dark:bg-[#0D0D0D] rounded-[28px] max-w-md w-full p-5 sm:p-6 shadow-xl dark:shadow-2xl border border-slate-200/80 dark:border-white/10 relative text-slate-800 dark:text-white transition-colors duration-300 max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              {/* Fechar */}
              <button
                onClick={() => {
                  setShowAddApp(false);
                  setShowQuickPatientForm(false);
                  setEditingApp(null);
                }}
                className="absolute right-5 top-5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* TABS DE SELEÇÃO */}
              {!editingApp ? (
                <div className="flex bg-slate-100 dark:bg-black p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/5 mb-5 max-w-xs transition-colors duration-300">
                  {['consulta', 'compromisso', 'tarefa'].map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveModalTab(tab)}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeModalTab === tab
                          ? 'bg-white dark:bg-[#196BFB] text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              ) : (
                <h3 className="text-sm font-black text-slate-800 dark:text-white mb-5 uppercase tracking-wider pl-1 font-title">
                  Editar {editingApp.type === 'CONSULTA' ? 'Consulta' : (editingApp.type === 'COMPROMISSO' ? 'Compromisso' : 'Tarefa')}
                </h3>
              )}

              {/* FORMULÁRIO COM DESIGN CENTRADO NO USUÁRIO (PATIENT-FIRST) */}
              <form onSubmit={handleAddAppSubmit} className="space-y-4 text-left font-body">

                {/* ----------------- ABA: CONSULTA ----------------- */}
                {activeModalTab === 'consulta' && (
                  <>
                    {/* 1. PACIENTE (Foco Principal da Tarefa - Hick's Law) */}
                    <div className="relative">
                      <div className="flex justify-between items-center pl-1 mb-1">
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Paciente *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowQuickPatientForm(!showQuickPatientForm)}
                          className="text-[10px] text-secondary hover:underline font-bold transition-all focus:outline-none focus:ring-1 focus:ring-secondary rounded px-1"
                          style={{ color: currentTheme.secondary_color }}
                          aria-label={showQuickPatientForm ? 'Voltar para busca de paciente' : 'Cadastrar novo paciente rápido'}
                        >
                          {showQuickPatientForm ? '« Buscar paciente' : '+ Cadastrar Novo'}
                        </button>
                      </div>

                      <div ref={autocompleteRef}>
                        {showQuickPatientForm ? (
                          /* Subform Cadastro Rápido com Prevenção de Erro */
                          <div className="p-3.5 bg-slate-100/70 dark:bg-black/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2.5 animate-in fade-in duration-150">
                            <div>
                              <input
                                type="text"
                                required
                                placeholder="Nome completo do paciente..."
                                value={quickPatientName}
                                onChange={(e) => setQuickPatientName(e.target.value)}
                                className="w-full bg-white dark:bg-black text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-secondary"
                                aria-label="Nome completo do paciente"
                              />
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                required
                                maxLength={16}
                                placeholder="Celular (WhatsApp)..."
                                value={quickPatientPhone}
                                onChange={(e) => setQuickPatientPhone(formatPhone(e.target.value))}
                                className="flex-1 bg-white dark:bg-black text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-mono font-semibold focus:outline-none focus:border-secondary"
                                aria-label="WhatsApp do paciente"
                              />
                              <button
                                type="button"
                                onClick={handleQuickPatientSave}
                                className="px-4 py-2 bg-secondary text-white font-bold text-xs rounded-xl shadow active:scale-95 transition-all cursor-pointer"
                                style={{ backgroundColor: currentTheme.secondary_color }}
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Autocomplete ou Badge de Paciente Selecionado */
                          <>
                            {appPatientId ? (
                              <div className="flex items-center justify-between bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl p-2.5 px-3 text-xs">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div className="text-left truncate">
                                    <span className="font-extrabold text-slate-800 dark:text-white block truncate">
                                      {patients.find(p => p.id === appPatientId)?.name || patientSearch}
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                                      {patients.find(p => p.id === appPatientId)?.phone || 'Sem telefone'}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAppPatientId('');
                                    setPatientSearch('');
                                  }}
                                  className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                                  title="Remover paciente selecionado"
                                  aria-label="Remover paciente"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="text"
                                  required
                                  placeholder="Digite para buscar paciente (Nome, Celular, CPF)..."
                                  value={patientSearch}
                                  onChange={(e) => {
                                    setPatientSearch(e.target.value);
                                    setShowSuggestions(true);
                                  }}
                                  onFocus={() => setShowSuggestions(true)}
                                  className="w-full bg-slate-50 dark:bg-black text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/10 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-secondary transition-colors"
                                  aria-label="Buscar paciente"
                                />
                                {showSuggestions && (
                                  <div className="absolute left-0 right-0 top-[65px] bg-white dark:bg-[#0D0D0D] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-48 overflow-y-auto z-40 p-1.5 space-y-0.5 scrollbar-thin">
                                    {filteredPatients.slice(0, 10).map(p => (
                                      <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                          setAppPatientId(p.id);
                                          setPatientSearch(p.name);
                                          setShowSuggestions(false);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-blue-50 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-colors flex items-center justify-between"
                                      >
                                        <span className="font-bold truncate">{p.name}</span>
                                        <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-2">{p.phone}</span>
                                      </button>
                                    ))}
                                    {filteredPatients.length === 0 && (
                                      <div className="p-3 text-center text-xs text-slate-400 flex flex-col gap-1.5 items-center">
                                        <span>Nenhum paciente encontrado</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setQuickPatientName(patientSearch);
                                            setShowQuickPatientForm(true);
                                            setShowSuggestions(false);
                                          }}
                                          className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg transition-all"
                                        >
                                          Cadastrar "{patientSearch}" rápido
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* 2. PROCEDIMENTO (Com auto-preenchimento de Duração) */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">
                        Procedimento *
                      </label>
                      <select
                        required
                        value={appProcedureId}
                        onChange={(e) => {
                          const procId = e.target.value;
                          setAppProcedureId(procId);
                          const selectedProc = procedures.find(p => p.id === procId);
                          if (selectedProc && selectedProc.defaultDuration) {
                            setAppDuration(parseInt(selectedProc.defaultDuration, 10));
                          }
                        }}
                        className="w-full bg-slate-50 dark:bg-black text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/10 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-secondary cursor-pointer"
                        aria-label="Procedimento clínico"
                      >
                        <option value="">-- Selecione o Procedimento --</option>
                        {procedures.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.defaultDuration || 30} min) - R$ {p.price}</option>
                        ))}
                      </select>
                    </div>

                    {/* 3. DENTISTA & CADEIRA (Alinhados Lado a Lado) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">
                          Profissional *
                        </label>
                        <select
                          required
                          value={appDoctorId}
                          onChange={(e) => setAppDoctorId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-secondary cursor-pointer"
                          aria-label="Dentista responsável"
                        >
                          {dentists.map(d => (
                            <option key={d.id} value={d.id}>{d.full_name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">
                          Consultório / Cadeira *
                        </label>
                        <select
                          required
                          value={appChairId}
                          onChange={(e) => setAppChairId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-secondary cursor-pointer"
                          aria-label="Cadeira ou consultório"
                        >
                          {chairs.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 4. DATA, HORÁRIO & DURAÇÃO */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">
                          Data *
                        </label>
                        <input
                          type="date"
                          required
                          value={appDate}
                          onChange={(e) => setAppDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-2 text-xs font-semibold focus:outline-none focus:border-secondary"
                          aria-label="Data da consulta"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">
                          Horário *
                        </label>
                        <input
                          type="time"
                          required
                          value={appTime}
                          onChange={(e) => setAppTime(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-2 text-xs font-semibold focus:outline-none focus:border-secondary"
                          aria-label="Horário de início"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">
                          Duração
                        </label>
                        <select
                          value={appDuration}
                          onChange={(e) => setAppDuration(parseInt(e.target.value, 10))}
                          className="w-full bg-slate-50 dark:bg-black text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/10 rounded-xl py-2 px-2 text-xs font-semibold focus:outline-none focus:border-secondary cursor-pointer"
                          aria-label="Duração em minutos"
                        >
                          <option value="15">15 min</option>
                          <option value="30">30 min</option>
                          <option value="45">45 min</option>
                          <option value="60">1h (60m)</option>
                          <option value="90">1h 30m</option>
                          <option value="120">2h (120m)</option>
                        </select>
                      </div>
                    </div>

                    {/* Observações */}
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Observações</label>
                      <textarea
                        rows={2}
                        placeholder="Adicione observações sobre esta consulta..."
                        value={appObservations}
                        onChange={(e) => setAppObservations(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary resize-none"
                      />
                    </div>

                    {/* Sim/Não WhatsApp & Retorno & Etiqueta */}
                    <div className="grid grid-cols-2 gap-3.5 bg-slate-50 dark:bg-black/15 p-3 rounded-2xl border border-slate-200/20 dark:border-slate-800/50">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5 mb-1.5">Enviar confirmação?</label>
                        <div className="flex gap-4 items-center mt-1">
                          <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <input
                              type="radio"
                              name="sendConfirmation"
                              checked={appSendConfirmation === true}
                              onChange={() => setAppSendConfirmation(true)}
                              className="accent-secondary"
                            />
                            Sim
                          </label>
                          <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <input
                              type="radio"
                              name="sendConfirmation"
                              checked={appSendConfirmation === false}
                              onChange={() => setAppSendConfirmation(false)}
                              className="accent-secondary"
                            />
                            Não
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Retornar em</label>
                        <select
                          value={appReturnDays}
                          onChange={(e) => setAppReturnDays(e.target.value)}
                          className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700/60 rounded-xl py-1.5 px-2 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="">Sem retorno</option>
                          <option value="15">15 dias</option>
                          <option value="30">30 dias</option>
                          <option value="90">90 dias</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Etiqueta</label>
                      <select
                        value={appLabel}
                        onChange={(e) => setAppLabel(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="Agendada">Agendada</option>
                        <option value="Primeira consulta">Primeira consulta</option>
                        <option value="Orçamento">Orçamento</option>
                        <option value="Retorno">Retorno</option>
                      </select>
                    </div>
                  </>
                )}

                {/* ----------------- ABA: COMPROMISSO ----------------- */}
                {activeModalTab === 'compromisso' && (
                  <>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Dentista</label>
                      <select
                        required
                        value={compDoctorId}
                        onChange={(e) => setCompDoctorId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary cursor-pointer"
                      >
                        {dentists.map(d => (
                          <option key={d.id} value={d.id}>{d.full_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Título</label>
                      <input
                        type="text"
                        required
                        placeholder="Dê um título ao compromisso (ex: Reunião, Almoço)..."
                        value={compTitle}
                        onChange={(e) => setCompTitle(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>

                    {/* Data/Hora Início */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Data de início</label>
                        <input
                          type="date"
                          required
                          value={compStartDate}
                          onChange={(e) => setCompStartDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Hora de início</label>
                        <input
                          type="time"
                          required
                          value={compStartTime}
                          onChange={(e) => setCompStartTime(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                    </div>

                    {/* Data/Hora Fim */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Data de término</label>
                        <input
                          type="date"
                          required
                          value={compEndDate}
                          onChange={(e) => setCompEndDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Hora de término</label>
                        <input
                          type="time"
                          required
                          value={compEndTime}
                          onChange={(e) => setCompEndTime(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                    </div>

                    {/* Recorrência */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-black/15 p-3 rounded-2xl border border-slate-200/20 dark:border-slate-800/50">
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={compIsRecurring}
                          onChange={(e) => setCompIsRecurring(e.target.checked)}
                          className="w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary"
                        />
                        Repetir este compromisso
                      </label>
                    </div>
                  </>
                )}

                {/* ----------------- ABA: TAREFA ----------------- */}
                {activeModalTab === 'tarefa' && (
                  <>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Título *</label>
                      <input
                        type="text"
                        required
                        placeholder="Qual tarefa você precisa fazer?"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Descrição</label>
                      <textarea
                        rows={2.5}
                        placeholder="Adicione detalhes sobre a tarefa..."
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary resize-none"
                      />
                    </div>

                    {/* Data/Hora Prazo */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Prazo (Data)</label>
                        <input
                          type="date"
                          required
                          value={taskDueDate}
                          onChange={(e) => setTaskDueDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Prazo (Hora)</label>
                        <input
                          type="time"
                          required
                          value={taskDueTime}
                          onChange={(e) => setTaskDueTime(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                    </div>

                    {/* Lista & Paciente */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Lista</label>
                        <select
                          value={taskList}
                          onChange={(e) => setTaskList(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary cursor-pointer"
                        >
                          <option value="Entrada">Entrada</option>
                          <option value="Hoje">Hoje</option>
                          <option value="Financeiro">Financeiro</option>
                        </select>
                      </div>
                      <div className="relative" ref={taskAutocompleteRef}>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Paciente (Opcional)</label>
                        {taskPatientId ? (
                          <div className="flex items-center justify-between bg-slate-50 dark:bg-black/45 border border-slate-200 dark:border-slate-800 rounded-xl p-2 px-3 text-xs">
                            <div className="flex items-center gap-2 text-left">
                              <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              <span className="font-extrabold text-slate-800 dark:text-white truncate max-w-[120px]">
                                {patients.find(p => p.id === taskPatientId)?.name || taskPatientSearch}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setTaskPatientId('');
                                setTaskPatientSearch('');
                              }}
                              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="text"
                              placeholder="Buscar paciente..."
                              value={taskPatientSearch}
                              onChange={(e) => {
                                setTaskPatientSearch(e.target.value);
                                setShowTaskPatientSuggestions(true);
                              }}
                              onFocus={() => setShowTaskPatientSuggestions(true)}
                              className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-secondary"
                            />
                            {showTaskPatientSuggestions && (
                              <div className="absolute left-0 right-0 top-[65px] bg-white dark:bg-[#0D0D0D] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-40 overflow-y-auto z-40 p-1.5 space-y-0.5">
                                {filteredTaskPatients.slice(0, 8).map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      setTaskPatientId(p.id);
                                      setTaskPatientSearch(p.name);
                                      setShowTaskPatientSuggestions(false);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-colors"
                                  >
                                    {p.name}
                                  </button>
                                ))}
                                {filteredTaskPatients.length === 0 && (
                                  <div className="p-2 text-center text-xs text-slate-600">Nenhum paciente encontrado</div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20">
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none text-purple-600 dark:text-purple-300">
                        <input
                          type="checkbox"
                          checked={taskSendReminder}
                          onChange={(e) => setTaskSendReminder(e.target.checked)}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                        />
                        <span>🔔 Enviar lembrete / notificação no horário agendado</span>
                      </label>
                    </div>
                  </>
                )}

                {/* Alerta de conflito de horários em tempo real */}
                {(() => {
                  if (activeModalTab === 'tarefa') return null;

                  let duration = appDuration;
                  if (activeModalTab === 'compromisso') {
                    try {
                      const start = new Date(`${compStartDate}T${compStartTime}:00`);
                      const end = new Date(`${compEndDate}T${compEndTime}:00`);
                      const diffMs = end - start;
                      duration = diffMs > 0 ? diffMs / (60 * 1000) : 30;
                    } catch (e) {
                      duration = 30;
                    }
                  }

                  const conflict = activeModalTab === 'consulta'
                    ? getSchedulingConflict(appDate, appTime, appDuration, appDoctorId, appChairId)
                    : getSchedulingConflict(compStartDate, compStartTime, duration, compDoctorId, null);

                  if (!conflict) return null;

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex gap-2.5 text-[11px] font-semibold leading-relaxed animate-in fade-in"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold block">Aviso de Conflito de Horário</span>
                        <span>{conflict.message}</span>
                      </div>
                    </motion.div>
                  );
                })()}

                {/* BOTÕES DE SUBMISSÃO */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/85">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddApp(false);
                      setShowQuickPatientForm(false);
                      setEditingApp(null);
                    }}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-secondary text-white font-bold rounded-xl text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5 border border-white/5"
                    style={{ backgroundColor: currentTheme.secondary_color }}
                  >
                    {editingApp ? 'Salvar alterações' : (
                      <>
                        {activeModalTab === 'consulta' && 'Agendar consulta'}
                        {activeModalTab === 'compromisso' && 'Salvar compromisso'}
                        {activeModalTab === 'tarefa' && 'Criar tarefa'}
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

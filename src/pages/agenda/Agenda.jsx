import { useState, useEffect, useRef } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Calendar as CalIcon, ChevronLeft, ChevronRight,
  Clock, MapPin, Check, X, ShieldAlert, ArrowLeftRight,
  Phone, User, Edit, Copy, CheckSquare, AlertCircle, FileText
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
  setSelectedPatient
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
    addPatient
  } = useClinic();
  const { currentTheme } = useTheme();
  const { user } = useAuth();

  // Diálogos
  const [showAddApp, setShowAddApp] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('consulta'); // 'consulta' | 'compromisso' | 'tarefa'

  // Sincronizar com agendamento selecionado da sidebar
  useEffect(() => {
    if (selectedAppointment) {
      setSelectedApp(selectedAppointment);
    }
  }, [selectedAppointment]);

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

  // Inicializar IDs padrões no modal ao abrir
  useEffect(() => {
    if (showAddApp) {
      if (chairs && chairs.length > 0 && !appChairId) {
        setAppChairId(chairs[0].id);
      }
      if (dentists && dentists.length > 0 && !appDoctorId) {
        setAppDoctorId(dentists[0].id);
        setCompDoctorId(dentists[0].id);
      }
    }
  }, [showAddApp, chairs, dentists]);

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
    if (timeStr === '12:00') return 'Meio dia';
    const hour = timeStr.split(':')[0];
    return `${hour}h`;
  };

  const renderCellSubSlots = (date, timeStr, onClickExtra = () => {}) => {
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

  const weekDates = getWeekDates(currentDate || new Date());

  const navigateDate = (direction) => {
    const temp = new Date(currentDate || new Date());
    if (view === 'day' || view === 'chair') {
      temp.setDate(temp.getDate() + direction);
    } else if (view === 'week') {
      temp.setDate(temp.getDate() + (direction * 7));
    } else if (view === 'month') {
      temp.setMonth(temp.getMonth() + direction);
    }
    setCurrentDate(temp);
  };

  // Submissão do novo agendamento
  const handleAddAppSubmit = async (e) => {
    e.preventDefault();

    if (activeModalTab === 'consulta') {
      if (!appPatientId || !appProcedureId) return;

      const matchedPat = patients.find(p => p.id === appPatientId);
      const matchedProc = procedures.find(p => p.id === appProcedureId);
      const matchedChair = chairs.find(c => c.id === appChairId);

      // RN-001 de Contas a Receber: Bloqueio de Prontuário por Inadimplência
      if (checkPatientInadimplente(appPatientId)) {
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

      await addAppointment({
        patient_id: appPatientId,
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
        type: 'CONSULTA',
        status: 'PENDING'
      });

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

      await addAppointment({
        title: compTitle,
        doctor_id: compDoctorId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        type: 'COMPROMISSO',
        is_recurring: compIsRecurring,
        status: 'CONFIRMED' // Blocker já nasce confirmado
      });

      setCompTitle('');
      setCompIsRecurring(false);

    } else if (activeModalTab === 'tarefa') {
      if (!taskTitle) return;

      const start = new Date(`${taskDueDate}T${taskDueTime}:00`);
      const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min padrão

      await addAppointment({
        title: taskTitle,
        observations: taskDescription,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        patient_id: taskPatientId || null,
        label: taskList,
        type: 'TAREFA',
        status: 'PENDING'
      });

      setTaskTitle('');
      setTaskDescription('');
      setTaskPatientId('');
      setTaskPatientSearch('');
    }

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

      const updated = {
        ...app,
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
        chair_id: chairId || app.chair_id,
        room: matchedChair ? matchedChair.name : app.room
      };
      updateAppointment(updated);
    }
  };

  const handleStatusChange = (appId, newStatus) => {
    const app = appointments.find(a => a.id === appId);
    if (app) {
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
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone.includes(patientSearch)
  );

  const filteredTaskPatients = patients.filter(p => 
    p.name.toLowerCase().includes(taskPatientSearch.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden text-slate-800 dark:text-slate-100">
      
      {/* ========================================================================= */}
      {/* CONTROLES SUPERIORES DA GRADE                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/85 backdrop-blur border border-slate-200/40 dark:border-slate-800/80 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex-shrink-0">
        
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <CalIcon className="w-5 h-5 text-violet-500 hidden sm:block" />
          <div className="flex items-center gap-1">
            <button 
              onClick={() => navigateDate(-1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white w-44 text-center font-title">
              {(view === 'day' || view === 'chair') && currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {view === 'week' && `Semana de ${weekDates[0].toLocaleDateString('pt-BR', { day: 'numeric' })} a ${weekDates[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`}
              {view === 'month' && currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              onClick={() => navigateDate(1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex border border-slate-200/30 dark:border-slate-700/30">
            {['day', 'week', 'month', 'chair'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  view === v 
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                    : 'text-slate-555 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : v === 'month' ? 'Mês' : 'Cadeira'}
              </button>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Extensão WhatsApp Button (Mock) */}
          <button
            onClick={() => alert('Extensão instalada e ativa no seu WhatsApp Web!')}
            className="hidden md:flex px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            <span>Extensão para WhatsApp</span>
          </button>

          <button
            onClick={() => {
              setActiveModalTab('consulta');
              setShowAddApp(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98] hover:opacity-95 flex items-center justify-center gap-1.5 border border-white/10"
            style={{ backgroundColor: currentTheme.secondary_color }}
          >
            <Plus className="w-4 h-4" />
            Agendar
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONTEÚDO PRINCIPAL (GRADE DE HORÁRIOS)                                   */}
      {/* ========================================================================= */}
      <div className="flex-1 bg-white/80 dark:bg-slate-900/85 backdrop-blur border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] overflow-hidden flex flex-col">
        
        {/* VIEW: SEMANA */}
        {view === 'week' && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center py-3 sticky top-0 z-10 flex-shrink-0 text-slate-550 font-semibold text-[10px] uppercase tracking-wider">
              <div className="flex items-center justify-center border-r border-slate-200/50 dark:border-slate-800/50">Horário</div>
              {weekDates.map((date, idx) => {
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div key={idx} className={`flex flex-col items-center justify-center ${isToday ? 'text-violet-500' : ''}`}>
                    <span>{weekdays[date.getDay()].substring(0, 3)}</span>
                    <span className={`text-base font-extrabold font-title mt-0.5 ${isToday ? 'bg-violet-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex-grow divide-y divide-slate-100 dark:divide-slate-800/80">
              {timeSlots.map((time, slotIdx) => (
                <div key={slotIdx} className="grid grid-cols-8 min-h-[70px]">
                  <div className="border-r border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center text-[10px] font-bold text-slate-400 select-none">
                    {formatTimeLabel(time)}
                  </div>
                  
                  {weekDates.map((date, dayIdx) => {
                    const hour = parseInt(time.split(':')[0]);
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
                        className="p-1 border-r border-slate-100 dark:border-slate-800/40 relative transition-colors"
                      >
                        {matchedApps.length === 0 && renderCellSubSlots(date, time)}
                        {matchedApps.map((app) => (
                          <div
                            key={app.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, app.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApp(app);
                            }}
                            className="absolute inset-x-1 top-1 bottom-1 rounded-xl border p-2 text-[10px] shadow-sm select-none hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing text-white"
                            style={{ 
                              backgroundColor: app.type === 'COMPROMISSO' ? '#64748b' : (app.type === 'TAREFA' ? '#8b5cf6' : (app.color || '#3b82f6')), 
                              borderColor: 'rgba(255, 255, 255, 0.15)',
                              boxShadow: `0 3px 12px rgba(0,0,0,0.08)`
                            }}
                          >
                            <div>
                              <h4 className="font-extrabold truncate leading-tight">
                                {app.type === 'CONSULTA' ? app.patientName : app.title}
                              </h4>
                              <p className="text-[9px] opacity-80 mt-0.5 truncate">
                                {app.type === 'CONSULTA' ? app.procedureName : (app.type === 'TAREFA' ? `Tarefa: ${app.observations}` : 'Compromisso')}
                              </p>
                            </div>
                            <div className="flex justify-between items-center text-[8px] font-bold opacity-90 mt-1">
                              <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {time}</span>
                              <span className="px-1 rounded bg-white/20">
                                {app.status === 'CONFIRMED' ? '✓' : '?'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: DIA */}
        {view === 'day' && (
          <div className="flex-grow flex flex-col overflow-y-auto">
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center py-4 flex-shrink-0 text-slate-550 font-semibold text-xs">
              <h4 className="font-title font-extrabold text-sm text-slate-800 dark:text-white">
                {weekdays[currentDate.getDay()]}
              </h4>
            </div>

            <div className="flex-grow divide-y divide-slate-100 dark:divide-slate-800/80">
              {timeSlots.map((time, slotIdx) => {
                const hour = parseInt(time.split(':')[0]);
                const dayApps = filteredApps.filter(app => {
                  const appStart = new Date(app.start_time);
                  return appStart.getDate() === currentDate.getDate() && 
                         appStart.getMonth() === currentDate.getMonth() && 
                         appStart.getFullYear() === currentDate.getFullYear() && 
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
                      {dayApps.map(app => (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApp(app);
                          }}
                          className="h-full min-w-[200px] w-64 rounded-xl border p-2.5 text-left flex flex-col justify-between shadow-sm cursor-grab active:cursor-grabbing text-white"
                          style={{ 
                            backgroundColor: app.type === 'COMPROMISSO' ? '#64748b' : (app.type === 'TAREFA' ? '#8b5cf6' : (app.color || '#3b82f6')), 
                            borderColor: 'rgba(255, 255, 255, 0.15)' 
                          }}
                        >
                          <div>
                            <h4 className="font-extrabold text-xs truncate leading-tight">
                              {app.type === 'CONSULTA' ? app.patientName : app.title}
                            </h4>
                            <p className="text-[10px] opacity-80 mt-0.5 truncate">
                              {app.type === 'CONSULTA' ? app.procedureName : (app.type === 'TAREFA' ? `Tarefa: ${app.observations}` : 'Compromisso')}
                            </p>
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-semibold mt-1">
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {app.room || 'Consultório'}</span>
                            <span className="px-1.5 py-0.5 rounded bg-white/25 uppercase font-bold text-[8px]">
                              {app.status === 'CONFIRMED' ? 'Confirmado' : 'Pendente'}
                            </span>
                          </div>
                        </div>
                      ))}
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
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center py-2.5 text-slate-550 font-bold text-[10px] uppercase tracking-wider flex-shrink-0">
              {weekdays.map((day, idx) => <div key={idx}>{day.substring(0, 3)}</div>)}
            </div>

            <div className="grid grid-cols-7 grid-rows-5 flex-grow divide-x divide-y divide-slate-100 dark:divide-slate-800/80 border-b border-r border-slate-100 dark:border-slate-800/80">
              {(() => {
                const days = [];
                const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const startDay = startMonth.getDay();
                
                for (let i = 0; i < startDay; i++) {
                  days.push(<div key={`prev-${i}`} className="bg-slate-50/50 dark:bg-slate-900/10 min-h-[90px]" />);
                }

                const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                for (let d = 1; d <= totalDays; d++) {
                  const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                  const matchedApps = filteredApps.filter(app => {
                    const appStart = new Date(app.start_time);
                    return appStart.getDate() === d && appStart.getMonth() === currentDate.getMonth() && appStart.getFullYear() === currentDate.getFullYear();
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
                      className="p-1.5 min-h-[90px] hover:bg-slate-50/30 dark:hover:bg-slate-800/5 transition-all text-left flex flex-col justify-between cursor-pointer"
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
                            className="w-full text-left truncate px-1.5 py-0.5 rounded text-[8px] text-white font-bold leading-tight"
                            style={{ backgroundColor: app.type === 'COMPROMISSO' ? '#64748b' : (app.type === 'TAREFA' ? '#8b5cf6' : (app.color || '#3b82f6')) }}
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
            <div className="grid grid-cols-12 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center py-3 sticky top-0 z-10 flex-shrink-0 text-slate-550 font-semibold text-[10px] uppercase tracking-wider">
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
            <div className="flex-grow divide-y divide-slate-100 dark:divide-slate-800/80">
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
                          const matchesDate = appStart.getDate() === currentDate.getDate() &&
                                              appStart.getMonth() === currentDate.getMonth() &&
                                              appStart.getFullYear() === currentDate.getFullYear();
                          const matchesHour = appStart.getHours() === hour;
                          const matchesChair = app.chair_id === chair.id || app.room === chair.name;
                          return matchesDate && matchesHour && matchesChair;
                        });

                        return (
                          <div
                            key={cIdx}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, time, currentDate, chair.id)}
                            className="p-1 border-r last:border-r-0 border-slate-100 dark:border-slate-800/40 relative transition-colors"
                          >
                            {chairApps.length === 0 && renderCellSubSlots(currentDate, time, () => setAppChairId(chair.id))}
                            {chairApps.map(app => (
                              <div
                                key={app.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, app.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApp(app);
                                }}
                                className="absolute inset-x-1.5 top-1 bottom-1 rounded-xl border p-2.5 text-[10px] shadow-sm select-none hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing text-white"
                                style={{ 
                                  backgroundColor: app.type === 'COMPROMISSO' ? '#64748b' : (app.type === 'TAREFA' ? '#8b5cf6' : (app.color || '#3b82f6')), 
                                  borderColor: 'rgba(255, 255, 255, 0.15)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              >
                                <div>
                                  <h4 className="font-extrabold truncate leading-tight">
                                    {app.type === 'CONSULTA' ? app.patientName : app.title}
                                  </h4>
                                  <p className="text-[9px] opacity-85 truncate mt-0.5">
                                    {app.type === 'CONSULTA' ? app.procedureName : (app.type === 'TAREFA' ? `Tarefa: ${app.observations}` : 'Compromisso')}
                                  </p>
                                </div>
                                <div className="flex justify-between items-center text-[8px] font-bold opacity-90 mt-1">
                                  <span>{time}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-white/20 font-bold uppercase text-[7px]">
                                    {app.status === 'CONFIRMED' ? 'Confirmado' : 'Pendente'}
                                  </span>
                                </div>
                              </div>
                            ))}
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className="bg-white dark:bg-slate-850 rounded-[28px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-slate-850 dark:text-white"
            >
              {/* Fechar */}
              <button 
                onClick={() => {
                  setSelectedApp(null);
                  if (selectedAppointment) {
                    selectedAppointment(null);
                  }
                }}
                className="absolute right-5 top-5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-250 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Corpo */}
              <div className="space-y-5 text-xs text-left">
                {/* Header Paciente / Título */}
                <div className="flex items-center gap-3.5 pr-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0 text-xl shadow-inner border border-slate-200/30 dark:border-white/5">
                    {selectedApp.type === 'CONSULTA' ? '👤' : (selectedApp.type === 'TAREFA' ? '📋' : '🔒')}
                  </div>
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
                      className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-850 dark:text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/40 dark:border-white/5 active:scale-[0.98] transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Abrir prontuário
                    </button>
                    <button
                      onClick={() => handleOpenPatientRecord(selectedApp.patient_id)}
                      className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-850 dark:text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/40 dark:border-white/5 active:scale-[0.98] transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-violet-500" />
                      Adicionar evolução
                    </button>
                  </div>
                )}

                {/* Botão de Edição */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      alert('Funcionalidade de edição avançada: em breve!');
                      setSelectedApp(null);
                    }}
                    className="flex-1 py-2.5 bg-secondary text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(var(--color-secondary),0.3)] hover:opacity-95 active:scale-[0.98] border border-white/10 transition-all text-xs"
                    style={{ backgroundColor: currentTheme.secondary_color }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {selectedApp.type === 'CONSULTA' ? 'Editar agendamento' : 'Editar compromisso'}
                  </button>
                  <button
                    onClick={() => handleDuplicateApp(selectedApp)}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-white rounded-xl flex items-center justify-center border border-slate-200/30 dark:border-white/5 shadow-sm transition-all"
                    title="Duplicar"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Listagem de Detalhes */}
                <div className="space-y-2.5 bg-slate-50 dark:bg-black/30 p-3 rounded-2xl border border-slate-250/20 dark:border-slate-800/60 text-slate-500 dark:text-slate-400">
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
                        className="w-full bg-slate-50 dark:bg-black/35 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 pl-8 text-xs font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-secondary/30 focus:border-secondary cursor-pointer appearance-none"
                      >
                        <option value="PENDING">Agendada</option>
                        <option value="CONFIRMED">Confirmada</option>
                        <option value="COMPLETED">Atendido</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                      <span className={`absolute left-3 top-[11px] w-2.5 h-2.5 rounded-full ${
                        selectedApp.status === 'CONFIRMED' 
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="bg-white dark:bg-slate-850 rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-slate-855 dark:text-white"
            >
              {/* Fechar */}
              <button 
                onClick={() => {
                  setShowAddApp(false);
                  setShowQuickPatientForm(false);
                }}
                className="absolute right-5 top-5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-250 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* TABS DE SELEÇÃO */}
              <div className="flex bg-slate-100 dark:bg-black/40 p-1.5 rounded-2xl border border-slate-200/30 dark:border-slate-800/80 mb-5 max-w-xs">
                {['consulta', 'compromisso', 'tarefa'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveModalTab(tab)}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      activeModalTab === tab 
                        ? 'bg-white dark:bg-slate-750 text-slate-850 dark:text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* FORMULÁRIO */}
              <form onSubmit={handleAddAppSubmit} className="space-y-4 text-left">
                
                {/* ----------------- ABA: CONSULTA ----------------- */}
                {activeModalTab === 'consulta' && (
                  <>
                    {/* Dentista & Cadeira */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Dentista</label>
                        <select
                          required
                          value={appDoctorId}
                          onChange={(e) => setAppDoctorId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary cursor-pointer"
                        >
                          {dentists.map(d => (
                            <option key={d.id} value={d.id}>{d.full_name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Cadeira</label>
                        <select
                          required
                          value={appChairId}
                          onChange={(e) => setAppChairId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary cursor-pointer"
                        >
                          {chairs.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Paciente (Autocomplete ou Cadastro Rápido) */}
                    <div className="relative">
                      <div className="flex justify-between items-center pl-1 mb-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Paciente</label>
                        <button
                          type="button"
                          onClick={() => setShowQuickPatientForm(!showQuickPatientForm)}
                          className="text-[9px] text-secondary hover:underline font-bold"
                          style={{ color: currentTheme.secondary_color }}
                        >
                          {showQuickPatientForm ? '« Buscar paciente' : '+ Cadastrar'}
                        </button>
                      </div>

                      {showQuickPatientForm ? (
                        /* Subform Cadastro Rápido */
                        <div className="p-3.5 bg-slate-100/50 dark:bg-black/40 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          <div>
                            <input
                              type="text"
                              required
                              placeholder="Nome completo..."
                              value={quickPatientName}
                              onChange={(e) => setQuickPatientName(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Celular (ex: 88999699232)..."
                              value={quickPatientPhone}
                              onChange={(e) => setQuickPatientPhone(e.target.value)}
                              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
                            />
                            <button
                              type="button"
                              onClick={handleQuickPatientSave}
                              className="px-4 py-2 bg-secondary text-white font-bold text-xs rounded-xl shadow border border-white/5 active:scale-95"
                              style={{ backgroundColor: currentTheme.secondary_color }}
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Autocomplete Input */
                        <>
                          <input
                            type="text"
                            required
                            placeholder="Busque por nome, telefone, CPF..."
                            value={patientSearch}
                            onChange={(e) => {
                              setPatientSearch(e.target.value);
                              setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-secondary"
                          />
                          {showSuggestions && patientSearch && (
                            <div className="absolute left-0 right-0 top-[65px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-40 overflow-y-auto z-40 p-1.5 space-y-0.5">
                              {filteredPatients.slice(0, 5).map(p => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setAppPatientId(p.id);
                                    setPatientSearch(p.name);
                                    setShowSuggestions(false);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-colors"
                                >
                                  {p.name} <span className="opacity-60">({p.phone})</span>
                                </button>
                              ))}
                              {filteredPatients.length === 0 && (
                                <div className="p-2 text-center text-xs text-slate-500">Nenhum paciente encontrado</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Procedimento */}
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Procedimento</label>
                      <select
                        required
                        value={appProcedureId}
                        onChange={(e) => setAppProcedureId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary cursor-pointer"
                      >
                        <option value="">Escolher procedimento...</option>
                        {procedures.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - R$ {p.price}</option>
                        ))}
                      </select>
                    </div>

                    {/* Data, Horário e Duração */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Data</label>
                        <input
                          type="date"
                          required
                          value={appDate}
                          onChange={(e) => setAppDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-2 text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Horário</label>
                        <input
                          type="time"
                          required
                          value={appTime}
                          onChange={(e) => setAppTime(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-2 text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center pl-1 mb-1">
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Duração</label>
                          <span className="text-[8px] text-slate-400">min</span>
                        </div>
                        <input
                          type="number"
                          required
                          value={appDuration}
                          onChange={(e) => setAppDuration(parseInt(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-2 text-xs focus:outline-none focus:border-secondary"
                        />
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
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary resize-none"
                      />
                    </div>

                    {/* Sim/Não WhatsApp & Retorno & Etiqueta */}
                    <div className="grid grid-cols-2 gap-3.5 bg-slate-50 dark:bg-black/15 p-3 rounded-2xl border border-slate-250/20 dark:border-slate-800/50">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5 mb-1.5">Enviar confirmação?</label>
                        <div className="flex gap-4 items-center mt-1">
                          <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <input
                              type="radio"
                              checked={appSendConfirmation === true}
                              onChange={() => setAppSendConfirmation(true)}
                              className="accent-secondary"
                            />
                            Sim
                          </label>
                          <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <input
                              type="radio"
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
                          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-1.5 px-2 text-xs focus:outline-none cursor-pointer"
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
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none cursor-pointer"
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
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary cursor-pointer"
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
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-secondary"
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
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Hora de início</label>
                        <input
                          type="time"
                          required
                          value={compStartTime}
                          onChange={(e) => setCompStartTime(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
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
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Hora de término</label>
                        <input
                          type="time"
                          required
                          value={compEndTime}
                          onChange={(e) => setCompEndTime(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                    </div>

                    {/* Recorrência */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-black/15 p-3 rounded-2xl border border-slate-250/20 dark:border-slate-800/50">
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
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Descrição</label>
                      <textarea
                        rows={2.5}
                        placeholder="Adicione detalhes sobre a tarefa..."
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary resize-none"
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
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Prazo (Hora)</label>
                        <input
                          type="time"
                          required
                          value={taskDueTime}
                          onChange={(e) => setTaskDueTime(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary"
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
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-secondary cursor-pointer"
                        >
                          <option value="Entrada">Entrada</option>
                          <option value="Hoje">Hoje</option>
                          <option value="Financeiro">Financeiro</option>
                        </select>
                      </div>
                      <div className="relative">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Paciente (Opcional)</label>
                        <input
                          type="text"
                          placeholder="Buscar paciente..."
                          value={taskPatientSearch}
                          onChange={(e) => {
                            setTaskPatientSearch(e.target.value);
                            setShowTaskPatientSuggestions(true);
                          }}
                          onFocus={() => setShowTaskPatientSuggestions(true)}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-250 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-secondary"
                        />
                        {showTaskPatientSuggestions && taskPatientSearch && (
                          <div className="absolute left-0 right-0 top-[65px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-40 overflow-y-auto z-40 p-1.5 space-y-0.5">
                            {filteredTaskPatients.slice(0, 5).map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setTaskPatientId(p.id);
                                  setTaskPatientSearch(p.name);
                                  setShowTaskPatientSuggestions(false);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-colors"
                              >
                                {p.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* BOTÕES DE SUBMISSÃO */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/85">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddApp(false);
                      setShowQuickPatientForm(false);
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
                    {activeModalTab === 'consulta' && 'Agendar consulta'}
                    {activeModalTab === 'compromisso' && 'Salvar compromisso'}
                    {activeModalTab === 'tarefa' && 'Criar tarefa'}
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

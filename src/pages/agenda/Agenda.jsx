import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Calendar as CalIcon, ChevronLeft, ChevronRight, Filter, 
  Clock, MapPin, Check, X, ShieldAlert, ArrowLeftRight 
} from 'lucide-react';

export default function Agenda({ selectedAppointment, setSelectedAppointment }) {
  const { appointments, addAppointment, updateAppointment, patients, procedures, checkPatientInadimplente } = useClinic();
  const { currentTheme } = useTheme();
  const { user } = useAuth();

  // Estados locais
  const [view, setView] = useState('week'); // 'day' | 'week' | 'month'
  const [selectedDentist, setSelectedDentist] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Diálogos
  const [showAddApp, setShowAddApp] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Sincronizar com agendamento selecionado da sidebar
  useEffect(() => {
    if (selectedAppointment) {
      setSelectedApp(selectedAppointment);
    }
  }, [selectedAppointment]);
  
  // Form Novo Agendamento
  const [appPatientId, setAppPatientId] = useState('');
  const [appProcedureId, setAppProcedureId] = useState('');
  const [appDate, setAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [appTime, setAppTime] = useState('09:00');
  const [appRoom, setAppRoom] = useState('Consultório A');
  const [appDoctor, setAppDoctor] = useState('Dr. Pedro Ramos');

  // Filtro de dentistas cadastrados para simulação
  const dentists = ['Dr. Pedro Ramos', 'Dra. Ana Paula', 'Dr. Carlos Souza'];
  const rooms = ['Consultório A', 'Consultório B', 'Sala Cirúrgica'];

  // Slots de Horários (08:00 às 17:00)
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

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

  const weekDates = getWeekDates(currentDate);

  const navigateDate = (direction) => {
    const temp = new Date(currentDate);
    if (view === 'day') {
      temp.setDate(temp.getDate() + direction);
    } else if (view === 'week') {
      temp.setDate(temp.getDate() + (direction * 7));
    } else if (view === 'month') {
      temp.setMonth(temp.getMonth() + direction);
    }
    setCurrentDate(temp);
  };

  const handleAddAppSubmit = (e) => {
    e.preventDefault();
    if (!appPatientId || !appProcedureId) return;

    const matchedPat = patients.find(p => p.id === appPatientId);
    const matchedProc = procedures.find(p => p.id === appProcedureId);

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
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hora padrão

    addAppointment({
      patient_id: appPatientId,
      patientName: matchedPat?.name || 'Paciente Novo',
      patientPhone: matchedPat?.phone || '',
      patientEmail: matchedPat?.email || '',
      procedureName: matchedProc?.name || 'Procedimento',
      color: matchedProc?.color || '#3b82f6',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      room: appRoom,
      doctor_id: 'doc-1', // Default
      status: 'PENDING'
    });

    setShowAddApp(false);
    setAppPatientId('');
    setAppProcedureId('');
  };

  // Drag and Drop
  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('text/plain', appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, slotTime, slotDate) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain');
    const app = appointments.find(a => a.id === appId);
    
    if (app) {
      const year = slotDate.getFullYear();
      const month = String(slotDate.getMonth() + 1).padStart(2, '0');
      const day = String(slotDate.getDate()).padStart(2, '0');
      
      const newStart = new Date(`${year}-${month}-${day}T${slotTime}:00`);
      const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);

      const updated = {
        ...app,
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString()
      };
      updateAppointment(updated);
    }
  };

  const handleStatusChange = (appId, newStatus) => {
    const app = appointments.find(a => a.id === appId);
    if (app) {
      updateAppointment({ ...app, status: newStatus });
      setSelectedApp(null);
      if (setSelectedAppointment) {
        setSelectedAppointment(null);
      }
    }
  };

  // Filtragem dos agendamentos
  const filteredApps = appointments.filter(app => {
    const matchesDentist = selectedDentist ? app.doctor_id === selectedDentist : true;
    const matchesRoom = selectedRoom ? app.room === selectedRoom : true;
    return matchesDentist && matchesRoom;
  });

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/40 dark:border-slate-800/60 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex-shrink-0">
        
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
              {view === 'day' && currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
            {['day', 'week', 'month'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  view === v 
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedDentist}
            onChange={(e) => setSelectedDentist(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl py-2 px-3 text-xs text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="">Todos Dentistas</option>
            <option value="doc-1">Dr. Pedro Ramos</option>
            <option value="doc-2">Dra. Ana Paula</option>
          </select>

          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl py-2 px-3 text-xs text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="">Todas Salas</option>
            {rooms.map((r, i) => (
              <option key={i} value={r}>{r}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAddApp(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98] hover:opacity-95 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: currentTheme.secondary_color }}
          >
            <Plus className="w-4 h-4" />
            Nova Consulta
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/40 dark:border-slate-800/60 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] overflow-hidden flex flex-col">
        
        {/* VIEW: SEMANA */}
        {view === 'week' && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Headers da Semana */}
            <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center py-3 sticky top-0 z-10 flex-shrink-0 text-slate-500 font-semibold text-xs">
              <div className="flex items-center justify-center border-r border-slate-200/50 dark:border-slate-800/50">Horário</div>
              {weekDates.map((date, idx) => {
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div key={idx} className={`flex flex-col items-center justify-center ${isToday ? 'text-violet-500' : ''}`}>
                    <span className="text-[10px] font-medium uppercase tracking-wider">{weekdays[date.getDay()].substring(0, 3)}</span>
                    <span className={`text-base font-extrabold font-title ${isToday ? 'bg-violet-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Linhas de Horário */}
            <div className="flex-grow divide-y divide-slate-100 dark:divide-slate-800/80">
              {timeSlots.map((time, slotIdx) => (
                <div key={slotIdx} className="grid grid-cols-8 min-h-[70px]">
                  {/* Célula de Horário */}
                  <div className="border-r border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center text-[10px] font-bold text-slate-400 select-none">
                    {time}
                  </div>
                  
                  {/* Dias */}
                  {weekDates.map((date, dayIdx) => {
                    // Filtrar consultas desse dia e horário
                    const hour = parseInt(time.split(':')[0]);
                    const matchedApps = filteredApps.filter(app => {
                      const appStart = new Date(app.start_time);
                      return appStart.getDate() === date.getDate() && 
                             appStart.getMonth() === date.getMonth() && 
                             appStart.getHours() === hour;
                    });

                    // Bloqueio de almoço (exemplo)
                    const isLunch = time === '12:00';

                    return (
                      <div
                        key={dayIdx}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, time, date)}
                        className={`p-1 border-r border-slate-100 dark:border-slate-800/40 relative group transition-colors ${
                          isLunch ? 'bg-slate-50/50 dark:bg-slate-800/10' : 'hover:bg-slate-50/20 dark:hover:bg-slate-800/5'
                        }`}
                      >
                        {isLunch && dayIdx > 0 && dayIdx < 6 && (
                          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-350 dark:text-slate-600 bg-slate-100/30 dark:bg-slate-900/10 select-none">
                            Intervalo Almoço
                          </div>
                        )}

                        {matchedApps.map((app) => (
                          <div
                            key={app.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, app.id)}
                            onClick={() => setSelectedApp(app)}
                            className="absolute inset-x-1.5 top-1.5 bottom-1.5 rounded-xl border p-2 text-[10px] shadow-sm select-none hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing text-white"
                            style={{ 
                              backgroundColor: app.color, 
                              borderColor: 'rgba(255, 255, 255, 0.15)',
                              boxShadow: `0 3px 12px ${app.color}25`
                            }}
                          >
                            <div>
                              <h4 className="font-extrabold truncate leading-tight">{app.patientName}</h4>
                              <p className="text-[9px] opacity-80 mt-0.5 truncate">{app.procedureName}</p>
                            </div>
                            <div className="flex justify-between items-center text-[8px] font-bold opacity-90 mt-1">
                              <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {time}</span>
                              <span className={`px-1 rounded bg-white/20`}>
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
            {/* Headers Dia */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center py-4 flex-shrink-0 text-slate-500 font-semibold text-xs">
              <h4 className="font-title font-extrabold text-sm text-slate-800 dark:text-white">
                {weekdays[currentDate.getDay()]}
              </h4>
            </div>

            {/* Linhas de Horário */}
            <div className="flex-grow divide-y divide-slate-100 dark:divide-slate-800/80">
              {timeSlots.map((time, slotIdx) => {
                const hour = parseInt(time.split(':')[0]);
                const dayApps = filteredApps.filter(app => {
                  const appStart = new Date(app.start_time);
                  return appStart.getDate() === currentDate.getDate() && 
                         appStart.getMonth() === currentDate.getMonth() && 
                         appStart.getHours() === hour;
                });

                return (
                  <div key={slotIdx} className="grid grid-cols-12 min-h-[75px] items-stretch">
                    <div className="col-span-2 border-r border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {time}
                    </div>

                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, time, currentDate)}
                      className="col-span-10 p-2 relative hover:bg-slate-50/10 transition-colors flex gap-2 overflow-x-auto"
                    >
                      {dayApps.map(app => (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          onClick={() => setSelectedApp(app)}
                          className="h-full min-w-[200px] w-64 rounded-xl border p-2.5 text-left flex flex-col justify-between shadow-sm cursor-grab active:cursor-grabbing text-white"
                          style={{ backgroundColor: app.color, borderColor: 'rgba(255, 255, 255, 0.15)' }}
                        >
                          <div>
                            <h4 className="font-extrabold text-xs truncate leading-tight">{app.patientName}</h4>
                            <p className="text-[10px] opacity-80 mt-0.5 truncate">{app.procedureName}</p>
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-semibold mt-1">
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {app.room}</span>
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
            {/* Headers dos Dias da Semana */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center py-2.5 text-slate-550 font-bold text-[10px] uppercase tracking-wider flex-shrink-0">
              {weekdays.map((day, idx) => <div key={idx}>{day.substring(0, 3)}</div>)}
            </div>

            {/* Grid dos Dias do Mês */}
            <div className="grid grid-cols-7 grid-rows-5 flex-grow divide-x divide-y divide-slate-100 dark:divide-slate-800/80 border-b border-r border-slate-100 dark:border-slate-800/80">
              {(() => {
                const days = [];
                const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const startDay = startMonth.getDay();
                
                // Células vazias do mês anterior
                for (let i = 0; i < startDay; i++) {
                  days.push(<div key={`prev-${i}`} className="bg-slate-50/50 dark:bg-slate-900/10 min-h-[90px]" />);
                }

                // Células do mês corrente
                const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                for (let d = 1; d <= totalDays; d++) {
                  const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                  const matchedApps = filteredApps.filter(app => {
                    const appStart = new Date(app.start_time);
                    return appStart.getDate() === d && appStart.getMonth() === currentDate.getMonth();
                  });

                  days.push(
                    <div 
                      key={`curr-${d}`} 
                      className="p-1.5 min-h-[90px] hover:bg-slate-50/30 dark:hover:bg-slate-800/5 transition-all text-left flex flex-col justify-between"
                    >
                      <span className="text-[10px] font-bold text-slate-400 select-none block mb-1">
                        {d}
                      </span>
                      
                      <div className="flex-1 overflow-y-auto space-y-1">
                        {matchedApps.slice(0, 3).map(app => (
                          <button
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className="w-full text-left truncate px-1.5 py-0.5 rounded text-[8px] text-white font-bold leading-tight"
                            style={{ backgroundColor: app.color }}
                          >
                            {app.patientName.split(' ')[0]}: {app.procedureName}
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

      </div>

      {/* DIÁLOGO: QUICK ACTIONS (CONSULTA) */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-white">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold font-title">Gerenciar Consulta</h3>
              <button 
                onClick={() => {
                  setSelectedApp(null);
                  if (setSelectedAppointment) {
                    setSelectedAppointment(null);
                  }
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="font-bold text-sm text-slate-800 dark:text-white">{selectedApp.patientName}</div>
                <div className="flex items-center gap-1.5 text-slate-400"><Clock className="w-3.5 h-3.5" /> <span>{new Date(selectedApp.start_time).toLocaleDateString('pt-BR')} às {new Date(selectedApp.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="flex items-center gap-1.5 text-slate-400"><MapPin className="w-3.5 h-3.5" /> <span>{selectedApp.room} ({selectedApp.procedureName})</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleStatusChange(selectedApp.id, 'CONFIRMED')}
                  className="py-2.5 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" /> Confirmar
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApp.id, 'CANCELLED')}
                  className="py-2.5 bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </div>

              <div className="p-3.5 bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/10 rounded-2xl flex items-start gap-2.5 text-[10px] text-slate-500">
                <ShieldAlert className="w-4 h-4 mt-0.5 text-violet-500 flex-shrink-0" />
                <span>Você também pode reagendar arrastando e soltando o card no horário desejado dentro da grade semanal.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO AGENDAMENTO */}
      {showAddApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title">Novo Agendamento Clínico</h3>
              <button 
                onClick={() => setShowAddApp(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAppSubmit} className="space-y-3.5 text-slate-800 dark:text-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Selecionar Paciente</label>
                <select
                  required
                  value={appPatientId}
                  onChange={(e) => setAppPatientId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                >
                  <option value="">Escolher paciente...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Procedimento</label>
                <select
                  required
                  value={appProcedureId}
                  onChange={(e) => setAppProcedureId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                >
                  <option value="">Escolher procedimento...</option>
                  {procedures.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - R$ {p.price}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={appDate}
                    onChange={(e) => setAppDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={appTime}
                    onChange={(e) => setAppTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sala / Consultório</label>
                  <select
                    value={appRoom}
                    onChange={(e) => setAppRoom(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    {rooms.map((r, i) => <option key={i} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dentista</label>
                  <select
                    value={appDoctor}
                    onChange={(e) => setAppDoctor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    {dentists.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl shadow text-xs mt-2"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Agendar Consulta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

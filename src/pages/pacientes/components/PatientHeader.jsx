import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft, Edit2, Phone, AlertTriangle, ShieldAlert, User, Camera } from 'lucide-react';

export default function PatientHeader({ 
  patient, 
  onBack, 
  onEdit, 
  onOpenWhatsApp,
  history = {} 
}) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  if (!patient) return null;

  const anamnese = history?.anamnese_estruturada || {};

  // Alertas médicos de atenção rápida no topo
  const quickAlerts = [];
  if (anamnese.has_alergia === 'Sim') {
    quickAlerts.push({ type: 'danger', text: anamnese.has_alergia_detail ? `Alergia: ${anamnese.has_alergia_detail}` : 'Alergia Médica' });
  }
  if (anamnese.has_pressao_alta === 'Sim') quickAlerts.push({ type: 'warning', text: 'Hipertensão' });
  if (anamnese.has_diabetes === 'Sim') quickAlerts.push({ type: 'warning', text: 'Diabetes' });
  if (anamnese.has_alteracao_cardio === 'Sim') quickAlerts.push({ type: 'danger', text: 'Cardiopatia' });
  if (anamnese.is_gestante === 'Sim') quickAlerts.push({ type: 'info', text: 'Gestante' });

  // Calcular Idade
  const getAge = (birthDateStr) => {
    if (!birthDateStr) return 'Idade n/d';
    const birth = new Date(birthDateStr);
    const ageDifMs = Date.now() - birth.getTime();
    const ageDate = new Date(ageDifMs);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    return `${years} anos`;
  };

  const patientIdFormatted = patient.id 
    ? (typeof patient.id === 'string' && patient.id.startsWith('p-') ? patient.id.replace('p-', '') : patient.id.substring(0, 8).toUpperCase())
    : 'C16A3F1B';

  return (
    <div className="w-full bg-white dark:bg-[#0D0D0D] border-b border-slate-200/80 dark:border-white/5 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-colors duration-300 relative overflow-hidden text-slate-800 dark:text-white">
      {/* Informações do Paciente */}
      <div className="flex items-center gap-4">
        {/* Foto / Avatar com Anel de Profundidade */}
        <div 
          onClick={onEdit}
          className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-lg shrink-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 flex items-center justify-center text-white cursor-pointer transition-all hover:scale-105 hover:border-blue-400"
          title="Clique para alterar a foto do paciente"
        >
          {patient.avatar_url || patient.photoUrl ? (
            <img 
              src={patient.avatar_url || patient.photoUrl} 
              alt={patient.name} 
              className="w-full h-full object-cover rounded-2xl" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-tr from-blue-700 via-indigo-800 to-slate-900">
              <User className="w-8 h-8 text-white/90 drop-shadow-md" />
            </div>
          )}

          {/* Overlay interativo com Câmera */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-0.5 text-white backdrop-blur-[2px]">
            <Camera className="w-5 h-5 text-blue-300 drop-shadow-md" />
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-200">Foto</span>
          </div>
        </div>

        {/* Nome, ID, Idade, Telefone e Alertas */}
        <div className="flex flex-col text-left space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={`text-xl font-black tracking-tight font-title ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {patient.name || 'Paciente Juliana Martins'}
            </h2>

            {/* Badges de Alerta de Saúde Rápido */}
            {quickAlerts.map((alt, idx) => (
              <span 
                key={idx}
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 uppercase tracking-wider ${
                  alt.type === 'danger'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : alt.type === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                }`}
              >
                <ShieldAlert className="w-3 h-3" /> {alt.text}
              </span>
            ))}
          </div>
          
          <div className={`flex flex-wrap items-center gap-3 text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="font-mono bg-slate-900/60 px-2 py-0.5 rounded-md border border-white/5">ID: {patientIdFormatted}</span>
            <span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
            <span>Idade: {getAge(patient.birth_date || patient.birthDate)}</span>
            <span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
            <button 
              onClick={() => onOpenWhatsApp && onOpenWhatsApp(patient)}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{patient.phone || '(83) 98877-6655'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Botões de Ação do Topo (Estilo macOS Depth Button) */}
      <div className="flex items-center gap-2.5 self-end md:self-center">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] ${
            isDarkMode
              ? 'bg-slate-800/80 border-white/10 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 border border-blue-400/40 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <Edit2 className="w-4 h-4" />
          Editar Cadastro
        </button>
      </div>
    </div>
  );
}

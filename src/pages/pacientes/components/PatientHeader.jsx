import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft, Edit2, Phone } from 'lucide-react';

export default function PatientHeader({ 
  patient, 
  onBack, 
  onEdit, 
  onOpenWhatsApp 
}) {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode;
  const isDarkMode = themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  if (!patient) return null;

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
    ? (typeof patient.id === 'string' && patient.id.startsWith('p-') ? patient.id.replace('p-', '') : patient.id.substring(0, 5))
    : '98777';

  return (
    <div className={`w-full backdrop-blur-md rounded-2xl border p-4 mb-4 flex items-center justify-between transition-all ${
      isDarkMode 
        ? 'bg-[#111726]/90 border-white/10 shadow-xl text-white' 
        : 'bg-white border-slate-200 shadow-xs text-slate-800'
    }`}>
      {/* Informações do Paciente */}
      <div className="flex items-center gap-4">
        {/* Foto / Avatar */}
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-blue-500/40 shadow-lg shrink-0 bg-slate-800 flex items-center justify-center text-xl font-bold text-white">
          {patient.avatar_url || patient.photoUrl ? (
            <img 
              src={patient.avatar_url || patient.photoUrl} 
              alt={patient.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span>{patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}</span>
          )}
        </div>

        {/* Nome, ID, Idade e Telefone */}
        <div className="flex flex-col text-left">
          <h2 className={`text-xl font-black tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {patient.name || 'Paciente Juliana Martins'}
          </h2>
          
          <div className={`flex items-center gap-4 text-xs font-semibold mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>ID: {patientIdFormatted}</span>
            <span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
            <span>Idade: {getAge(patient.birth_date || patient.birthDate)}</span>
            <span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
            <button 
              onClick={() => onOpenWhatsApp && onOpenWhatsApp(patient)}
              className="flex items-center gap-1.5 text-emerald-500 hover:text-emerald-600 font-bold transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{patient.phone || '(83) 98877-6655'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Botões de Ação do Topo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            isDarkMode
              ? 'bg-slate-800/80 border-white/10 text-slate-300 hover:bg-slate-700 hover:text-white'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 border border-blue-500 text-xs font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          Editar
        </button>
      </div>
    </div>
  );
}

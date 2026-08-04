import React, { useState } from 'react';
import { UserCheck, Building, ShieldCheck, Check, Layers, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function DevTabRolesTenant({ setMessage }) {
  const { user, clinic, selectClinic } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.role || 'admin');

  const roles = [
    { id: 'admin', label: 'Admin / Gestor', desc: 'Acesso total a relatórios, configurações e equipe.' },
    { id: 'dentist', label: 'Dentista / Doutor', desc: 'Foco na Agenda, Prontuários e Odontograma.' },
    { id: 'receptionist', label: 'Recepcionista', desc: 'Atendimento, agendamentos e recepção de pacientes.' },
    { id: 'financial', label: 'Financeiro', desc: 'Foco em fluxo de caixa, boletos e recebimentos.' },
    { id: 'superadmin', label: 'SuperAdmin', desc: 'Modo plataforma global multi-clínicas.' },
  ];

  const clinicsMock = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Clínica OdontoFlow (Matriz JP)', plan: 'Premium' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'DentalCare (Filial Campina)', plan: 'Pro' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'OrthoMaster (Filial SP)', plan: 'Enterprise' },
  ];

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    if (user) {
      user.role = roleId;
    }
    setMessage({ text: `Perfil de usuário alterado temporariamente para: ${roleId.toUpperCase()}`, type: 'success' });
  };

  const handleClinicSwitch = (cItem) => {
    if (selectClinic) {
      selectClinic(cItem);
      setMessage({ text: `Alternado para a clínica: ${cItem.name}`, type: 'success' });
    }
  };

  return (
    <div className="space-y-5 font-sans text-left">
      {/* Perfil Ativo */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-amber-500" />
          Simular Papel / Permissão do Usuário
        </h4>
        <div className="space-y-1.5">
          {roles.map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRoleChange(r.id)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-300 font-bold'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-2">
                    <span>{r.label}</span>
                    {isSelected && (
                      <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-extrabold uppercase">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] opacity-75 font-normal">{r.desc}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tenant / Multi-clínica Switcher */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/10">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-sky-500" />
          Simular Tenant Multi-Clínica (clinic_id)
        </h4>
        <div className="space-y-1.5">
          {clinicsMock.map((c) => {
            const isCurrent = clinic?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleClinicSwitch(c)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isCurrent
                    ? 'bg-sky-500/10 border-sky-500/40 text-sky-900 dark:text-sky-300 font-bold'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{c.name}</div>
                  <div className="text-[10px] opacity-75 font-mono">ID: {c.id} • Plano: {c.plan}</div>
                </div>
                {isCurrent && <Check className="w-4 h-4 text-sky-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

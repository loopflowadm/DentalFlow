import { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings, Clock, Trash2, Check, 
  Smartphone, Calendar, Mail, Key, QrCode, X, Palette, Image
} from 'lucide-react';

export default function Configuracoes() {
  const { 
    procedures, saveProcedures, insurancePlans, saveInsurancePlans 
  } = useClinic();
  
  const { clinic, updateClinic } = useAuth();
  const { currentTheme } = useTheme();

  // Estados locais
  const [activeSubTab, setActiveSubTab] = useState('clinica'); // 'clinica' | 'procs' | 'integracoes'

  // Estados locais do Branding da Clínica
  const [cName, setCName] = useState('');
  const [cLogo, setCLogo] = useState('');
  const [cPrimary, setCPrimary] = useState('#03269A');
  const [cSecondary, setCSecondary] = useState('#196BFB');
  const [cAccent, setCAccent] = useState('#D9E2FF');

  useEffect(() => {
    if (clinic) {
      setCName(clinic.name || '');
      setCLogo(clinic.logo_url || '');
      setCPrimary(clinic.primary_color || '#03269A');
      setCSecondary(clinic.secondary_color || '#196BFB');
      setCAccent(clinic.accent_color || '#D9E2FF');
    }
  }, [clinic]);

  const handleSaveBranding = (e) => {
    e.preventDefault();
    if (!cName) return;
    updateClinic({
      name: cName,
      logo_url: cLogo,
      primary_color: cPrimary,
      secondary_color: cSecondary,
      accent_color: cAccent
    });
  };

  // Mock Equipe da clínica
  const [staff, setStaff] = useState([
    { id: 'st-1', name: 'Dr. Pedro Ramos', email: 'pedro@sorriso.com', role: 'Dentista (DOCTOR)' },
    { id: 'st-2', name: 'Dra. Ana Paula', email: 'ana@sorriso.com', role: 'Dentista (DOCTOR)' },
    { id: 'st-3', name: 'Juliana Medeiros', email: 'recepcao@sorriso.com', role: 'Secretária (RECEPTIONIST)' },
    { id: 'st-4', name: 'Rodrigo Alves', email: 'financeiro@sorriso.com', role: 'Financeiro (FINANCIAL)' }
  ]);

  // Form states
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('RECEPTIONIST');
  const [showAddStaff, setShowAddStaff] = useState(false);

  // States do WhatsApp QR code
  const [showQr, setShowQr] = useState(false);
  const [qrStatus, setQrStatus] = useState('PENDING'); // 'PENDING' | 'CONNECTED'

  // States Google Calendar
  const [gcalConnected, setGcalConnected] = useState(false);

  // States SMTP Email
  const [smtpHost, setSmtpHost] = useState('smtp.odontocrm.com');
  const [smtpPort, setSmtpPort] = useState('587');

  // Estados locais adicionais para Procedimentos e Convênios
  const [showAddProc, setShowAddProc] = useState(false);
  const [newProcName, setNewProcName] = useState('');
  const [newProcPrice, setNewProcPrice] = useState('');
  const [newProcCategory, setNewProcCategory] = useState('CLINICAL');
  const [newProcColor, setNewProcColor] = useState('#a78bfa');

  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const [newInsuranceName, setNewInsuranceName] = useState('');
  const [newInsuranceDiscount, setNewInsuranceDiscount] = useState('');

  const handleAddProcSubmit = (e) => {
    e.preventDefault();
    if (!newProcName || !newProcPrice) return;
    const fresh = {
      id: 'pr-' + Math.random().toString(36).substr(2, 9),
      name: newProcName,
      price: parseFloat(newProcPrice),
      category: newProcCategory,
      color: newProcColor
    };
    const updated = [...procedures, fresh];
    saveProcedures(updated);
    
    setNewProcName('');
    setNewProcPrice('');
    setNewProcCategory('CLINICAL');
    setNewProcColor('#a78bfa');
    setShowAddProc(false);
  };

  const handleDeleteProc = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este procedimento?')) {
      const updated = procedures.filter(p => p.id !== id);
      saveProcedures(updated);
    }
  };

  const handleAddInsuranceSubmit = (e) => {
    e.preventDefault();
    if (!newInsuranceName || !newInsuranceDiscount) return;
    const fresh = {
      id: 'pl-' + Math.random().toString(36).substr(2, 9),
      name: newInsuranceName,
      discountPercent: parseInt(newInsuranceDiscount)
    };
    const updated = [...insurancePlans, fresh];
    saveInsurancePlans(updated);

    setNewInsuranceName('');
    setNewInsuranceDiscount('');
    setShowAddInsurance(false);
  };

  const handleDeleteInsurance = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este convênio?')) {
      const updated = insurancePlans.filter(plan => plan.id !== id);
      saveInsurancePlans(updated);
    }
  };

  // Adicionar profissional
  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;

    const fresh = {
      id: 'st-' + Math.random().toString(36).substr(2, 9),
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole === 'DOCTOR' ? 'Dentista (DOCTOR)' : newStaffRole === 'FINANCIAL' ? 'Financeiro (FINANCIAL)' : 'Secretária (RECEPTIONIST)'
    };

    setStaff([...staff, fresh]);
    setNewStaffName('');
    setNewStaffEmail('');
    setShowAddStaff(false);
  };

  // WhatsApp Link Simulator
  const handleGenerateQr = () => {
    setShowQr(true);
    setQrStatus('PENDING');
    setTimeout(() => {
      setQrStatus('CONNECTED');
    }, 3000);
  };

  return (
    <div className="space-y-6 pb-10 text-slate-800 dark:text-slate-200">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/40 dark:border-slate-800/60 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-violet-500" />
          <h2 className="text-sm font-bold font-title">Configurações Gerais da Clínica</h2>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/30 dark:border-slate-700/30">
          {[
            { id: 'clinica', label: 'Clínica & Equipe' },
            { id: 'procs', label: 'Procedimentos & Convênios' },
            { id: 'integracoes', label: 'Integrações API' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-ABA: CLINICA & EQUIPE */}
      {activeSubTab === 'clinica' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Perfil Clínica */}
          <div className="lg:col-span-4 space-y-4">
            {(() => {
              const isImageUrl = cLogo && (cLogo.startsWith('http') || cLogo.startsWith('/') || cLogo.includes('.') || cLogo.includes('data:image'));
              return (
                <form onSubmit={handleSaveBranding} className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-violet-500" /> Identidade Visual
                  </h3>

                  {/* Preview em Tempo Real */}
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3 overflow-hidden shadow-inner select-none">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white text-[10px] border border-white/10 flex-shrink-0 overflow-hidden">
                      {isImageUrl ? (
                        <img src={cLogo} alt="Logo Preview" className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-xs">{cLogo || '🦷'}</span>
                      )}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <h4 className="text-[10px] font-black text-slate-350 uppercase tracking-wider truncate">
                        {cName || 'ODONTO CRM'}
                      </h4>
                      <span className="text-[8px] font-extrabold uppercase tracking-widest block" style={{ color: cSecondary }}>
                        Cor de Destaque Act.
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3.5 text-xs text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome da Empresa</label>
                      <input
                        type="text"
                        required
                        value={cName}
                        onChange={(e) => setCName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2 px-3 focus:outline-none"
                        placeholder="Nome da clínica/empresa"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Logo URL ou Emoji</label>
                      <div className="flex gap-2.5 items-center">
                        <input
                          type="text"
                          value={cLogo}
                          onChange={(e) => setCLogo(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2 px-3 focus:outline-none"
                          placeholder="ex: 💎 ou /logo-brand.png"
                        />
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-lg select-none flex-shrink-0 shadow-inner">
                          {isImageUrl ? (
                            <img src={cLogo} alt="Logo" className="w-8 h-8 object-contain" />
                          ) : (
                            <span>{cLogo || '🦷'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Paleta de Cores da Marca</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Primária', val: cPrimary, set: setCPrimary },
                          { label: 'Secundária', val: cSecondary, set: setCSecondary },
                          { label: 'Destaque', val: cAccent, set: setCAccent }
                        ].map((item, idx) => (
                          <div key={idx} className="flex flex-col items-center p-2.5 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-800/80">
                            <span className="text-[9px] font-bold text-slate-400 uppercase mb-1.5">{item.label}</span>
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform" style={{ backgroundColor: item.val }}>
                              <input 
                                type="color" 
                                value={item.val} 
                                onChange={(e) => item.set(e.target.value)} 
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
                              />
                            </div>
                            <span className="text-[8px] font-mono font-semibold text-slate-500 mt-2 tracking-tight">{item.val.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 hover:opacity-90 text-white font-extrabold rounded-xl shadow-md text-xs mt-2 transition-all active:scale-[0.99]"
                      style={{ backgroundColor: cSecondary }}
                    >
                      Salvar Identidade Visual
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>

          {/* Lista Equipe */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profissionais e Equipe</h3>
              <button
                onClick={() => setShowAddStaff(true)}
                className="px-3 py-1.5 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98]"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Adicionar Profissional
              </button>
            </div>
            
            <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-500 border-b border-slate-200/40 dark:border-slate-800">
                    <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px]">Profissional</th>
                    <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px]">E-mail</th>
                    <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px]">Função</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-350">
                  {staff.map(st => {
                    const initials = st.name ? st.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
                    const isDoctor = st.role.toLowerCase().includes('doctor');
                    const isFinancial = st.role.toLowerCase().includes('financial');
                    
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-5 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-[10px] shadow-sm select-none border border-slate-200/40 dark:border-slate-700/40 flex-shrink-0 ${
                            isDoctor ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-450' :
                            isFinancial ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450' :
                            'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450'
                          }`}>
                            {initials}
                          </div>
                          <span className="font-extrabold text-slate-800 dark:text-white text-[12px]">{st.name}</span>
                        </td>
                        <td className="py-3 px-5 font-medium text-slate-500 dark:text-slate-400 font-mono text-[11px]">{st.email}</td>
                        <td className="py-3 px-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shadow-sm ${
                            isDoctor ? 'bg-indigo-50/80 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40' :
                            isFinancial ? 'bg-amber-50/80 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40' :
                            'bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40'
                          }`}>
                            {isDoctor ? '🦷 Dentista' : isFinancial ? '📊 Financeiro' : '💼 Recepção'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA: PROCEDIMENTOS & CONVÊNIOS */}
      {activeSubTab === 'procs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          {/* Procedimentos */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Procedimentos Lançados</h3>
              <button
                onClick={() => setShowAddProc(true)}
                className="px-3 py-1.5 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98]"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Adicionar Procedimento
              </button>
            </div>
            
            <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-550 border-b border-slate-200/40 dark:border-slate-800">
                    <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px]">Procedimento</th>
                    <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px]">Preço Padrão</th>
                    <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px]">Categoria</th>
                    <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-350">
                  {procedures.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </td>
                      <td className="py-3.5 px-5 font-extrabold text-slate-850 dark:text-white">R$ {p.price}</td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200/30 dark:border-slate-700/30 uppercase tracking-wide">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleDeleteProc(p.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Convênios */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Convênios e Planos</h3>
              <button
                onClick={() => setShowAddInsurance(true)}
                className="px-3 py-1.5 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98]"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Adicionar Convênio
              </button>
            </div>
            
            <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-550 border-b border-slate-200/40 dark:border-slate-800">
                    <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px]">Convênio</th>
                    <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px]">Desconto</th>
                    <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[10px] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-350">
                  {insurancePlans.map(plan => (
                    <tr key={plan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-800 dark:text-white">{plan.name}</td>
                      <td className="py-3.5 px-5 font-extrabold text-emerald-500">{plan.discountPercent}%</td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleDeleteInsurance(plan.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA: INTEGRAÇÕES API */}
      {activeSubTab === 'integracoes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          {/* WhatsApp QR Code */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs font-title">WhatsApp Connection QR Link</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">Conecte o seu número de WhatsApp da clínica para acionar automações e chatbot de IA.</p>
              </div>
            </div>

            <div className="flex flex-col items-center py-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800 relative">
              {showQr ? (
                qrStatus === 'PENDING' ? (
                  <div className="flex flex-col items-center space-y-2">
                    <QrCode className="w-28 h-28 text-slate-700 dark:text-white opacity-40 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400">Gerando QR Code...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-emerald-500">
                    <Check className="w-12 h-12" />
                    <span className="text-[10px] font-bold">WhatsApp Conectado com Sucesso!</span>
                  </div>
                )
              ) : (
                <button
                  onClick={handleGenerateQr}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-250 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-750 dark:text-white font-bold rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-xs shadow-sm"
                >
                  Gerar QR Code de Conexão
                </button>
              )}
            </div>
          </div>

          {/* Google Calendar Link */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs font-title">Sincronização Google Calendar</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">Sincronize as agendas dos dentistas com suas contas do Google Calendar em duas vias.</p>
              </div>
            </div>

            <div className="py-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-center">
              {gcalConnected ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                  <Check className="w-4 h-4" /> Conta do Google Conectada
                </div>
              ) : (
                <button
                  onClick={() => setGcalConnected(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-250 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-750 dark:text-white font-bold rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-xs shadow-sm"
                >
                  Vincular Google Calendar
                </button>
              )}
            </div>
          </div>

          {/* SMTP Email Settings */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-3">
            <div className="flex gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
              <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs font-title">SMTP E-mail Próprio</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">Configure seu servidor SMTP de e-mail para disparo de alertas e lembretes.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-750 rounded-lg py-1 px-2.5 text-[10px] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Port</label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-750 rounded-lg py-1 px-2.5 text-[10px] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* API Access Tokens */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-3">
            <div className="flex gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs font-title">Chaves de API & Webhooks</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">Gere tokens de autenticação para integrar o CRM a sistemas externos.</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-150 dark:border-slate-800">
              <span className="font-mono text-[9px] text-slate-400">sk_live_loopflow_clinic_889922ff</span>
              <button className="text-[9px] text-violet-500 hover:underline font-bold">Copiar Key</button>
            </div>
          </div>

        </div>
      )}

      {/* MODAL: ADICIONAR PROFISSIONAL */}
      {showAddStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title">Adicionar à Equipe</h3>
              <button 
                onClick={() => setShowAddStaff(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-slate-800 dark:text-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Dr. Carlos Souza"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail Operacional</label>
                <input
                  type="email"
                  required
                  placeholder="carlos@sorriso.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cargo / Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                >
                  <option value="DOCTOR">Dentista (DOCTOR)</option>
                  <option value="RECEPTIONIST">Secretária (RECEPTIONIST)</option>
                  <option value="FINANCIAL">Financeiro (FINANCIAL)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl shadow text-xs mt-2"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Cadastrar Colaborador
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR PROCEDIMENTO */}
      {showAddProc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title">Cadastrar Procedimento</h3>
              <button 
                onClick={() => setShowAddProc(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-855 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProcSubmit} className="space-y-4 text-slate-800 dark:text-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Nome do Procedimento</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Canal Endodôntico Molar"
                  value={newProcName}
                  onChange={(e) => setNewProcName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Preço Padrão (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="ex: 450.00"
                  value={newProcPrice}
                  onChange={(e) => setNewProcPrice(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Categoria</label>
                <select
                  value={newProcCategory}
                  onChange={(e) => setNewProcCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                >
                  <option value="CLINICAL">Clínico Geral (CLINICAL)</option>
                  <option value="SURGERY">Cirurgia (SURGERY)</option>
                  <option value="ESTHETIC">Estética (ESTHETIC)</option>
                  <option value="ORTHO">Ortodontia (ORTHO)</option>
                  <option value="IMPLANT">Implantes (IMPLANT)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Cor Indicativa (Odontograma)</label>
                <select
                  value={newProcColor}
                  onChange={(e) => setNewProcColor(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                >
                  <option value="#a78bfa">Roxo (#a78bfa)</option>
                  <option value="#f87171">Vermelho (#f87171)</option>
                  <option value="#34d399">Verde (#34d399)</option>
                  <option value="#60a5fa">Azul (#60a5fa)</option>
                  <option value="#fbbf24">Amarelo (#fbbf24)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl shadow text-xs mt-2"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Cadastrar Procedimento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR CONVÊNIO */}
      {showAddInsurance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-title">Cadastrar Convênio</h3>
              <button 
                onClick={() => setShowAddInsurance(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-855 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddInsuranceSubmit} className="space-y-4 text-slate-800 dark:text-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Nome do Convênio</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Bradesco Dental"
                  value={newInsuranceName}
                  onChange={(e) => setNewInsuranceName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Desconto Padrão (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  placeholder="ex: 15"
                  value={newInsuranceDiscount}
                  onChange={(e) => setNewInsuranceDiscount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl shadow text-xs mt-2"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Cadastrar Convênio
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

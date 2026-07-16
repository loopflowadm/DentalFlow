import { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings, Clock, Trash2, Check, 
  Smartphone, Calendar, Mail, Key, QrCode, X, Palette, Image,
  Sparkles, Building, Type, Globe, Compass, Lock,
  Activity, DollarSign, User, Gem, Shield
} from 'lucide-react';

const BRAND_PRESETS = [
  {
    name: 'Classic Navy (Padrão)',
    primary: '#03269A',
    secondary: '#196BFB',
    accent: '#D9E2FF',
  },
  {
    name: 'Menta Saudável',
    primary: '#0F766E',
    secondary: '#13B9A6',
    accent: '#CCFBF1',
  },
  {
    name: 'Safira Premium',
    primary: '#1E3A8A',
    secondary: '#3B82F6',
    accent: '#DBEAFE',
  },
  {
    name: 'Ouro Nobre',
    primary: '#1E1E1E',
    secondary: '#D4AF37',
    accent: '#FDF6E2',
  },
  {
    name: 'Orquídea Moderna',
    primary: '#581C87',
    secondary: '#A855F7',
    accent: '#F3E8FF',
  },
  {
    name: 'Clean Clínico',
    primary: '#0F172A',
    secondary: '#0EA5E9',
    accent: '#E0F2FE',
  }
];

function adjustColorBrightness(hex, percent) {
  if (!hex) return hex;
  const cleanHex = hex.replace(/^#/, '');
  let R = parseInt(cleanHex.substring(0, 2), 16);
  let G = parseInt(cleanHex.substring(2, 4), 16);
  let B = parseInt(cleanHex.substring(4, 6), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;  
  G = (G < 255) ? G : 255;  
  B = (B < 255) ? B : 255;  

  R = (R > 0) ? R : 0;  
  G = (G > 0) ? G : 0;  
  B = (B > 0) ? B : 0;  

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

export default function Configuracoes() {
  const { 
    procedures, saveProcedures, insurancePlans, saveInsurancePlans 
  } = useClinic();
  
  const { clinic, updateClinic } = useAuth();
  const { currentTheme } = useTheme();

  // Estados locais
  const [activeSubTab, setActiveSubTab] = useState('identidade'); // 'identidade' | 'equipe' | 'procs' | 'integracoes'

  // Estados locais do Branding da Clínica
  const [cName, setCName] = useState('');
  const [cLogo, setCLogo] = useState('');
  const [cPrimary, setCPrimary] = useState('#03269A');
  const [cSecondary, setCSecondary] = useState('#196BFB');
  const [cAccent, setCAccent] = useState('#D9E2FF');
  
  // Novas configurações de Whitelabel avançado
  const [cFontFamily, setCFontFamily] = useState('Inter');
  const [cThemeBase, setCThemeBase] = useState('light');
  const [cFaviconUrl, setCFaviconUrl] = useState('');
  const [cLoginTitle, setCLoginTitle] = useState('Portal de Acesso');
  const [cLoginBg, setCLoginBg] = useState('');
  const [cSubdomain, setCSubdomain] = useState('');

  useEffect(() => {
    if (clinic) {
      let active = true;
      const run = async () => {
        await Promise.resolve();
        if (active) {
          setCName(clinic.name || '');
          setCLogo(clinic.logo_url || '');
          setCPrimary(clinic.primary_color || '#03269A');
          setCSecondary(clinic.secondary_color || '#196BFB');
          setCAccent(clinic.accent_color || '#D9E2FF');
          setCFontFamily(clinic.font_family || 'Geist');
          setCThemeBase(clinic.theme_base || 'light');
          setCFaviconUrl(clinic.favicon_url || '');
          setCLoginTitle(clinic.login_title || 'Bem-vindo ao seu portal');
          setCLoginBg(clinic.login_bg || '');
          setCSubdomain(clinic.subdomain || '');
        }
      };
      run();
      return () => {
        active = false;
      };
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
      accent_color: cAccent,
      font_family: cFontFamily,
      theme_base: cThemeBase,
      favicon_url: cFaviconUrl,
      login_title: cLoginTitle,
      login_bg: cLoginBg,
      subdomain: cSubdomain
    });
  };

  const handleApplyPreset = (preset) => {
    setCPrimary(preset.primary);
    setCSecondary(preset.secondary);
    setCAccent(preset.accent);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    
    if (file.size > 500 * 1024) {
      alert('A imagem é muito grande. O limite máximo permitido é 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCLogo(event.target.result);
    };
    reader.readAsDataURL(file);
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

  // States do WhatsApp (Evolution API)
  const [evolutionUrl, setEvolutionUrl] = useState('');
  const [evolutionInstance, setEvolutionInstance] = useState('');
  const [evolutionToken, setEvolutionToken] = useState('');
  const [evolutionStatus, setEvolutionStatus] = useState('DISCONNECTED');

  // Carregar configurações da Evolution API
  useEffect(() => {
    if (clinic) {
      const clinicId = clinic.id;
      let active = true;
      const run = async () => {
        await Promise.resolve();
        if (active) {
          setEvolutionUrl(localStorage.getItem(`evolution_url_${clinicId}`) || '');
          setEvolutionInstance(localStorage.getItem(`evolution_instance_${clinicId}`) || '');
          setEvolutionToken(localStorage.getItem(`evolution_token_${clinicId}`) || '');
          setEvolutionStatus(localStorage.getItem(`evolution_status_${clinicId}`) || 'DISCONNECTED');
        }
      };
      run();
      return () => {
        active = false;
      };
    }
  }, [clinic]);

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

  // WhatsApp Evolution API Actions
  const handleSaveWhatsAppConfig = (e) => {
    e.preventDefault();
    if (!clinic) return;
    const clinicId = clinic.id;
    localStorage.setItem(`evolution_url_${clinicId}`, evolutionUrl);
    localStorage.setItem(`evolution_instance_${clinicId}`, evolutionInstance);
    localStorage.setItem(`evolution_token_${clinicId}`, evolutionToken);
    localStorage.setItem(`evolution_status_${clinicId}`, 'CONNECTED');
    setEvolutionStatus('CONNECTED');
    alert('Configurações salvas e WhatsApp ativado!');
  };

  const handleDisconnectWhatsApp = () => {
    if (!clinic) return;
    const clinicId = clinic.id;
    localStorage.removeItem(`evolution_url_${clinicId}`);
    localStorage.removeItem(`evolution_instance_${clinicId}`);
    localStorage.removeItem(`evolution_token_${clinicId}`);
    localStorage.setItem(`evolution_status_${clinicId}`, 'DISCONNECTED');
    setEvolutionUrl('');
    setEvolutionInstance('');
    setEvolutionToken('');
    setEvolutionStatus('DISCONNECTED');
    alert('WhatsApp desconectado.');
  };

  return (
    <div className="h-full overflow-y-auto pr-1 space-y-6 pb-10 text-slate-800 dark:text-slate-200 scrollbar-thin">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/40 dark:border-slate-800/60 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-violet-500" />
          <h2 className="text-sm font-bold font-title">Configurações Gerais da Clínica</h2>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/30 dark:border-slate-700/30">
          {[
            { id: 'identidade', label: 'Identidade Visual' },
            { id: 'equipe', label: 'Equipe da Clínica' },
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

      {/* SUB-ABA: IDENTIDADE VISUAL & WHITELABEL */}
      {activeSubTab === 'identidade' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Formulário de Configuração */}
          <div className="lg:col-span-5 space-y-4">
            {(() => {
              const isImageUrl = cLogo && (cLogo.startsWith('http') || cLogo.startsWith('/') || cLogo.includes('.') || cLogo.includes('data:image'));
              return (
                <form onSubmit={handleSaveBranding} className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-violet-500" /> Painel Whitelabel & Marca
                  </h3>

                  <div className="space-y-4 text-xs text-left">
                    {/* Nome & Subdomínio */}
                    <div className="grid grid-cols-2 gap-2.5">
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
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subdomínio</label>
                        <input
                          type="text"
                          value={cSubdomain}
                          onChange={(e) => setCSubdomain(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2 px-3 focus:outline-none font-mono text-[11px]"
                          placeholder="Link (ex: sorriso)"
                        />
                      </div>
                    </div>

                    {/* Logo Upload & Emoji */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Logo URL, Emoji ou Upload</label>
                      <div className="flex gap-2.5 items-center">
                        <input
                          type="text"
                          value={cLogo}
                          onChange={(e) => setCLogo(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2 px-3 focus:outline-none text-xs text-slate-800 dark:text-white"
                          placeholder="ex: 💎 ou URL da imagem"
                        />
                        <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 rounded-xl cursor-pointer text-[10px] font-bold text-slate-700 dark:text-slate-350 transition-all select-none whitespace-nowrap">
                          Upload Imagem
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-lg select-none flex-shrink-0 shadow-inner">
                          {isImageUrl ? (
                            <img src={cLogo} alt="Logo" className="w-8 h-8 object-contain" />
                          ) : (
                            <span>
                              {(() => {
                                const logoMap = {
                                  '🦷': Activity,
                                  '✨': Sparkles,
                                  '💎': Gem,
                                  '🏥': Building,
                                  '🛡️': Shield,
                                  '⚕️': Activity
                                };
                                const IconComponent = logoMap[cLogo] || Activity;
                                return <IconComponent className="w-5 h-5 text-secondary" />;
                              })()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Paleta de Cores */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Paleta de Cores da Marca</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Primária', val: cPrimary, set: setCPrimary },
                          { label: 'Secundária', val: cSecondary, set: setCSecondary },
                          { label: 'Destaque', val: cAccent, set: setCAccent }
                        ].map((item, idx) => (
                          <div key={idx} className="flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-800/80">
                            <span className="text-[9px] font-bold text-slate-400 uppercase mb-1.5">{item.label}</span>
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200/70 dark:border-slate-600 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform" style={{ backgroundColor: item.val }}>
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

                    {/* Presets do Designer */}
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800/80">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Paletas Prontas (Presets)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {BRAND_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 text-left transition-all active:scale-[0.98] flex items-center justify-between"
                          >
                            <span className="text-[9px] font-bold text-slate-700 dark:text-slate-350 truncate max-w-[75px]">{preset.name}</span>
                            <div className="flex gap-0.5 flex-shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: preset.primary }} />
                              <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: preset.secondary }} />
                              <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: preset.accent }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tipografia & Base */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipografia (Fonte)</label>
                        <select
                          value={cFontFamily}
                          onChange={(e) => setCFontFamily(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2 px-2.5 text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                        >
                          {['Geist', 'Inter', 'Outfit', 'Poppins', 'Montserrat', 'Roboto'].map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Base do Tema</label>
                        <select
                          value={cThemeBase}
                          onChange={(e) => setCThemeBase(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2 px-2.5 text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="light">Claro (Recomendado)</option>
                          <option value="dark">Escuro</option>
                        </select>
                      </div>
                    </div>

                    {/* Fim das Configurações de Aparência */}

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

          {/* Sandbox: Mockup Interativo em Tempo Real */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-violet-500" /> Sandbox: Preview em Tempo Real
            </h3>

            {(() => {
              const darkerPrimary = adjustColorBrightness(cPrimary, -25);
              const accentBg = cAccent || '#D9E2FF';
              const lightBg = adjustColorBrightness(accentBg, 80);
              return (
                <div 
                  className="w-full aspect-[16/10] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex select-none transition-all duration-300 relative bg-white"
                  style={{ backgroundColor: cThemeBase === 'dark' ? '#020617' : lightBg, fontFamily: `"${cFontFamily}", sans-serif` }}
                >
                  {/* 1. Sidebar Fictícia */}
                  <div 
                    className="w-12 h-full flex flex-col justify-between items-center py-3 border-r border-black/10 flex-shrink-0"
                    style={{ backgroundColor: cThemeBase === 'dark' ? '#0f172a' : cPrimary }}
                  >
                    <div className="flex flex-col items-center gap-4 w-full">
                      {/* Logo compacta */}
                      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 text-xs overflow-hidden text-white font-bold">
                        {cLogo && (cLogo.startsWith('http') || cLogo.startsWith('data:image/') || cLogo.includes('.')) ? (
                          <img src={cLogo} alt="Logo" className="w-4 h-4 object-contain" />
                        ) : (
                          <span>
                            {(() => {
                              const logoMap = {
                                '🦷': Activity,
                                '✨': Sparkles,
                                '💎': Gem,
                                '🏥': Building,
                                '🛡️': Shield,
                                '⚕️': Activity
                              };
                              const IconComponent = logoMap[cLogo] || Activity;
                              return <IconComponent className="w-3.5 h-3.5 text-white" />;
                            })()}
                          </span>
                        )}
                      </div>

                      {/* Links */}
                      {[1, 2, 3].map((item, idx) => (
                        <div 
                          key={idx} 
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-80"
                          style={idx === 0 ? { backgroundColor: cThemeBase === 'dark' ? '#3b82f6' : cSecondary, color: '#ffffff' } : { color: 'rgba(255,255,255,0.4)' }}
                        >
                          <span className="text-[9px] font-black">{idx === 0 ? '★' : '●'}</span>
                        </div>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[8px] text-white/40">
                      ✕
                    </div>
                  </div>

                  {/* 2. Sub-Sidebar Fictícia */}
                  <div 
                    className="w-32 h-full border-r border-black/5 flex flex-col p-2.5 flex-shrink-0"
                    style={{ backgroundColor: cThemeBase === 'dark' ? '#080d1c' : darkerPrimary }}
                  >
                    <span className="text-[7px] font-black text-white/50 uppercase tracking-widest pl-1 mb-2">Jornada</span>
                    <div className="space-y-1.5">
                      {[
                        { l: 'Total', v: '24' },
                        { l: 'Novos', v: '6', color: 'text-sky-400' }
                      ].map((m, idx) => (
                        <div key={idx} className="p-1.5 bg-black/20 border border-white/5 rounded-lg flex flex-col justify-between text-white">
                          <span className="text-[6px] text-slate-400 uppercase font-bold">{m.l}</span>
                          <span className={`text-xs font-black mt-0.5 ${m.color || ''}`}>{m.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Área de Conteúdo Principal */}
                  <div className="flex-1 flex flex-col h-full overflow-hidden text-slate-800 dark:text-slate-200">
                    {/* Cabeçalho */}
                    <div className="h-10 border-b border-black/5 bg-white/60 backdrop-blur-md px-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md overflow-hidden bg-white flex items-center justify-center border border-slate-200/50 flex-shrink-0 select-none shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                          {cLogo && (cLogo.startsWith('http') || cLogo.startsWith('data:image/') || cLogo.includes('.')) ? (
                            <img src={cLogo} alt="Logo" className="w-3 h-3 object-contain" />
                          ) : (
                            (() => {
                              const logoMap = {
                                '🦷': Activity,
                                '✨': Sparkles,
                                '💎': Gem,
                                '🏥': Building,
                                '🛡️': Shield,
                                '⚕️': Activity
                              };
                              const IconComponent = logoMap[cLogo] || Activity;
                              return <IconComponent className="w-2.5 h-2.5 text-secondary" />;
                            })()
                          )}
                        </div>
                        <span className="text-[9px] font-black text-slate-800 tracking-wide truncate max-w-[60px]">{cName || 'Sorrisoclinica'}</span>
                      </div>

                      {/* Botões do Topo */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-md bg-slate-100 flex items-center justify-center text-[7px] text-slate-550 border border-slate-200/40">☼</div>
                        <div className="w-4 h-4 rounded-md bg-slate-100 flex items-center justify-center text-[7px] text-slate-550 border border-slate-200/40 font-bold">🔔</div>
                      </div>
                    </div>

                    {/* Corpo do Dashboard */}
                    <div className="flex-1 p-3 overflow-hidden">
                      <h4 className="text-[10px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                        Olá, Dr. Thácio!
                      </h4>
                      <p className="text-[6px] text-slate-550 dark:text-slate-400 mt-0.5">Acompanhe as métricas de sua clínica em tempo real.</p>

                      {/* Exemplo de Card */}
                      <div className="mt-2.5 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/40 dark:border-slate-700 shadow-sm flex flex-col justify-between h-[65px] transition-transform duration-300">
                        <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wide">Faturamento Estimado</span>
                        <span className="text-sm font-black font-title tracking-tight mt-0.5" style={{ color: cThemeBase === 'dark' ? '#3b82f6' : cSecondary }}>
                          R$ 38.450,00
                        </span>
                        <span className="text-[5px] text-emerald-500 font-bold mt-1">▲ +12% em relação ao mês anterior</span>
                      </div>
                    </div>
                  </div>

                  {/* Dica Flutuante no Sandbox */}
                  <div className="absolute right-3.5 bottom-3.5 px-2 py-1 rounded-md bg-slate-900/90 text-white text-[7px] font-bold tracking-wider uppercase select-none pointer-events-none shadow-lg border border-white/5 flex items-center gap-1 backdrop-blur-md">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    Visualização em tempo real
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* SUB-ABA: GERENCIAMENTO DE EQUIPE */}
      {activeSubTab === 'equipe' && (
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/60 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white font-title">Profissionais e Equipe</h3>
              <p className="text-xs text-slate-450 mt-0.5">Gerencie os funcionários, permissões de acesso e dentistas de sua clínica.</p>
            </div>
            <button
              onClick={() => setShowAddStaff(true)}
              className="px-4 py-2 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98] flex items-center gap-1.5"
              style={{ backgroundColor: currentTheme.secondary_color }}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Adicionar Profissional</span>
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-550 border-b border-slate-200/40 dark:border-slate-800">
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
                          'bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/40'
                        }`}>
                          {isDoctor ? (
                            <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-indigo-500" /> Dentista</span>
                          ) : isFinancial ? (
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-amber-500" /> Financeiro</span>
                          ) : (
                            <span className="flex items-center gap-1"><User className="w-3 h-3 text-emerald-500" /> Recepção</span>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
          
          {/* WhatsApp Evolution API Config */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs font-title">Integração WhatsApp (Evolution API)</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">Conecte o seu número de WhatsApp comercial para automações e chatbot.</p>
              </div>
            </div>

            {evolutionStatus === 'CONNECTED' ? (
              <div className="space-y-4 py-1.5 text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl flex items-center gap-2 font-bold">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  Instância Ativa & Conectada
                </div>

                <div className="space-y-1.5 font-semibold text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Servidor:</span>
                    <span className="font-mono text-[10px] truncate max-w-[180px]">{evolutionUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Instância:</span>
                    <span className="font-mono text-[10px]">{evolutionInstance}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDisconnectWhatsApp}
                  className="w-full py-2 bg-red-650 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl shadow active:scale-95 transition-all"
                >
                  Desconectar Instância
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveWhatsAppConfig} className="space-y-3.5 text-xs text-left">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Evolution API Server URL</label>
                  <input
                    type="url"
                    required
                    placeholder="ex: https://api.evolution.com.br"
                    value={evolutionUrl}
                    onChange={(e) => setEvolutionUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Instância</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: clinica-sorriso"
                      value={evolutionInstance}
                      onChange={(e) => setEvolutionInstance(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Apikey Token</label>
                    <input
                      type="password"
                      required
                      placeholder="API token key"
                      value={evolutionToken}
                      onChange={(e) => setEvolutionToken(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition-all active:scale-95"
                >
                  Conectar Instância WhatsApp
                </button>
              </form>
            )}
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

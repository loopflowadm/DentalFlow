import { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings, Clock, Trash2, Check, Sun, Moon,
  Smartphone, Calendar, Mail, Key, QrCode, X, Palette, Image,
  Sparkles, Building, Type, Globe, Compass, Lock,
  Activity, DollarSign, User, Gem, Shield, Bot, Zap,
  ChevronRight, CheckCircle, ExternalLink, Copy, Users, ClipboardList
} from 'lucide-react';
import AIModule from '../ai/AIModule';
import Automacoes from '../automacoes/Automacoes';
import Logo from '../../components/Logo';

const BRAND_PRESETS = [
  {
    name: 'Classic Navy',
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
    secondary: '#196BFB',
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
  },
  {
    name: 'Esmeralda VIP',
    primary: '#064E3B',
    secondary: '#10B981',
    accent: '#D1FAE5',
  },
  {
    name: 'Coral Elegante',
    primary: '#881337',
    secondary: '#F43F5E',
    accent: '#FFE4E6',
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
  
  const { user, clinic, updateClinic } = useAuth();
  const { currentTheme, setThemeMode, applyTheme } = useTheme();

  // Estados locais
  const [activeSubTab, setActiveSubTab] = useState('identidade'); // 'identidade' | 'equipe' | 'procs' | 'integracoes'
  const [sandboxMode, setSandboxMode] = useState('light'); // 'light' | 'dark' preview in Sandbox

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

  const [showSavedAlert, setShowSavedAlert] = useState(false);

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
    if (applyTheme) {
      applyTheme({
        name: cName,
        logo_url: cLogo,
        primary_color: cPrimary,
        secondary_color: cSecondary,
        accent_color: cAccent,
        theme_base: cThemeBase
      });
    }
    setShowSavedAlert(true);
    setTimeout(() => setShowSavedAlert(false), 3500);
  };

  const handleApplyPreset = (preset) => {
    setCPrimary(preset.primary);
    setCSecondary(preset.secondary);
    setCAccent(preset.accent);
    if (applyTheme) {
      applyTheme({
        ...currentTheme,
        primary_color: preset.primary,
        secondary_color: preset.secondary,
        accent_color: preset.accent,
        theme_base: cThemeBase
      });
    }
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

  // Equipe da clínica
  const [staff, setStaff] = useState(() => {
    if (user && user.full_name) {
      return [{ id: 'st-owner', name: user.full_name, email: user.email || 'admin@clinica.com', role: 'Administrador (CLINIC_OWNER)' }];
    }
    return [];
  });

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/90 dark:bg-[#0D0D0D] backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-5 rounded-[24px] shadow-lg flex-shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20 shadow-sm flex-shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold font-title text-slate-900 dark:text-white">Configurações & Whitelabel Studio</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Whitelabel Ativo
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Personalize a marca, cores, logotipo e subdomínio exclusivo de sua clínica em tempo real.</p>
          </div>
        </div>

        {/* NAVEGAÇÃO DE SUB-ABAS */}
        <div className="flex bg-slate-100/80 dark:bg-black p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'identidade', label: 'Identidade Visual', icon: Palette },
            { id: 'equipe', label: 'Equipe & Permissões', icon: Users },
            { id: 'procs', label: 'Procedimentos & Convênios', icon: ClipboardList }
          ].map(tab => {
            const TabIcon = tab.icon;
            const isTabActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isTabActive 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md font-extrabold scale-[1.02]' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isTabActive ? 'text-violet-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-ABA: IDENTIDADE VISUAL & WHITELABEL */}
      {activeSubTab === 'identidade' && (
        <form onSubmit={handleSaveBranding} className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
          
          {/* FORMULÁRIO DE CONFIGURAÇÃO DE MARCA (COLUNA DA ESQUERDA - COMPACTO E SEM SCROLL) */}
          <div className="lg:col-span-5 space-y-3">
            {(() => {
              const isImageUrl = cLogo && (cLogo.startsWith('http') || cLogo.startsWith('/') || cLogo.includes('.') || cLogo.includes('data:image'));
              return (
                <>
                  {/* ALERTA DE SUCESSO AO SALVAR */}
                  {showSavedAlert && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in zoom-in-95 duration-200 shadow-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Identidade visual salva com sucesso!</span>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold bg-emerald-500/20 px-2 py-0.5 rounded-lg">Aplicado</span>
                    </div>
                  )}

                  {/* BLOCO 1: DADOS DA MARCA & TEMA BASE DA CLÍNICA */}
                  <div className="bg-white dark:bg-[#0D0D0D] p-4 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-md space-y-3 transition-colors duration-300">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                      <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 font-title">
                        <Building className="w-3.5 h-3.5 text-violet-500" /> Marca & Tema da Clínica
                      </h3>
                      <span className="text-[9px] font-bold text-slate-400">Identidade Visual</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center text-xs text-left">
                      {/* Nome da Clínica */}
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Nome Comercial</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={cName}
                            onChange={(e) => setCName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black border border-slate-200/80 dark:border-white/10 rounded-xl py-2 pl-8 pr-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-violet-500 transition-colors shadow-inner"
                            placeholder="ex: OdontoFace Clínica"
                          />
                          <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                      </div>

                      {/* Logotipo da Clínica */}
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Logotipo</label>
                        
                        <div className="flex gap-2 items-center p-1 px-2 rounded-xl bg-slate-50/80 dark:bg-black border border-slate-200/80 dark:border-white/10 min-h-[38px]">
                          <div className="w-7 h-7 rounded-lg overflow-hidden bg-white dark:bg-[#18181B] flex items-center justify-center border border-slate-200 dark:border-white/10 text-sm select-none flex-shrink-0 shadow-sm">
                            {isImageUrl ? (
                              <img src={cLogo} alt="Logo" className="w-5 h-5 object-contain" />
                            ) : (
                              <Logo collapsed={true} className="w-4 h-4" />
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-500 hover:bg-violet-600 text-white rounded-lg cursor-pointer text-[10px] font-extrabold transition-all shadow-md active:scale-[0.98] select-none truncate">
                              <Image className="w-3 h-3 flex-shrink-0" />
                              <span>Fazer Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                            </label>

                            {isImageUrl && (
                              <button
                                type="button"
                                onClick={() => setCLogo('🦷')}
                                className="text-[9px] text-rose-500 hover:text-rose-400 font-bold cursor-pointer hover:underline flex-shrink-0"
                              >
                                Remover
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divisor & Tema Padrão */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                      <label className="block text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Tema Padrão do App</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            const newTheme = 'light';
                            setCThemeBase(newTheme);
                            setSandboxMode(newTheme);
                            if (applyTheme) {
                              applyTheme({
                                ...currentTheme,
                                primary_color: cPrimary,
                                secondary_color: cSecondary,
                                accent_color: cAccent,
                                theme_base: newTheme
                              });
                            }
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                            cThemeBase === 'light'
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-sm font-black ring-2 ring-amber-500/20'
                              : 'bg-slate-50 dark:bg-black border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>Claro</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const newTheme = 'dark';
                            setCThemeBase(newTheme);
                            setSandboxMode(newTheme);
                            if (applyTheme) {
                              applyTheme({
                                ...currentTheme,
                                primary_color: cPrimary,
                                secondary_color: cSecondary,
                                accent_color: cAccent,
                                theme_base: newTheme
                              });
                            }
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                            cThemeBase === 'dark'
                              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 shadow-sm font-black ring-2 ring-indigo-500/20'
                              : 'bg-slate-50 dark:bg-black border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Escuro</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BLOCO 2: PALETA DE CORES DA MARCA (DESIGN TOKENS) */}
                  <div className="bg-white dark:bg-[#0D0D0D] p-4 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-md space-y-3 transition-colors duration-300">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                      <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 font-title">
                        <Palette className="w-3.5 h-3.5 text-violet-500" /> Paleta de Cores da Marca
                      </h3>
                      <span className="text-[9px] font-bold text-slate-400">Design Tokens</span>
                    </div>

                    {/* 3 Swatches Limpos de Cores da Marca */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Primária', val: cPrimary, set: setCPrimary },
                        { label: 'Secundária', val: cSecondary, set: setCSecondary },
                        { label: 'Destaque', val: cAccent, set: setCAccent }
                      ].map((item, idx) => (
                        <div 
                          key={idx} 
                          className="flex flex-col items-center p-2 bg-slate-50/80 dark:bg-[#0D0D0D] rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all group relative overflow-hidden text-center"
                        >
                          <span className="text-[9px] font-extrabold text-slate-800 dark:text-slate-200 uppercase mb-1">{item.label}</span>

                          {/* Swatch de cor tátil */}
                          <div 
                            className="relative w-8 h-8 rounded-xl border-2 border-white dark:border-slate-800 flex items-center justify-center cursor-pointer shadow-md group-hover:scale-105 transition-transform" 
                            style={{ backgroundColor: item.val, boxShadow: `0 4px 12px ${item.val}40` }}
                          >
                            <input 
                              type="color" 
                              value={item.val} 
                              onChange={(e) => item.set(e.target.value)} 
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
                            />
                          </div>

                          <span className="text-[8px] font-mono font-extrabold text-slate-800 dark:text-slate-200 mt-1.5 bg-white dark:bg-white/10 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-white/5">
                            {item.val.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Presets do Designer */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                      <label className="block text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Paletas Prontas Recomendadas</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {BRAND_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className="p-1.5 px-2 bg-slate-50 dark:bg-[#0D0D0D] hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg border border-slate-200/80 dark:border-white/5 text-left transition-all active:scale-[0.98] flex items-center justify-between group cursor-pointer"
                          >
                            <span className="text-[9px] font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[85px]">{preset.name}</span>
                            <div className="flex gap-1 flex-shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: preset.primary }} />
                              <span className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: preset.secondary }} />
                              <span className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: preset.accent }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* SANDBOX STUDIO: MOCKUP INTERATIVO + CTA DE SALVAR NO LADO DIREITO */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3">

            {/* JANELA MACOS DO SANDBOX */}
            {(() => {
              const isDarkPreview = sandboxMode === 'dark' || (cThemeBase === 'dark' && sandboxMode !== 'light');
              const mockSidebarBg = isDarkPreview 
                ? adjustColorBrightness(cPrimary || '#000000', -70) 
                : '#ffffff';
              const canvasBg = isDarkPreview ? '#000000' : '#F1F5F9';
              const isImageUrl = cLogo && (cLogo.startsWith('http') || cLogo.startsWith('/') || cLogo.includes('.') || cLogo.includes('data:image'));

              return (
                <div 
                  className="w-full rounded-[24px] border border-slate-300/80 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col select-none transition-all duration-300 relative bg-black"
                  style={{ fontFamily: `"${cFontFamily}", sans-serif` }}
                >
                  {/* BARRA SUPERIOR MACOS STUDIO */}
                  <div className="h-9 bg-slate-200/90 dark:bg-[#0A0A0A] border-b border-slate-300/60 dark:border-white/10 px-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] block" />
                      <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] block" />
                      <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] block" />
                    </div>

                    {/* URL BADGE DO SUBDOMÍNIO */}
                    <div className="px-3 py-0.5 rounded-full bg-white/70 dark:bg-white/10 text-[10px] font-mono text-slate-700 dark:text-slate-300 font-bold border border-slate-300/50 dark:border-white/10 flex items-center gap-1.5 shadow-xs">
                      <Lock className="w-3 h-3 text-emerald-500" />
                      <span>https://{cSubdomain || 'sorriso'}.dentalflow.com.br/dashboard</span>
                    </div>

                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">DentalFlow Studio</span>
                  </div>

                  {/* CORPO DA APLICAÇÃO MOCKUP (LAYOUT EXATO DO APP EM ESTILO ULTRA-MINIMALISTA) */}
                  <div 
                    className="flex flex-1 min-h-[460px] p-3 gap-3 relative overflow-hidden transition-colors duration-300" 
                    style={{ backgroundColor: canvasBg }}
                  >
                    {/* 1. SIDEBAR FLUTUANTE DE NAVEGAÇÃO DA APLICAÇÃO (UTILIZA A COR PRIMÁRIA DA CLÍNICA) */}
                    <div 
                      className="w-16 flex flex-col justify-between items-center py-3.5 px-2 rounded-[24px] border border-white/10 shadow-lg flex-shrink-0 z-10 transition-colors duration-300"
                      style={{ backgroundColor: mockSidebarBg }}
                    >
                      <div className="flex flex-col items-center gap-3.5 w-full">
                        {/* Placeholder de Logo Minimalista */}
                        <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center shadow-xs flex-shrink-0 ${
                          isDarkPreview ? 'bg-white/10 border-white/15' : 'bg-slate-100 border-slate-200/80'
                        }`}>
                          {isImageUrl ? (
                            <img src={cLogo} alt="Logo" className="w-6 h-6 object-contain" />
                          ) : (
                            <span className="w-4 h-4 rounded-md bg-white/70 block" />
                          )}
                        </div>

                        {/* Ícones do Menu Minimalistas */}
                        <div className="flex flex-col gap-2.5 w-full items-center mt-1">
                          {/* Ícone Ativo -> Usa a Cor Secundária da Clínica */}
                          <div 
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-all scale-105"
                            style={{ backgroundColor: cSecondary, boxShadow: `0 4px 14px ${cSecondary}50` }}
                          >
                            <span className="w-4 h-4 rounded-md bg-white block" />
                          </div>

                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDarkPreview ? 'bg-white/5' : 'bg-slate-100/80'}`}>
                            <span className={`w-4 h-4 rounded-sm block ${isDarkPreview ? 'bg-white/30' : 'bg-slate-400/40'}`} />
                          </div>

                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDarkPreview ? 'bg-white/5' : 'bg-slate-100/80'}`}>
                            <span className={`w-4 h-4 rounded-sm block ${isDarkPreview ? 'bg-white/30' : 'bg-slate-400/40'}`} />
                          </div>

                          {/* WhatsApp Icon com Indicador Pulsante */}
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/15 border border-emerald-500/30 relative">
                            <span className="w-4 h-4 rounded-sm bg-emerald-500 block" />
                            <span className={`w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 border-2 animate-pulse ${
                              isDarkPreview ? 'border-[#0B1220]' : 'border-white'
                            }`} />
                          </div>

                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDarkPreview ? 'bg-white/5' : 'bg-slate-100/80'}`}>
                            <span className={`w-4 h-4 rounded-sm block ${isDarkPreview ? 'bg-white/30' : 'bg-slate-400/40'}`} />
                          </div>

                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDarkPreview ? 'bg-white/5' : 'bg-slate-100/80'}`}>
                            <span className={`w-4 h-4 rounded-sm block ${isDarkPreview ? 'bg-white/30' : 'bg-slate-400/40'}`} />
                          </div>
                        </div>
                      </div>

                      {/* Avatar do Usuário Minimalista */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkPreview ? 'bg-white/10' : 'bg-slate-200'}`}>
                        <span className={`w-3 h-3 rounded-full block ${isDarkPreview ? 'bg-white/60' : 'bg-slate-400/60'}`} />
                      </div>
                    </div>

                    {/* 2. ÁREA DE CONTEÚDO DA APLICAÇÃO (LAYOUT EXATO MINIMALISTA) */}
                    <div className={`flex-1 rounded-[24px] border shadow-lg flex flex-col overflow-hidden text-left transition-colors duration-300 ${
                      isDarkPreview ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-200/80'
                    }`}>
                      
                      {/* BARRA SUPERIOR HEADER SKELETON */}
                      <div className={`h-12 border-b px-4 flex items-center justify-between flex-shrink-0 ${
                        isDarkPreview ? 'border-white/5 bg-[#0D0D0D]' : 'border-slate-100 bg-white'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg block ${isDarkPreview ? 'bg-slate-800' : 'bg-slate-200'}`} />
                          <span className={`w-20 h-2.5 rounded block font-black ${isDarkPreview ? 'bg-white' : 'bg-slate-800'}`} />
                          <span className={isDarkPreview ? 'text-slate-600 text-xs' : 'text-slate-300 text-xs'}>›</span>
                          <span className={`w-16 h-2 rounded block ${isDarkPreview ? 'bg-slate-600' : 'bg-slate-300'}`} />
                        </div>

                        {/* Botões do Canto Direito */}
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-xl block ${isDarkPreview ? 'bg-slate-800' : 'bg-slate-100'}`} />

                          {/* BOTÃO + NOVO PINTADO NA COR SECUNDÁRIA */}
                          <div 
                            className="w-20 h-7 rounded-xl shadow-md flex items-center justify-center gap-1"
                            style={{ backgroundColor: cSecondary }}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-white block" />
                            <span className="w-10 h-2 rounded bg-white block" />
                          </div>

                          <span className="w-7 h-7 rounded-xl bg-violet-500/10 block" />
                          <span className={`w-7 h-7 rounded-xl block ${isDarkPreview ? 'bg-slate-800' : 'bg-slate-100'}`} />
                          <span className="w-7 h-7 rounded-full bg-emerald-500 block" />
                        </div>
                      </div>

                      {/* CORPO DO DASHBOARD MINIMALISTA */}
                      <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
                        
                        {/* HERO BOX DE BOAS-VINDAS PINTADO NA COR DE DESTAQUE (ACCENT) */}
                        <div 
                          className="p-3.5 rounded-2xl border transition-colors space-y-2"
                          style={{ 
                            backgroundColor: isDarkPreview ? '#18181B' : adjustColorBrightness(cAccent || '#D9E2FF', 75),
                            borderColor: isDarkPreview ? 'rgba(255, 255, 255, 0.08)' : adjustColorBrightness(cAccent || '#D9E2FF', 20)
                          }}
                        >
                          <span className={`w-32 h-3 rounded block font-black ${isDarkPreview ? 'bg-white' : 'bg-slate-900'}`} />
                          <span className={`w-64 h-2 rounded block ${isDarkPreview ? 'bg-slate-400/50' : 'bg-slate-500/50'}`} />
                        </div>

                        {/* 4 CARDS KPI DE MÉTRICAS */}
                        <div className="grid grid-cols-4 gap-2.5">
                          {/* Card 1: Faturamento (Colorido na Cor Secundária) */}
                          <div className={`p-3 rounded-2xl border shadow-sm flex flex-col justify-between h-20 ${
                            isDarkPreview ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-200/80'
                          }`}>
                            <span className={`w-20 h-2 rounded block ${isDarkPreview ? 'bg-white/20' : 'bg-slate-300'}`} />
                            <span className="w-24 h-4 rounded-md block" style={{ backgroundColor: cSecondary }} />
                            <span className="w-10 h-1.5 rounded bg-emerald-500/60 block" />
                          </div>

                          {/* Card 2 */}
                          <div className={`p-3 rounded-2xl border shadow-sm flex flex-col justify-between h-20 ${
                            isDarkPreview ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-200/80'
                          }`}>
                            <span className={`w-24 h-2 rounded block ${isDarkPreview ? 'bg-white/20' : 'bg-slate-300'}`} />
                            <span className={`w-10 h-4 rounded-md block ${isDarkPreview ? 'bg-white' : 'bg-slate-800'}`} />
                            <span className="w-12 h-1.5 rounded bg-slate-400/40 block" />
                          </div>

                          {/* Card 3 */}
                          <div className={`p-3 rounded-2xl border shadow-sm flex flex-col justify-between h-20 ${
                            isDarkPreview ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-200/80'
                          }`}>
                            <span className={`w-16 h-2 rounded block ${isDarkPreview ? 'bg-white/20' : 'bg-slate-300'}`} />
                            <span className={`w-14 h-4 rounded-md block ${isDarkPreview ? 'bg-white' : 'bg-slate-800'}`} />
                            <span className="w-10 h-1.5 rounded bg-slate-400/40 block" />
                          </div>

                          {/* Card 4 */}
                          <div className={`p-3 rounded-2xl border shadow-sm flex flex-col justify-between h-20 ${
                            isDarkPreview ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-200/80'
                          }`}>
                            <span className={`w-16 h-2 rounded block ${isDarkPreview ? 'bg-white/20' : 'bg-slate-300'}`} />
                            <span className={`w-10 h-4 rounded-md block ${isDarkPreview ? 'bg-white' : 'bg-slate-800'}`} />
                            <span className="w-12 h-1.5 rounded bg-slate-400/40 block" />
                          </div>
                        </div>

                        {/* SEÇÃO PRINCIPAL EM 2 COLUNAS: GRÁFICO (ESQUERDA) E CALENDÁRIO/AGENDA (DIREITA) */}
                        <div className="grid grid-cols-12 gap-3">
                          
                          {/* COLUNA ESQUERDA GRÁFICO (8 COLS) */}
                          <div className="col-span-8 space-y-3">
                            <div className={`p-3.5 rounded-2xl border shadow-sm ${
                              isDarkPreview ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-200/80'
                            }`}>
                              <div className="flex justify-between items-center mb-3">
                                <div className="space-y-1">
                                  <span className={`w-44 h-2.5 rounded block ${isDarkPreview ? 'bg-white' : 'bg-slate-800'}`} />
                                  <span className="w-32 h-1.5 rounded bg-slate-400/40 block" />
                                </div>
                                <span className="w-16 h-2 rounded block" style={{ backgroundColor: cSecondary }} />
                              </div>

                              {/* Gráfico Simulado de Linhas na Cor Secundária */}
                              <div className={`h-28 w-full flex items-end gap-2 pt-4 px-2 border-b border-l relative ${
                                isDarkPreview ? 'border-slate-800' : 'border-slate-200'
                              }`}>
                                <svg className="absolute inset-0 w-full h-full p-2 overflow-visible" preserveAspectRatio="none">
                                  <path 
                                    d="M 10 70 Q 60 20, 120 50 T 240 30 T 320 10" 
                                    fill="none" 
                                    stroke={cSecondary} 
                                    strokeWidth="3" 
                                  />
                                </svg>
                              </div>
                            </div>

                            {/* Sala de Espera Minimalista */}
                            <div className={`p-3 rounded-2xl border shadow-sm flex justify-between items-center ${
                              isDarkPreview ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-200/80'
                            }`}>
                              <div className="space-y-1">
                                <span className={`w-36 h-2 rounded block ${isDarkPreview ? 'bg-white' : 'bg-slate-800'}`} />
                                <span className="w-48 h-1.5 rounded bg-slate-400/40 block" />
                              </div>
                              <span className="w-16 h-3 rounded-full bg-amber-500/20 border border-amber-500/30 block" />
                            </div>
                          </div>

                          {/* COLUNA DIREITA CALENDÁRIO & AGENDA (4 COLS) */}
                          <div className="col-span-4 space-y-3">
                            
                            {/* Mini Calendário Clínico Skeleton */}
                            <div className={`p-3 rounded-2xl border shadow-sm ${
                              isDarkPreview ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-200/80'
                            }`}>
                              <div className={`flex justify-between items-center mb-2 pb-1 border-b ${
                                isDarkPreview ? 'border-white/5' : 'border-slate-100'
                              }`}>
                                <span className={`w-20 h-2 rounded block ${isDarkPreview ? 'bg-white' : 'bg-slate-800'}`} />
                                <span className="w-10 h-1.5 rounded bg-slate-400/40 block" />
                              </div>

                              {/* Grid do Mês com o Dia Atual Destacado em cSecondary */}
                              <div className="grid grid-cols-7 gap-1 text-center">
                                {[...Array(7)].map((_, i) => (
                                  <span key={i} className={`w-full h-1.5 rounded block my-1 ${isDarkPreview ? 'bg-white/20' : 'bg-slate-300'}`} />
                                ))}
                                {[...Array(28)].map((_, i) => {
                                  const isCurrentDay = i + 1 === 23;
                                  return (
                                    <div 
                                      key={i} 
                                      className={`h-4 rounded-md flex items-center justify-center ${
                                        isCurrentDay 
                                          ? 'shadow-sm scale-105' 
                                          : (isDarkPreview ? 'bg-white/5' : 'bg-slate-100')
                                      }`}
                                      style={isCurrentDay ? { backgroundColor: cSecondary } : {}}
                                    >
                                      {isCurrentDay && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Agenda de Hoje Skeleton */}
                            <div className={`p-3 rounded-2xl border shadow-sm ${
                              isDarkPreview ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-200/80'
                            }`}>
                              <div className="flex justify-between items-center mb-2">
                                <span className={`w-16 h-2 rounded block ${isDarkPreview ? 'bg-white' : 'bg-slate-800'}`} />
                                <span className="w-8 h-1.5 rounded bg-slate-400/40 block" />
                              </div>

                              <div className="space-y-1.5">
                                <div className={`p-1.5 rounded-xl border flex justify-between items-center ${
                                  isDarkPreview ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/60'
                                }`}>
                                  <span className={`w-20 h-2 rounded block ${isDarkPreview ? 'bg-white/80' : 'bg-slate-700'}`} />
                                  <span className="w-10 h-2.5 rounded bg-emerald-500/20 block" />
                                </div>
                                <div className={`p-1.5 rounded-xl border flex justify-between items-center ${
                                  isDarkPreview ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/60'
                                }`}>
                                  <span className={`w-18 h-2 rounded block ${isDarkPreview ? 'bg-white/80' : 'bg-slate-700'}`} />
                                  <span className="w-10 h-2.5 rounded bg-amber-500/20 block" />
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* BADGE FLUTUANTE DE HARMONIA DE CORES */}
                  <div className="absolute right-4 bottom-4 px-3 py-1.5 rounded-xl bg-slate-950/90 text-white text-[9px] font-extrabold tracking-wider uppercase select-none pointer-events-none shadow-2xl border border-white/10 flex items-center gap-2 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>⚡ Harmonia Minimalista da Marca</span>
                  </div>
                </div>
              );
            })()}

            {/* BOTÃO CTA PRINCIPAL DE SALVAR NO LADO DIREITO */}
            <button
              type="submit"
              className="w-full py-3.5 text-white font-black text-xs rounded-2xl shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              style={{ 
                backgroundColor: cSecondary, 
                boxShadow: `0 8px 25px ${cSecondary}50` 
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Salvar Identidade Visual da Clínica</span>
            </button>

          </div>
        </form>
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
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Procedimentos Lançados</h3>
              <button
                onClick={() => setShowAddProc(true)}
                className="px-3.5 py-2 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98] cursor-pointer"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                Adicionar Procedimento
              </button>
            </div>
            
            <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-b border-slate-200/40 dark:border-slate-800">
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
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/30 dark:border-slate-700/30 uppercase tracking-wide">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleDeleteProc(p.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer"
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
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Convênios e Planos</h3>
              <button
                onClick={() => setShowAddInsurance(true)}
                className="px-3.5 py-2 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98] cursor-pointer"
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

      {/* SUB-ABA: INTEGRAÇÕES API & WEBHOOKS */}
      {activeSubTab === 'integracoes' && (
        <div className="space-y-6 text-left animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* 1. WhatsApp Evolution API */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    evolutionStatus === 'CONNECTED' 
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                      : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                  }`}>
                    {evolutionStatus === 'CONNECTED' ? '● Ativo' : '○ Aguardando Conexão'}
                  </span>
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-white font-title">WhatsApp Meta / Evolution API</h3>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Disparo de mensagens automáticas de confirmação, lembretes de consultas e robô Sofia.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="text"
                  placeholder="URL da API (ex: https://api.whatsapp.com)"
                  value={evolutionUrl}
                  onChange={(e) => setEvolutionUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-1.5 px-3 text-[11px] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(`evolution_url_${clinic?.id}`, evolutionUrl);
                    localStorage.setItem(`evolution_status_${clinic?.id}`, 'CONNECTED');
                    setEvolutionStatus('CONNECTED');
                    alert('Instância do WhatsApp configurada com sucesso!');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Salvar Conexão WhatsApp
                </button>
              </div>
            </div>

            {/* 2. Google Calendar Sync */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    gcalConnected 
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                      : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                  }`}>
                    {gcalConnected ? '● Sincronizado' : '○ Desconectado'}
                  </span>
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-white font-title">Google Calendar</h3>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Sincronização bidirecional em tempo real de agendamentos entre o OdontoCRM e o Google Agenda.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setGcalConnected(!gcalConnected);
                    alert(gcalConnected ? 'Google Calendar desconectado.' : 'Google Calendar conectado com sucesso!');
                  }}
                  className={`w-full py-2 font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                    gcalConnected 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {gcalConnected ? 'Desconectar Google Calendar' : 'Conectar Conta Google'}
                </button>
              </div>
            </div>

            {/* 3. Gateway de Pagamentos Stripe / PIX */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    ● Ativo
                  </span>
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-white font-title">Stripe / Pagamentos PIX & Cartão</h3>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Geração de links de cobrança e QR Code PIX diretamente nos orçamentos dos pacientes.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="password"
                  placeholder="Chave Secreta Stripe (sk_live_...)"
                  defaultValue="sk_live_demo_key_odontocrm_2026"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-1.5 px-3 text-[11px] focus:outline-none font-mono text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => alert('Configurações de pagamento atualizadas com sucesso!')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                >
                  Salvar Gateway
                </button>
              </div>
            </div>

            {/* 4. n8n / Webhooks de Automação */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-500 border border-blue-500/30">
                    Webhooks On
                  </span>
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-white font-title">n8n / Webhooks de Automação</h3>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Disparos de eventos HTTP POST para automação de CRM com n8n, Make ou Zapier.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="url"
                  placeholder="URL do Webhook (https://n8n.suaclinica.com/webhook/...)"
                  defaultValue="https://n8n.odontocrm.com/webhook/clinic-events"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-1.5 px-3 text-[11px] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => alert('Webhook de automação ativado com sucesso!')}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                >
                  Testar Webhook
                </button>
              </div>
            </div>

            {/* 5. OpenAI / Gemini AI API Key */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-500 border border-purple-500/30">
                    IA Ativa
                  </span>
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-white font-title">Agente de IA (Gemini / OpenAI)</h3>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Chave customizada para processamento de linguagem natural do Robô Sofia e diagnósticos.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="password"
                  placeholder="Chave de API (AIzaSy... ou sk-...)"
                  defaultValue="AIzaSy_demo_gemini_key_2026"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl py-1.5 px-3 text-[11px] focus:outline-none font-mono text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => alert('Chave de IA atualizada com sucesso!')}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                >
                  Salvar Chave de IA
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
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

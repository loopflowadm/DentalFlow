import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../lib/mockDatabase';
import { supabase } from '../lib/supabase';
import { 
  Plus, Users, Shield, LogOut, CheckCircle, Palette, MonitorPlay, Key, Check, 
  Activity, Sparkles, Gem, Building, Server, Database, Cloud, Radio, Zap, 
  RefreshCw, CheckCircle2, AlertTriangle, Bug, Eye, Sliders, BarChart2, Globe, Cpu
} from 'lucide-react';
import Logo from '../components/Logo';

// Helpers puros externos para evitar erro react-hooks/purity
function generateClinicId() {
  return 'clinic-' + Math.random().toString(36).substr(2, 9);
}

function generateUserId() {
  return 'user-' + Math.random().toString(36).substr(2, 9);
}

export default function SuperAdmin() {
  const { logout, supabaseActive, selectClinic } = useAuth();
  
  // Controle de Abas
  const [activeTab, setActiveTab] = useState('tenants'); // 'tenants' | 'observability'

  // Lista de clínicas cadastradas
  const [clinics, setClinics] = useState([]);
  
  // Estados de Observabilidade, Flags e Auditoria
  const [dbLatency, setDbLatency] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [featureFlags, setFeatureFlags] = useState(() => mockDb.getFeatureFlags());
  const [auditLogs, setAuditLogs] = useState([]);

  // Carregar Feature Flags do Supabase/MockDb
  const loadFeatureFlags = async () => {
    if (supabaseActive && supabase) {
      try {
        const { data, error } = await supabase.from('system_flags').select('*');
        if (!error && data && data.length > 0) {
          const flagMap = {};
          data.forEach(f => { flagMap[f.id] = f.enabled; });
          setFeatureFlags(prev => ({ ...prev, ...flagMap }));
          return;
        }
      } catch (err) {
        console.warn('Usando mock flags:', err);
      }
    }
    setFeatureFlags(mockDb.getFeatureFlags());
  };

  // Carregar Logs de Auditoria do Supabase/MockDb
  const loadAuditLogs = async () => {
    if (supabaseActive && supabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        if (!error && data && data.length > 0) {
          setAuditLogs(data);
          return;
        }
      } catch (err) {
        console.warn('Usando mock audit logs:', err);
      }
    }
    setAuditLogs(mockDb.getAuditLogs());
  };

  // Alternar Feature Flag e persistir no banco + registrar audit log
  const handleToggleFeatureFlag = async (flagId) => {
    const newValue = !featureFlags[flagId];
    const updatedFlags = { ...featureFlags, [flagId]: newValue };
    setFeatureFlags(updatedFlags);
    mockDb.saveFeatureFlags(updatedFlags);

    const logAction = `Feature Flag "${flagId}" ${newValue ? 'HABILITADA' : 'DESABILITADA'}`;
    const logDetails = `SuperAdmin alterou o status global da flag no painel de observabilidade`;

    mockDb.addAuditLog(logAction, logDetails);

    if (supabaseActive && supabase) {
      try {
        await supabase.from('system_flags').upsert([{ id: flagId, enabled: newValue, updated_at: new Date().toISOString() }]);
        await supabase.from('audit_logs').insert([{ action: logAction, details: logDetails, created_at: new Date().toISOString() }]);
      } catch (err) {
        console.error('Erro ao persistir flag no Supabase:', err);
      }
    }

    loadAuditLogs();
  };

  // Estado do formulário de criação
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0f766e');
  const [secondaryColor, setSecondaryColor] = useState('#0d9488');
  const [logo, setLogo] = useState('🦷');
  const [plan, setPlan] = useState('Pro');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('123');
  
  // Status de gravação
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Função para suspender/reativar clínica
  const toggleClinicStatus = async (clinicToToggle) => {
    const newStatus = clinicToToggle.status === 'suspended' ? 'active' : 'suspended';
    
    if (supabaseActive && supabase) {
      try {
        const { error } = await supabase
          .from('clinics')
          .update({ status: newStatus })
          .eq('id', clinicToToggle.id);
        if (error) throw error;

        await supabase.from('audit_logs').insert([{
          clinic_id: clinicToToggle.id,
          action: `Status da Clínica ${clinicToToggle.name} alterado`,
          details: `Novo status: ${newStatus.toUpperCase()}`
        }]);
      } catch (err) {
        console.error(err);
      }
    } else {
      const updatedClinic = { ...clinicToToggle, status: newStatus };
      mockDb.saveClinic(updatedClinic);
    }

    mockDb.addAuditLog(
      `Status da Clínica ${clinicToToggle.name} alterado`,
      `Status alterado para ${newStatus.toUpperCase()}`
    );

    setClinics(prev => prev.map(c => (c.id === clinicToToggle.id ? { ...c, status: newStatus } : c)));
    setStatusMsg({
      type: 'success',
      text: `Status da clínica "${clinicToToggle.name}" alterado para ${newStatus === 'active' ? 'ATIVA' : 'SUSPENSA'}.`
    });
    loadAuditLogs();
  };

  // Carregar clínicas na inicialização
  const loadClinics = async () => {
    let rawClinics;
    if (supabaseActive && supabase) {
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        rawClinics = data || [];
      } catch (err) {
        console.error(err);
        rawClinics = mockDb.getClinics();
      }
    } else {
      rawClinics = mockDb.getClinics();
    }

    const normalized = rawClinics.map(c => ({
      ...c,
      plan: c.plan || (c.id === 'clinic-sorriso-perfeito' ? 'Enterprise' : c.id === 'clinic-odonto-prime' ? 'Starter' : 'Pro'),
      status: c.status || (c.id === 'clinic-odonto-prime' ? 'suspended' : 'active')
    }));

    setClinics(normalized);
  };

  // Teste de latência e saúde do sistema
  const checkSystemHealth = async () => {
    setCheckingHealth(true);
    const start = performance.now();
    try {
      if (supabaseActive && supabase) {
        await supabase.from('clinics').select('id', { head: true, count: 'exact' });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      const end = performance.now();
      setDbLatency(Math.round(end - start));
    } catch (err) {
      console.error('Health check fail', err);
      setDbLatency(-1);
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        loadClinics();
        checkSystemHealth();
        loadFeatureFlags();
        loadAuditLogs();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [supabaseActive]);

  // Gerar subdomínio baseado no nome da clínica
  useEffect(() => {
    if (name) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]/g, ''); // Apenas letras e números
      
      let active = true;
      const run = async () => {
        await Promise.resolve();
        if (active) {
          setSubdomain(slug);
        }
      };
      run();
      return () => {
        active = false;
      };
    }
  }, [name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setLoading(true);

    const newClinic = {
      id: supabaseActive ? undefined : generateClinicId(),
      name,
      subdomain,
      logo_url: logo,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      plan: plan || 'Pro',
      status: 'active',
      created_at: new Date().toISOString()
    };

    if (supabaseActive && supabase) {
      try {
        // 1. Inserir clínica
        const { data: clinicData, error: clinicErr } = await supabase
          .from('clinics')
          .insert([newClinic])
          .select()
          .single();

        if (clinicErr) throw clinicErr;

        // 2. Criar perfil de usuário associado
        setStatusMsg({ 
          type: 'success', 
          text: `Clínica ${name} registrada no Supabase!` 
        });
        
        loadClinics();
        resetForm();
      } catch (err) {
        setStatusMsg({ type: 'danger', text: 'Erro ao registrar no Supabase: ' + err.message });
      } finally {
        setLoading(false);
      }
    } else {
      // Registrar no MockDb Local
      try {
        const savedClinic = mockDb.saveClinic(newClinic);
        
        // Criar usuário para a clínica
        const newUser = {
          id: generateUserId(),
          email: adminEmail || `admin@${subdomain}.com`,
          password: adminPassword,
          role: 'CLINIC_ADMIN',
          full_name: `Administrador da ${name}`,
          clinic_id: savedClinic.id
        };
        mockDb.saveUser(newUser);

        setStatusMsg({ 
          type: 'success', 
          text: `Clínica ${name} registrada com sucesso localmente! Usuário de login: ${newUser.email}` 
        });

        loadClinics();
        resetForm();
      } catch (err) {
        setStatusMsg({ type: 'danger', text: 'Erro ao registrar clinic localmente.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setName('');
    setSubdomain('');
    setPrimaryColor('#0f766e');
    setSecondaryColor('#0d9488');
    setLogo('🦷');
    setPlan('Pro');
    setAdminEmail('');
    setAdminPassword('123');
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-body p-6 lg:p-10 relative overflow-hidden">
      
      {/* Glows de fundo da marca DentalFlow/OdontoCRM */}
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-[#1855FD]/10 -top-20 -left-20" />
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-indigo-600/10 -bottom-20 -right-20" />

      {/* Header macOS Depth Vibe */}
      <header className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-8 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="flex items-center gap-2">
            <Logo collapsed={false} className="w-48 h-auto drop-shadow-[0_4px_16px_rgba(24,85,253,0.3)]" />
          </div>
          <div className="h-6 w-[1px] bg-white/15 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#1855FD]/15 text-[#196BFB] font-bold px-3 py-1 rounded-full border border-[#1855FD]/30 font-title tracking-wider uppercase">
              SuperAdmin Control Room
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-900/60 border border-white/10 px-3 py-1.5 rounded-xl font-mono">
            Ambiente: <b className="text-emerald-400">{supabaseActive ? 'Supabase Postgres' : 'Simulação Local'}</b>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-semibold px-4 py-2.5 rounded-xl transition-all border border-white/10 active:scale-[0.98] shadow-sm backdrop-blur-md"
          >
            <LogOut className="w-4 h-4" />
            Sair do SaaS
          </button>
        </div>
      </header>

      {/* Navegação por Abas macOS Depth UI */}
      <div className="flex items-center gap-2 mb-8 bg-[#121827]/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 w-fit shadow-2xl relative z-10">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tenants'
              ? 'bg-gradient-to-r from-[#1855FD] to-[#03269A] text-white shadow-lg shadow-[#1855FD]/30 border border-white/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Building className="w-4 h-4" />
          Inquilinos & Whitelabel
          <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-black/40 text-blue-200 font-mono">
            {clinics.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('observability')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'observability'
              ? 'bg-gradient-to-r from-[#1855FD] to-[#03269A] text-white shadow-lg shadow-[#1855FD]/30 border border-white/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          Saúde do Sistema & Observabilidade
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      </div>

      {activeTab === 'tenants' ? (
        /* Grid Central - Inquilinos */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Painel do Formulário & Listagem (Lado Esquerdo - 8 Colunas) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Formulário */}
          <div className="bg-[#0D0D0D]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#1855FD] via-[#196BFB] to-[#03269A]" />
            
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-title">
              <Plus className="w-5 h-5 text-[#196BFB]" />
              Cadastrar Nova Clínica
            </h2>

            {statusMsg.text && (
              <div className={`mb-5 p-4 rounded-xl text-xs border flex items-start gap-2.5 ${
                statusMsg.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">Nome da Clínica</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Clinica Sorriso Perfeito"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/80 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#1855FD] focus:ring-1 focus:ring-[#1855FD] transition-all text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">Subdomínio (Tenant)</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="sorrisoperfeito"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      className="w-full bg-black/80 border border-white/10 rounded-xl p-2.5 text-sm pr-16 focus:outline-none focus:border-[#1855FD] focus:ring-1 focus:ring-[#1855FD] transition-all text-white font-mono placeholder-slate-500"
                    />
                    <span className="absolute right-3 text-[10px] text-slate-400 font-semibold font-mono">.crm.com</span>
                  </div>
                </div>
              </div>

              {/* Controles de Design Whitelabel */}
              <div className="p-4 bg-black/60 rounded-xl border border-white/10 space-y-3">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-title">
                  <Palette className="w-4 h-4 text-[#196BFB]" />
                  Identidade Visual Whitelabel & Plano
                </span>
                
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-medium">Cor Primária</label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-1 text-[11px] text-center font-mono text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-medium">Cor Secundária</label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-1 text-[11px] text-center font-mono text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-medium">Plano SaaS</label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:border-[#1855FD] outline-none"
                    >
                      <option value="Starter">Starter (R$ 199)</option>
                      <option value="Pro">Pro (R$ 399)</option>
                      <option value="Enterprise">Enterprise (R$ 799)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-medium font-medium">Logotipo</label>
                    <select
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:border-[#1855FD] outline-none"
                    >
                      <option value="🦷">Dente</option>
                      <option value="✨">Brilho</option>
                      <option value="💎">Diamante</option>
                      <option value="🏥">Hospital</option>
                      <option value="🛡️">Escudo</option>
                      <option value="⚕️">Medicina</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Admin User setup */}
              {!supabaseActive && (
                <div className="p-4 bg-black/60 rounded-xl border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-title">
                    <Key className="w-4 h-4 text-[#196BFB]" />
                    Conta Administrativa da Clínica
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-semibold">E-mail do Administrador</label>
                      <input
                        type="email"
                        placeholder="Ex: admin@sorriso.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Senha Inicial</label>
                      <input
                        type="password"
                        placeholder="Ex: 123"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#1855FD] to-[#03269A] hover:from-[#2566ff] hover:to-[#042eb8] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#1855FD]/25 border border-white/10 active:scale-[0.98] transition-all text-xs cursor-pointer"
              >
                {loading ? 'Processando cadastro...' : 'Registrar Inquilino'}
              </button>
            </form>
          </div>

          {/* Lista de Clínicas */}
          <div className="bg-[#0D0D0D]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2 font-title">
                <Users className="w-5 h-5 text-[#196BFB]" />
                Inquilinos Registrados ({clinics.length})
              </h3>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {clinics.filter(c => c.status !== 'suspended').length} Ativas
                </span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  {clinics.filter(c => c.status === 'suspended').length} Suspensas
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] text-slate-400 uppercase tracking-wider font-title">
                    <th className="pb-3 font-bold">Clínica</th>
                    <th className="pb-3 font-bold">Plano & Status</th>
                    <th className="pb-3 font-bold">Subdomínio</th>
                    <th className="pb-3 font-bold">Identidade</th>
                    <th className="pb-3 font-bold text-center">Data</th>
                    <th className="pb-3 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {clinics.map((c) => {
                    const isSuspended = c.status === 'suspended';
                    return (
                      <tr key={c.id || c.subdomain} className={`hover:bg-white/5 transition-colors ${isSuspended ? 'opacity-75 bg-red-950/10' : ''}`}>
                        <td className="py-3.5 font-bold text-white flex items-center gap-2.5">
                          <span className="text-lg flex items-center justify-center p-1 bg-white/5 rounded-lg border border-white/10">
                            {c.logo_url === '🦷' ? (
                              <Logo collapsed={true} className="w-5 h-5" />
                            ) : (
                              (() => {
                                const logoMap = {
                                  '✨': Sparkles,
                                  '💎': Gem,
                                  '🏥': Building,
                                  '🛡️': Shield,
                                  '⚕️': Activity
                                };
                                const IconComponent = logoMap[c.logo_url] || Activity;
                                return <IconComponent className="w-5 h-5 text-[#196BFB]" />;
                              })()
                            )}
                          </span>
                          <div>
                            <span className="block font-title font-bold text-sm">{c.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono font-normal">ID: {c.id || 'local'}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.plan === 'Enterprise' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                              c.plan === 'Starter' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                              'bg-[#1855FD]/15 text-[#196BFB] border border-[#1855FD]/30'
                            }`}>
                              {c.plan || 'Pro'}
                            </span>
                            {isSuspended ? (
                              <span className="text-[9px] font-bold text-red-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Suspensa
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ativa
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-300 font-mono">{c.subdomain}.crm.com</td>
                        <td className="py-3.5">
                          <div className="flex gap-1.5 items-center">
                            <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c.primary_color }} title="Cor Primária" />
                            <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c.secondary_color }} title="Cor Secundária" />
                          </div>
                        </td>
                        <td className="py-3.5 text-center text-slate-400 font-mono">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleClinicStatus(c)}
                              className={`px-2.5 py-1 rounded-xl font-bold active:scale-95 transition-all text-[10px] border cursor-pointer ${
                                isSuspended
                                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/30'
                                  : 'bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white border-red-500/30'
                              }`}
                              title={isSuspended ? 'Reativar Clínica' : 'Suspender por Inadimplência'}
                            >
                              {isSuspended ? 'Reativar' : 'Suspender'}
                            </button>
                            <button
                              type="button"
                              onClick={() => selectClinic(c)}
                              className="bg-[#1855FD]/20 text-[#196BFB] hover:bg-[#1855FD] hover:text-white px-3 py-1 rounded-xl font-bold active:scale-95 transition-all text-[10px] border border-[#1855FD]/30 shadow-sm cursor-pointer"
                            >
                              Acessar Painel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {clinics.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        Nenhuma clínica cadastrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lado Direito: Preview Whitelabel do CRM (Lado Direito - 5 Colunas) */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">
              <MonitorPlay className="w-4 h-4 text-violet-400" />
              Preview Whitelabel (Tempo Real)
            </div>

            {/* Simulador de Computador/Monitor */}
            <div className="w-full bg-slate-950 rounded-2xl p-3 shadow-2xl border border-slate-700/60 overflow-hidden">
              {/* Barra superior de controle do navegador simulado */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-500">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded px-4 py-0.5 text-center font-mono w-[180px] truncate text-[9px]">
                  https://{subdomain || 'exemplo'}.crm.com
                </div>
                <div className="w-10"></div>
              </div>

              {/* Interface do CRM Simulada */}
              <div className="rounded-xl overflow-hidden bg-slate-100 text-slate-800 min-h-[360px] flex flex-col font-sans transition-all duration-300">
                
                {/* Header da clínica simulada */}
                <header 
                  className="px-4 py-3 flex items-center justify-between shadow-sm border-b transition-colors duration-500"
                  style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{logo}</span>
                    <span className="font-title font-bold text-sm tracking-tight">{name || 'Minha Clínica'}</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                    U
                  </div>
                </header>

                {/* Corpo do CRM Simulado */}
                <div className="flex flex-1 text-slate-700 text-xs">
                  {/* Sidebar simulada */}
                  <aside className="w-20 bg-slate-50 border-r p-2 flex flex-col gap-2">
                    <div className="p-1 rounded bg-slate-200/60 font-semibold text-center text-[9px]">Agenda</div>
                    <div className="p-1 rounded text-center text-[9px] text-slate-500">Pacientes</div>
                    <div className="p-1 rounded text-center text-[9px] text-slate-500">WhatsApp</div>
                  </aside>

                  {/* Área de conteúdo simulada */}
                  <main className="flex-1 p-4 bg-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 font-title">Dashboard</span>
                      {/* Botão primário com a cor secundária simulada */}
                      <button 
                        className="px-2.5 py-1 text-[9px] text-white font-semibold rounded-md shadow-sm active:scale-95 transition-all"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        Nova Consulta
                      </button>
                    </div>

                    {/* Cards mockados com a cor secundária e primária em detalhes */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm flex flex-col">
                        <span className="text-[9px] text-slate-400 font-medium">Pacientes Hoje</span>
                        <span className="text-lg font-black font-title mt-0.5" style={{ color: primaryColor }}>12</span>
                        <span className="text-[8px] text-emerald-600 font-bold mt-1">▲ +25%</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm flex flex-col">
                        <span className="text-[9px] text-slate-400 font-medium">Confirmados</span>
                        <span className="text-lg font-black font-title mt-0.5" style={{ color: secondaryColor }}>8</span>
                        <span className="text-[8px] text-slate-500 font-bold mt-1">Aguardando 4</span>
                      </div>
                    </div>

                    {/* Tabela de Consultas Simulada */}
                    <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm flex-1 p-3">
                      <span className="font-bold text-slate-800 block mb-2 text-[9px] border-b pb-1">Próximos Horários</span>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[9px]">João Silva</span>
                            <span className="text-[8px] text-slate-400">Canal / Limpeza</span>
                          </div>
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[8px] font-bold rounded-full flex items-center gap-0.5">
                            <Check className="w-2 h-2" /> Confirmado
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[9px]">Maria Oliveira</span>
                            <span className="text-[8px] text-slate-400">Manutenção Aparelho</span>
                          </div>
                          <span 
                            className="px-1.5 py-0.5 text-[8px] font-bold rounded-full"
                            style={{ backgroundColor: `${secondaryColor}15`, color: secondaryColor }}
                          >
                            Aguardando
                          </span>
                        </div>
                      </div>
                    </div>
                  </main>
                </div>
              </div>
            </div>
            
            {/* Informações explicativas */}
            <div className="p-4 bg-slate-850 bg-slate-800/30 border border-slate-800 rounded-xl text-xs text-slate-400">
              <h4 className="font-bold text-slate-300 mb-1.5">Como testar:</h4>
              <p className="leading-relaxed">
                Ao alterar as cores no formulário de cadastro, o preview atualiza instantaneamente. O visual criado é renderizado usando variáveis de CSS injetadas dinamicamente no tema do cliente.
              </p>
            </div>
          </div>
        </div>

      </div>
      ) : (
        /* Aba de Observabilidade & Saúde do Sistema */
        <div className="space-y-8 animate-fadeIn">
          
          {/* Header da Observabilidade & Status Geral */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 font-title">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Painel Integrado de Observabilidade & Telemetria
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Monitoramento em tempo real do ecossistema OdontoCRM (Supabase + Vercel + Sentry + PostHog)
                </p>
              </div>

              <button
                onClick={checkSystemHealth}
                disabled={checkingHealth}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all active:scale-95 self-start md:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${checkingHealth ? 'animate-spin' : ''}`} />
                {checkingHealth ? 'Pingando Serviços...' : 'Testar Latência Agora'}
              </button>
            </div>

            {/* Grid 4 Cards de Infraestrutura */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              
              {/* Card 1: Supabase DB */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Operacional
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Supabase Postgres</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold font-title text-white">
                      {dbLatency !== null ? `${dbLatency}ms` : '--'}
                    </span>
                    <span className="text-[10px] text-slate-500">latência RTT</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Vercel CDN */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    99.98% Uptime
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Vercel Edge Network</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold font-title text-white">HTTP/3</span>
                    <span className="text-[10px] text-slate-500">Global SSL/CDN</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Sentry Error Tracking */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <Bug className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                    Sentry Active
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Rastreador de Erros</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold font-title text-white">0 Críticos</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">100% limpo hoje</span>
                  </div>
                </div>
              </div>

              {/* Card 4: PostHog Analytics & Replay */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Session Replay
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">PostHog Analytics</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold font-title text-white">12 Sessões</span>
                    <span className="text-[10px] text-slate-500">gravações prontas</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Seção Central de Observabilidade (2 Colunas) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Gerenciador de Feature Flags (7 Colunas) */}
            <div className="lg:col-span-7 bg-slate-800/20 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-violet-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white font-title">
                      Feature Flags (PostHog Engine)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Ative ou desative recursos em tempo real sem precisar de novos deploys de código
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-violet-500/10 text-violet-300 border border-violet-500/20 font-mono px-2 py-1 rounded-lg">
                  SDK Live
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { id: 'odontograma-3d-v2', title: 'Odontograma 3D Avançado (v2)', desc: 'Renderização vetorial fluida dos arcos dentários com visualização de tratamentos' },
                  { id: 'receita-digital-assina-pf', title: 'Emissão de Receita com Assinatura Digital (ICP)', desc: 'Geração automatizada de PDF de prescrição com validação jurídica' },
                  { id: 'ai-diagnostico-assistido', title: 'Assistente IA de Pré-Análise Odontológica', desc: 'Resumos inteligentes de prontuários com IA generativa para o dentista' },
                  { id: 'whatsapp-evolution-v2', title: 'Integração WhatsApp Evolution API v2', desc: 'Disparo de confirmações de consulta e lembretes com chatbot automatizado' },
                ].map((flag) => {
                  const isEnabled = featureFlags[flag.id];
                  return (
                    <div 
                      key={flag.id}
                      className="flex items-start justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
                    >
                      <div className="pr-4">
                        <span className="text-xs font-bold text-white block mb-0.5 flex items-center gap-2">
                          {flag.title}
                          {isEnabled ? (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">ATIVA</span>
                          ) : (
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">DESATIVADA</span>
                          )}
                        </span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{flag.desc}</p>
                      </div>

                      <button
                        onClick={() => handleToggleFeatureFlag(flag.id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? 'bg-violet-600' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Painel de Auditoria & Links Diretos aos Dashboards (5 Colunas) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Logs de Auditoria LGPD */}
              <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2 font-title uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Logs de Auditoria & Segurança (LGPD)
                  </h3>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live Stream
                  </span>
                </div>
                
                <div className="space-y-2.5 font-mono text-[10px] max-h-[220px] overflow-y-auto pr-1">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold flex-shrink-0">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-semibold">{log.action}</span>
                        {log.details && <span className="text-slate-400 text-[9px]">{log.details}</span>}
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <p className="text-slate-500 text-center py-4">Nenhum evento registrado.</p>
                  )}
                </div>
              </div>

              {/* Links Externos dos Dashboards */}
              <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-title flex items-center gap-2">
                  <Globe className="w-4 h-4 text-violet-400" />
                  Acesso Rápido aos Console Externos
                </h3>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-400 transition-all hover:-translate-y-0.5"
                  >
                    <Database className="w-4 h-4" />
                    Supabase DB
                  </a>
                  <a 
                    href="https://sentry.io" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-2 text-xs font-bold text-violet-400 transition-all hover:-translate-y-0.5"
                  >
                    <Bug className="w-4 h-4" />
                    Sentry Errors
                  </a>
                  <a 
                    href="https://posthog.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-400 transition-all hover:-translate-y-0.5"
                  >
                    <Eye className="w-4 h-4" />
                    PostHog Replay
                  </a>
                  <a 
                    href="https://vercel.com/dashboard" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-2 text-xs font-bold text-blue-400 transition-all hover:-translate-y-0.5"
                  >
                    <Cloud className="w-4 h-4" />
                    Vercel Deploy
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../lib/mockDatabase';
import { supabase } from '../lib/supabase';
import { Plus, Users, Shield, LogOut, CheckCircle, Palette, MonitorPlay, Key, Check } from 'lucide-react';

export default function SuperAdmin() {
  const { logout, supabaseActive, selectClinic } = useAuth();
  
  // Lista de clínicas cadastradas
  const [clinics, setClinics] = useState([]);
  
  // Estado do formulário de criação
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0f766e');
  const [secondaryColor, setSecondaryColor] = useState('#0d9488');
  const [logo, setLogo] = useState('🦷');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('123');
  
  // Status de gravação
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Carregar clínicas na inicialização
  const loadClinics = async () => {
    if (supabaseActive && supabase) {
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setClinics(data || []);
      } catch (err) {
        console.error(err);
        setClinics(mockDb.getClinics());
      }
    } else {
      setClinics(mockDb.getClinics());
    }
  };

  useEffect(() => {
    loadClinics();
  }, [supabaseActive]);

  // Gerar subdomínio baseado no nome da clínica
  useEffect(() => {
    if (name) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]/g, ''); // Apenas letras e números
      setSubdomain(slug);
    }
  }, [name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setLoading(true);

    const newClinic = {
      id: supabaseActive ? undefined : 'clinic-' + Math.random().toString(36).substr(2, 9),
      name,
      subdomain,
      logo_url: logo,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
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
        // Observação: Na prática do Supabase, o registro em auth.users requer convite ou signup,
        // mas podemos tentar simular criando o registro na tabela de perfis (profiles) se a conta auth.users for criada.
        // Como o auth.users é restrito, mostramos uma notificação indicando sucesso de criação da clínica.
        setStatusMsg({ 
          type: 'success', 
          text: `Clínica ${name} registrada no Supabase! Para criar o usuário no Supabase Auth, utilize o painel admin ou trigger.` 
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
          id: 'user-' + Math.random().toString(36).substr(2, 9),
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
    setAdminEmail('');
    setAdminPassword('123');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-body p-6 lg:p-10">
      
      {/* Header macOS Vibe */}
      <header className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-8 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-title flex items-center gap-2">
              SaaS Admin Control Room
              <span className="text-xs bg-slate-800 text-violet-400 font-semibold px-2 py-0.5 rounded-full">SuperAdmin</span>
            </h1>
            <p className="text-xs text-slate-400">
              Gerenciamento global de inquilinos e customização Whitelabel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Modo: <b>{supabaseActive ? 'Supabase DB' : 'Simulação Local'}</b>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs bg-slate-800 text-slate-300 hover:text-red-400 hover:bg-slate-700 font-semibold px-4 py-2.5 rounded-xl transition-all border border-slate-700/50"
          >
            <LogOut className="w-4 h-4" />
            Sair do SaaS
          </button>
        </div>
      </header>

      {/* Grid Central */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Painel do Formulário & Listagem (Lado Esquerdo - 8 Colunas) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Formulário */}
          <div className="bg-slate-850 bg-slate-800/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-violet-600 to-indigo-500" />
            
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-violet-500" />
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
                  <label className="block text-xs text-slate-400 mb-1">Nome da Clínica</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Clinica Sorriso Perfeito"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Subdomínio (Tenant)</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="sorrisoperfeito"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm pr-16 focus:outline-none focus:border-violet-500 transition-all text-white font-mono"
                    />
                    <span className="absolute right-3 text-[10px] text-slate-500 font-semibold">.crm.com</span>
                  </div>
                </div>
              </div>

              {/* Controles de Design Whitelabel */}
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-violet-400" />
                  Identidade Visual Whitelabel
                </span>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Cor Primária</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-center font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Cor Secundária</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-center font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Logotipo (Emoji/Ícone)</label>
                    <select
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="🦷">🦷 Dente</option>
                      <option value="✨">✨ Brilho</option>
                      <option value="💎">💎 Diamante</option>
                      <option value="🏥">🏥 Hospital/Clínica</option>
                      <option value="🛡️">🛡️ Escudo</option>
                      <option value="⚕️">⚕️ Medicina</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Admin User setup */}
              {!supabaseActive && (
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-violet-400" />
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Senha Inicial</label>
                      <input
                        type="password"
                        placeholder="Ex: 123"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all hover:bg-violet-500 active:scale-[0.98] text-sm"
              >
                {loading ? 'Processando cadastro...' : 'Registrar Inquilino'}
              </button>
            </form>
          </div>

          {/* Lista de Clínicas */}
          <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              Inquilinos Ativos ({clinics.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Clínica</th>
                    <th className="pb-3 font-semibold">Subdomínio</th>
                    <th className="pb-3 font-semibold">Identidade</th>
                    <th className="pb-3 font-semibold text-center">Data</th>
                    <th className="pb-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs">
                  {clinics.map((c) => (
                    <tr key={c.id || c.subdomain} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 font-bold text-white flex items-center gap-2">
                        <span className="text-lg">{c.logo_url || '🦷'}</span>
                        {c.name}
                      </td>
                      <td className="py-3 text-slate-300 font-mono">{c.subdomain}.crm.com</td>
                      <td className="py-3">
                        <div className="flex gap-1.5 items-center">
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: c.primary_color }} title="Cor Primária" />
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: c.secondary_color }} title="Cor Secundária" />
                        </div>
                      </td>
                      <td className="py-3 text-center text-slate-500">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => selectClinic(c)}
                          className="bg-violet-600/20 text-violet-400 hover:bg-violet-600 hover:text-white px-3 py-1.5 rounded-xl font-bold active:scale-95 transition-all text-[10px] border border-violet-500/20 shadow-sm"
                        >
                          Acessar Painel
                        </button>
                      </td>
                    </tr>
                  ))}
                  {clinics.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500">
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
    </div>
  );
}

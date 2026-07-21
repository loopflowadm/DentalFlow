import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';
import { mockDb } from '../lib/mockDatabase';
import {
  KeyRound, Mail, AlertTriangle, ShieldCheck, HelpCircle,
  Building, UserPlus, ArrowLeft, Paintbrush, Smile, Info,
  Activity, Sparkles, Gem, Shield
} from 'lucide-react';

export default function Login({ initialView = 'login', onBack }) {
  const [view, setView] = useState(initialView); // 'login' | 'register' | 'forgot'

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Form States
  const [clinicName, setClinicName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPrimaryColor, setRegPrimaryColor] = useState('#03269A');
  const [regSecondaryColor, setRegSecondaryColor] = useState('#196BFB');
  const [regLogo, setRegLogo] = useState('🦷');
  const [regRole, setRegRole] = useState('CLINIC_OWNER'); // Default role when registering clinic
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const formatPhone = (val) => {
    const nums = val.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 2) return nums ? `(${nums}` : '';
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  // Forgot Form States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  const { login, clinic, supabaseActive, setSupabaseActive } = useAuth();
  const { applyTheme, resetTheme, currentTheme } = useTheme();

  // Efeito dinâmico para prever o tema no login pelo e-mail
  useEffect(() => {
    if (view !== 'login') return;

    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length > 1) {
      const sub = parts[0].toLowerCase();
      if (sub !== 'www' && sub !== 'localhost') {
        return;
      }
    }

    if (!email) {
      resetTheme();
      return;
    }

    const emailParts = email.split('@');
    if (emailParts.length > 1) {
      const domain = emailParts[1].toLowerCase();
      const clinics = mockDb.getClinics();
      let matchedClinic = null;

      if (domain.includes('sorriso')) {
        matchedClinic = clinics.find(c => c.id === 'clinic-sorriso-perfeito');
      } else if (domain.includes('orto')) {
        matchedClinic = clinics.find(c => c.id === 'clinic-orto-clean');
      } else if (domain.includes('prime')) {
        matchedClinic = clinics.find(c => c.id === 'clinic-odonto-prime');
      }

      if (matchedClinic) {
        applyTheme({
          name: matchedClinic.name,
          primary_color: matchedClinic.primary_color,
          secondary_color: matchedClinic.secondary_color,
          logo_url: matchedClinic.logo_url
        });
      } else {
        resetTheme();
      }
    }
  }, [email, view, applyTheme, resetTheme]);

  // Efeito dinâmico para prever o tema durante o cadastro da clínica
  useEffect(() => {
    if (view !== 'register') return;

    if (clinicName) {
      // Gerar subdomínio automaticamente
      const slug = clinicName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

      let active = true;
      const run = async () => {
        await Promise.resolve();
        if (active) {
          setSubdomain(slug);
        }
      };
      run();

      applyTheme({
        name: clinicName,
        primary_color: regPrimaryColor,
        secondary_color: regSecondaryColor,
        logo_url: regLogo
      });

      return () => {
        active = false;
      };
    } else {
      resetTheme();
    }
  }, [clinicName, regPrimaryColor, regSecondaryColor, regLogo, view, applyTheme, resetTheme]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingState(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Erro desconhecido ao efetuar login.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao fazer login.');
    } finally {
      setLoadingState(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoadingState(true);

    const newClinic = {
      id: 'clinic-' + Math.random().toString(36).substr(2, 9),
      name: clinicName,
      subdomain: subdomain || 'clinica-temp',
      logo_url: regLogo,
      primary_color: regPrimaryColor,
      secondary_color: regSecondaryColor,
      created_at: new Date().toISOString()
    };

    if (supabaseActive) {
      try {
        // 1. Inserir a clínica no banco real Supabase
        const { data: clinicData, error: clinicErr } = await supabase
          .from('clinics')
          .insert({
            name: clinicName,
            subdomain: subdomain || 'clinica-temp',
            logo_url: regLogo,
            primary_color: regPrimaryColor,
            secondary_color: regSecondaryColor
          })
          .select()
          .single();

        if (clinicErr) throw clinicErr;

        // 2. Cadastrar usuário no Supabase Auth com metadados para o trigger de profiles
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: regEmail,
          password: regPassword,
          options: {
            data: {
              clinic_id: clinicData.id,
              role: 'CLINIC_ADMIN',
              full_name: regFullName.trim() || 'Administrador',
              phone: regPhone.trim()
            }
          }
        });

        if (authErr) throw authErr;

        setSuccess(`Clínica "${clinicName}" registrada com sucesso! Verifique a caixa de entrada de seu e-mail para confirmação.`);
        setLoadingState(false);

        // Mover para login
        setTimeout(() => {
          setEmail(regEmail);
          setPassword(regPassword);
          setView('login');
          setSuccess('');
        }, 4000);
      } catch (err) {
        console.error('Erro ao cadastrar no Supabase:', err);
        setError(err.message || 'Falha ao cadastrar clínica no Supabase.');
        setLoadingState(false);
      }
    } else {
      // Salvar Local
      try {
        const savedClinic = mockDb.saveClinic(newClinic);

        // Criar conta do proprietário/administrador da clínica
        const newUser = {
          id: 'user-' + Math.random().toString(36).substr(2, 9),
          email: regEmail,
          password: regPassword,
          role: 'CLINIC_ADMIN', // CLINIC_OWNER / CLINIC_ADMIN
          full_name: regFullName.trim() || 'Administrador',
          phone: regPhone.trim(),
          clinic_id: savedClinic.id
        };
        mockDb.saveUser(newUser);

        setSuccess(`Clínica cadastrada com sucesso! Faça login com o email: ${regEmail}`);
        setLoadingState(false);

        // Mover para login pré-preenchido
        setTimeout(() => {
          setEmail(regEmail);
          setPassword(regPassword);
          setView('login');
          setSuccess('');
        }, 3000);
      } catch (err) {
        setError('Falha ao salvar clínica localmente.');
        setLoadingState(false);
      }
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setLoadingState(true);

    // Simulação de envio de email
    setTimeout(() => {
      setForgotSuccess(true);
      setLoadingState(false);
    }, 1500);
  };

  const handleQuickCredentials = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center bg-slate-900 overflow-hidden font-body px-4 py-8"
      style={clinic?.login_bg ? {
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url(${clinic.login_bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      {/* Círculos decorativos de background com blur */}
      <div
        className="absolute -top-40 -left-45 w-[450px] h-[450px] rounded-full filter blur-[100px] opacity-25 transition-colors duration-1000"
        style={{ backgroundColor: currentTheme.primary_color }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full filter blur-[100px] opacity-20 transition-colors duration-1000"
        style={{ backgroundColor: currentTheme.secondary_color }}
      />

      <div className="relative w-full max-w-[480px] z-10 transition-all duration-300">

        {/* Card Principal */}
        <div className="bg-slate-950/60 border border-white/10 rounded-[28px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl text-white flex flex-col">

          {onBack && (
            <button
              onClick={onBack}
              className="self-start mb-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para o site</span>
            </button>
          )}

          {/* Header do Formulário */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="h-12 w-auto mb-4 flex items-center justify-center">
              {currentTheme?.logo_url && (
                currentTheme.logo_url.startsWith('http') ||
                currentTheme.logo_url.startsWith('data:image/') ||
                currentTheme.logo_url.startsWith('/') ||
                currentTheme.logo_url.includes('.')
              ) ? (
                <img src={currentTheme.logo_url} className="h-10 object-contain rounded-lg" alt={currentTheme.name} />
              ) : currentTheme?.logo_url && currentTheme.logo_url.trim().length <= 4 ? (
                (() => {
                  const logoMap = {
                    '🦷': Activity,
                    '✨': Sparkles,
                    '💎': Gem,
                    '🏥': Building,
                    '🛡️': Shield,
                    '⚕️': Activity
                  };
                  const IconComponent = logoMap[currentTheme.logo_url] || Activity;
                  return <IconComponent className="h-10 w-10 text-white" style={{ color: currentTheme.secondary_color }} />;
                })()
              ) : (
                <Logo collapsed={false} className="h-10 w-auto text-white" />
              )}
            </div>

            {view === 'login' && (
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-0.5 font-title">
                {clinic?.login_title || `Portal ${currentTheme?.name || 'Sorrisoclinica'}`}
              </h2>
            )}

            {(view === 'register' || view === 'forgot') && (
              <h2 className="text-2.5xl font-extrabold tracking-tight text-white mb-1 font-title">
                {view === 'register' && 'Crie sua Conta SaaS'}
                {view === 'forgot' && 'Recuperar Senha'}
              </h2>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {view === 'login' && 'Faça login no painel operacional da clínica'}
              {view === 'register' && 'Cadastre sua clínica e customize seu tema em segundos'}
              {view === 'forgot' && 'Digite seu e-mail para receber o link de recuperação'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* VIEW: LOGIN */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  E-mail do Profissional
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="nome@clinica.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setError(''); }}
                    className="text-[10px] text-slate-400 hover:text-white transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingState}
                className="w-full py-3.5 mt-2 bg-secondary text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] hover:opacity-90 flex items-center justify-center"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                {loadingState ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Entrar no Sistema'
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Não tem uma clínica registrada? </span>
                <button
                  type="button"
                  onClick={() => { setView('register'); setError(''); }}
                  className="text-xs font-bold text-white hover:underline"
                >
                  Cadastrar Clínica
                </button>
              </div>
            </form>
          )}

          {/* VIEW: REGISTER */}
          {view === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    Nome da Clínica
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Clínica Sorrir"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    Subdomínio
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      placeholder="sorrir"
                      value={subdomain}
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  Nome do Administrador / Proprietário
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Thácio Maikon"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  WhatsApp / Celular
                </label>
                <input
                  type="tel"
                  placeholder="(88) 99999-9999"
                  value={regPhone}
                  onChange={(e) => setRegPhone(formatPhone(e.target.value))}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  E-mail do Administrador
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@clinica.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-secondary"
                />
              </div>

              <button
                type="submit"
                disabled={loadingState}
                className="w-full py-3 bg-secondary text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] hover:opacity-90 flex items-center justify-center text-xs"
                style={{ backgroundColor: currentTheme.secondary_color }}
              >
                {loadingState ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Registrar Clínica & Acessar'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setView('login'); resetTheme(); setError(''); }}
                className="w-full py-2 bg-transparent text-slate-350 hover:text-white transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar ao Login
              </button>
            </form>
          )}

          {/* VIEW: FORGOT */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {!forgotSuccess ? (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      E-mail Cadastrado
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="seuemail@clinica.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loadingState}
                    className="w-full py-3.5 bg-secondary text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] hover:opacity-90 flex items-center justify-center"
                    style={{ backgroundColor: currentTheme.secondary_color }}
                  >
                    {loadingState ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Enviar Instruções'
                    )}
                  </button>
                </>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-2 text-slate-300">
                  <Smile className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-white text-sm">Link de Recuperação Enviado!</h4>
                  <p className="text-xs">
                    Um e-mail de simulação foi disparado para <b>{forgotEmail}</b> com as instruções para redefinição de senha.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => { setView('login'); setForgotSuccess(false); setForgotEmail(''); setError(''); }}
                className="w-full py-2 bg-transparent text-slate-350 hover:text-white transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar ao Login
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

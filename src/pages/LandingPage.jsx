import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Sparkles, MessageSquare, Calendar, Shield, DollarSign,
  Check, ArrowRight, ChevronDown, Users, FileText, CheckCircle2,
  BarChart3, Clock, X, UserPlus, Search, Bell, Lock, Headphones,
  Star, Brain, Plug, TrendingUp, ClipboardList, Zap, Heart,
  Play, Monitor, Smartphone, Tablet, Activity, Award, Phone,
  Folder, CreditCard, Bot, Link as LinkIcon, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';
import './LandingPage.css';

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.08 }
  })
};

/* ── Animated section wrapper ── */
function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Brand Logo ── */
const BrandLogo = ({ className = '', variant = 'dark' }) => {
  const fillClass = variant === 'light' ? 'landing-logo--light' : 'landing-logo--dark';
  return (
    <div className={`landing-brand-logo ${fillClass} ${className}`}>
      <Logo collapsed={false} className="landing-brand-logo__svg" />
    </div>
  );
};

const BrandIcon = ({ className = '', variant = 'dark' }) => {
  const fillClass = variant === 'light' ? 'landing-logo--light' : 'landing-logo--dark';
  return (
    <div className={`landing-brand-icon ${fillClass} ${className}`}>
      <Logo collapsed={true} className="landing-brand-icon__svg" />
    </div>
  );
};

export default function LandingPage({ onLogin, onRegister }) {
  useEffect(() => {
    const wasDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
    return () => { if (wasDark) document.documentElement.classList.add('dark'); };
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [procedure, setProcedure] = useState('Limpeza e Profilaxia');
  const [budget, setBudget] = useState('200');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    setFormLoading(true);
    try {
      localStorage.setItem('df_temp_phone', phone);
      await addLeadToDatabase({ name, email, phone, procedure, budget: parseFloat(budget) || 150 });
      setFormSuccess(true);
      setName(''); setEmail(''); setPhone('');
    } catch (err) { console.error(err); }
    finally { setFormLoading(false); }
  };

  const addLeadToDatabase = async (leadData) => {
    const defaultClinicId = 'clinic-sorriso-perfeito';
    const newLead = {
      clinic_id: defaultClinicId,
      name: leadData.name,
      phone: leadData.phone.replace(/\D/g, ''),
      avatar: '',
      stage: 0,
      priority: 'medium',
      budget_amount: leadData.budget || 0.00,
      procedure_name: leadData.procedure,
      comments: [],
      checklist: [],
      history: [{ date: new Date().toISOString(), type: 'STATUS', description: 'Lead capturado via Landing Page', user: 'Sistema' }],
      created_at: new Date().toISOString()
    };
    if (supabase) {
      try {
        await supabase.from('crm_leads').insert([newLead]);
      } catch (err) {
        console.warn('Erro ao inserir no Supabase:', err.message);
      }
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* ═══════════════ HEADER ═══════════════ */}
      <header className={`landing-header ${scrolled ? 'landing-header--scrolled' : ''}`}>
        <div className="landing-header__inner">
          <div className="landing-header__logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <BrandLogo variant="dark" />
          </div>

          <nav className="landing-header__nav">
            <button onClick={() => scrollToSection('segunda-feira')}>Rotina</button>
            <button onClick={() => scrollToSection('beneficios')}>Benefícios</button>
            <button onClick={() => scrollToSection('demonstracao')}>Demonstração</button>
            <button onClick={() => scrollToSection('oferta')}>Oferta</button>
            <button onClick={() => scrollToSection('contato')}>Contato</button>
          </nav>

          <div className="landing-header__actions">
            <button onClick={onLogin} className="landing-btn--ghost">Entrar</button>
            <button onClick={() => scrollToSection('oferta')} className="landing-btn--primary landing-btn--sm">
              Quero Minha Clínica no Automático
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="landing-hero">
        <div className="landing-hero__bg">
          <div className="landing-hero__orb landing-hero__orb--1" />
          <div className="landing-hero__orb landing-hero__orb--2" />
          <div className="landing-hero__orb landing-hero__orb--3" />
          <div className="landing-hero__grid-pattern" />
        </div>

        <div className="landing-hero__inner">
          {/* Left Column Copy */}
          <motion.div
            className="landing-hero__copy"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp} className="landing-hero__badge">
              <Sparkles style={{ width: 14, height: 14, color: '#F59E0B' }} />
              A nova geração de gestão para clínicas odontológicas
            </motion.div>

            <motion.h1 variants={fadeUp} className="landing-hero__title">
              A clínica que{' '}
              <span className="landing-hero__title-accent">trabalha enquanto você atende.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="landing-hero__subtitle">
              Chega de confirmações manuais, agendas com furos e planilhas espalhadas. O DentalFlow <strong>automatiza a rotina da sua clínica</strong> para que você e sua equipe possam focar no que realmente importa: <strong>cuidar dos pacientes</strong>.
            </motion.p>

            <motion.div variants={fadeUp} className="landing-hero__buttons flex-wrap gap-4">
              <button onClick={() => scrollToSection('oferta')} className="landing-btn--primary landing-btn--lg">
                Começar 14 dias grátis
                <ArrowRight style={{ width: 18, height: 18 }} />
              </button>

              <button onClick={() => scrollToSection('demonstracao')} className="landing-btn--outline landing-btn--lg flex items-center gap-2">
                <Play style={{ width: 14, height: 14, fill: '#196BFB', color: '#196BFB' }} />
                Veja funcionando em 2 min
              </button>
            </motion.div>

            {/* 4 Trust points in 2x2 grid */}
            <motion.div variants={fadeUp} className="landing-hero__trust-grid grid grid-cols-2 gap-y-2.5 gap-x-4 pt-4 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-500" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-500" />
                <span>Ativação em 2 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Dados protegidos (LGPD)</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span>Suporte humano no WhatsApp</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column Showcase Mockup */}
          <motion.div
            className="landing-hero__mockup"
            initial={{ opacity: 0, x: 50, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top Right Floating Notification Badge */}
            <motion.div
              className="landing-hero__float-notif"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <div className="landing-hero__notif-icon bg-emerald-500/20 text-emerald-500 p-2 rounded-xl">
                <MessageSquare className="w-5 h-5 fill-emerald-500 text-emerald-500" />
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-800">Paciente confirmou!</span>
                  <span className="text-[10px] text-slate-400">agora</span>
                </div>
                <span className="text-xs text-slate-600 font-medium block">
                  Ana Paula confirmou a consulta de amanhã às 14:00
                </span>
              </div>
            </motion.div>

            {/* Laptop App Mockup */}
            <div className="landing-dashboard">
              <div className="landing-dashboard__chrome">
                <div className="landing-dashboard__dots">
                  <span style={{ background: '#FF5F57' }} />
                  <span style={{ background: '#FFBD2E' }} />
                  <span style={{ background: '#28C840' }} />
                </div>
                <div className="landing-dashboard__url">dentalflow.app • Resumo da Clínica</div>
                <div style={{ width: 48 }} />
              </div>

              <div className="landing-dashboard__content">
                <div className="landing-dashboard__topbar">
                  <div className="landing-dashboard__topbar-left">
                    <div className="landing-dashboard__app-icon">DF</div>
                    <span className="landing-dashboard__greeting">Resumo da clínica</span>
                  </div>
                  <div className="landing-dashboard__topbar-right">
                    <Search style={{ width: 14, height: 14, color: '#94A3B8' }} />
                    <Bell style={{ width: 14, height: 14, color: '#94A3B8' }} />
                  </div>
                </div>

                <div className="landing-dashboard__stats">
                  {[
                    { label: 'Consultas hoje', val: '24', delta: '↑ 12%', positive: true },
                    { label: 'Confirmadas', val: '21', delta: '↑ 19%', positive: true },
                    { label: 'Faturamento do mês', val: 'R$ 8.750,00', delta: '↑ 23%', positive: true },
                    { label: 'Pacientes ativos', val: '842', delta: '↑ 6%', positive: true },
                  ].map((s, i) => (
                    <div key={i} className="landing-dashboard__stat-card">
                      <span className="landing-dashboard__stat-label">{s.label}</span>
                      <span className="landing-dashboard__stat-value">{s.val}</span>
                      <span className={`landing-dashboard__stat-delta ${s.positive ? 'positive' : 'negative'}`}>{s.delta}</span>
                    </div>
                  ))}
                </div>

                <div className="landing-dashboard__columns">
                  <div className="landing-dashboard__panel">
                    <div className="landing-dashboard__panel-header">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-500" /> Agenda do dia</span>
                    </div>
                    {[
                      { time: '07:00', name: 'Ana Paula Souza', tag: 'Clareamento', color: '#196BFB' },
                      { time: '08:30', name: 'Célio Eduardo', tag: 'Avaliação', color: '#10B981' },
                      { time: '10:00', name: 'Vanessa Lima', tag: 'Limpeza', color: '#8B5CF6' },
                      { time: '14:00', name: 'João Pedro Silva', tag: 'Retorno', color: '#F59E0B' },
                    ].map((a, i) => (
                      <div key={i} className="landing-dashboard__agenda-item">
                        <span className="landing-dashboard__agenda-time">{a.time}</span>
                        <span className="landing-dashboard__agenda-name">{a.name}</span>
                        <span className="landing-dashboard__agenda-tag" style={{ background: a.color + '15', color: a.color }}>{a.tag}</span>
                      </div>
                    ))}
                  </div>

                  <div className="landing-dashboard__panel">
                    <div className="landing-dashboard__panel-header">
                      <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Confirmações automáticas</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Enviadas hoje: <strong className="text-slate-800">48</strong></span>
                        <span className="text-slate-500">Confirmadas: <strong className="text-slate-800">41</strong></span>
                      </div>
                      <div className="h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                        <span className="text-[11px] font-bold text-blue-600">Taxa de Confirmação 85.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Floating Phone with WhatsApp Chat */}
            <div className="landing-hero__phone-whatsapp">
              <div className="landing-hero__phone-header">
                <div className="landing-hero__whatsapp-avatar">DF</div>
                <div>
                  <span className="landing-hero__whatsapp-name">DentalFlow Clínica</span>
                  <span className="landing-hero__whatsapp-status">online</span>
                </div>
              </div>
              <div className="landing-hero__whatsapp-body">
                <div className="landing-hero__wa-msg landing-hero__wa-msg--received">
                  Olá, Ana Paula! 😊<br />
                  Sua consulta é amanhã (15/06) às 14:00.<br /><br />
                  Para confirmar, responda com:<br />
                  1 - Confirmar<br />
                  2 - Reagendar<br />
                  3 - Cancelar
                  <span className="landing-hero__wa-time">09:42</span>
                </div>
                <div className="landing-hero__wa-msg landing-hero__wa-msg--sent">
                  1
                  <span className="landing-hero__wa-time">09:43 ✓✓</span>
                </div>
                <div className="landing-hero__wa-msg landing-hero__wa-msg--received bg-emerald-50 border-emerald-200 text-emerald-900">
                  ✅ <strong>Consulta confirmada!</strong><br />
                  Te esperamos! 😊
                  <span className="landing-hero__wa-time">09:43</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SEÇÃO: MAIS QUE UM SISTEMA ═══════════════ */}
      <section className="landing-overview-section py-16 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy & Checklist */}
            <AnimatedSection className="lg:col-span-5">
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase block mb-2">MAIS QUE UM SISTEMA.</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-4">
                É uma nova forma de administrar sua clínica.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Enquanto você faz um procedimento, o DentalFlow cuida de toda a operação em segundo plano.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Confirma consultas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Organiza recebimentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Envia lembretes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Atualiza a agenda</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Acompanha orçamentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Gera relatórios</span>
                </div>
              </div>
            </AnimatedSection>

            {/* Right Dashboard Calendar View Mockup */}
            <AnimatedSection delay={0.15} className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-lg bg-white">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <BrandIcon variant="dark" className="w-4 h-4" />
                    <span className="font-bold text-slate-800">DentalFlow • Agenda Semanal</span>
                  </div>
                  <span>12 - 18 de Maio, 2024</span>
                </div>

                <div className="p-4 grid grid-cols-6 gap-2 text-[10px] bg-slate-50/50 min-h-[220px]">
                  {[
                    { day: 'Seg 12', time: '07:00', title: 'Ana Paula Souza', tag: 'Clareamento', bg: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
                    { day: 'Ter 13', time: '09:30', title: 'Vanessa Lima', tag: 'Avaliação', bg: 'bg-rose-100 border-rose-300 text-rose-800' },
                    { day: 'Qua 14', time: '11:00', time2: '11:00', title: 'Felisberto Alves', tag: 'Limpeza', bg: 'bg-teal-100 border-teal-300 text-teal-800' },
                    { day: 'Qui 15', time: '08:30', title: 'Juliana Martins', tag: 'Canal', bg: 'bg-red-100 border-red-300 text-red-800' },
                    { day: 'Sex 16', time: '09:00', title: 'Fernando Rocha', tag: 'Aparelho', bg: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
                    { day: 'Sáb 17', time: '10:30', title: 'Patrícia Gomes', tag: 'Clareamento', bg: 'bg-blue-100 border-blue-300 text-blue-800' },
                  ].map((col, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <span className="font-bold text-slate-600 text-center pb-1 border-b border-slate-200">{col.day}</span>
                      <div className={`p-2 rounded-lg border ${col.bg} flex flex-col justify-between h-20 shadow-xs`}>
                        <span className="font-extrabold text-[9px] truncate">{col.title}</span>
                        <span className="opacity-80 text-[8px]">{col.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════ SEÇÃO: IMAGINE COMO SERÁ SUA SEGUNDA-FEIRA (STEPPER HORIZONTAL) ═══════════════ */}
      <section id="segunda-feira" className="landing-timeline-section py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection className="mb-14">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Imagine como será sua segunda-feira.
            </h2>
          </AnimatedSection>

          {/* Horizontal Stepper Line */}
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-6 left-12 right-12 h-0.5 bg-blue-200 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              {[
                {
                  time: '08:00',
                  icon: <Calendar className="w-5 h-5 text-white" />,
                  desc: 'Pacientes confirmam presença automaticamente pelo WhatsApp no domingo.'
                },
                {
                  time: '09:20',
                  icon: <MessageSquare className="w-5 h-5 text-white" />,
                  desc: 'Remarcações acontecem e a agenda se reorganiza sozinho.'
                },
                {
                  time: '11:10',
                  icon: <FileText className="w-5 h-5 text-white" />,
                  desc: 'Você acessa o prontuário com todo o histórico do paciente.'
                },
                {
                  time: '14:00',
                  icon: <Phone className="w-5 h-5 text-white" />,
                  desc: 'O sistema lembra um orçamento parado e o paciente recebe um contato.'
                },
                {
                  time: '17:50',
                  icon: <TrendingUp className="w-5 h-5 text-white" />,
                  desc: 'Financeiro atualizado. Relatórios prontos. Dia encerrado com tudo em ordem.'
                }
              ].map((step, i) => (
                <AnimatedSection key={i} delay={i * 0.08} className="flex flex-col items-start md:items-center text-left md:text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 border-4 border-white">
                    {step.icon}
                  </div>
                  <span className="text-lg font-black text-slate-900 mb-2">{step.time}</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SEÇÃO: NA PRÁTICA — VEJA ACONTECENDO (DARK BANNER) ═══════════════ */}
      <section id="demonstracao" className="landing-practice-section py-16 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/80 border border-blue-500/30 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Title & Button */}
              <AnimatedSection className="lg:col-span-4">
                <span className="text-xs font-bold text-blue-400 tracking-wider uppercase block mb-2">NA PRÁTICA</span>
                <h2 className="text-3xl font-black text-white leading-tight mb-3">
                  Veja acontecendo.
                </h2>
                <p className="text-slate-300 text-xs leading-relaxed mb-6">
                  Assista como o DentalFlow trabalha por você e por sua equipe.
                </p>
                <button
                  onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                  className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Play className="w-4 h-4 fill-blue-400" />
                  <span>Assistir demonstração completa (2 minutos)</span>
                </button>
              </AnimatedSection>

              {/* Right 5 Sequential Steps Flow connected by arrows */}
              <AnimatedSection delay={0.15} className="lg:col-span-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 overflow-x-auto pb-2">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center min-w-[110px]">
                    <div className="bg-slate-800/90 border border-slate-700 p-2 rounded-xl mb-2 w-full text-[10px] text-slate-300">
                      <span className="font-bold text-slate-200 block mb-1">Olá Jader!</span>
                      <span>Sua consulta é amanhã... 1 - Confirmar</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">Paciente recebe mensagem</span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-blue-400/60 hidden md:block flex-shrink-0" />

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center min-w-[110px]">
                    <div className="bg-emerald-950/80 border border-emerald-500/40 p-2 rounded-xl mb-2 w-full text-[10px] text-emerald-300">
                      <span className="font-bold block">✅ Consulta confirmada!</span>
                      <span>Te esperamos!</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">Paciente confirma</span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-blue-400/60 hidden md:block flex-shrink-0" />

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center min-w-[110px]">
                    <div className="bg-slate-800/90 border border-slate-700 p-2 rounded-xl mb-2 w-full text-[10px] text-blue-300 flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      <span>Agenda 100% OK</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">Agenda atualiza automaticamente</span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-blue-400/60 hidden md:block flex-shrink-0" />

                  {/* Step 4 */}
                  <div className="flex flex-col items-center text-center min-w-[110px]">
                    <div className="bg-slate-800/90 border border-slate-700 p-2 rounded-xl mb-2 w-full text-[10px] text-slate-200">
                      <span className="font-bold text-emerald-400 block">✓ Nova confirmação</span>
                      <span>João Silva confirmou</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">Recepção é avisada</span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-blue-400/60 hidden md:block flex-shrink-0" />

                  {/* Step 5 */}
                  <div className="flex flex-col items-center text-center min-w-[110px]">
                    <div className="bg-slate-800/90 border border-slate-700 p-2 rounded-xl mb-2 w-full text-[10px] text-slate-200">
                      <span className="font-bold text-emerald-400 block">✓ Receita confirmada</span>
                      <span className="font-extrabold text-white text-xs">R$ 250,00</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">Financeiro sincronizado</span>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ BENEFÍCIOS TRANSFORMACIONAIS ═══════════════ */}
      <section id="beneficios" className="landing-benefits-section">
        <div className="landing-benefits-section__inner">
          <AnimatedSection className="text-center mb-14">
            <span className="landing-overline">VOCÊ ATENDE. O DENTALFLOW ADMINISTRA.</span>
            <h2 className="landing-section-title text-white">
              Tranquilidade para focar no que você faz de melhor.
            </h2>
          </AnimatedSection>

          <div className="landing-benefits__grid">
            {[
              {
                title: 'Nunca descubra uma falta quando a cadeira já estiver vazia.',
                desc: 'Confirmações automáticas pelo WhatsApp reduzem esquecimentos e mantêm sua agenda organizada sem esforço da recepção.',
                color: '#196BFB', icon: <Calendar className="w-6 h-6" />
              },
              {
                title: 'Nenhum orçamento fica esquecido.',
                desc: 'Pacientes que ainda não fecharam o tratamento recebem acompanhamentos automáticos e voltam para o seu funil de atendimento.',
                color: '#10B981', icon: <DollarSign className="w-6 h-6" />
              },
              {
                title: 'Sua recepção deixa de passar horas no WhatsApp.',
                desc: 'Lembretes de consulta, confirmações e retornos periódicos acontecem sozinhos em segundo plano 24 horas por dia.',
                color: '#25D366', icon: <MessageSquare className="w-6 h-6" />
              },
              {
                title: 'Todo o financeiro em um único lugar.',
                desc: 'Entradas, saídas, orçamentos, recibos e indicadores de faturamento organizados sem que você precise ser um contador.',
                color: '#F59E0B', icon: <BarChart3 className="w-6 h-6" />
              },
              {
                title: 'Prontuário completo em qualquer dispositivo.',
                desc: 'Acesse o histórico clínico do paciente no consultório, em casa ou no celular com total sincronização e segurança LGPD.',
                color: '#8B5CF6', icon: <ClipboardList className="w-6 h-6" />
              },
              {
                title: 'Saiba exatamente como está sua clínica.',
                desc: 'Visão clara da taxa de retorno de pacientes, faturamento mensal e eficiência da agenda em um painel intuitivo.',
                color: '#06B6D4', icon: <TrendingUp className="w-6 h-6" />
              }
            ].map((card, i) => (
              <AnimatedSection key={i} delay={i * 0.08} className="landing-benefits__card">
                <div className="landing-benefits__icon" style={{ background: card.color + '15', color: card.color }}>
                  {card.icon}
                </div>
                <h3 className="landing-benefits__card-title">{card.title}</h3>
                <p className="landing-benefits__card-desc">{card.desc}</p>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.3} className="text-center mt-12">
            <button onClick={() => scrollToSection('demonstracao')} className="landing-btn--outline landing-btn--lg">
              Ver como funciona na prática
              <ChevronRight className="w-4 h-4" />
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════ DEMONSTRAÇÃO EM VÍDEO ═══════════════ */}
      <section id="demonstracao" className="landing-video-section">
        <div className="landing-video-section__inner">
          <AnimatedSection className="text-center mb-12">
            <span className="landing-overline">VEJA ACONTECENDO</span>
            <h2 className="landing-section-title text-white">
              Não mostramos promessas.<br />Mostramos o sistema funcionando.
            </h2>
            <p className="landing-section-subtitle text-slate-300 max-w-xl mx-auto mt-2">
              Veja como o paciente confirma a consulta no WhatsApp e a sua agenda atualiza instantaneamente.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="landing-video__player-container">
            <div className="landing-video__chrome">
              <div className="landing-video__dots">
                <span style={{ background: '#FF5F57' }} />
                <span style={{ background: '#FFBD2E' }} />
                <span style={{ background: '#28C840' }} />
              </div>
              <span className="text-xs text-slate-400 font-medium">Demonstração Interativa • DentalFlow em 2 minutos</span>
            </div>

            <div className="landing-video__viewport" onClick={() => setIsPlayingVideo(!isPlayingVideo)}>
              <div className="landing-video__preview-bg" />
              <div className="landing-video__play-overlay">
                <div className="landing-video__play-btn">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
                <span className="text-white font-bold text-sm mt-3">Clique para ver a automação ao vivo</span>
              </div>
            </div>

            {/* 4 Steps Flow */}
            <div className="landing-video__steps-row">
              {[
                { step: '1', title: 'Paciente recebe mensagem no WhatsApp' },
                { step: '2', title: 'Paciente responde "1" para confirmar' },
                { step: '3', title: 'Agenda é atualizada na hora' },
                { step: '4', title: 'Você atende com 0% de preocupação' }
              ].map((s, idx) => (
                <div key={idx} className="landing-video__step-item">
                  <span className="landing-video__step-num">{s.step}</span>
                  <span className="landing-video__step-text">{s.title}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════ MÉTRICAS E RESULTADOS ═══════════════ */}
      <section className="landing-results">
        <AnimatedSection className="landing-results__header">
          <span className="landing-overline">O QUE MUDA NA ROTINA DA CLÍNICA</span>
          <h2 className="landing-section-title">Resultados reais desde a primeira semana</h2>
        </AnimatedSection>
        <div className="landing-results__grid">
          {[
            { val: '-70%', label: 'Menos faltas sem aviso', desc: 'Porque cada paciente recebe confirmações automáticas no WhatsApp.', color: '#196BFB' },
            { val: '2h/dia', label: 'Horas economizadas', desc: 'Sua secretária deixa de executar tarefas repetitivas.', color: '#10B981' },
            { val: '+35%', label: 'Mais retornos confirmados', desc: 'Pacientes antigos voltam para acompanhamento no tempo certo.', color: '#F59E0B' },
            { val: '100%', label: 'Menos estresse administrativo', desc: 'Mais tempo livre e foco total no atendimento clínico.', color: '#EC4899' },
          ].map((s, i) => (
            <AnimatedSection key={i} delay={i * 0.1} className="landing-results__card">
              <span className="landing-results__card-value" style={{ color: s.color }}>{s.val}</span>
              <span className="landing-results__card-label">{s.label}</span>
              <span className="landing-results__card-desc">{s.desc}</span>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════════════ COMPARAÇÃO (OUTROS VS DENTALFLOW) ═══════════════ */}
      <section className="landing-comparison-section bg-slate-900/60 py-16 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <span className="landing-overline">A MAIORIA DOS SISTEMAS ORGANIZA INFORMAÇÕES</span>
            <h2 className="landing-section-title text-white">O DentalFlow organiza toda a operação.</h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <AnimatedSection className="bg-slate-950/80 p-6 rounded-2xl border border-red-500/20">
              <div className="flex items-center gap-2 mb-4 text-red-400 font-bold text-lg">
                <X className="w-5 h-5" />
                <span>Outros Sistemas</span>
              </div>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span> Mensagens no WhatsApp enviadas manualmente uma por uma</li>
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span> Agenda estática que exige checagem constante</li>
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span> Cobrança de módulos extras e usuários adicionais</li>
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span> Suporte demorado por ticket</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.1} className="bg-blue-950/40 p-6 rounded-2xl border border-blue-500/30">
              <div className="flex items-center gap-2 mb-4 text-blue-400 font-bold text-lg">
                <Check className="w-5 h-5" />
                <span>O Jeito DentalFlow</span>
              </div>
              <ul className="space-y-3 text-slate-200 text-sm">
                <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">✓</span> Agenda Inteligente + WhatsApp Automático</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">✓</span> Recuperação de pacientes e orçamentos pendentes</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">✓</span> Controle financeiro, retornos e IA em um único lugar</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">✓</span> Suporte humanizado rápido direto no WhatsApp</li>
              </ul>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════ SEÇÃO: TUDO CONECTADO ═══════════════ */}
      <section id="funcionalidades" className="landing-all-connected py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection className="mb-10">
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase block mb-2">TUDO CONECTADO</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Um único sistema. Tudo que sua clínica precisa.
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: 'Agenda Inteligente', desc: 'Visualize sua semana, organize horários e tenha uma agenda sempre atualizada.', icon: <Calendar className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
              { title: 'WhatsApp Automático', desc: 'Confirmações, lembretes e retornos enviados automaticamente.', icon: <MessageSquare className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
              { title: 'CRM Inteligente', desc: 'Acompanhe cada paciente do primeiro contato ao pós-tratamento.', icon: <Users className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
              { title: 'Financeiro', desc: 'Controle completo de recebimentos, despesas, orçamentos e fluxo de caixa.', icon: <DollarSign className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
              { title: 'Prontuário Digital', desc: 'Histórico, anamnese, tratamentos e documentos tudo em um só lugar.', icon: <FileText className="w-5 h-5 text-sky-600" />, bg: 'bg-sky-50' },
              { title: 'Inteligência Artificial', desc: 'Sua assistente para agilizar tarefas e apoiar decisões da rotina.', icon: <Sparkles className="w-5 h-5 text-pink-600" />, bg: 'bg-pink-50' },
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 0.05} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SEÇÃO: POR QUE O DENTALFLOW? (COMPARATIVO + MÉTRICAS) ═══════════════ */}
      <section className="landing-why-section py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <AnimatedSection className="lg:col-span-4">
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase block mb-2">POR QUE O DENTALFLOW?</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                A maioria organiza informações.
              </h2>
              <h2 className="text-2xl md:text-3xl font-black text-blue-600 leading-tight">
                Nós organizamos a operação inteira.
              </h2>
            </AnimatedSection>

            {/* Center Comparison Table */}
            <AnimatedSection delay={0.1} className="lg:col-span-5 flex items-center justify-center">
              <div className="flex border border-slate-200 rounded-2xl overflow-hidden shadow-md bg-white w-full max-w-md">
                {/* Outros Sistemas Column */}
                <div className="w-1/2 bg-slate-100 p-4 text-xs space-y-2 text-slate-500 border-r border-slate-200">
                  <span className="font-extrabold text-slate-400 block pb-2 border-b border-slate-200 text-[11px]">OUTROS SISTEMAS</span>
                  <div>Agenda comum</div>
                  <div>WhatsApp manual</div>
                  <div>Cadastro de pacientes</div>
                  <div>Financeiro básico</div>
                  <div>Interface complexa</div>
                  <div>Várias plataformas</div>
                  <div>Relatórios limitados</div>
                </div>
                {/* DentalFlow Column */}
                <div className="w-1/2 bg-blue-600 text-white p-4 text-xs space-y-2 font-semibold">
                  <span className="font-extrabold text-blue-100 block pb-2 border-b border-blue-500 text-[11px]">DENTALFLOW</span>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-200" /> Agenda Inteligente</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-200" /> WhatsApp Automático</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-200" /> CRM Inteligente</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-200" /> Gestão financeira completa</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-200" /> Design intuitivo e moderno</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-200" /> Tudo integrado em um só lugar</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-200" /> Relatórios em tempo real</div>
                </div>
              </div>
            </AnimatedSection>

            {/* Right Metric Icons */}
            <AnimatedSection delay={0.2} className="lg:col-span-3">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
                  <Calendar className="w-6 h-6 text-blue-600 mb-1" />
                  <span className="text-xl font-black text-blue-600">-70%</span>
                  <span className="text-[10px] text-slate-500 font-medium leading-tight">menos faltas sem aviso</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
                  <Users className="w-6 h-6 text-blue-600 mb-1" />
                  <span className="text-xl font-black text-blue-600">+35%</span>
                  <span className="text-[10px] text-slate-500 font-medium leading-tight">mais pacientes retornando</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
                  <Clock className="w-6 h-6 text-emerald-600 mb-1" />
                  <span className="text-xl font-black text-emerald-600">2h/dia</span>
                  <span className="text-[10px] text-slate-500 font-medium leading-tight">economizadas na recepção</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
                  <Zap className="w-6 h-6 text-amber-500 mb-1" />
                  <span className="text-xl font-black text-amber-600">15min</span>
                  <span className="text-[10px] text-slate-500 font-medium leading-tight">para aprender a usar</span>
                </div>
              </div>
              <span className="text-[9px] text-slate-400 block text-center mt-3">
                *Resultados podem variar conforme a rotina e a adoção da plataforma.
              </span>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════ SEÇÃO: OFERTA EXCLUSIVA DE LANÇAMENTO ═══════════════ */}
      <section id="oferta" className="landing-offer-section py-16 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border border-blue-500/30 rounded-3xl p-8 md:p-12 shadow-2xl text-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Copy & Checklist */}
              <AnimatedSection className="lg:col-span-4">
                <span className="text-xs font-bold text-blue-400 tracking-wider uppercase block mb-2">OFERTA EXCLUSIVA DE LANÇAMENTO</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-6">
                  Tudo que sua clínica precisa em um único plano simples.
                </h2>
                <div className="space-y-3 text-xs text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Sem limite de dentistas ou secretárias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Sem taxa de setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Sem contrato de fidelidade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Suporte VIP no WhatsApp</span>
                  </div>
                </div>
              </AnimatedSection>

              {/* Center Pricing & Value Comparison Box */}
              <AnimatedSection delay={0.15} className="lg:col-span-8">
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Separate Tools Costs */}
                  <div className="md:col-span-5 text-xs text-slate-400 space-y-2 pr-4 border-r-0 md:border-r border-slate-800">
                    <span className="font-bold text-slate-300 block mb-2">Ferramentas separadas <br /><span className="text-[10px] font-normal opacity-70">(custo mensal estimado)</span></span>
                    <div className="flex justify-between"><span>Sistema odontológico</span><span>R$ 250</span></div>
                    <div className="flex justify-between"><span>WhatsApp Business API</span><span>R$ 120</span></div>
                    <div className="flex justify-between"><span>Agenda online</span><span>R$ 80</span></div>
                    <div className="flex justify-between"><span>Financeiro / Fluxo de caixa</span><span>R$ 120</span></div>
                    <div className="flex justify-between"><span>Relatórios / BI</span><span>R$ 80</span></div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between font-extrabold text-slate-200">
                      <span>Total estimado</span>
                      <span className="text-amber-400">R$ 650+</span>
                    </div>
                  </div>

                  {/* DentalFlow Complete Plan Card */}
                  <div className="md:col-span-7 bg-white text-slate-900 rounded-xl p-5 relative shadow-xl">
                    <div className="absolute -top-3 right-4 bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                      ECONOMIZE R$ 450+ POR MÊS
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 block uppercase mb-1">PLANO COMPLETO</span>
                    <h3 className="text-lg font-black text-slate-900 mb-1">DentalFlow</h3>

                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-black text-blue-600">R$ 197</span>
                      <span className="text-xs text-slate-500 font-semibold">/mês</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 block mb-3">14 dias grátis</span>

                    <div className="space-y-1.5 text-[11px] text-slate-600 font-medium mb-4">
                      <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Tudo incluso</div>
                      <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Dentistas ilimitados</div>
                      <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Secretárias ilimitadas</div>
                      <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Suporte humano</div>
                      <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Atualizações contínuas</div>
                    </div>

                    <button
                      onClick={onRegister}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Quero experimentar grátis</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="text-[9px] text-slate-400 block text-center mt-2">Sem cartão de crédito • Ativação imediata</span>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Bottom Trust Badges */}
            <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <div><strong className="text-slate-200 block">100% seguro</strong>Seus dados protegidos (LGPD)</div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <div><strong className="text-slate-200 block">Ativação imediata</strong>Sua clínica online em minutos</div>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-emerald-400" />
                <div><strong className="text-slate-200 block">Suporte humano</strong>No WhatsApp sempre que precisar</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SEÇÃO: CTA FINAL COM FOTO DO MÉDICO ═══════════════ */}
      <section className="landing-cta-doctor py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-lg grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Doctor Photo */}
            <AnimatedSection className="md:col-span-4 flex justify-center">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=500"
                  alt="Cirurgião-Dentista sorrindo na clínica"
                  className="w-full h-full object-cover"
                />
              </div>
            </AnimatedSection>

            {/* Middle Copy */}
            <AnimatedSection delay={0.1} className="md:col-span-5 text-slate-800">
              <p className="text-sm text-slate-600 font-semibold mb-1">Você abriu uma clínica para cuidar de pessoas.</p>
              <p className="text-sm text-slate-600 font-semibold mb-3">Não para administrar planilhas e enviar mensagens.</p>
              <h3 className="text-xl md:text-2xl font-black text-blue-600 leading-snug mb-3">
                Deixe as tarefas repetitivas com o DentalFlow.
              </h3>
              <p className="text-sm font-bold text-slate-900">Você cuida dos pacientes.</p>
              <p className="text-sm font-bold text-slate-900">Nós cuidamos da operação.</p>
            </AnimatedSection>

            {/* Right Action Button & Badges */}
            <AnimatedSection delay={0.2} className="md:col-span-3 flex flex-col items-center md:items-start gap-3">
              <button onClick={onRegister} className="landing-btn--primary landing-btn--lg w-full">
                Começar teste gratuito
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="space-y-1 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 14 dias grátis</div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Sem cartão de crédito</div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Configuração em 2 minutos</div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER COMPLETO ═══════════════ */}
      <footer className="landing-footer bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <BrandLogo variant="light" />
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Gestão inteligente para clínicas que querem crescer com organização.
              </p>
            </div>

            {/* Produto */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-2">Produto</h4>
              <div><a href="#funcionalidades" className="hover:text-white transition-colors">Recursos</a></div>
              <div><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></div>
              <div><a href="#integracoes" className="hover:text-white transition-colors">Integrações</a></div>
              <div><a href="#ia" className="hover:text-white transition-colors">IA</a></div>
            </div>

            {/* Empresa */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-2">Empresa</h4>
              <div><a href="#" className="hover:text-white transition-colors">Sobre nós</a></div>
              <div><a href="#" className="hover:text-white transition-colors">Blog</a></div>
              <div><a href="#" className="hover:text-white transition-colors">Carreiras</a></div>
              <div><a href="#contato" className="hover:text-white transition-colors">Contato</a></div>
            </div>

            {/* Suporte & Fale Conosco */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-2">Suporte</h4>
              <div><a href="#faq" className="hover:text-white transition-colors">Central de ajuda</a></div>
              <div><a href="#faq" className="hover:text-white transition-colors">Dúvidas frequentes</a></div>
              <div><a href="#" className="hover:text-white transition-colors">Status do sistema</a></div>
              <div className="pt-2 text-[11px] text-slate-400">
                <span>📞 WhatsApp: (11) 97234-5678</span><br />
                <span>✉️ contato@dentalflow.com.br</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
            <span>© {new Date().getFullYear()} DentalFlow. Todos os direitos reservados.</span>
            <span>Feito com ❤️ para clínicas odontológicas.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

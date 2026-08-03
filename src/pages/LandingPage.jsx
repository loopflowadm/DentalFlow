import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Sparkles, MessageSquare, Calendar, Shield, DollarSign,
  Check, ArrowRight, ChevronDown, Users, FileText, CheckCircle2,
  BarChart3, Clock, X, UserPlus, Search, Bell, Lock, Headphones,
  Star, Brain, Plug, TrendingUp, ClipboardList, Zap, Heart, Smile,
  Play, Pause, Volume2, VolumeX, Monitor, Smartphone, Tablet, Activity, Award, Phone,
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

  const heroVideoRef = useRef(null);
  const [isHeroMuted, setIsHeroMuted] = useState(true);
  const [isHeroPlaying, setIsHeroPlaying] = useState(true);

  const toggleHeroPlay = (e) => {
    e.stopPropagation();
    if (heroVideoRef.current) {
      if (isHeroPlaying) {
        heroVideoRef.current.pause();
      } else {
        heroVideoRef.current.play();
      }
      setIsHeroPlaying(!isHeroPlaying);
    }
  };

  const toggleHeroMute = (e) => {
    e.stopPropagation();
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = !isHeroMuted;
      setIsHeroMuted(!isHeroMuted);
    }
  };

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
        <div className="landing-header__inner max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
          <div className="landing-header__logo cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <BrandLogo variant="dark" />
          </div>

          <nav className="landing-header__nav hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection('segunda-feira')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Recursos</button>
            <button onClick={() => scrollToSection('segunda-feira')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Para Clínicas</button>
            <button onClick={() => scrollToSection('beneficios')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Benefícios</button>
            <button onClick={() => scrollToSection('demonstracao')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Depoimentos</button>
            <button onClick={() => scrollToSection('oferta')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Preços</button>
            <button onClick={() => scrollToSection('contato')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Contato</button>
          </nav>

          <div className="landing-header__actions flex items-center gap-3">
            <button onClick={onLogin} className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 transition-colors">
              Entrar
            </button>
            <button onClick={onRegister} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Começar gratuitamente
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="landing-hero pt-28 pb-16 overflow-hidden relative min-h-[90vh] flex items-center">
        {/* Background Video + Glow Backdrop */}
        <div className="landing-hero__bg absolute inset-0 overflow-hidden pointer-events-none z-0">
          <video
            ref={heroVideoRef}
            src="/video-hero.mp4"
            autoPlay
            loop
            muted={isHeroMuted}
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60 filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 via-slate-50/20 to-slate-50" />
          <div className="landing-hero__orb landing-hero__orb--1" />
          <div className="landing-hero__orb landing-hero__orb--2" />
          <div className="landing-hero__orb landing-hero__orb--3" />
        </div>

        <div className="landing-hero__inner max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10 w-full">
          {/* Left Column Copy (5 cols on lg) */}
          <motion.div
            className="landing-hero__copy lg:col-span-5 flex flex-col gap-5 text-left"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp} className="landing-hero__badge flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100/80 px-3.5 py-1.5 rounded-full text-xs font-bold w-fit">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>A nova geração de gestão para clínicas odontológicas</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="landing-hero__title text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Mais tempo para sorrisos.<br />
              <span className="landing-hero__title-accent text-blue-600">Menos tempo para burocracia.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="landing-hero__subtitle text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
              O DentalFlow cuida da sua clínica nos bastidores para que você possa focar no que realmente importa: <strong>seus pacientes</strong>.
            </motion.p>

            {/* 4 Feature Items Grid (2x2) */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-1">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Agenda organizada</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Chega de conflitos e horários perdidos.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Comunicação automática</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Confirmações, lembretes e retornos no WhatsApp, sem esforço.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Financeiro no controle</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Recebimentos, despesas e relatórios sempre em dia.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Conformidade e segurança</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Dados protegidos e prontuários sempre seguros.</p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 flex-wrap pt-2">
              <button onClick={onRegister} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3.5 rounded-full shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                <span>Quero minha clínica no automático</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column Showcase Visual (4 Floating Cards in Red Box Locations Marked by User) */}
          <motion.div
            className="landing-hero__visual lg:col-span-7 relative w-full min-h-[460px] lg:min-h-[540px] flex items-center justify-center z-10"
            initial={{ opacity: 0, x: 30, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Layout dos cartões flutuantes exatamente nos locais marcados em vermelho */}
            <div className="w-full relative min-h-[440px] lg:min-h-[500px] flex flex-col sm:grid sm:grid-cols-2 lg:block gap-4">
              
              {/* Card 1: Mais tempo para você (REBAIXADO PARA BAIXO) */}
              <motion.div
                className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-slate-900/10 flex items-start gap-3.5 text-left transition-all hover:scale-[1.03] hover:border-blue-300 hover:shadow-2xl lg:absolute lg:top-[120px] lg:left-0 lg:max-w-[250px] z-20"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, delay: 0.3, ease: 'easeInOut' }}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Mais tempo para você</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">Automatizamos tarefas para você focar no que ama.</p>
                </div>
              </motion.div>

              {/* Card 2: Pacientes mais satisfeitos (MANTIDO MAIS PRA CIMA E MAIS PRA ESQUERDA) */}
              <motion.div
                className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-slate-900/10 flex items-start gap-3.5 text-left transition-all hover:scale-[1.03] hover:border-blue-300 hover:shadow-2xl lg:absolute lg:-top-20 lg:left-[18%] xl:left-[22%] lg:max-w-[250px] z-20"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Pacientes mais satisfeitos</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">Atendimento ágil e personalizado em cada etapa.</p>
                </div>
              </motion.div>

              {/* Card 3: Clínica mais lucrativa (REBAIXADO MAIS PARA BAIXO) */}
              <motion.div
                className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-slate-900/10 flex items-start gap-3.5 text-left transition-all hover:scale-[1.03] hover:border-blue-300 hover:shadow-2xl lg:absolute lg:top-[280px] lg:-left-6 lg:max-w-[250px] z-20"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 5, delay: 0.7, ease: 'easeInOut' }}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Clínica mais lucrativa</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">Gestão inteligente que aumenta a produtividade e reduz perdas.</p>
                </div>
              </motion.div>

              {/* Card 4: Tranquilidade todos os dias (REBAIXADO MAIS PARA A BASE) */}
              <motion.div
                className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-slate-900/10 flex items-start gap-3.5 text-left transition-all hover:scale-[1.03] hover:border-blue-300 hover:shadow-2xl lg:absolute lg:-bottom-6 lg:left-[28%] xl:left-[32%] lg:max-w-[250px] z-20"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 5.2, delay: 1, ease: 'easeInOut' }}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Tranquilidade todos os dias</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">Tudo funcionando, tudo sob controle, mesmo quando você não está.</p>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SEÇÃO 1: MAIS QUE UM SISTEMA ═══════════════ */}
      <section className="landing-overview-section py-20 bg-slate-50/70 relative border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-200/80 shadow-xl shadow-slate-900/5 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Copy & 6-Feature Grid */}
            <AnimatedSection className="lg:col-span-5 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-3.5 py-1 rounded-full text-xs font-bold w-fit mb-4">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>MAIS QUE UM SISTEMA.</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                É uma nova forma de administrar <span className="text-blue-600">sua clínica.</span>
              </h2>

              <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed mb-8">
                Enquanto você faz um procedimento, o <strong>DentalFlow</strong> cuida de toda a operação em segundo plano.
              </p>

              {/* 6 Feature Items (2 Columns x 3 Rows) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-800">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Confirma consultas</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Organiza recebimentos</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Envia lembretes</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Atualiza a agenda</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Acompanha orçamentos</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Gera relatórios</span>
                </div>
              </div>
            </AnimatedSection>

            {/* Right Weekly Schedule View Mockup (6 Color-Tinted Patient Columns with Avatars) */}
            <AnimatedSection delay={0.15} className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-2xl bg-white">
                <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <BrandIcon variant="dark" className="w-4 h-4" />
                    <span className="font-bold text-slate-900">DentalFlow • Agenda Semanal</span>
                  </div>
                  <span className="text-slate-500 font-medium">12 - 18 de Maio, 2024</span>
                </div>

                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-[10px] bg-slate-50/50 min-h-[300px]">
                  {[
                    { day: 'Seg 12', name: 'Ana Paula Souza', tag: 'Clareamento', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop', cardStyle: 'bg-emerald-50 border-emerald-200/90 text-emerald-900', tagStyle: 'text-emerald-700 bg-emerald-100/60', iconColor: 'text-emerald-600 bg-emerald-100' },
                    { day: 'Ter 13', name: 'Vanessa Lima', tag: 'Avaliação', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop', cardStyle: 'bg-rose-50 border-rose-200/90 text-rose-900', tagStyle: 'text-rose-700 bg-rose-100/60', iconColor: 'text-rose-600 bg-rose-100' },
                    { day: 'Qua 14', name: 'Felisberto Alves', tag: 'Limpeza', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop', cardStyle: 'bg-cyan-50 border-cyan-200/90 text-cyan-900', tagStyle: 'text-cyan-700 bg-cyan-100/60', iconColor: 'text-cyan-600 bg-cyan-100' },
                    { day: 'Qui 15', name: 'Juliana Martins', tag: 'Canal', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop', cardStyle: 'bg-orange-50 border-orange-200/90 text-orange-900', tagStyle: 'text-orange-700 bg-orange-100/60', iconColor: 'text-orange-600 bg-orange-100' },
                    { day: 'Sex 16', name: 'Fernando Rocha', tag: 'Aparelho', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop', cardStyle: 'bg-teal-50 border-teal-200/90 text-teal-900', tagStyle: 'text-teal-700 bg-teal-100/60', iconColor: 'text-teal-600 bg-teal-100' },
                    { day: 'Sáb 17', name: 'Patrícia Gomes', tag: 'Clareamento', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop', cardStyle: 'bg-purple-50 border-purple-200/90 text-purple-900', tagStyle: 'text-purple-700 bg-purple-100/60', iconColor: 'text-purple-600 bg-purple-100' },
                  ].map((col, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <span className="font-bold text-slate-600 text-center pb-1 border-b border-slate-200 text-xs">{col.day}</span>
                      <div className={`p-3 rounded-2xl border ${col.cardStyle} flex flex-col items-center justify-between text-center min-h-[220px] shadow-sm transition-all hover:scale-[1.02]`}>
                        <img src={col.img} alt={col.name} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md my-1" />
                        <span className="font-extrabold text-[11px] leading-tight text-slate-900">{col.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${col.tagStyle}`}>{col.tag}</span>
                        <div className={`w-7 h-7 rounded-full ${col.iconColor} flex items-center justify-center mt-2`}>
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════ SEÇÃO 2: IMAGINE COMO SERÁ SUA SEGUNDA-FEIRA (VERTICAL TIMELINE FLOW) ═══════════════ */}
      <section id="segunda-feira" className="landing-timeline-section py-24 bg-slate-50/70 relative border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              ROTINA INTELIGENTE. DIA MAIS LEVE.
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              Imagine como será <span className="text-blue-600">sua segunda-feira.</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto">
              O <strong>DentalFlow</strong> trabalha por você do início ao fim do dia.
            </p>
          </AnimatedSection>

          {/* Vertical Timeline Stack with Dashed Connecting Line */}
          <div className="relative flex flex-col gap-12 sm:gap-14">
            {/* Dashed Connecting Line on Left */}
            <div className="hidden sm:block absolute top-8 bottom-8 left-[27px] w-0.5 border-l-2 border-dashed border-blue-300 z-0 opacity-80" />

            {/* Item 1: 08:00 */}
            <AnimatedSection delay={0.05} className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-5 flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 border-4 border-white ring-4 ring-blue-100">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="pt-1">
                  <span className="text-xl sm:text-2xl font-black text-blue-600 block mb-1">08:00</span>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                    Pacientes confirmam presença automaticamente pelo WhatsApp no domingo.
                  </p>
                </div>
              </div>
              <div className="sm:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-900/5 flex items-center justify-between gap-4 overflow-hidden hover:border-blue-300 transition-all">
                <div className="flex-1">
                  <div className="bg-blue-600 text-white p-3.5 rounded-xl max-w-[260px] text-xs shadow-md">
                    <p className="font-bold mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                      Lembrete de consulta
                    </p>
                    <p className="text-[11px] text-blue-50 leading-tight">Confirmar presença? Domingo, 20:30 ✓</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Presença confirmada!</span>
                </div>
              </div>
            </AnimatedSection>

            {/* Item 2: 09:20 */}
            <AnimatedSection delay={0.1} className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-5 flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 border-4 border-white ring-4 ring-blue-100">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="pt-1">
                  <span className="text-xl sm:text-2xl font-black text-blue-600 block mb-1">09:20</span>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                    Remarcações acontecem e a agenda se reorganiza sozinho.
                  </p>
                </div>
              </div>
              <div className="sm:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-900/5 flex items-center justify-between gap-4 hover:border-blue-300 transition-all">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="text-slate-400">09:00</span>
                    <span className="bg-blue-100/70 text-blue-800 px-2.5 py-1 rounded-lg text-[11px]">Dra. Ana • Consulta</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="text-slate-400">10:00</span>
                    <span className="bg-emerald-100/70 text-emerald-800 px-2.5 py-1 rounded-lg text-[11px]">Horário remanejado automaticamente</span>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Remarcação realizada!</span>
                </div>
              </div>
            </AnimatedSection>

            {/* Item 3: 11:10 */}
            <AnimatedSection delay={0.15} className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-5 flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 border-4 border-white ring-4 ring-blue-100">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="pt-1">
                  <span className="text-xl sm:text-2xl font-black text-blue-600 block mb-1">11:10</span>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                    Você acessa o prontuário com todo o histórico do paciente.
                  </p>
                </div>
              </div>
              <div className="sm:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-900/5 flex items-center gap-4 hover:border-blue-300 transition-all">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop" alt="Ana Paula Souza" className="w-13 h-13 rounded-full object-cover border-2 border-blue-200 shadow-md shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">Ana Paula Souza</h4>
                  <p className="text-xs text-slate-500 font-medium mb-2">Prontuário Odontológico Completo</p>
                  <div className="flex gap-1.5 flex-wrap text-[10px] font-bold">
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">Clareamento</span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">Avaliação</span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">Raio-X Digital</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Item 4: 14:00 */}
            <AnimatedSection delay={0.2} className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-5 flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 border-4 border-white ring-4 ring-blue-100">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="pt-1">
                  <span className="text-xl sm:text-2xl font-black text-blue-600 block mb-1">14:00</span>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                    O sistema lembra um orçamento parado e o paciente recebe um contato.
                  </p>
                </div>
              </div>
              <div className="sm:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-900/5 flex items-center justify-between gap-4 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Orçamento pendente</h4>
                    <p className="text-xs text-slate-500 font-medium">Enviar lembrete para o paciente?</p>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0">
                  Enviar agora
                </button>
              </div>
            </AnimatedSection>

            {/* Item 5: 17:50 */}
            <AnimatedSection delay={0.25} className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-5 flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 border-4 border-white ring-4 ring-blue-100">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="pt-1">
                  <span className="text-xl sm:text-2xl font-black text-blue-600 block mb-1">17:50</span>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                    Financeiro atualizado. Relatórios prontos. Dia encerrado com tudo em ordem.
                  </p>
                </div>
              </div>
              <div className="sm:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-900/5 flex items-center justify-between gap-4 hover:border-blue-300 transition-all">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">Resumo financeiro do dia</h4>
                  <div className="flex items-center gap-3 text-xs font-extrabold flex-wrap">
                    <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/80">Recebimentos: R$ 8.450,00</span>
                    <span className="text-rose-700 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200/80">Despesas: R$ 2.150,00</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </AnimatedSection>

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

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Sparkles, MessageSquare, Calendar, Shield, DollarSign, 
  Check, ArrowRight, ChevronDown, Users, FileText, CheckCircle2, 
  BarChart3, Clock, X, UserPlus, Search, Bell, Lock, Headphones,
  Star, Brain, Plug, TrendingUp, ClipboardList, Zap, Heart,
  ExternalLink, Mail, Phone, MapPin, Globe, ChevronRight,
  Play, Monitor, Smartphone, Tablet, Activity, Award
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
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

/* ── Brand Logo: Official logo with proper styling for landing contexts ── */
const BrandLogo = ({ className = '', variant = 'dark' }) => {
  // variant: 'dark' = dark fill (for light backgrounds), 'light' = white fill (for dark backgrounds)
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
      phone: leadData.phone.replace(/\D/g, '') || '5511999999999',
      avatar: '👤',
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

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <div className="landing-page">
      {/* ═══════════════ HEADER ═══════════════ */}
      <header className={`landing-header ${scrolled ? 'landing-header--scrolled' : ''}`}>
        <div className="landing-header__inner">
          {/* Logo */}
          <div className="landing-header__logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <BrandLogo variant="dark" />
          </div>
          
          {/* Nav */}
          <nav className="landing-header__nav">
            <button onClick={() => scrollToSection('recursos')}>Recursos</button>
            <button onClick={() => scrollToSection('funcionalidades')}>Funcionalidades</button>
            <button onClick={() => scrollToSection('integracoes')}>Integrações</button>
            <button onClick={() => scrollToSection('precos')}>Preços</button>
            <button onClick={() => scrollToSection('depoimentos')}>Depoimentos</button>
            <button onClick={() => scrollToSection('contato')}>Contato</button>
          </nav>

          {/* Actions */}
          <div className="landing-header__actions">
            <button onClick={onLogin} className="landing-btn--ghost">Entrar</button>
            <button onClick={onRegister} className="landing-btn--primary landing-btn--sm">
              Começar Gratuitamente
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="landing-hero">
        {/* Background decorations */}
        <div className="landing-hero__bg">
          <div className="landing-hero__orb landing-hero__orb--1" />
          <div className="landing-hero__orb landing-hero__orb--2" />
          <div className="landing-hero__orb landing-hero__orb--3" />
          <div className="landing-hero__grid-pattern" />
        </div>

        <div className="landing-hero__inner">
          {/* Left - Copy */}
          <motion.div 
            className="landing-hero__copy"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp} className="landing-hero__badge">
              <Sparkles style={{ width: 14, height: 14 }} />
              CRM Inteligente para Clínicas Odontológicas
            </motion.div>

            <motion.h1 variants={fadeUp} className="landing-hero__title">
              Organize sua clínica.{'\n'}
              <span className="landing-hero__title-accent">Automatize</span> seu atendimento.{'\n'}
              Cresça com <span className="landing-hero__title-accent">inteligência</span>.
            </motion.h1>

            <motion.p variants={fadeUp} className="landing-hero__subtitle">
              O DentalFlow centraliza agenda, pacientes, financeiro, WhatsApp e 
              Inteligência Artificial em um único sistema para clínicas modernas.
            </motion.p>

            <motion.div variants={fadeUp} className="landing-hero__buttons">
              <button onClick={onRegister} className="landing-btn--primary landing-btn--lg">
                Começar Gratuitamente
                <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
              <button onClick={() => scrollToSection('contato')} className="landing-btn--outline landing-btn--lg">
                <Play style={{ width: 16, height: 16 }} />
                Agendar Demonstração
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="landing-hero__social-proof">
              <div className="landing-hero__avatars">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100" alt="" />
                <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100" alt="" />
                <img src="https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=100" alt="" />
                <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=100" alt="" />
              </div>
              <div className="landing-hero__proof-text">
                <div className="landing-hero__proof-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} style={{ width: 13, height: 13, fill: '#F59E0B', color: '#F59E0B' }} />)}
                </div>
                <span>Mais de <strong>1.500 clínicas</strong> confiam no DentalFlow</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Dashboard Mockup */}
          <motion.div 
            className="landing-hero__mockup"
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Dashboard Card */}
            <div className="landing-dashboard">
              {/* Browser chrome */}
              <div className="landing-dashboard__chrome">
                <div className="landing-dashboard__dots">
                  <span style={{ background: '#FF5F57' }} />
                  <span style={{ background: '#FFBD2E' }} />
                  <span style={{ background: '#28C840' }} />
                </div>
                <div className="landing-dashboard__url">dentalflow.app</div>
                <div style={{ width: 48 }} />
              </div>

              {/* App Content */}
              <div className="landing-dashboard__content">
                {/* Top bar */}
                <div className="landing-dashboard__topbar">
                  <div className="landing-dashboard__topbar-left">
                    <div className="landing-dashboard__app-icon">DF</div>
                    <span className="landing-dashboard__greeting">Olá, Dra. Camila! 👋</span>
                  </div>
                  <div className="landing-dashboard__topbar-right">
                    <Search style={{ width: 14, height: 14, color: '#94A3B8' }} />
                    <Bell style={{ width: 14, height: 14, color: '#94A3B8' }} />
                    <img className="landing-dashboard__avatar" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=50" alt="" />
                  </div>
                </div>
                <div className="landing-dashboard__sub">Aqui está o resumo da sua clínica hoje.</div>

                {/* Stats */}
                <div className="landing-dashboard__stats">
                  {[
                    { label: 'Consultas hoje', val: '24', delta: '▲ 30%', positive: true },
                    { label: 'Faturamento', val: 'R$ 12.840', delta: '▲ 16%', positive: true },
                    { label: 'Pacientes ativos', val: '1.268', delta: '▲ 14%', positive: true },
                    { label: 'Taxa de retorno', val: '72%', delta: '▼ 8%', positive: false },
                  ].map((s, i) => (
                    <div key={i} className="landing-dashboard__stat-card">
                      <span className="landing-dashboard__stat-label">{s.label}</span>
                      <span className="landing-dashboard__stat-value">{s.val}</span>
                      <span className={`landing-dashboard__stat-delta ${s.positive ? 'positive' : 'negative'}`}>{s.delta} vs ontem</span>
                    </div>
                  ))}
                </div>

                {/* Two columns: Agenda + Chart */}
                <div className="landing-dashboard__columns">
                  {/* Agenda */}
                  <div className="landing-dashboard__panel">
                    <div className="landing-dashboard__panel-header">
                      <span>📅 Agenda do dia</span>
                      <span className="landing-dashboard__panel-link">Ver todas →</span>
                    </div>
                    {[
                      { time: '08:00', name: 'Mariana Silva', tag: 'Profilaxia', color: '#196BFB' },
                      { time: '09:30', name: 'João Pereira', tag: 'Clareamento', color: '#10B981' },
                      { time: '11:00', name: 'Ana Souza', tag: 'Restauração', color: '#8B5CF6' },
                      { time: '14:00', name: 'Carlos Lima', tag: 'Retorno', color: '#F59E0B' },
                      { time: '15:30', name: 'Juliana Martins', tag: 'Ortodontia', color: '#EC4899' },
                    ].map((a, i) => (
                      <div key={i} className="landing-dashboard__agenda-item">
                        <span className="landing-dashboard__agenda-time">{a.time}</span>
                        <span className="landing-dashboard__agenda-name">{a.name}</span>
                        <span className="landing-dashboard__agenda-tag" style={{ background: a.color + '15', color: a.color }}>{a.tag}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="landing-dashboard__panel">
                    <div className="landing-dashboard__panel-header">
                      <span>📊 Faturamento</span>
                      <span className="landing-dashboard__panel-link">Mensal ▾</span>
                    </div>
                    <div className="landing-dashboard__chart">
                      <svg className="landing-dashboard__chart-svg" viewBox="0 0 240 80" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#196BFB" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#196BFB" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,60 Q20,55 40,50 T80,35 T120,25 T160,15 T200,20 L240,8 L240,80 L0,80 Z" fill="url(#chartFill)" />
                        <path d="M0,60 Q20,55 40,50 T80,35 T120,25 T160,15 T200,20 L240,8" fill="none" stroke="#196BFB" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="200" cy="20" r="4" fill="#196BFB" stroke="white" strokeWidth="2" />
                      </svg>
                      <div className="landing-dashboard__chart-tooltip">R$ 12.840</div>
                      <div className="landing-dashboard__chart-labels">
                        <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="landing-dashboard__actions-row">
                  <span className="landing-dashboard__actions-title">Atalhos rápidos</span>
                  <div className="landing-dashboard__shortcuts">
                    {[
                      { icon: <UserPlus style={{ width: 14, height: 14 }} />, label: 'Novo paciente' },
                      { icon: <Calendar style={{ width: 14, height: 14 }} />, label: 'Nova consulta' },
                      { icon: <MessageSquare style={{ width: 14, height: 14 }} />, label: 'Enviar lembrete' },
                      { icon: <BarChart3 style={{ width: 14, height: 14 }} />, label: 'Relatórios' },
                    ].map((b, i) => (
                      <div key={i} className="landing-dashboard__shortcut">
                        {b.icon}
                        <span>{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Phone */}
            <div className="landing-hero__phone">
              <div className="landing-hero__phone-notch" />
              <div className="landing-hero__phone-screen">
                <div className="landing-hero__phone-header">
                  <BrandIcon variant="dark" className="landing-hero__phone-brand-icon" />
                  <span className="landing-hero__phone-title">Agenda</span>
                  <span className="landing-hero__phone-date">Hoje, 24 de Mai</span>
                </div>
                <div className="landing-hero__phone-items">
                  {[
                    { name: 'Mariana Silva', time: '08:00', color: '#196BFB' },
                    { name: 'João Pereira', time: '09:30', color: '#10B981' },
                    { name: 'Ana Souza', time: '11:00', color: '#8B5CF6' },
                    { name: 'Carlos Lima', time: '14:00', color: '#F59E0B' },
                    { name: 'Juliana Martins', time: '15:30', color: '#EC4899' },
                  ].map((item, i) => (
                    <div key={i} className="landing-hero__phone-item">
                      <div className="landing-hero__phone-dot" style={{ background: item.color }} />
                      <div className="landing-hero__phone-item-info">
                        <span className="landing-hero__phone-item-name">{item.name}</span>
                        <span className="landing-hero__phone-item-time">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating glassmorphism cards */}
            <motion.div 
              className="landing-hero__float-card landing-hero__float-card--ai"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <Brain style={{ width: 16, height: 16, color: '#8B5CF6' }} />
              <span>IA ativa</span>
            </motion.div>

            <motion.div 
              className="landing-hero__float-card landing-hero__float-card--patients"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }}
            >
              <TrendingUp style={{ width: 16, height: 16, color: '#10B981' }} />
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A' }}>+35%</span>
                <span style={{ fontSize: 9, color: '#64748B', display: 'block' }}>retornos</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FEATURE BAR ═══════════════ */}
      <section id="recursos" className="landing-feature-bar">
        <AnimatedSection className="landing-feature-bar__inner">
          {[
            { icon: <Calendar style={{ width: 20, height: 20 }} />, label: 'Agenda Inteligente' },
            { icon: <MessageSquare style={{ width: 20, height: 20 }} />, label: 'WhatsApp Integrado' },
            { icon: <Users style={{ width: 20, height: 20 }} />, label: 'CRM de Pacientes' },
            { icon: <DollarSign style={{ width: 20, height: 20 }} />, label: 'Financeiro' },
            { icon: <ClipboardList style={{ width: 20, height: 20 }} />, label: 'Prontuário Digital' },
            { icon: <Brain style={{ width: 20, height: 20 }} />, label: 'Inteligência Artificial' },
            { icon: <BarChart3 style={{ width: 20, height: 20 }} />, label: 'Relatórios' },
            { icon: <Plug style={{ width: 20, height: 20 }} />, label: 'Integrações' },
          ].map((f, i) => (
            <div key={i} className="landing-feature-bar__item">
              <div className="landing-feature-bar__icon">{f.icon}</div>
              <span>{f.label}</span>
            </div>
          ))}
        </AnimatedSection>
      </section>

      {/* ═══════════════ FUNCIONALIDADES GRID ═══════════════ */}
      <section id="funcionalidades" className="landing-features">
        <div className="landing-features__inner">
          {/* Left copy */}
          <AnimatedSection className="landing-features__copy">
            <span className="landing-overline">ENQUANTO VOCÊ ATENDE PACIENTES...</span>
            <h2 className="landing-section-title">
              O DentalFlow cuida<br />do resto.
            </h2>
            <p className="landing-section-subtitle">
              Automatize tarefas, organize informações e tenha mais tempo para o que realmente importa: seus pacientes.
            </p>
            <button onClick={onRegister} className="landing-btn--primary landing-btn--lg" style={{ marginTop: 24 }}>
              Quero automatizar minha clínica
              <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
          </AnimatedSection>

          {/* Right 2x3 grid */}
          <div className="landing-features__grid">
            {[
              { icon: <Calendar style={{ width: 22, height: 22 }} />, title: 'Agenda Inteligente', desc: 'Organize consultas, encaixes e retornos automaticamente.', color: '#196BFB' },
              { icon: <MessageSquare style={{ width: 22, height: 22 }} />, title: 'WhatsApp Automatizado', desc: 'Confirmações, lembretes e pós-atendimento enviados sem esforço.', color: '#25D366' },
              { icon: <Users style={{ width: 22, height: 22 }} />, title: 'Gestão de Pacientes', desc: 'Todo histórico organizado em um único lugar.', color: '#6366F1' },
              { icon: <DollarSign style={{ width: 22, height: 22 }} />, title: 'Financeiro', desc: 'Controle pagamentos, inadimplência e faturamento.', color: '#F59E0B' },
              { icon: <Brain style={{ width: 22, height: 22 }} />, title: 'Inteligência Artificial', desc: 'Automatize tarefas repetitivas e economize horas todos os dias.', color: '#8B5CF6' },
              { icon: <BarChart3 style={{ width: 22, height: 22 }} />, title: 'Relatórios', desc: 'Descubra exatamente onde sua clínica pode crescer.', color: '#06B6D4' },
            ].map((c, i) => (
              <AnimatedSection key={i} delay={i * 0.08} className="landing-features__card">
                <div className="landing-features__card-icon" style={{ background: c.color + '12', color: c.color }}>
                  {c.icon}
                </div>
                <h3 className="landing-features__card-title">{c.title}</h3>
                <p className="landing-features__card-desc">{c.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ DARK CONTRAST SECTION ═══════════════ */}
      <section className="landing-dark-section">
        <div className="landing-dark-section__inner">
          {/* Photo */}
          <AnimatedSection className="landing-dark-section__photo-col">
            <div className="landing-dark-section__photo-wrapper">
              <div className="landing-dark-section__photo-glow" />
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=500" 
                alt="Dentista usando DentalFlow" 
                className="landing-dark-section__photo"
              />
            </div>
          </AnimatedSection>

          {/* Pain points */}
          <AnimatedSection delay={0.15} className="landing-dark-section__problems">
            <h3 className="landing-dark-section__heading">
              Chega de perder tempo com tarefas que não geram resultado.
            </h3>
            <ul className="landing-dark-section__list">
              {['Confirmando consultas manualmente', 'Respondendo WhatsApp o dia inteiro', 'Procurando fichas de pacientes', 'Reagendamentos sem controle', 'Controle financeiro em planilhas'].map((t, i) => (
                <li key={i} className="landing-dark-section__list-item landing-dark-section__list-item--problem">
                  <span className="landing-dark-section__list-marker landing-dark-section__list-marker--x">
                    <X style={{ width: 12, height: 12 }} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </AnimatedSection>

          {/* Benefits */}
          <AnimatedSection delay={0.3} className="landing-dark-section__benefits">
            <h3 className="landing-dark-section__heading landing-dark-section__heading--accent">
              Com o DentalFlow tudo isso acontece automaticamente.
            </h3>
            <ul className="landing-dark-section__list">
              {['Mais organização', 'Menos faltas', 'Mais retornos', 'Mais faturamento', 'Mais tempo para você'].map((t, i) => (
                <li key={i} className="landing-dark-section__list-item landing-dark-section__list-item--benefit">
                  <span className="landing-dark-section__list-marker landing-dark-section__list-marker--check">
                    <Check style={{ width: 12, height: 12 }} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════ RESULTS ═══════════════ */}
      <section className="landing-results">
        <AnimatedSection className="landing-results__header">
          <span className="landing-overline">RESULTADOS QUE FAZEM A DIFERENÇA</span>
          <h2 className="landing-section-title">Números que comprovam</h2>
        </AnimatedSection>
        <div className="landing-results__grid">
          {[
            { icon: <Users style={{ width: 28, height: 28 }} />, val: '-70%', label: 'Redução de faltas', desc: 'Com confirmações automáticas via WhatsApp', color: '#196BFB' },
            { icon: <TrendingUp style={{ width: 28, height: 28 }} />, val: '+35%', label: 'Mais faturamento', desc: 'Retenção e retorno de pacientes otimizados', color: '#10B981' },
            { icon: <Clock style={{ width: 28, height: 28 }} />, val: '10h', label: 'Tempo economizado', desc: 'Por semana em tarefas administrativas', color: '#F59E0B' },
            { icon: <Heart style={{ width: 28, height: 28 }} />, val: '98%', label: 'Satisfação dos pacientes', desc: 'Avaliação média dos pacientes atendidos', color: '#EC4899' },
          ].map((s, i) => (
            <AnimatedSection key={i} delay={i * 0.1} className="landing-results__card">
              <div className="landing-results__card-icon" style={{ background: s.color + '10', color: s.color }}>
                {s.icon}
              </div>
              <span className="landing-results__card-value" style={{ color: s.color }}>{s.val}</span>
              <span className="landing-results__card-label">{s.label}</span>
              <span className="landing-results__card-desc">{s.desc}</span>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section id="depoimentos" className="landing-testimonials">
        <AnimatedSection className="landing-testimonials__header">
          <span className="landing-overline">O QUE DIZEM NOSSOS CLIENTES</span>
          <h2 className="landing-section-title">Histórias de sucesso reais</h2>
        </AnimatedSection>
        <div className="landing-testimonials__grid">
          {[
            { 
              name: 'Dr. Rafael Mendes', clinic: 'Clínica Sorriso Perfeito', 
              text: 'O DentalFlow mudou a rotina da nossa clínica. Reduzimos faltas em 70%, organizamos processos e hoje temos mais tempo para focar no que realmente importa.',
              img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'
            },
            { 
              name: 'Dra. Camila Santos', clinic: 'OdontoVida Premium', 
              text: 'A integração com WhatsApp é incrível. Nossos pacientes recebem confirmações automáticas e o índice de comparecimento subiu muito desde que começamos a usar.',
              img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
            },
            { 
              name: 'Dr. Pedro Oliveira', clinic: 'Instituto Dental Plus', 
              text: 'O controle financeiro ficou transparente e fácil. Consigo ver em tempo real o faturamento, inadimplência e fazer projeções com a IA integrada.',
              img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150'
            },
          ].map((t, i) => (
            <AnimatedSection key={i} delay={i * 0.12} className="landing-testimonials__card">
              <div className="landing-testimonials__stars">
                {[...Array(5)].map((_, j) => <Star key={j} style={{ width: 16, height: 16, fill: '#F59E0B', color: '#F59E0B' }} />)}
              </div>
              <p className="landing-testimonials__text">"{t.text}"</p>
              <div className="landing-testimonials__author">
                <img src={t.img} alt={t.name} className="landing-testimonials__avatar" />
                <div>
                  <span className="landing-testimonials__name">{t.name}</span>
                  <span className="landing-testimonials__clinic">{t.clinic}</span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════════════ DEVICE SHOWCASE ═══════════════ */}
      <section className="landing-showcase">
        <AnimatedSection className="landing-showcase__header">
          <span className="landing-overline">SIMPLES DE USAR. BONITO DE VER. DIFÍCIL DE ABANDONAR.</span>
          <h2 className="landing-section-title">Uma experiência incrível<br />em qualquer dispositivo.</h2>
        </AnimatedSection>

        <AnimatedSection className="landing-showcase__devices">
          {/* Laptop */}
          <div className="landing-showcase__laptop">
            <div className="landing-showcase__laptop-screen">
              <div className="landing-showcase__laptop-chrome">
                <span style={{ background: '#FF5F57' }} /><span style={{ background: '#FFBD2E' }} /><span style={{ background: '#28C840' }} />
              </div>
              <div className="landing-showcase__laptop-content">
                <div className="landing-showcase__mock-topbar" />
                <div className="landing-showcase__mock-grid">
                  <div className="landing-showcase__mock-card" /><div className="landing-showcase__mock-card" /><div className="landing-showcase__mock-card" />
                </div>
                <div className="landing-showcase__mock-chart" />
              </div>
            </div>
            <div className="landing-showcase__laptop-base" />
          </div>

          {/* Tablet */}
          <div className="landing-showcase__tablet">
            <div className="landing-showcase__tablet-cam" />
            <div className="landing-showcase__tablet-content">
              <div className="landing-showcase__mock-topbar" />
              <div className="landing-showcase__mock-card" style={{ height: 20, marginBottom: 6 }} />
              <div className="landing-showcase__mock-card" style={{ height: 30, marginBottom: 6 }} />
              <div className="landing-showcase__mock-chart" style={{ height: 50 }} />
            </div>
          </div>

          {/* Phone */}
          <div className="landing-showcase__phone">
            <div className="landing-showcase__phone-notch-small" />
            <div className="landing-showcase__phone-content">
              <div className="landing-showcase__mock-topbar" style={{ height: 8, width: '50%' }} />
              <div className="landing-showcase__mock-card" style={{ height: 14, marginBottom: 4 }} />
              <div className="landing-showcase__mock-card" style={{ height: 14, marginBottom: 4 }} />
              <div className="landing-showcase__mock-card" style={{ height: 14, marginBottom: 4 }} />
              <div className="landing-showcase__mock-chart" style={{ height: 40, background: '#EAF2FF', border: '1px solid #C7D9FF', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 6, fontWeight: 700, color: '#196BFB' }}>Agenda do dia</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══════════════ INTEGRATIONS ═══════════════ */}
      <section id="integracoes" className="landing-integrations">
        <AnimatedSection className="landing-integrations__header">
          <span className="landing-overline">CONECTE COM SUAS FERRAMENTAS FAVORITAS</span>
          <h2 className="landing-section-title">Integrações poderosas</h2>
          <p className="landing-section-subtitle" style={{ maxWidth: 560, margin: '0 auto' }}>
            O DentalFlow se conecta com as ferramentas que sua clínica já utiliza.
          </p>
        </AnimatedSection>

        <div className="landing-integrations__grid">
          {[
            { name: 'WhatsApp', icon: '💬', desc: 'Mensagens automatizadas' },
            { name: 'Google Calendar', icon: '📅', desc: 'Sincronização de agenda' },
            { name: 'Google Drive', icon: '📁', desc: 'Armazenamento de arquivos' },
            { name: 'Gmail', icon: '✉️', desc: 'E-mails automáticos' },
            { name: 'Stripe', icon: '💳', desc: 'Pagamentos online' },
            { name: 'OpenAI', icon: '🤖', desc: 'Inteligência artificial' },
            { name: 'n8n', icon: '⚡', desc: 'Automação de workflows' },
            { name: 'Meta', icon: '📱', desc: 'Anúncios e leads' },
            { name: 'Microsoft', icon: '🪟', desc: 'Produtividade' },
            { name: 'API', icon: '🔗', desc: 'Integração personalizada' },
          ].map((item, i) => (
            <AnimatedSection key={i} delay={i * 0.05} className="landing-integrations__card">
              <span className="landing-integrations__card-icon">{item.icon}</span>
              <span className="landing-integrations__card-name">{item.name}</span>
              <span className="landing-integrations__card-desc">{item.desc}</span>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="precos" className="landing-pricing">
        <AnimatedSection className="landing-pricing__header">
          <span className="landing-overline">PLANOS E PREÇOS</span>
          <h2 className="landing-section-title">Escolha o plano ideal para sua clínica</h2>
        </AnimatedSection>

        <div className="landing-pricing__grid">
          {[
            { 
              name: 'Starter', price: 'R$ 197', period: '/mês', 
              desc: 'Para clínicas que estão começando a digitalizar.',
              features: ['Até 500 pacientes', 'Agenda inteligente', 'WhatsApp básico', 'Prontuário digital', 'Suporte por email'],
              highlight: false
            },
            { 
              name: 'Professional', price: 'R$ 397', period: '/mês',
              desc: 'Para clínicas em crescimento que buscam automação.',
              features: ['Pacientes ilimitados', 'WhatsApp completo', 'Financeiro integrado', 'Relatórios avançados', 'IA assistente', 'Integrações'],
              highlight: true, badge: 'Mais popular'
            },
            { 
              name: 'Enterprise', price: 'Sob consulta', period: '',
              desc: 'Para redes de clínicas e grandes operações.',
              features: ['Multi-clínicas', 'API personalizada', 'SLA dedicado', 'Onboarding VIP', 'Customização completa', 'Gerente de sucesso'],
              highlight: false
            },
          ].map((plan, i) => (
            <AnimatedSection key={i} delay={i * 0.1} className={`landing-pricing__card ${plan.highlight ? 'landing-pricing__card--highlight' : ''}`}>
              {plan.badge && <span className="landing-pricing__badge">{plan.badge}</span>}
              <h3 className="landing-pricing__plan-name">{plan.name}</h3>
              <p className="landing-pricing__plan-desc">{plan.desc}</p>
              <div className="landing-pricing__price">
                <span className="landing-pricing__price-value">{plan.price}</span>
                <span className="landing-pricing__price-period">{plan.period}</span>
              </div>
              <ul className="landing-pricing__features">
                {plan.features.map((f, j) => (
                  <li key={j}><Check style={{ width: 16, height: 16, color: plan.highlight ? '#196BFB' : '#10B981' }} /> {f}</li>
                ))}
              </ul>
              <button 
                onClick={onRegister}
                className={plan.highlight ? 'landing-btn--primary landing-btn--lg landing-btn--full' : 'landing-btn--outline landing-btn--lg landing-btn--full'}
              >
                {plan.price === 'Sob consulta' ? 'Falar com vendas' : 'Começar agora'}
              </button>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section id="faq" className="landing-faq">
        <AnimatedSection className="landing-faq__header">
          <span className="landing-overline">PERGUNTAS FREQUENTES</span>
          <h2 className="landing-section-title">Tudo o que você precisa saber</h2>
        </AnimatedSection>

        <div className="landing-faq__list">
          {[
            { q: 'Preciso instalar algo?', a: 'Não. O DentalFlow funciona diretamente no seu navegador, sem necessidade de downloads ou instalação de software adicional.' },
            { q: 'Tem aplicativo para celular?', a: 'Sim. O DentalFlow é totalmente responsivo e funciona perfeitamente em qualquer celular, tablet ou computador.' },
            { q: 'Posso importar meus pacientes?', a: 'Sim. Você pode importar seus pacientes via planilha Excel/CSV de forma rápida e segura. Nossa equipe auxilia no processo.' },
            { q: 'Como funciona o suporte?', a: 'Oferecemos suporte humanizado via WhatsApp, email e chat. Nossa equipe de especialistas auxilia você em todo o processo.' },
            { q: 'Meus dados estão seguros?', a: 'Absolutamente. Seus dados são criptografados em trânsito e em repouso, com backups diários e infraestrutura em nuvem de alta disponibilidade.' },
            { q: 'Existe período de teste gratuito?', a: 'Sim! Você pode testar o DentalFlow gratuitamente por 14 dias, sem necessidade de cartão de crédito.' },
            { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Não há fidelidade ou multa de cancelamento. Você pode cancelar seu plano a qualquer momento diretamente pelo painel.' },
            { q: 'A IA substitui o dentista?', a: 'De forma alguma. A IA do DentalFlow automatiza tarefas administrativas e repetitivas, liberando mais tempo para o atendimento clínico.' },
          ].map((faq, idx) => (
            <AnimatedSection key={idx} delay={idx * 0.04} className="landing-faq__item">
              <button 
                onClick={() => setOpenFaq(p => p === idx ? null : idx)}
                className={`landing-faq__question ${openFaq === idx ? 'landing-faq__question--open' : ''}`}
              >
                <span>{faq.q}</span>
                <ChevronDown style={{ width: 20, height: 20, transition: 'transform 0.3s', transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    transition={{ duration: 0.25 }}
                  >
                    <div className="landing-faq__answer">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════════════ CONTACT FORM ═══════════════ */}
      <section id="contato" className="landing-contact">
        <AnimatedSection className="landing-contact__card">
          <div className="landing-contact__header">
            <h2 className="landing-section-title">Fale com um especialista</h2>
            <p className="landing-section-subtitle">Preencha o formulário para agendarmos uma demonstração guiada e ativar seu teste grátis.</p>
          </div>
          <AnimatePresence mode="wait">
            {formSuccess ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="landing-contact__success">
                <CheckCircle2 style={{ width: 48, height: 48, color: '#10B981' }} />
                <h3>Solicitação enviada com sucesso!</h3>
                <p>
                  Seus dados foram cadastrados com sucesso. Faça login com as credenciais administrativas para gerenciar a jornada de seus pacientes!
                </p>
                <button onClick={() => setFormSuccess(false)} className="landing-btn--primary landing-btn--lg">Enviar outra mensagem</button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleFormSubmit} className="landing-contact__form">
                <div className="landing-contact__form-row">
                  <div className="landing-contact__field">
                    <label>Nome Completo</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Dr(a). Seu Nome" />
                  </div>
                  <div className="landing-contact__field">
                    <label>E-mail Corporativo</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@clinica.com" />
                  </div>
                </div>
                <div className="landing-contact__form-row landing-contact__form-row--3">
                  <div className="landing-contact__field">
                    <label>Telefone (WhatsApp)</label>
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
                  </div>
                  <div className="landing-contact__field">
                    <label>Interesse Principal</label>
                    <select value={procedure} onChange={e => setProcedure(e.target.value)}>
                      <option value="Limpeza e Profilaxia">Clareamento e Estética</option>
                      <option value="Tratamento de Canal">Procedimentos Clínicos</option>
                      <option value="Implante Dentário">Implantes e Cirurgias</option>
                      <option value="Aparelho Ortodôntico (Manutenção)">Ortodontia</option>
                    </select>
                  </div>
                  <div className="landing-contact__field">
                    <label>Faturamento Médio</label>
                    <select value={budget} onChange={e => setBudget(e.target.value)}>
                      <option value="200">Até R$ 10.000,00</option>
                      <option value="1200">De R$ 10k a R$ 50k</option>
                      <option value="3500">Acima de R$ 50.000,00</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={formLoading} className="landing-btn--primary landing-btn--lg landing-btn--full">
                  {formLoading ? 'Processando...' : 'Agendar demonstração gratuita'}
                  <ArrowRight style={{ width: 18, height: 18 }} />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </AnimatedSection>
      </section>

      {/* ═══════════════ CTA FINAL ═══════════════ */}
      <section className="landing-cta-final">
        <AnimatedSection className="landing-cta-final__inner">
          <div className="landing-cta-final__bg-decor" />
          <BrandIcon variant="light" className="landing-cta-final__brand-icon" />
          <h2 className="landing-cta-final__title">
            Transforme a gestão da sua clínica hoje mesmo.
          </h2>
          <p className="landing-cta-final__subtitle">
            Automatize processos, reduza faltas e aumente seu faturamento.
          </p>
          <button onClick={onRegister} className="landing-cta-final__button">
            Teste Gratuitamente
            <ArrowRight style={{ width: 20, height: 20 }} />
          </button>
          <div className="landing-cta-final__trust">
            {[
              { icon: <DollarSign style={{ width: 16, height: 16 }} />, label: 'Sem cartão de crédito' },
              { icon: <Zap style={{ width: 16, height: 16 }} />, label: 'Instalação rápida' },
              { icon: <Headphones style={{ width: 16, height: 16 }} />, label: 'Suporte humanizado' },
              { icon: <Lock style={{ width: 16, height: 16 }} />, label: 'Segurança de dados' },
            ].map((b, i) => (
              <div key={i} className="landing-cta-final__trust-item">
                {b.icon}
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__top">
            {/* Logo + desc */}
            <div className="landing-footer__brand">
              <div className="landing-footer__brand-logo">
                <BrandLogo variant="light" />
              </div>
              <p className="landing-footer__brand-desc">
                O CRM inteligente para clínicas odontológicas modernas. Organize, automatize e cresça.
              </p>
              <div className="landing-footer__social">
                <a href="#" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" /></svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                <a href="#" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div className="landing-footer__links-group">
              <h4>Produto</h4>
              <a href="#recursos">Recursos</a>
              <a href="#funcionalidades">Funcionalidades</a>
              <a href="#integracoes">Integrações</a>
              <a href="#precos">Preços</a>
            </div>
            <div className="landing-footer__links-group">
              <h4>Empresa</h4>
              <a href="#">Sobre nós</a>
              <a href="#">Blog</a>
              <a href="#">Carreiras</a>
              <a href="#contato">Contato</a>
            </div>
            <div className="landing-footer__links-group">
              <h4>Legal</h4>
              <a href="#">Política de Privacidade</a>
              <a href="#">Termos de Uso</a>
              <a href="#">LGPD</a>
              <a href="#">Segurança</a>
            </div>
          </div>
          
          <div className="landing-footer__bottom">
            <span>© {new Date().getFullYear()} DentalFlow. Todos os direitos reservados.</span>
            <span>Feito com ❤️ para clínicas odontológicas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, Building2, Users, Phone, CheckCircle2, Sparkles, MapPin } from 'lucide-react';
import OnboardingProgress from './OnboardingProgress';
import Logo from '../Logo';

export default function OnboardingWizard({ initialClinic = {}, onComplete, onSaveClinicData }) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(1); // 1: Clínica, 2: Estrutura, 3: WhatsApp, 4: Pronto

  // Estados dos formulários
  const [clinicName, setClinicName] = useState(() => initialClinic?.name || '');
  const [cep, setCep] = useState(() => initialClinic?.address?.cep || '');
  const [cidade, setCidade] = useState(() => initialClinic?.address?.cidade || '');
  const [uf, setUf] = useState(() => initialClinic?.address?.uf || 'SP');
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const [chairs, setChairs] = useState('2'); // '1' | '2' | '3' | '4+'
  const [staffCount, setStaffCount] = useState('1-3'); // '1' | '1-3' | '4-8' | '9+'

  const [whatsapp, setWhatsapp] = useState(() => initialClinic?.phone || '');

  // Formatação automática do CEP
  const handleCepChange = async (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 8);
    let formatted = raw;
    if (raw.length > 5) {
      formatted = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    }
    setCep(formatted);

    if (raw.length === 8) {
      setIsLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (data.localidade) setCidade(data.localidade);
          if (data.uf) setUf(data.uf);
        }
      } catch (err) {
        console.warn('[OnboardingWizard] Erro ao buscar CEP viaViaCEP:', err);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  // Formatação automática do Celular/WhatsApp
  const handlePhoneChange = (val) => {
    const nums = val.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 2) {
      setWhatsapp(nums ? `(${nums}` : '');
      return;
    }
    if (nums.length <= 7) {
      setWhatsapp(`(${nums.slice(0, 2)}) ${nums.slice(2)}`);
      return;
    }
    setWhatsapp(`(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`);
  };

  const handleNextStep = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
      // Salvar progresso intermediário
      if (onSaveClinicData) {
        onSaveClinicData({
          name: clinicName,
          phone: whatsapp,
          chairs_count: chairs,
          staff_count: staffCount,
          address: { cep, cidade, uf }
        });
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleFinalSubmit = () => {
    if (onSaveClinicData) {
      onSaveClinicData({
        name: clinicName,
        phone: whatsapp,
        chairs_count: chairs,
        staff_count: staffCount,
        address: { cep, cidade, uf },
        onboarding_completed: true
      });
    }
    if (onComplete) {
      onComplete();
    }
  };

  // -------------------------------------------------------------
  // TELA DE BOAS-VINDAS (ANTES DE CLICAR EM COMEÇAR)
  // -------------------------------------------------------------
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-900 dark:bg-black text-white flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
        {/* Glow de Fundo Suave */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(25,107,251,0.15),transparent)] pointer-events-none" />

        <div className="w-full max-w-lg bg-[#0D0D0D] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10 text-center space-y-6">
          <div className="flex justify-center mb-2">
            <Logo collapsed={false} className="h-10 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-title text-white tracking-tight">
              Bem-vindo ao DentalFlow 👋
            </h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Vamos configurar sua clínica. Isso leva menos de 2 minutos.
            </p>
          </div>

          {/* Indicador Discreto 1 de 4 e Visão Geral dos Passos */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-left space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 border-b border-white/10 pb-2">
              <span>RESUMO DO SETUP</span>
              <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                1 de 4
              </span>
            </div>

            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Sua clínica (Nome e localização)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-white/10 text-slate-400 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Estrutura (Cadeiras e equipe)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-white/10 text-slate-400 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>WhatsApp da clínica</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-white/10 text-slate-400 flex items-center justify-center text-[10px] font-bold">4</span>
                <span>Pronto para usar</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full h-12 bg-[#196BFB] hover:bg-[#155bd8] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Começar configuração</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // WIZARD EM 4 PASSOS
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 dark:bg-black text-white flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(25,107,251,0.12),transparent)] pointer-events-none" />

      {/* Botão de Voltar */}
      {step > 1 && step < 4 && (
        <button
          onClick={handlePrevStep}
          className="absolute top-6 left-6 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
      )}

      <div className="w-full max-w-lg bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        
        {/* Progresso do Wizard */}
        <OnboardingProgress currentStep={step} totalSteps={4} />

        {/* ========================================================= */}
        {/* ETAPA 1: SUA CLÍNICA                                      */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-title text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>Sua clínica</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Informe o nome oficial e a localização para personalizarmos os documentos.
              </p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nome da clínica <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: OdontoArt Sorrisos"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full h-11 px-3.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    CEP
                  </label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    className="w-full h-11 px-3.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Cidade / UF
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: São Paulo"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full h-11 px-3.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="SP"
                      value={uf}
                      onChange={(e) => setUf(e.target.value.toUpperCase())}
                      className="w-14 h-11 px-2 text-center bg-black/40 border border-white/10 rounded-xl text-sm text-white uppercase font-bold focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              disabled={!clinicName.trim()}
              onClick={handleNextStep}
              className="w-full h-11 bg-[#196BFB] hover:bg-[#155bd8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* ETAPA 2: ESTRUTURA                                        */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-title text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Estrutura</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Ajudará a dimensionar a Agenda e as permissões de acesso.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Quantas cadeiras sua clínica possui?
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {['1', '2', '3', '4+'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setChairs(num)}
                      className={`h-12 rounded-xl font-bold text-sm transition-all border flex items-center justify-center cursor-pointer ${
                        chairs === num
                          ? 'bg-[#196BFB] border-blue-400 text-white shadow-md'
                          : 'bg-black/40 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {num} {num === '1' ? 'cadeira' : 'cadeiras'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Quantos profissionais atendem aqui?
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { id: '1', label: 'Apenas eu' },
                    { id: '1-3', label: '2 a 3' },
                    { id: '4-8', label: '4 a 8' },
                    { id: '9+', label: '9 ou +' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStaffCount(opt.id)}
                      className={`h-12 rounded-xl font-bold text-xs transition-all border flex items-center justify-center px-1 text-center cursor-pointer ${
                        staffCount === opt.id
                          ? 'bg-[#196BFB] border-blue-400 text-white shadow-md'
                          : 'bg-black/40 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full h-11 bg-[#196BFB] hover:bg-[#155bd8] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* ETAPA 3: WHATSAPP                                         */}
        {/* ========================================================= */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-title text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-400" />
                <span>Vamos conectar seu atendimento</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Usaremos este número para organizar seus atendimentos e automações.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                WhatsApp da clínica
              </label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={whatsapp}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full h-11 px-3.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Você poderá ativar o envio de lembretes automáticos mais tarde.
              </p>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full h-11 bg-[#196BFB] hover:bg-[#155bd8] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* ETAPA 4: PRONTO                                           */}
        {/* ========================================================= */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200 py-2">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold font-title text-white">
                Sua clínica está pronta. 🎉
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                Agora você já pode começar a cadastrar pacientes, organizar sua agenda e acompanhar seus atendimentos.
              </p>
            </div>

            <button
              onClick={handleFinalSubmit}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/25 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Entrar no DentalFlow</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

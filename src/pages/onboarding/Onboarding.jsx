import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, ChevronLeft, Check, Smartphone, Send, 
  Gift, HeartHandshake, MapPin, Building2, HelpCircle, 
  ShieldCheck, AlertCircle 
} from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const { user, clinic, updateClinic } = useAuth();
  const [step, setStep] = useState(1);

  // Estados dos inputs do onboarding
  const [clinicaNome, setClinicaNome] = useState('');
  const [endereco, setEndereco] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: 'SP'
  });
  const [cadeiras, setCadeiras] = useState('');
  const [funcao, setFuncao] = useState('');
  const [especialidades, setEspecialidades] = useState([]);
  const [dores, setDores] = useState([]);
  const [comoConheceu, setComoConheceu] = useState('');
  const [organizacao, setOrganizacao] = useState('');
  const [sistemaAnterior, setSistemaAnterior] = useState('');
  
  // WhatsApp Mockup State
  const [celular, setCelular] = useState(user?.phone || '');
  const [whatsappChat, setWhatsappChat] = useState([
    { id: 1, sender: 'bot', text: 'Enviando convite de confirmação...', typing: true }
  ]);
  const [chatStage, setChatStage] = useState('waiting_user'); // 'waiting_user' | 'user_responded' | 'bot_confirmed'
  const [showConfetti, setShowConfetti] = useState(false);

  const formatPhone = (val) => {
    const nums = val.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 2) return nums ? `(${nums}` : '';
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  // Buscar dados da clínica e usuário existente para pré-preencher
  useEffect(() => {
    if (clinic?.name) {
      Promise.resolve().then(() => {
        setClinicaNome(clinic.name);
      });
    }
    if (user?.phone) {
      setCelular(user.phone);
    }
  }, [clinic, user]);

  // Efeito de digitação e envio no WhatsApp Mockup
  useEffect(() => {
    if (step === 10) {
      // Mensagem inicial do bot
      const t1 = setTimeout(() => {
        setWhatsappChat([
          { 
            id: 1, 
            sender: 'bot', 
            text: `Olá ${user?.full_name?.split(' ')[0] || 'Doutor(a)'}! Sou a Sofia, inteligência artificial da ${clinicaNome || 'sua clínica'}. Confirmando sua consulta experimental de amanhã às 14:00. Responda SIM para confirmar.` 
          }
        ]);
      }, 1500);

      return () => clearTimeout(t1);
    }
  }, [step, clinicaNome, user]);

  // Função para buscar CEP
  const handleCepChange = async (e) => {
    const rawValue = e.target.value;
    const cepValue = rawValue.replace(/\D/g, '');
    setEndereco(prev => ({ ...prev, cep: rawValue }));

    if (cepValue.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setEndereco(prev => ({
            ...prev,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || 'SP'
          }));
        }
      } catch (err) {
        console.error('Falha ao buscar CEP:', err);
      }
    }
  };

  // Função para lidar com clique no botão de simulação de WhatsApp
  const handleSimulateResponse = () => {
    if (chatStage !== 'waiting_user') return;

    setChatStage('user_responded');
    // Adiciona resposta do usuário no mock do chat
    setWhatsappChat(prev => [
      ...prev,
      { id: 2, sender: 'user', text: 'SIM' }
    ]);

    // Bot responde confirmando a consulta
    setTimeout(() => {
      setWhatsappChat(prev => [
        ...prev,
        { id: 3, sender: 'bot', text: 'Excelente! Sua presença foi confirmada e o Dr. Carlos já foi notificado. Até amanhã!' }
      ]);
      setChatStage('bot_confirmed');
      setShowConfetti(true);

      // Avança de etapa automaticamente após 2.5s
      setTimeout(() => {
        setStep(11);
      }, 2500);
    }, 1200);
  };

  // Toggle de especialidade (seleção múltipla)
  const toggleEspecialidade = (esp) => {
    setEspecialidades(prev => 
      prev.includes(esp) ? prev.filter(e => e !== esp) : [...prev, esp]
    );
  };

  // Toggle de dores (seleção múltipla)
  const toggleDor = (dor) => {
    setDores(prev => 
      prev.includes(dor) ? prev.filter(d => d !== dor) : [...prev, dor]
    );
  };

  // Navegação do funil
  const nextStep = async () => {
    // Ações específicas de persistência em etapas importantes
    if (step === 2) {
      // Salvar os dados reais da clínica no Supabase
      if (clinicaNome.trim()) {
        try {
          await updateClinic({ 
            name: clinicaNome,
            logo_url: clinic?.logo_url || '🦷',
            address: {
              cep: endereco.cep,
              logradouro: endereco.logradouro,
              numero: endereco.numero,
              complemento: endereco.complemento,
              bairro: endereco.bairro,
              cidade: endereco.cidade,
              uf: endereco.uf
            }
          });
        } catch (err) {
          console.error('Erro ao atualizar dados da clínica no onboarding:', err);
        }
      }
    }

    // Condicional: Se não usava outro sistema no passo 8, pula a pergunta de sistema anterior (passo 9)
    if (step === 8) {
      if (organizacao !== 'Usava outro sistema') {
        setStep(10);
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    // Se voltar a partir da etapa 10 e não usava outro sistema, volta para a 8
    if (step === 10 && organizacao !== 'Usava outro sistema') {
      setStep(8);
      return;
    }
    setStep(prev => Math.max(1, prev - 1));
  };

  // Lista de especialidades (Print 6)
  const listaEspecialidades = [
    'Clínico geral', 'Ortodontia', 'Implantodontia', 'Endodontia',
    'Periodontia', 'Prótese', 'Dentística/Estética', 'Odontopediatria',
    'Cirurgia', 'Harmonização Orofacial', 'Radiologia', 'DTM/Dor Orofacial'
  ];

  // Lista de dores (Print 7)
  const listaDores = [
    'Falta de organização', 'Organizar agenda, faltas',
    'Processos manuais trabalhosos', 'Dificuldade em extrair relatórios para tomada de decisão',
    'Captação de pacientes'
  ];

  // Componentes auxiliares movidos para escopo de arquivo para evitar recriação no render (eslint: react-hooks/static-components)

  // Nome simplificado do usuário
  const userFirstName = user?.full_name?.split(' ')[0] || 'Doutor(a)';

  return (
    <div className="relative overflow-hidden min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-8 select-none">
      {/* Grade milimétrica estilizada de engenharia */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(59,130,246,0.06),rgba(255,255,255,0))] pointer-events-none" />

      {/* Botão de Voltar */}
      {step > 1 && step < 11 && (
        <button
          onClick={prevStep}
          className="absolute top-6 left-6 px-4 py-2 border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-700 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-md flex items-center gap-1.5 z-30"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </button>
      )}

      {/* Área Central Animada */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-2xl text-center flex flex-col items-center z-10"
        >
          {/* Bolha de IA no topo */}
          {step < 11 && <AiBlob />}

          {/* ============================================== */}
          {/* PASSO 1: Nome da Clínica                       */}
          {/* ============================================== */}
          {step === 1 && (
            <div className="space-y-6 w-full max-w-md">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-title leading-tight">
                Qual é o nome da sua clínica ou consultório, {userFirstName}?
              </h2>
              <div className="relative">
                <Building2 className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Nome da clínica ou consultório"
                  value={clinicaNome}
                  onChange={(e) => setClinicaNome(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  autoFocus
                />
              </div>
              <button
                onClick={nextStep}
                disabled={!clinicaNome.trim()}
                className="w-full md:w-auto px-8 py-3 rounded-2xl font-bold text-sm text-white bg-blue-600 disabled:opacity-40 transition-all hover:bg-blue-700 active:scale-95 shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
              >
                Avançar
              </button>
            </div>
          )}

          {/* ============================================== */}
          {/* PASSO 2: Endereço da Clínica                   */}
          {/* ============================================== */}
          {step === 2 && (
            <div className="space-y-6 w-full max-w-lg">
              <h2 className="text-2xl font-extrabold text-slate-900 font-title leading-tight">
                E qual o endereço de <span className="text-blue-600">{clinicaNome}</span>?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CEP</label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={endereco.cep}
                    onChange={handleCepChange}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Endereço</label>
                  <input
                    type="text"
                    placeholder="Rua, avenida..."
                    value={endereco.logradouro}
                    onChange={(e) => setEndereco({ ...endereco, logradouro: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Número</label>
                  <input
                    type="text"
                    placeholder="Número"
                    value={endereco.numero}
                    onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Complemento</label>
                  <input
                    type="text"
                    placeholder="Sala, bloco..."
                    value={endereco.complemento}
                    onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bairro</label>
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={endereco.bairro}
                    onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cidade</label>
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={endereco.cidade}
                    onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estado</label>
                  <select
                    value={endereco.uf}
                    onChange={(e) => setEndereco({ ...endereco, uf: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={nextStep}
                disabled={!endereco.logradouro.trim() || !endereco.cidade.trim()}
                className="px-8 py-3 rounded-2xl font-bold text-sm text-white bg-blue-600 disabled:opacity-40 transition-all hover:bg-blue-700 active:scale-95 shadow-[0_4px_12px_rgba(59,130,246,0.3)] mt-2"
              >
                Continuar
              </button>
            </div>
          )}

          {/* ============================================== */}
          {/* PASSO 3: Cadeiras                              */}
          {/* ============================================== */}
          {step === 3 && (
            <div className="space-y-6 w-full max-w-md">
              <h2 className="text-2xl font-extrabold text-slate-900 font-title leading-tight">
                Quantas cadeiras sua clínica possui?
              </h2>
              <p className="text-xs text-slate-400">Posso deixar todas prontas para você agora. (opcional)</p>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                {['1', '2', '3', '4', '+ 4'].map((opcao) => {
                  const isSelected = cadeiras === opcao;
                  return (
                    <button
                      key={opcao}
                      onClick={() => setCadeiras(opcao)}
                      className={`py-3 rounded-xl border font-bold text-xs text-center transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opcao}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={nextStep}
                  className="px-8 py-3 rounded-2xl font-bold text-sm text-white bg-blue-600 transition-all hover:bg-blue-700 active:scale-95 shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* PASSO 4: Função/Atuação na clínica            */}
          {/* ============================================== */}
          {step === 4 && (
            <div className="space-y-6 w-full max-w-md">
              <h2 className="text-2xl font-extrabold text-slate-900 font-title leading-tight">
                Qual sua função/atuação na clínica?
              </h2>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                {['Dentista', 'Secretária(o)', 'Administrador', 'Outro'].map((opcao) => {
                  const isSelected = funcao === opcao;
                  return (
                    <button
                      key={opcao}
                      onClick={() => setFuncao(opcao)}
                      className={`py-3.5 rounded-xl border font-bold text-xs text-center transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opcao}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={nextStep}
                  disabled={!funcao}
                  className="px-8 py-3 rounded-2xl font-bold text-sm text-white bg-blue-600 disabled:opacity-40 transition-all hover:bg-blue-700 active:scale-95 shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                >
                  Avançar
                </button>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* PASSO 5: Especialidade Clínicas                */}
          {/* ============================================== */}
          {step === 5 && (
            <div className="space-y-6 w-full max-w-lg">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 font-title leading-tight">
                  Para deixar o DentalFlow preparado para você, me conta:
                </h2>
                <h3 className="text-base font-bold text-slate-750 font-title mt-1.5">
                  Qual sua especialidade dentro da odontologia?
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Selecione quantos quiser.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 w-full text-left">
                {listaEspecialidades.map((esp) => {
                  const isSelected = especialidades.includes(esp);
                  return (
                    <button
                      key={esp}
                      onClick={() => toggleEspecialidade(esp)}
                      className={`p-2.5 rounded-xl border text-[10px] font-bold text-left transition-all flex items-center justify-between group ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-inner' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>{esp}</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-transparent group-hover:border-slate-400'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={nextStep}
                  className="px-8 py-3 rounded-2xl font-bold text-sm text-white bg-blue-600 transition-all hover:bg-blue-700 active:scale-95 shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* PASSO 6: Dores Principais                      */}
          {/* ============================================== */}
          {step === 6 && (
            <div className="space-y-6 w-full max-w-lg">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 font-title leading-tight">
                  Para que eu possa te ajudar.
                </h2>
                <h3 className="text-base font-bold text-slate-750 font-title mt-1.5">
                  Quais são as principais dores que você espera resolver com o DentalFlow?
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Selecione quantos quiser.</p>
              </div>

              <div className="space-y-2 w-full text-left">
                {listaDores.map((dor) => {
                  const isSelected = dores.includes(dor);
                  return (
                    <button
                      key={dor}
                      onClick={() => toggleDor(dor)}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between group ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-inner' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>{dor}</span>
                      <span className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-transparent group-hover:border-slate-400'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={nextStep}
                  className="px-8 py-3 rounded-2xl font-bold text-sm text-white bg-blue-600 transition-all hover:bg-blue-700 active:scale-95 shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* PASSO 7: Canal de Aquisição                    */}
          {/* ============================================== */}
          {step === 7 && (
            <div className="space-y-6 w-full max-w-md">
              <h2 className="text-2xl font-extrabold text-slate-900 font-title leading-tight">
                Agora me conta: como você conheceu o DentalFlow?
              </h2>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                {['Google', 'Instagram', 'Indicação de outro dentista', 'YouTube', 'Evento ou congresso', 'Outro'].map((opcao) => {
                  const isSelected = comoConheceu === opcao;
                  return (
                    <button
                      key={opcao}
                      onClick={() => setComoConheceu(opcao)}
                      className={`py-3.5 px-2 rounded-xl border font-bold text-xs text-center transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opcao}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={nextStep}
                  disabled={!comoConheceu}
                  className="px-8 py-3 rounded-2xl font-bold text-sm text-white bg-blue-600 disabled:opacity-40 transition-all hover:bg-blue-700 active:scale-95 shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* PASSO 8: Organização Atual                     */}
          {/* ============================================== */}
          {step === 8 && (
            <div className="space-y-6 w-full max-w-md">
              <h2 className="text-2xl font-extrabold text-slate-900 font-title leading-tight">
                Agora preciso saber como sua clínica é organizada hoje:
              </h2>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                {[
                  { value: 'Usava outro sistema', label: 'Usava outro sistema' },
                  { value: 'Planilhas', label: 'Planilhas' },
                  { value: 'Papel e caneta', label: 'Papel e caneta' },
                  { value: 'Começando agora', label: 'Começando agora' }
                ].map((opcao) => {
                  const isSelected = organizacao === opcao.value;
                  return (
                    <button
                      key={opcao.value}
                      onClick={() => setOrganizacao(opcao.value)}
                      className={`py-3.5 px-2 rounded-xl border font-bold text-xs text-center transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opcao.label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={nextStep}
                  disabled={!organizacao}
                  className="px-8 py-3 rounded-2xl font-bold text-sm text-white bg-blue-600 disabled:opacity-40 transition-all hover:bg-blue-700 active:scale-95 shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* PASSO 9: Sistema Anterior (Condicional)        */}
          {/* ============================================== */}
          {step === 9 && (
            <div className="space-y-6 w-full max-w-lg">
              <h2 className="text-2xl font-extrabold text-slate-900 font-title leading-tight">
                Ótimo! E qual era o sistema que você utilizava?
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
                {['Simples Dental', 'Clinicorp', 'Capim', 'Dental Office', 'Controle Odonto', 'Easy Dental', 'Outro'].map((opcao) => {
                  const isSelected = sistemaAnterior === opcao;
                  return (
                    <button
                      key={opcao}
                      onClick={() => setSistemaAnterior(opcao)}
                      className={`py-3 rounded-xl border font-bold text-xs text-center transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opcao}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={nextStep}
                  disabled={!sistemaAnterior}
                  className="px-8 py-3 rounded-2xl font-bold text-sm text-white bg-blue-600 disabled:opacity-40 transition-all hover:bg-blue-700 active:scale-95 shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* PASSO 10: Teste do WhatsApp                   */}
          {/* ============================================== */}
          {step === 10 && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-2xl px-2 relative">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 font-title leading-tight">
                  {userFirstName}, acabei de enviar uma mensagem via WhatsApp no número{' '}
                  <input
                    type="tel"
                    value={celular}
                    onChange={(e) => setCelular(formatPhone(e.target.value))}
                    placeholder="(88) 99969-9232"
                    className="inline-block bg-blue-50 border border-blue-200 text-blue-700 font-black px-2.5 py-0.5 rounded-xl text-lg md:text-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 shadow-sm"
                  />{' '}
                  para você ver como o paciente confirma a consulta no DentalFlow.
                </h2>
                <p className="text-xs font-bold text-slate-750 font-title">
                  Pode responder?
                </p>
                <div className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Esperando você responder a mensagem enviada via WhatsApp. Ao responder (enviando SIM), vamos passar à próxima etapa automaticamente.
                </div>
                
                {/* Botão extra para simulação assistida */}
                {chatStage === 'waiting_user' && (
                  <button
                    onClick={handleSimulateResponse}
                    className="mx-auto md:mx-0 flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-[0_4px_10px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:scale-95"
                  >
                    <Smartphone className="w-4 h-4" />
                    Simular Resposta (Enviar SIM)
                  </button>
                )}
                
                {chatStage === 'user_responded' && (
                  <div className="text-xs font-bold text-amber-500 flex items-center gap-1.5 justify-center md:justify-start">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Robô digitando resposta...
                  </div>
                )}

                {chatStage === 'bot_confirmed' && (
                  <div className="text-xs font-bold text-green-600 flex items-center gap-1.5 justify-center md:justify-start">
                    <ShieldCheck className="w-5 h-5 animate-bounce" />
                    Consulta confirmada com sucesso!
                  </div>
                )}
              </div>
              
              <div className="flex-shrink-0 relative">
                <SmartphoneMockup whatsappChat={whatsappChat} chatStage={chatStage} handleSimulateResponse={handleSimulateResponse} />
                {showConfetti && (
                  <div className="absolute inset-0 bg-green-500/10 pointer-events-none rounded-[36px] flex items-center justify-center animate-ping">
                    <Sparkles className="w-12 h-12 text-green-500" />
                  </div>
                )}
              </div>

              {/* Botão de Pular */}
              <div className="w-full flex justify-center md:absolute md:-bottom-12 md:right-0">
                <button
                  onClick={() => setStep(11)}
                  className="w-full md:w-auto px-5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all mt-4 md:mt-0"
                >
                  Não quero testar
                </button>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* PASSO 11: Tela Final (Boas-Vindas)            */}
          {/* ============================================== */}
          {step === 11 && (
            <div className="space-y-6 w-full max-w-lg text-center">
              {/* Confete visual da IA */}
              <div className="relative w-24 h-24 flex items-center justify-center mx-auto mb-2">
                <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-400 to-emerald-500 shadow-[0_8px_30px_rgba(16,185,129,0.25)] flex items-center justify-center text-white"
                >
                  <Check className="w-8 h-8 stroke-[3]" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest font-title">
                  Onboarding Concluído
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 font-title">
                  Tudo pronto, {userFirstName}!
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  A <span className="font-extrabold text-blue-600">{clinicaNome || 'sua clínica'}</span> está preparada para o futuro. Que comece uma nova fase de sucesso
                </p>
              </div>

              {/* Cards de Presente (Print 12) */}
              <div className="space-y-3 w-full text-left pt-2">
                {/* Presente de Boas-Vindas */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start gap-4 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/50 flex items-center justify-center text-emerald-500 flex-shrink-0 shadow-sm animate-pulse">
                    <Gift className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[9px] uppercase tracking-wider">
                      Presente de Boas-Vindas
                    </span>
                    <h4 className="text-xs font-black text-slate-800 font-title">
                      100 créditos de confirmação de consulta
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Basta adicionar o telefone do paciente no cadastro, nós cuidamos do resto enviando mensagens automáticas de confirmação.
                    </p>
                  </div>
                </div>

                {/* Suporte Humano */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start gap-4 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/50 flex items-center justify-center text-blue-500 flex-shrink-0 shadow-sm">
                    <HeartHandshake className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-800 font-title">
                      Gente de verdade pra te ajudar
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Nosso suporte responde rápido por chat e telefone, de segunda a sexta das 7h às 22h, e aos sábados das 9h às 13h.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onComplete}
                  className="w-full md:w-auto px-10 py-3.5 rounded-2xl font-black text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-[0_4px_15px_rgba(59,130,246,0.35)]"
                >
                  Entrar no DentalFlow
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Componentes estáticos fora do render do componente pai (Onboarding)
function AiBlob() {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center mb-6">
      {/* Glow de fundo */}
      <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
      
      {/* Blob em movimento */}
      <motion.div
        animate={{
          borderRadius: [
            "42% 58% 70% 30% / 45% 45% 55% 55%",
            "70% 30% 52% 48% / 60% 40% 60% 40%",
            "50% 50% 35% 65% / 40% 60% 40% 60%",
            "42% 58% 70% 30% / 45% 45% 55% 55%"
          ],
          rotate: [0, 120, 240, 360],
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="w-20 h-20 bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 shadow-[0_8px_30px_rgba(99,102,241,0.25)] border border-white/20"
      />
      {/* Reflexo sutil de vidro para efeito 3D / Depth */}
      <div className="absolute w-20 h-20 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
    </div>
  );
}

function SmartphoneMockup({ whatsappChat, chatStage, handleSimulateResponse }) {
  return (
    <div className="border-[8px] border-slate-900 bg-slate-100 shadow-2xl rounded-[36px] w-72 h-[410px] overflow-hidden flex flex-col relative font-sans text-left">
      {/* Notch do Celular */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-28 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center">
        <div className="w-10 h-1 bg-slate-800 rounded-full mb-1" />
      </div>
      
      {/* Cabeçalho do Chat */}
      <div className="bg-[#0b141a] text-white pt-5 pb-2.5 px-3 flex items-center gap-2 border-b border-white/5 relative z-10">
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
          DF
        </div>
        <div>
          <div className="font-bold text-[10px] flex items-center gap-1">
            DentalFlow Bot
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
          </div>
          <div className="text-[8px] text-green-400 font-medium">online</div>
        </div>
      </div>

      {/* Corpo de mensagens */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[#0b141a] flex flex-col justify-end">
        {whatsappChat.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`max-w-[85%] p-2 rounded-2xl text-[10px] leading-relaxed shadow-sm ${
              msg.sender === 'bot' 
                ? 'bg-[#202c33] text-slate-100 self-start rounded-tl-none' 
                : 'bg-[#005c4b] text-white self-end rounded-tr-none'
            }`}
          >
            {msg.typing ? (
              <div className="flex gap-1 py-1 px-2 items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              msg.text
            )}
          </motion.div>
        ))}
      </div>

      {/* Input/Rodapé do Chat */}
      <div className="p-2 bg-[#1f2c34] flex gap-2 items-center border-t border-white/5">
        <div className="flex-1 bg-[#2a3942] rounded-full py-1.5 px-3 text-[9px] text-slate-400">
          {chatStage === 'waiting_user' ? 'Responda SIM...' : 'Mensagem enviada'}
        </div>
        <button 
          onClick={handleSimulateResponse}
          disabled={chatStage !== 'waiting_user'}
          className="w-7 h-7 rounded-full bg-[#00a884] disabled:opacity-40 flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

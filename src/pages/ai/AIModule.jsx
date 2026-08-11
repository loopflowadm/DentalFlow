import { useState, useEffect, useRef } from 'react';
import { useClinic, DEFAULT_DENTAL_AI_PROMPT, expandAiPrompt } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import VisualFlowBuilder from './flow-builder/VisualFlowBuilder';
import FlowInspectorModal from './flow-builder/FlowInspectorModal';
import { 
  Bot, Send, ShieldAlert, Sparkles, Sliders, BookOpen, 
  Clock, Plus, Trash2, CheckCircle2, User, HelpCircle, AlertTriangle,
  RotateCcw, Eye, X, MessageSquare, Tag, Zap, Check, ChevronRight, ChevronLeft, Play,
  ChevronDown, ChevronUp, Building2, Stethoscope, Copy
} from 'lucide-react';

function formatAddressString(addr) {
  if (!addr) return 'Av. Epitácio Pessoa, 1000 - João Pessoa / PB';
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object' && addr !== null) {
    const parts = [
      addr.logradouro,
      addr.numero ? `nº ${addr.numero}` : '',
      addr.bairro,
      addr.cidade ? (addr.uf ? `${addr.cidade}/${addr.uf}` : addr.cidade) : ''
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  return String(addr);
}

function safeString(val, fallback = '') {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return formatAddressString(val);
  return String(val);
}

function HighlightedPromptEditor({ value, onChange, isDarkMode, rows = 14, placeholder }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={onChange}
      spellCheck={false}
      placeholder={placeholder}
      className={`w-full p-4 border rounded-2xl leading-relaxed whitespace-pre-wrap font-mono text-xs focus:outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 transition-all scrollbar-thin ${
        isDarkMode 
          ? 'bg-[#080d11] border-[#1f2c34] text-slate-100 placeholder-slate-500' 
          : 'bg-[#f8f9fa] border-slate-200 text-slate-900 placeholder-slate-400'
      }`}
    />
  );
}

export default function AIModule({ onClose }) {
  const { 
    aiConfig, 
    saveAiConfig, 
    procedures, 
    insurancePlans, 
    dentists,
    addAppointment 
  } = useClinic();
  const { currentTheme, themeMode } = useTheme();
  const { clinic } = useAuth();

  // Detecção e observador do tema Claro / Escuro da aplicação
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const updateDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    updateDarkMode();

    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [themeMode]);

  // Abas do Módulo de Automação WhatsApp: 'flow_builder' | 'simulator' | 'faq' | 'prompt'
  const [activeTab, setActiveTab] = useState('flow_builder');

  // Integração de IA Opcional (Provedor + API Key)
  const [aiProvider, setAiProvider] = useState(aiConfig?.aiProvider || 'openai');
  const [apiKey, setApiKey] = useState(aiConfig?.apiKey || '');

  // Variáveis Dinâmicas da Clínica (Garantindo que são SEMPRE Strings puras)
  const [varClinicName, setVarClinicName] = useState(() => safeString(clinic?.name || clinic?.clinic_name, 'DentalFlow Odontologia'));
  const [varAddress, setVarAddress] = useState(() => formatAddressString(clinic?.address));
  const [varPhone, setVarPhone] = useState(() => safeString(clinic?.phone || clinic?.telefone, '(83) 99999-9999'));
  const [varHours, setVarHours] = useState(() => safeString(clinic?.operating_hours || clinic?.horario_funcionamento, 'Segunda a Sexta, das 08h00 às 18h00 | Sábado das 08h00 às 12h00'));

  // Variáveis Editáveis para Corpo Clínico, Procedimentos, Convênios e Regras
  const [varDentistsText, setVarDentistsText] = useState(() => {
    if (dentists && dentists.length > 0) {
      return dentists.map(d => `• ${d.full_name || d.name} (${d.specialty || 'Dentista Clínico'})`).join('\n');
    }
    return '• Dr. Lucas Ferreira (Ortodontia & Implantes)\n• Dra. Juliana Martins (Estética Dental)';
  });

  const [varProceduresText, setVarProceduresText] = useState(() => {
    if (procedures && procedures.length > 0) {
      return procedures.map(p => `• ${p.name}: R$ ${Number(p.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${p.category || 'Odontologia Generalista'})`).join('\n');
    }
    return '• Clareamento Dental a Laser — R$ 800,00\n• Limpeza & Profilaxia Completa — R$ 250,00\n• Restauração Estética em Resina — R$ 180,00';
  });

  const [varInsuranceText, setVarInsuranceText] = useState(() => {
    if (insurancePlans && insurancePlans.length > 0) {
      return insurancePlans.map(i => `• ${i.name || i}`).join('\n');
    }
    return '• Amil Dental, Unimed Odonto, Bradesco Dental, SulAmérica';
  });

  const [varRulesText, setVarRulesText] = useState(
    '1. Responda com clareza, simpatia e tom direto. Evite textos longos ou robotizados.\n' +
    '2. Para agendamentos, ofereça 2 opções de horários e confirme os dados do paciente.\n' +
    '3. Informe apenas os procedimentos e valores descritos acima. Se não souber, confirme com a recepção.\n' +
    '4. Em caso de dor forte, urgência ou solicitação de atendimento humano, passe o atendimento para a recepção imediatamente.'
  );

  // Configurações Gerais do Agente
  const [personality, setPersonality] = useState(aiConfig?.personality || 'sofia_assistente');
  const [operatingHoursMode, setOperatingHoursMode] = useState(aiConfig?.operatingHours || '24h');
  const [isActive, setIsActive] = useState(aiConfig?.isActive !== undefined ? aiConfig.isActive : true);
  const [autoSilence, setAutoSilence] = useState(aiConfig?.autoSilence !== undefined ? aiConfig.autoSilence : true);
  const [kb, setKb] = useState(aiConfig?.knowledgeBase || [
    { id: 'kb-1', question: 'O clareamento dental dói?', answer: 'O clareamento dental moderno utiliza géis dessensibilizantes de última geração que minimizam o desconforto.' },
    { id: 'kb-2', question: 'Quais as formas de pagamento aceitas?', answer: 'Aceitamos PIX com desconto, cartões de crédito em até 12x e convênios parceiros.' }
  ]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState('persona'); // 'persona' | 'clinic_data' | 'crm_data' | 'rules'
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Prompt Mestre inicial preenchido diretamente com os dados coletados nas chaves
  const [prompt, setPrompt] = useState(() => {
    if (aiConfig?.prompt && !aiConfig.prompt.includes('{NOME_CLINICA}')) {
      return aiConfig.prompt;
    }
    const initialName = safeString(clinic?.name || clinic?.clinic_name, 'DentalFlow Odontologia');
    const initialAddr = formatAddressString(clinic?.address);
    const initialPhone = safeString(clinic?.phone || clinic?.telefone, '(83) 99999-9999');
    const initialHours = safeString(clinic?.operating_hours || clinic?.horario_funcionamento, 'Segunda a Sexta, das 08h00 às 18h00 | Sábado das 08h00 às 12h00');
    
    const initialDentists = (dentists && dentists.length > 0)
      ? dentists.map(d => `• ${d.full_name || d.name} (${d.specialty || 'Dentista Clínico'})`).join('\n')
      : '• Dr. Lucas Ferreira (Ortodontia & Implantes)\n• Dra. Juliana Martins (Estética Dental)';

    const initialProcedures = (procedures && procedures.length > 0)
      ? procedures.map(p => `• ${p.name}: R$ ${Number(p.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${p.category || 'Odontologia Generalista'})`).join('\n')
      : '• Clareamento Dental a Laser — R$ 800,00\n• Limpeza & Profilaxia Completa — R$ 250,00\n• Restauração Estética em Resina — R$ 180,00';

    const initialInsurance = (insurancePlans && insurancePlans.length > 0)
      ? insurancePlans.map(i => `• ${i.name || i}`).join('\n')
      : '• Amil Dental, Unimed Odonto, Bradesco Dental, SulAmérica';

    return DEFAULT_DENTAL_AI_PROMPT
      .replace(/\{NOME_CLINICA\}/g, `{${initialName}}`)
      .replace(/\{ENDERECO_COMPLETO\}/g, `{${initialAddr}}`)
      .replace(/\{TELEFONE_CONTATO\}/g, `{${initialPhone}}`)
      .replace(/\{HORARIO_FUNCIONAMENTO\}/g, `{${initialHours}}`)
      .replace(/\{LISTA_DENTISTAS\}/g, `{${initialDentists}}`)
      .replace(/\{LISTA_PROCEDIMENTOS\}/g, `{${initialProcedures}}`)
      .replace(/\{CONVENIOS_ACEITOS\}/g, `{${initialInsurance}}`);
  });

  // Form de FAQ
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // States do Simulator Chat
  const [simMessages, setSimMessages] = useState([
    { sender: 'BOT', text: `Olá! Sou a Sofia, assistente virtual da clínica ${clinic?.name || 'DentalFlow'}. Como posso ajudar?`, time: '10:00' }
  ]);
  const [simInput, setSimInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState({
    intent: 'Boas-vindas',
    confidence: '100%',
    action: 'Iniciar atendimento e propor suporte.'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveConfigs = async () => {
    setIsSaving(true);
    try {
      await saveAiConfig({
        prompt,
        personality,
        operatingHours: operatingHoursMode,
        isActive,
        autoSilence,
        knowledgeBase: kb,
        aiProvider,
        apiKey
      });
      alert('Configurações da automação salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaultPrompt = () => {
    if (window.confirm('Restaurar o prompt padrão da Sofia IA com os dados da clínica?')) {
      const restoredFilled = DEFAULT_DENTAL_AI_PROMPT
        .replace(/\{NOME_CLINICA\}/g, `{${varClinicName}}`)
        .replace(/\{ENDERECO_COMPLETO\}/g, `{${varAddress}}`)
        .replace(/\{TELEFONE_CONTATO\}/g, `{${varPhone}}`)
        .replace(/\{HORARIO_FUNCIONAMENTO\}/g, `{${varHours}}`)
        .replace(/\{LISTA_DENTISTAS\}/g, `{${varDentistsText}}`)
        .replace(/\{LISTA_PROCEDIMENTOS\}/g, `{${varProceduresText}}`)
        .replace(/\{CONVENIOS_ACEITOS\}/g, `{${varInsuranceText}}`);
      setPrompt(restoredFilled);
    }
  };

  const handleCopyPrompt = () => {
    const textToCopy = expandAiPrompt(prompt, {
      clinic: {
        name: varClinicName,
        address: varAddress,
        phone: varPhone,
        operating_hours: varHours
      },
      dentists: varDentistsText,
      procedures: varProceduresText,
      insurancePlans: varInsuranceText
    });
    navigator.clipboard.writeText(textToCopy);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleInsertTag = (tag) => {
    setPrompt(prev => prev + ` ${tag}`);
  };

  const handleAddKb = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const newEntry = {
      id: 'kb-' + Math.random().toString(36).substr(2, 9),
      question: newQuestion.trim(),
      answer: newAnswer.trim()
    };
    setKb([...kb, newEntry]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleRemoveKb = (id) => {
    setKb(kb.filter(item => item.id !== id));
  };

  // Simular Respostas da IA e Detecção de Intenções no Chat Interno
  const handleSimSend = (e, customText = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const queryText = customText || simInput;
    if (!queryText.trim()) return;

    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      sender: 'USER',
      text: queryText,
      time: timeStr
    };

    setSimMessages(prev => [...prev, userMsg]);
    if (!customText) setSimInput('');
    setIsTyping(true);

    setTimeout(() => {
      let responseText;
      let intent = 'Dúvida Geral';
      let confidence = '92%';
      let action;
      let activeNode;
      let options = null;

      const lower = queryText.toLowerCase();

      // Busca na Base de Conhecimento
      const kbMatch = kb.find(item => 
        lower.includes(item.question.toLowerCase().slice(0, 15)) || 
        item.question.toLowerCase().split(' ').some(w => w.length > 4 && lower.includes(w))
      );

      // 1. Confirmação de Agendamento (Resolução Real)
      if (lower.includes('confirmar amanhã') || lower.includes('confirmar sexta') || (lower.includes('confirmar') && (lower.includes('14:30') || lower.includes('10:00')))) {
        intent = 'Confirmação de Agendamento';
        confidence = '100%';
        const slotName = lower.includes('sexta') ? 'Sexta-feira às 10:00 (Dra. Juliana)' : 'Amanhã às 14:30 (Dr. Lucas)';
        
        // Criar agendamento real na Agenda do CRM
        try {
          if (addAppointment) {
            const today = new Date();
            const targetDate = new Date(today);
            if (lower.includes('sexta')) {
              targetDate.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
            } else {
              targetDate.setDate(today.getDate() + 1);
            }
            const dateStr = targetDate.toISOString().split('T')[0];
            const timeStr = lower.includes('sexta') ? '10:00' : '14:30';

            addAppointment({
              patientName: 'Paciente WhatsApp (Teste)',
              patientPhone: '(83) 99988-7766',
              procedureName: 'Avaliação Inicial',
              date: dateStr,
              time: timeStr,
              doctorId: dentists?.[0]?.id || null,
              status: 'CONFIRMED',
              observations: 'Agendado automaticamente pelo Simulador da Sofia IA'
            });
          }
        } catch (e) {
          console.warn('Erro ao inserir agendamento simulado:', e);
        }

        responseText = `✅ Consulta agendada e confirmada com sucesso!\n\n📅 Horário: ${slotName}\n📍 Clínica: ${clinic?.name || 'OdontoFace'}\n👤 Paciente: Paciente WhatsApp (Teste)\n\nO agendamento já foi inserido automaticamente na Agenda do seu CRM! Se precisar alterar ou cancelar, mande uma mensagem a qualquer momento.`;
        action = 'Novo agendamento confirmado e gravado na tabela de agendamentos do CRM.';
        activeNode = 'Agendamento Confirmado';
        options = ['Ver endereço da clínica', 'Falar com recepção', 'Voltar ao início'];
      } 
      // 2. Busca na Base de Conhecimento FAQ
      else if (kbMatch) {
        intent = 'Base FAQ';
        confidence = '98%';
        responseText = kbMatch.answer;
        action = `Resposta automática da Base FAQ (ID: ${kbMatch.id})`;
        activeNode = 'FAQ Match Node';
      } 
      // 3. Solicitação de Agendamento (Seleção de Horário)
      else if (lower.includes('agendar') || lower.includes('marcar') || lower.includes('consulta') || lower.includes('horario') || lower.includes('1.')) {
        intent = 'Agendamento de Consulta';
        confidence = '99%';
        responseText = `Perfeito! Tenho horários livres na agenda da clínica ${clinic?.name || 'DentalFlow'}:\n\n1. Amanhã às 14:30 (Dr. Lucas)\n2. Sexta-feira às 10:00 (Dra. Juliana)\n\nQual desses horários prefere para a sua consulta?`;
        action = 'Oferecer horários disponíveis e aguardar confirmação.';
        activeNode = 'Agenda Node';
        options = ['Confirmar amanhã 14:30', 'Confirmar sexta 10:00', 'Ver outros horários'];
      } 
      // 4. Consulta de Preços e Valores
      else if (lower.includes('preco') || lower.includes('valor') || lower.includes('quanto custa') || lower.includes('2.') || lower.includes('tabela')) {
        intent = 'Consulta de Valores & Tratamentos';
        confidence = '96%';
        const pStr = procedures.length > 0 ? procedures.slice(0, 3).map(p => `• ${p.name}: R$ ${p.price}`).join('\n') : '• Limpeza & Profilaxia: R$ 250,00\n• Clareamento a Laser: R$ 800,00';
        responseText = `Nossos procedimentos principais na ${clinic?.name || 'nossa clínica'}:\n\n${pStr}\n\nAceitamos cartões em até 12x e convênios parceiros. Deseja agendar uma avaliação?`;
        action = 'Apresentar tabela de procedimentos e convidar p/ avaliação.';
        activeNode = 'Preços & Tratamentos';
        options = ['Quero agendar avaliação', 'Ver convênios aceitos', 'Falar com recepção'];
      } 
      // 5. Endereço e Localização
      else if (lower.includes('endereco') || lower.includes('localizacao') || lower.includes('onde fica') || lower.includes('3.')) {
        intent = 'Endereço & Localização';
        confidence = '97%';
        responseText = `Nossa clínica fica em:\n📍 ${formatAddressString(clinic?.address)}\n📞 Contato: ${clinic?.phone || '(83) 99999-9999'}\n⏰ Expediente: ${clinic?.operating_hours || 'Segunda a Sexta das 08h às 18h'}`;
        action = 'Informar localização e horário de funcionamento.';
        activeNode = 'Endereço Node';
        options = ['Agendar consulta', 'Falar com recepção'];
      } 
      // 6. Urgência / Dor Forte
      else if (lower.includes('urgencia') || lower.includes('dor') || lower.includes('socorro') || lower.includes('4.')) {
        intent = 'Urgência / Dor Forte';
        confidence = '100%';
        responseText = '🚨 Entendo que está com dor/urgência! Notifiquei imediatamente nossa recepção. Um atendente humano vai assumir este chat agora mesmo!';
        action = 'Silenciar robô (AutoSilence) e emitir alerta de dor forte p/ recepção.';
        activeNode = 'Transferência Humana (Urgência)';
      } 
      // 7. Falar com Humano
      else if (lower.includes('humano') || lower.includes('atendente') || lower.includes('pessoa') || lower.includes('recepcao') || lower.includes('5.')) {
        intent = 'Transição Humana';
        confidence = '100%';
        responseText = 'Transferindo seu atendimento para a recepção presencial da clínica. Por favor, aguarde um momento!';
        action = 'Silenciar IA e criar atendimento pendente no painel.';
        activeNode = 'Handoff Node';
      } 
      // 8. Resposta Padrão / Reexibição do Menu Principal (Modo Automação Pura)
      else {
        responseText = `Sou o assistente virtual da clínica ${clinic?.name || 'OdontoFace'}. Para que eu possa te ajudar da melhor forma, por favor escolha uma das opções do menu abaixo:`;
        action = 'Texto livre não reconhecido em modo automação: reexibindo o Menu Principal.';
        activeNode = 'Menu Principal (Fallback)';
        options = ['1. Agendar ou remarcar consulta', '2. Tabela de procedimentos e valores', '3. Endereço e horários', '4. Urgência ou dor forte', '5. Falar com a recepção'];
      }

      const botMsg = {
        sender: 'BOT',
        text: responseText,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        options: options
      };

      setSimMessages(prev => [...prev, botMsg]);
      setAiAnalysis({ intent, confidence, action, activeNode });
      setIsTyping(false);
    }, 700);
  };

  const handleResetSim = () => {
    setSimMessages([
      { 
        sender: 'BOT', 
        text: `Olá! Sou a Sofia, assistente virtual da clínica ${clinic?.name || 'DentalFlow'}. Como posso ajudar?`, 
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        options: ['1. Agendar consulta', '2. Preços e tratamentos', '3. Endereço da clínica', '4. Urgência / Dor forte', '5. Falar com atendente']
      }
    ]);
    setAiAnalysis({
      intent: 'Boas-vindas',
      confidence: '100%',
      action: 'Iniciar atendimento e propor suporte.',
      activeNode: 'Boas-Vindas (Início)'
    });
  };

  const expandedPromptPreview = expandAiPrompt(prompt, { clinic, dentists, procedures, insurancePlans });

  const tagsList = [
    { tag: '{NOME_CLINICA}', label: 'Nome' },
    { tag: '{ENDERECO_COMPLETO}', label: 'Endereço' },
    { tag: '{TELEFONE_CONTATO}', label: 'Telefone' },
    { tag: '{HORARIO_FUNCIONAMENTO}', label: 'Expediente' },
    { tag: '{LISTA_DENTISTAS}', label: 'Dentistas' },
    { tag: '{LISTA_PROCEDIMENTOS}', label: 'Tratamentos' },
    { tag: '{CONVENIOS_ACEITOS}', label: 'Convênios' }
  ];

  return (
    <div className={`h-full flex flex-col overflow-hidden select-none font-sans relative transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]'
    }`}>
      
      {/* CABEÇALHO DO AGENTE - CORES E ESTILO WHATSAPP */}
      <div className={`h-[57px] px-5 border-b flex items-center justify-between flex-shrink-0 transition-colors ${
        isDarkMode ? 'border-[#1f2c34] bg-[#0D0D0D]' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-3">
          {onClose && (
            <button 
              onClick={onClose}
              className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
                isDarkMode 
                  ? 'bg-[#182730] hover:bg-[#20323e] border-[#1f2c34] text-slate-300 hover:text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Voltar ao chat"
            >
              <ChevronLeft className="w-4 h-4 text-[#00a884]" />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-[#008069] text-white flex items-center justify-center shadow-md">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-xs font-extrabold font-title tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111b21]'}`}>
                Automação WhatsApp
              </h2>
              <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold flex items-center gap-1 border ${
                isActive 
                  ? 'bg-[#00a884]/15 text-[#00a884] border-[#00a884]/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#00a884] animate-ping' : 'bg-slate-500'}`} />
                {isActive ? 'Automação Ativa' : 'Pausado'}
              </span>
            </div>
            <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-[#667781]'}`}>
              Fluxo visual de atendimento, robô de mensagens e menus interativos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl border transition-all ${
            isActive 
              ? isDarkMode ? 'bg-[#00a884]/20 border-[#00a884]/40 text-[#00a884]' : 'bg-[#00a884]/10 border-[#00a884]/30 text-[#00a884]' 
              : isDarkMode ? 'bg-[#182730] border-[#1f2c34] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            <span className="text-[11px] font-bold">{isActive ? 'Automação Ativa' : 'Automação Desativada'}</span>
            <input 
              type="checkbox" 
              checked={isActive} 
              onChange={(e) => {
                const nextActive = e.target.checked;
                setIsActive(nextActive);
                // Salva a alteração do status de automação imediatamente no Supabase e no Context
                saveAiConfig({
                  prompt,
                  personality,
                  operatingHours: operatingHoursMode,
                  isActive: nextActive,
                  autoSilence,
                  knowledgeBase: kb,
                  aiProvider,
                  apiKey
                }).catch(console.error);
              }}
              className="w-4 h-4 accent-[#00a884] rounded cursor-pointer"
            />
          </label>

          <button 
            onClick={handleSaveConfigs}
            disabled={isSaving}
            className="px-4 py-1.5 bg-[#00a884] hover:bg-[#008069] text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Fluxo'}</span>
          </button>
        </div>
      </div>

      {/* CORPO PRINCIPAL COM SIDEBAR LATERAL E ÁREA DE CONTEÚDO */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* NAVEGAÇÃO LATERAL (SIDEBAR DE ABAS DE AUTOMAÇÃO) */}
        <div className={`w-56 md:w-60 border-r p-3 flex flex-col gap-1.5 flex-shrink-0 overflow-y-auto transition-colors ${
          isDarkMode ? 'border-[#1f2c34] bg-[#0c141a]' : 'border-slate-200 bg-[#f0f2f5]'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 text-left ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Módulo de Automação
          </span>

          <button
            onClick={() => setActiveTab('flow_builder')}
            className={`w-full h-10 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer text-left ${
              activeTab === 'flow_builder'
                ? 'bg-[#00a884] text-white shadow-md'
                : isDarkMode 
                  ? 'bg-[#111c24] text-slate-400 hover:text-white border border-[#1f2c34] hover:bg-[#182730]' 
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span className="truncate flex-1">Editor Visual (Flow)</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`w-full h-10 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer text-left ${
              activeTab === 'simulator'
                ? 'bg-[#00a884] text-white shadow-md'
                : isDarkMode 
                  ? 'bg-[#111c24] text-slate-400 hover:text-white border border-[#1f2c34] hover:bg-[#182730]' 
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Play className="w-4 h-4 flex-shrink-0 text-teal-400" />
            <span className="truncate flex-1">Simulador WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`w-full h-10 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer text-left ${
              activeTab === 'faq'
                ? 'bg-[#00a884] text-white shadow-md'
                : isDarkMode 
                  ? 'bg-[#111c24] text-slate-400 hover:text-white border border-[#1f2c34] hover:bg-[#182730]' 
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4 flex-shrink-0 text-blue-400" />
            <span className="truncate flex-1">Base FAQ ({kb.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt')}
            className={`w-full h-10 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer text-left ${
              activeTab === 'prompt'
                ? 'bg-[#00a884] text-white shadow-md'
                : isDarkMode 
                  ? 'bg-[#111c24] text-slate-400 hover:text-white border border-[#1f2c34] hover:bg-[#182730]' 
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span className="truncate flex-1">Integração de IA (API)</span>
          </button>
        </div>

        {/* ÁREA DE CONTEÚDO PRINCIPAL DA ABA SELECIONADA */}
        <div className={`flex-1 ${activeTab === 'flow_builder' || activeTab === 'simulator' ? 'h-full overflow-hidden' : 'overflow-y-auto p-5 pb-12 scrollbar-thin space-y-5 text-left'}`}>
        
        {/* ========================================================================= */}
        {/* ABA: INTEGRAÇÃO DE IA (OPCIONAL - API KEY PRÓPRIA & PROMPT)               */}
        {/* ========================================================================= */}
        {activeTab === 'prompt' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left items-start">
            
            {/* LADO ESQUERDO: CONFIGURAÇÃO DE API KEY + PROMPT MESTRE */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* CARD DE CONFIGURAÇÃO DE API KEY PRÓPRIA */}
              <div className={`p-4 rounded-2xl border shadow-xs space-y-3 transition-all ${
                isDarkMode ? 'bg-[#111c24] border-[#1f2c34]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between border-b pb-2.5 border-slate-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Chave de API de IA (Opcional)
                      </h4>
                      <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Cadastre sua própria API Key para habilitar o nó 'Agente IA' no fluxo visual.
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${
                    apiKey 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {apiKey ? 'API KEY CONECTADA' : 'MODO AUTOMAÇÃO PURA'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Provedor de IA:
                    </label>
                    <select
                      value={aiProvider}
                      onChange={(e) => setAiProvider(e.target.value)}
                      className={`w-full rounded-xl py-2 px-3 text-xs font-medium border focus:outline-none focus:border-[#00a884] transition-all ${
                        isDarkMode ? 'bg-[#080d11] border-[#1f2c34] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                      <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                      <option value="gemini">Google Gemini 1.5 Pro</option>
                    </select>
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Chave de API (API Key Própria):
                    </label>
                    <input
                      type="password"
                      placeholder="sk-proj-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className={`w-full rounded-xl py-2 px-3 text-xs font-mono border focus:outline-none focus:border-[#00a884] transition-all ${
                        isDarkMode ? 'bg-[#080d11] border-[#1f2c34] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* HEADER DO EDITOR */}
              <div className="flex items-center justify-between px-1">
                <span className={`text-xs font-extrabold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Sliders className="w-4 h-4 text-[#00a884]" />
                  Blocos Modulares do Agente
                </span>
                <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Clique no card para expandir
                </span>
              </div>

              {/* EDITOR UNIFICADO DO PROMPT MESTRE DA SOFIA IA */}
              <div className={`rounded-2xl border overflow-hidden transition-all shadow-xs ${
                isDarkMode ? 'bg-[#111c24] border-[#1f2c34]' : 'bg-white border-slate-200'
              }`}>
                <div className="p-4 flex items-center justify-between border-b border-[#1f2c34]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#00a884]/15 text-[#00a884] flex items-center justify-center font-bold flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Editor de Prompt & Persona da Sofia IA
                      </h4>
                      <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Texto mestre completo editável com realce automático de chaves em verde
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Prompt Completo da Assistente (Editável):
                    </label>
                  </div>

                  <HighlightedPromptEditor
                    rows={18}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    isDarkMode={isDarkMode}
                    placeholder="Escreva aqui as instruções completas do prompt mestre..."
                  />
                </div>
              </div>
            </div>

            {/* LADO DIREITO: PREVIEW AO VIVO EM TEMPO REAL DO PROMPT FINAL COMPILADO */}
            <div className="lg:col-span-5 space-y-3 sticky top-0">
              <div className="flex items-center justify-between px-1">
                <span className={`text-xs font-extrabold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Eye className="w-4 h-4 text-[#00a884]" />
                  Pré-visualização ao Vivo
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                      copiedPrompt 
                        ? 'bg-emerald-500 text-white border-emerald-500' 
                        : isDarkMode 
                          ? 'bg-[#182730] hover:bg-[#20323e] text-slate-300 border-[#1f2c34]' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                    title="Copiar prompt completo"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 opacity-60" />}
                    <span>{copiedPrompt ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestoreDefaultPrompt}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                      isDarkMode ? 'bg-[#182730] hover:bg-[#20323e] text-slate-300 border-[#1f2c34]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                    title="Restaurar prompt padrão"
                  >
                    <RotateCcw className="w-3 h-3 opacity-60" />
                    <span>Restaurar</span>
                  </button>
                </div>
              </div>

              {/* CARD DE DISPLAY DO PROMPT COMPILADO COM DADOS REAIS */}
              <div className={`p-4 rounded-2xl border transition-all space-y-3 font-mono text-[11px] leading-relaxed max-h-[calc(100vh-260px)] overflow-y-auto select-text shadow-xs scrollbar-thin ${
                isDarkMode ? 'bg-[#080d11] border-[#1f2c34] text-[#e9edef]' : 'bg-[#f8f9fa] border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-500/20 text-[10px] font-sans">
                  <span className="font-bold text-[#00a884] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Prompt Final Injetado
                  </span>
                  <span className="opacity-60">Compilado em tempo real</span>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed">
                  {expandAiPrompt(prompt, {
                    clinic: {
                      name: varClinicName,
                      address: varAddress,
                      phone: varPhone,
                      operating_hours: varHours
                    },
                    dentists: varDentistsText,
                    procedures: varProceduresText,
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: BASE FAQ                                                           */}
        {/* ========================================================================= */}
        {activeTab === 'faq' && (
          <div className="max-w-4xl space-y-5 text-left mx-auto">
            
            {/* Cadastro FAQ */}
            <div className={`p-4 rounded-2xl border transition-all space-y-3 shadow-xs ${
              isDarkMode ? 'bg-[#111c24] border-[#1f2c34]' : 'bg-white border-slate-200'
            }`}>
              <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-[#111b21]'}`}>
                <Plus className="w-3.5 h-3.5 text-[#00a884]" />
                Nova Pergunta & Resposta
              </h4>

              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Pergunta (ex: Qual o valor da limpeza?)"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className={`w-full rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#00a884] border transition-all ${
                    isDarkMode ? 'bg-[#080d11] border-[#1f2c34] text-white' : 'bg-[#f8f9fa] border-slate-200 text-[#111b21]'
                  }`}
                />

                <textarea
                  rows={2}
                  placeholder="Resposta oficial da clínica..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className={`w-full rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#00a884] border transition-all ${
                    isDarkMode ? 'bg-[#080d11] border-[#1f2c34] text-white' : 'bg-[#f8f9fa] border-slate-200 text-[#111b21]'
                  }`}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddKb}
                    className="px-3.5 py-1.5 bg-[#00a884] hover:bg-[#008069] text-white font-bold rounded-xl text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lista FAQ */}
            <div className="space-y-2.5">
              <span className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Perguntas Cadastradas ({kb.length})
              </span>

              <div className="grid gap-2.5">
                {kb.map((item) => (
                  <div key={item.id} className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 transition-all shadow-xs ${
                    isDarkMode ? 'bg-[#111c24] border-[#1f2c34]' : 'bg-white border-slate-200'
                  }`}>
                    <div className="space-y-1 text-left flex-1">
                      <h5 className={`text-xs font-extrabold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-[#111b21]'}`}>
                        <HelpCircle className="w-3.5 h-3.5 text-[#00a884] flex-shrink-0" />
                        <span>{item.question}</span>
                      </h5>
                      <p className={`text-xs font-normal pl-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {item.answer}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveKb(item.id)}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all flex-shrink-0 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: REGRAS & TRANSIÇÃO                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'rules' && (
          <div className="max-w-4xl space-y-5 text-left mx-auto">
            
            {/* Horário */}
            <div className={`p-4 rounded-2xl border transition-all space-y-3 shadow-xs ${
              isDarkMode ? 'bg-[#111c24] border-[#1f2c34]' : 'bg-white border-slate-200'
            }`}>
              <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-[#111b21]'}`}>
                <Clock className="w-3.5 h-3.5 text-[#00a884]" />
                Horário de Atuação
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label 
                  onClick={() => setOperatingHoursMode('24h')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    operatingHoursMode === '24h'
                      ? 'bg-[#00a884]/15 border-[#00a884] text-[#00a884] font-bold'
                      : isDarkMode 
                        ? 'bg-[#080d11] border-[#1f2c34] text-slate-400 hover:text-white' 
                        : 'bg-[#f8f9fa] border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <input type="radio" name="hours" checked={operatingHoursMode === '24h'} readOnly className="mt-0.5 accent-[#00a884]" />
                  <div>
                    <span className={`text-xs font-bold block ${
                      operatingHoursMode === '24h' ? 'text-[#00a884]' : isDarkMode ? 'text-white' : 'text-[#111b21]'
                    }`}>Atendimento 24h / 7 dias</span>
                    <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Respostas automáticas contínuas a qualquer momento.</p>
                  </div>
                </label>

                <label 
                  onClick={() => setOperatingHoursMode('after_hours')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    operatingHoursMode === 'after_hours'
                      ? 'bg-[#00a884]/15 border-[#00a884] text-[#00a884] font-bold'
                      : isDarkMode 
                        ? 'bg-[#080d11] border-[#1f2c34] text-slate-400 hover:text-white' 
                        : 'bg-[#f8f9fa] border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <input type="radio" name="hours" checked={operatingHoursMode === 'after_hours'} readOnly className="mt-0.5 accent-[#00a884]" />
                  <div>
                    <span className={`text-xs font-bold block ${
                      operatingHoursMode === 'after_hours' ? 'text-[#00a884]' : isDarkMode ? 'text-white' : 'text-[#111b21]'
                    }`}>Fora do Expediente</span>
                    <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Apenas à noite e fins de semana. Recepção atende durante o dia.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Transição Humana */}
            <div className={`p-4 rounded-2xl border transition-all space-y-3 shadow-xs ${
              isDarkMode ? 'bg-[#111c24] border-[#1f2c34]' : 'bg-white border-slate-200'
            }`}>
              <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-[#111b21]'}`}>
                <ShieldAlert className="w-3.5 h-3.5 text-[#00a884]" />
                Transição Humana
              </h4>

              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                isDarkMode ? 'bg-[#080d11] border-[#1f2c34]' : 'bg-[#f8f9fa] border-slate-200'
              }`}>
                <input 
                  type="checkbox" 
                  checked={autoSilence}
                  onChange={(e) => setAutoSilence(e.target.checked)}
                  className="w-4 h-4 accent-[#00a884] rounded cursor-pointer"
                />
                <div>
                  <span className={`text-xs font-bold block ${isDarkMode ? 'text-white' : 'text-[#111b21]'}`}>Silenciar ao intervir</span>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pausa a IA quando a recepção envia mensagem manual no chat.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: SIMULADOR DE TESTE INTERATIVO (LARGURA TOTAL 100%)                */}
        {/* ========================================================================= */}
        {activeTab === 'simulator' && (
          <div className="w-full h-full p-4 text-left flex flex-col items-stretch overflow-hidden">
            
            {/* CHAT INTERATIVO SIMULADOR DO WHATSAPP - 100% LARGURA */}
            <div className={`w-full h-full rounded-2xl border flex flex-col overflow-hidden transition-all shadow-sm ${
              isDarkMode ? 'bg-[#0b141a] border-[#1f2c34]' : 'bg-white border-slate-200'
            }`}>
              {/* Header do Chat WhatsApp Simulador */}
              <div className={`p-3 px-4 border-b flex items-center justify-between transition-colors ${
                isDarkMode ? 'border-[#1f2c34] bg-[#111c24]' : 'border-slate-200 bg-slate-100'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center font-bold text-xs shadow">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#111b21]'}`}>
                      Simulador WhatsApp — Sofia IA
                    </h3>
                    <span className="text-[10px] text-[#00a884] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-ping" />
                      Sessão ativa de teste
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleResetSim}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isDarkMode ? 'bg-[#182730] hover:bg-[#20323e] text-slate-300 border-[#1f2c34]' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title="Reiniciar conversa de teste"
                >
                  <RotateCcw className="w-3.5 h-3.5 opacity-70" />
                  <span>Reiniciar Chat</span>
                </button>
              </div>

              {/* Atalhos Rápidos de Teste (Presets) */}
              <div className={`px-3 py-2 border-b flex items-center gap-1.5 overflow-x-auto scrollbar-none transition-colors ${
                isDarkMode ? 'border-[#1f2c34] bg-[#0c141a]' : 'border-slate-200 bg-slate-50'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider flex-shrink-0 mr-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Atalhos Rápidos:
                </span>
                <button
                  onClick={() => handleSimSend(null, 'Quero agendar uma consulta')}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#00a884]/15 hover:bg-[#00a884]/25 text-[#00a884] transition-all cursor-pointer flex-shrink-0"
                >
                  📅 Agendar
                </button>
                <button
                  onClick={() => handleSimSend(null, 'Quais os preços dos tratamentos?')}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 transition-all cursor-pointer flex-shrink-0"
                >
                  💰 Preços
                </button>
                <button
                  onClick={() => handleSimSend(null, 'Onde fica a clínica e qual o endereço?')}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 transition-all cursor-pointer flex-shrink-0"
                >
                  📍 Endereço
                </button>
                <button
                  onClick={() => handleSimSend(null, 'Estou com muita dor de dente!')}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-all cursor-pointer flex-shrink-0"
                >
                  🚨 Urgência
                </button>
                <button
                  onClick={() => handleSimSend(null, 'Quero falar com a recepção')}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 transition-all cursor-pointer flex-shrink-0"
                >
                  👨‍💼 Falar com Humano
                </button>
              </div>

              {/* Área de Mensagens do Chat */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
                {simMessages.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[80%] ${m.sender === 'BOT' ? 'mr-auto items-start' : 'ml-auto items-end'}`}
                  >
                    <span className={`text-[10px] font-bold mb-1 px-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {m.sender === 'BOT' ? 'Sofia IA' : 'Você'} • {m.time}
                    </span>
                    <div className={`p-3.5 rounded-2xl text-xs font-medium whitespace-pre-wrap leading-relaxed ${
                      m.sender === 'BOT'
                        ? isDarkMode 
                          ? 'bg-[#182730] text-slate-100 rounded-tl-none border border-[#1f2c34]' 
                          : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200'
                        : 'bg-[#00a884] text-white rounded-tr-none shadow-sm'
                    }`}>
                      {m.text}
                    </div>

                    {/* Botões Clicáveis de Opções (Quick Replies) do WhatsApp */}
                    {m.sender === 'BOT' && m.options && m.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5 text-left">
                        {m.options.map((optText, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => handleSimSend(null, optText)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00a884]/15 hover:bg-[#00a884] text-[#00a884] hover:text-white border border-[#00a884]/30 transition-all active:scale-95 cursor-pointer shadow-xs"
                          >
                            {optText}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className={`flex items-center gap-2 text-xs italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce" />
                    <span>Sofia IA está analisando a mensagem e digitando...</span>
                  </div>
                )}
              </div>

              {/* Form de Envio */}
              <form onSubmit={(e) => handleSimSend(e)} className={`p-3 border-t flex gap-2 transition-colors ${
                isDarkMode ? 'border-[#1f2c34] bg-[#0c141a]' : 'border-slate-200 bg-slate-50'
              }`}>
                <input
                  type="text"
                  placeholder="Digite uma pergunta para testar o comportamento do robô..."
                  value={simInput}
                  onChange={(e) => setSimInput(e.target.value)}
                  className={`flex-1 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-[#00a884] border transition-all ${
                    isDarkMode ? 'bg-[#111c24] border-[#1f2c34] text-white' : 'bg-white border-slate-200 text-[#111b21]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!simInput.trim()}
                  className="px-4 py-2.5 bg-[#00a884] hover:bg-[#008069] text-white font-bold text-xs rounded-xl shadow active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA NOVA: EDITOR VISUAL DE FLUXO (REACT FLOW)                           */}
        {/* ========================================================================= */}
        {activeTab === 'flow_builder' && (
          <VisualFlowBuilder onOpenInspector={() => setShowInspectorModal(true)} />
        )}
      </div>
    </div>

      {/* MODAL DE INSPETOR E LOGS DE TRACE DA IA */}
      <FlowInspectorModal 
        isOpen={showInspectorModal} 
        onClose={() => setShowInspectorModal(false)} 
      />

      {/* MODAL DE PRÉ-VISUALIZAÇÃO */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden text-left transition-all ${
            isDarkMode ? 'bg-[#111c24] border-[#1f2c34]' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-3.5 border-b flex items-center justify-between transition-colors ${
              isDarkMode ? 'border-[#1f2c34] bg-[#182730]' : 'border-slate-200 bg-slate-100'
            }`}>
              <h3 className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-[#111b21]'}`}>
                <Eye className="w-4 h-4 text-[#00a884]" />
                Prompt Expandido com Dados Reais da Clínica
              </h3>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-4 flex-1 overflow-y-auto font-mono text-[11px] whitespace-pre-wrap leading-relaxed scrollbar-thin ${
              isDarkMode ? 'bg-[#080d11] text-[#e9edef]' : 'bg-slate-50 text-slate-800'
            }`}>
              {expandedPromptPreview}
            </div>

            <div className={`p-3 border-t flex justify-end transition-colors ${
              isDarkMode ? 'border-[#1f2c34] bg-[#111c24]' : 'border-slate-200 bg-white'
            }`}>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 bg-[#00a884] hover:bg-[#008069] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

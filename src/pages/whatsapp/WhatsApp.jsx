import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Send, Phone, User, Check, ShieldAlert, Tag, FileText, 
  Smile, Mic, Image, Paperclip, MoreVertical, Search, Bot, Zap,
  Smartphone, Key, Globe, Plus, AlertCircle, CheckCircle2 
} from 'lucide-react';

export default function WhatsApp() {
  const { whatsappChats, sendWhatsAppMessage, updateChatNotes, updateChatTags, toggleBotSilence } = useClinic();
  const { currentTheme } = useTheme();
  const { user, clinic } = useAuth();

  // Estados locais
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showEvolutionSettings, setShowEvolutionSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const clinicId = clinic?.id || 'default';

  // Carregar configurações da Evolution API do localStorage
  const [evolutionUrl, setEvolutionUrl] = useState(() => {
    return localStorage.getItem(`evolution_url_${clinicId}`) || 'https://api.dentalflow.clinic';
  });
  const [evolutionInstance, setEvolutionInstance] = useState(() => {
    return localStorage.getItem(`evolution_instance_${clinicId}`) || 'dentalflow-prod';
  });
  const [evolutionToken, setEvolutionToken] = useState(() => {
    return localStorage.getItem(`evolution_token_${clinicId}`) || 'dentalflow_key_secure_123456';
  });
  const [evolutionStatus, setEvolutionStatus] = useState(() => {
    return localStorage.getItem(`evolution_status_${clinicId}`) || 'DISCONNECTED';
  });

  // Novos estados para a conexão real
  const [qrCode, setQrCode] = useState('');
  const [connectionLogs, setConnectionLogs] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(`evolution_url_${clinicId}`, evolutionUrl);
  }, [evolutionUrl, clinicId]);

  useEffect(() => {
    localStorage.setItem(`evolution_instance_${clinicId}`, evolutionInstance);
  }, [evolutionInstance, clinicId]);

  useEffect(() => {
    localStorage.setItem(`evolution_token_${clinicId}`, evolutionToken);
  }, [evolutionToken, clinicId]);

  useEffect(() => {
    localStorage.setItem(`evolution_status_${clinicId}`, evolutionStatus);
  }, [evolutionStatus, clinicId]);

  // Log auxiliar para o console interno
  const addLog = (msg) => {
    setConnectionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Verificar status real de conexão com a VPS
  const checkRealConnection = async () => {
    if (!evolutionUrl || !evolutionInstance || !evolutionToken) return;
    try {
      const response = await fetch(`${evolutionUrl}/instance/connectionState/${evolutionInstance}`, {
        headers: { apikey: evolutionToken }
      });
      const data = await response.json();
      if (response.ok && data.instance?.state === 'open') {
        setEvolutionStatus('CONNECTED');
        setQrCode('');
      } else {
        setEvolutionStatus('DISCONNECTED');
      }
    } catch (e) {
      setEvolutionStatus('DISCONNECTED');
    }
  };

  // Checar conexão ao abrir o painel
  useEffect(() => {
    if (showEvolutionSettings) {
      let active = true;
      const run = async () => {
        await Promise.resolve();
        if (active) {
          checkRealConnection();
        }
      };
      run();
      return () => {
        active = false;
      };
    }
  }, [showEvolutionSettings, evolutionUrl, evolutionInstance, evolutionToken]);

  // Criar instância e buscar QR Code
  const handleConnectWhatsApp = async () => {
    setIsConnecting(true);
    setConnectionLogs([]);
    addLog(`Iniciando processo de conexão para "${evolutionInstance}"...`);

    try {
      // 1. Criar a Instância
      addLog('Passo 1: Verificando/Criando instância na VPS...');
      const createRes = await fetch(`${evolutionUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionToken
        },
        body: JSON.stringify({
          instanceName: evolutionInstance,
          token: evolutionToken,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS"
        })
      });
      const createData = await createRes.json();
      if (createRes.ok || createRes.status === 201 || createRes.status === 403) {
        addLog('Sucesso: Instância ativa na VPS.');
      } else {
        addLog(`Aviso ao criar: ${createData.message || JSON.stringify(createData)}`);
      }

      // 2. Gerar QR Code
      addLog('Passo 2: Buscando QR Code de pareamento...');
      const connectRes = await fetch(`${evolutionUrl}/instance/connect/${evolutionInstance}`, {
        method: 'GET',
        headers: {
          'apikey': evolutionToken
        }
      });
      const connectData = await connectRes.json();
      if (connectRes.ok) {
        const base64Qr = connectData.base64 || (connectData.qrcode && connectData.qrcode.base64);
        if (base64Qr) {
          setQrCode(base64Qr);
          addLog('QR Code obtido com sucesso! Escaneie pelo WhatsApp do celular.');
        } else if (connectData.status === 'open' || connectData.instance?.state === 'open') {
          setEvolutionStatus('CONNECTED');
          setQrCode('');
          addLog('WhatsApp já conectado nesta instância!');
        } else {
          addLog(`Status: ${connectData.status || JSON.stringify(connectData)}`);
        }
      } else {
        addLog(`Erro ao obter QR Code: ${JSON.stringify(connectData)}`);
      }
    } catch (err) {
      addLog(`Falha na requisição: ${err.message}`);
    }
    setIsConnecting(false);
  };

  // Configurar o Webhook no Supabase
  const handleConfigureWebhook = async () => {
    addLog('Configurando webhook da IA Sofia...');
    const webhookUrl = `https://rxjwfzknxatoozbuhqtr.supabase.co/functions/v1/whatsapp-agent`;

    try {
      const response = await fetch(`${evolutionUrl}/webhook/set/${evolutionInstance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionToken
        },
        body: JSON.stringify({
          webhook: {
            enabled: true,
            url: webhookUrl,
            byEvents: false,
            events: ["MESSAGES_UPSERT"]
          }
        })
      });
      const data = await response.json();
      if (response.ok) {
        addLog(`Sucesso: Webhook apontado para o Supabase!`);
      } else {
        addLog(`Erro ao definir Webhook: ${data.message || JSON.stringify(data)}`);
      }
    } catch (err) {
      addLog(`Falha ao definir Webhook: ${err.message}`);
    }
  };

  // Modelos de Mensagens Rápidas
  const quickReplies = [
    { label: 'Confirmar Consulta', text: 'Olá! Confirmamos sua consulta marcada para amanhã. Podemos confirmar sua presença?' },
    { label: 'Preparo Canal', text: 'Lembramos que para o procedimento de canal é recomendado não estar em jejum absoluto. Qualquer dúvida estamos à disposição.' },
    { label: 'Agradecimento', text: 'Obrigado pela visita hoje! Seu feedback é muito importante para nós. Tenha um excelente dia!' }
  ];

  const [showMobileList, setShowMobileList] = useState(true);

  // Chat selecionado
  const activeChat = whatsappChats.find(c => c.patientId === selectedPatientId);

  // Inicializar o primeiro chat na carga se disponível
  useEffect(() => {
    if (whatsappChats.length > 0 && !selectedPatientId) {
      let active = true;
      const run = async () => {
        await Promise.resolve();
        if (active) {
          setSelectedPatientId(whatsappChats[0].patientId);
        }
      };
      run();
      return () => {
        active = false;
      };
    }
  }, [whatsappChats, selectedPatientId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedPatientId) return;

    sendWhatsAppMessage(selectedPatientId, typedMessage, 'USER', 'text');
    setTypedMessage('');
  };

  const handleSendQuickReply = (text) => {
    if (!selectedPatientId) return;
    sendWhatsAppMessage(selectedPatientId, text, 'USER', 'text');
  };

  const handleSimulateReceive = () => {
    if (!selectedPatientId) return;
    sendWhatsAppMessage(selectedPatientId, 'Gostaria de saber se tem horário disponível para limpeza preventiva na sexta à tarde.', 'PATIENT', 'text');
  };

  // Simuladores de Mídia
  const handleSimulateAudio = () => {
    if (!selectedPatientId) return;
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      sendWhatsAppMessage(selectedPatientId, 'Mensagem de áudio (Simulada)', 'USER', 'audio', '#');
    }, 1500);
  };

  const handleSimulateImage = () => {
    if (!selectedPatientId) return;
    sendWhatsAppMessage(selectedPatientId, 'Imagem da moldeira de clareamento', 'USER', 'image', 'https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=150&auto=format&fit=crop&q=60');
  };

  const handleSimulatePdf = () => {
    if (!selectedPatientId) return;
    sendWhatsAppMessage(selectedPatientId, 'Receita_Odontologica_Assinada.pdf', 'USER', 'pdf', '#');
  };

  // Filtragem dos contatos do chat
  const filteredChats = whatsappChats.filter(chat => 
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-sm">
      
      {/* 1. Lista de Conversas (Esquerda) */}
      <div className={`w-full md:w-80 border-r border-slate-200/50 dark:border-slate-800 flex flex-col flex-shrink-0 bg-slate-50/20 dark:bg-slate-950/10 ${showMobileList ? 'flex' : 'hidden md:flex'}`}>
        
        {/* Barra de Busca Conversas */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800 space-y-2 flex-shrink-0">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>
          
          <button 
            onClick={() => {
              setShowEvolutionSettings(!showEvolutionSettings);
              if (window.innerWidth < 768) {
                setShowMobileList(false);
              }
            }}
            className={`w-full py-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              showEvolutionSettings 
                ? 'bg-secondary text-white border-secondary' 
                : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Configurar Evolution API
          </button>
        </div>

        {/* Lista de Contatos Scroll */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850 pr-1.5 scrollbar-thin">
          {filteredChats.map(chat => {
            const isSelected = chat.patientId === selectedPatientId;
            const lastMsg = chat.messages[chat.messages.length - 1];
            
            return (
              <button
                key={chat.patientId}
                onClick={() => {
                  setSelectedPatientId(chat.patientId);
                  setShowEvolutionSettings(false);
                  setShowMobileList(false);
                }}
                className={`w-full text-left p-4 hover:bg-slate-100/50 dark:hover:bg-slate-850/50 flex items-start gap-3 transition-all relative ${
                  isSelected ? 'bg-slate-100/50 dark:bg-slate-850/50 border-r-2 border-secondary' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-850 flex items-center justify-center font-bold text-xs">
                    {chat.name.charAt(0)}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-850 ${
                    chat.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{chat.name}</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">{lastMsg?.time || '10:00'}</span>
                  </div>
                  
                  <p className="text-[10px] text-slate-550 dark:text-slate-400 truncate mt-0.5">
                    {lastMsg?.type === 'text' ? lastMsg.text : `[Arquivo / Mídia]`}
                  </p>
                </div>

                {chat.unreadCount > 0 && (
                  <span className="w-4 h-4 bg-secondary rounded-full text-[9px] font-bold text-white flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2">
                    {chat.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Chat Central (Meio) */}
      <div className={`flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-900/10 ${!showMobileList ? 'flex' : 'hidden md:flex'}`}>
        
        {showEvolutionSettings ? (
          /* PAINEL DE CONFIGURAÇÕES EVOLUTION API */
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 dark:text-slate-200 text-left">
            <div className="flex items-center gap-2 mb-2 md:hidden">
              <button
                onClick={() => {
                  setShowEvolutionSettings(false);
                  setShowMobileList(true);
                }}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                type="button"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
            </div>
            <div>
              <h3 className="text-sm font-bold font-title">Integração com Evolution API</h3>
              <p className="text-[11px] text-slate-450 mt-0.5">Gerencie a conexão da sua VPS, gere o QR Code e ative o robô de inteligência artificial.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Servidor API URL
                </label>
                <input
                  type="text"
                  value={evolutionUrl}
                  onChange={(e) => setEvolutionUrl(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
                {evolutionUrl && !evolutionUrl.startsWith('https://') && (
                  <span className="text-[10px] text-amber-500 font-semibold block mt-1 leading-normal">
                    ⚠️ Atenção: Use HTTPS para evitar bloqueios de conteúdo misto (Mixed Content) no navegador.
                  </span>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> Nome da Instância
                </label>
                <input
                  type="text"
                  value={evolutionInstance}
                  onChange={(e) => setEvolutionInstance(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> Token Global (Apikey)
                </label>
                <input
                  type="password"
                  value={evolutionToken}
                  onChange={(e) => setEvolutionToken(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Painel Central do QR Code e Ações */}
            <div className="p-5 border border-slate-200/50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 rounded-2xl flex flex-col md:flex-row items-center gap-6">
              
              {/* QR Code Frame */}
              <div className="w-48 h-48 border border-slate-200/50 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-3 relative overflow-hidden shadow-sm">
                {qrCode ? (
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-full h-full object-contain" />
                ) : evolutionStatus === 'CONNECTED' ? (
                  <div className="text-center space-y-1.5 p-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <span className="text-[10px] font-bold text-emerald-500 block">WhatsApp Ativo</span>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 space-y-1 p-2">
                    <Smartphone className="w-8 h-8 mx-auto opacity-30 animate-pulse" />
                    <span className="text-[9px] font-medium block">Nenhum QR Code gerado</span>
                  </div>
                )}
              </div>

              {/* Botões e Status */}
              <div className="flex-1 space-y-4 w-full text-left">
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${
                    evolutionStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`} />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">Status da Conexão</span>
                    <p className="text-[10px] text-slate-450 mt-0.5">
                      {evolutionStatus === 'CONNECTED' 
                        ? 'WhatsApp Conectado e escutando webhooks.' 
                        : 'WhatsApp Desconectado. É necessário gerar e escanear o QR Code.'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={handleConnectWhatsApp}
                    disabled={isConnecting}
                    className="px-3.5 py-2 bg-secondary text-white font-bold rounded-xl text-xs hover:opacity-95 shadow transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isConnecting ? 'Verificando...' : '1. Gerar QR Code / Conectar'}
                  </button>
                  <button 
                    onClick={handleConfigureWebhook}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-250 font-bold rounded-xl border border-slate-250 dark:border-slate-700 text-xs shadow-sm transition-all active:scale-[0.98]"
                  >
                    2. Ativar Webhook da Sofia IA
                  </button>
                  <button 
                    onClick={checkRealConnection}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-500 font-semibold rounded-xl border border-slate-200 dark:border-slate-850 text-xs shadow-sm"
                  >
                    Atualizar Status
                  </button>
                </div>
              </div>
            </div>

            {/* Diagnostic Console */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Console de Conexão (VPS Logs)</label>
              <div className="w-full h-32 bg-slate-950 border border-slate-800/80 rounded-2xl p-3 font-mono text-[10px] text-emerald-500 overflow-y-auto space-y-1">
                {connectionLogs.length > 0 ? (
                  connectionLogs.map((line, idx) => <div key={idx}>{line}</div>)
                ) : (
                  <div className="text-slate-600">[Aguardando comandos. Clique em "Gerar QR Code" acima para conectar.]</div>
                )}
              </div>
            </div>

          </div>
        ) : activeChat ? (
          <>
            {/* Top Bar Chat */}
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Botão Voltar (Mobile) */}
                <button
                  onClick={() => setShowMobileList(true)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 md:hidden"
                  title="Voltar para conversas"
                  type="button"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center font-bold text-slate-500 text-xs">
                  {activeChat.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white font-title">{activeChat.name}</h3>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold mt-0.5">
                    {activeChat.isBotPaused ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                        <span className="text-amber-500">Atendimento Humano (IA Pausada)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-emerald-500">IA Sofia Ativa</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões do Topo */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBotSilence(activeChat.patientId, !activeChat.isBotPaused)}
                  className={`px-3 py-1.5 font-bold rounded-lg text-[9px] hover:opacity-90 flex items-center gap-1 transition-all ${
                    activeChat.isBotPaused 
                      ? 'bg-violet-600 text-white shadow-sm' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  {activeChat.isBotPaused ? 'Reativar IA Sofia' : 'Pausar IA Sofia'}
                </button>
                <button 
                  onClick={handleSimulateReceive}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 text-slate-650 dark:text-slate-250 font-bold rounded-lg text-[9px] flex items-center gap-1 border border-slate-200/50 dark:border-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Mensagem (Mock)
                </button>
              </div>
            </div>

            {/* Balões de Conversa Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin flex flex-col">
              {activeChat.messages.map((msg, idx) => {
                const isUser = msg.sender === 'USER';
                const isBot = msg.sender === 'BOT';
                
                return (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[70%] ${
                      isUser ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    {/* Balão */}
                    <div className={`p-3 rounded-2xl text-xs relative ${
                      isUser 
                        ? 'bg-secondary text-white rounded-tr-none' 
                        : isBot
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-250 border border-slate-300/30 dark:border-slate-850 rounded-tl-none font-medium'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-250 border border-slate-200 dark:border-slate-800 rounded-tl-none font-medium'
                    }`}>
                      {msg.type === 'text' && <p>{msg.text}</p>}
                      {msg.type === 'audio' && (
                        <div className="flex items-center gap-2.5">
                          <Mic className="w-4 h-4 text-white/80 flex-shrink-0" />
                          <div className="w-24 h-1.5 bg-white/20 rounded-full relative overflow-hidden">
                            <span className="absolute top-0 left-0 w-2/3 h-full bg-white" />
                          </div>
                          <span className="text-[9px] font-bold">0:12</span>
                        </div>
                      )}
                      {msg.type === 'image' && (
                        <div className="space-y-1.5">
                          <img src={msg.url} alt="Envio" className="w-36 h-28 object-cover rounded-lg" />
                          <p className="text-[10px] opacity-80">{msg.text}</p>
                        </div>
                      )}
                      {msg.type === 'pdf' && (
                        <div className="flex items-center gap-2 bg-slate-100/10 p-2 rounded-xl border border-white/5">
                          <FileText className="w-8 h-8 text-red-500" />
                          <div className="text-[10px]">
                            <h5 className="font-bold truncate max-w-[120px]">{msg.text}</h5>
                            <span className="text-[8px] opacity-70">PDF Document</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-450 mt-1 font-semibold">{msg.time}</span>
                  </div>
                );
              })}

              {isRecording && (
                <div className="self-end bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-2 flex items-center gap-2.5 animate-pulse text-[10px]">
                  <Mic className="w-3.5 h-3.5 text-red-500" />
                  <span>Gravando áudio simulado...</span>
                </div>
              )}
            </div>

            {/* Rodapé Input & Ações */}
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex-shrink-0 flex flex-col gap-2">
              
              {/* Respostas Rápidas / Templates */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0 scrollbar-none">
                {quickReplies.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendQuickReply(r.text)}
                    className="flex-shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-350 rounded-lg text-[9px] font-bold border border-slate-200/40 dark:border-slate-750"
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                
                {/* Botões Mídias */}
                <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-450">
                  <button type="button" onClick={handleSimulateAudio} title="Gravar áudio" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl active:scale-95 transition-all"><Mic className="w-4 h-4" /></button>
                  <button type="button" onClick={handleSimulateImage} title="Enviar imagem" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl active:scale-95 transition-all"><Image className="w-4 h-4" /></button>
                  <button type="button" onClick={handleSimulatePdf} title="Anexar documento" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl active:scale-95 transition-all"><Paperclip className="w-4 h-4" /></button>
                </div>

                <input
                  type="text"
                  placeholder="Escrever mensagem do WhatsApp..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 bg-slate-150 dark:bg-slate-800 border border-slate-200/30 dark:border-slate-750 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />

                <button
                  type="submit"
                  className="p-2 bg-secondary text-white rounded-xl active:scale-95 hover:opacity-95 shadow transition-all"
                  style={{ backgroundColor: currentTheme.secondary_color }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Smartphone className="w-12 h-12 stroke-1 text-slate-350" />
            <h4 className="font-title font-bold text-slate-700 dark:text-slate-300 text-sm">Central de Chats</h4>
            <p className="text-xs text-center max-w-xs leading-relaxed">Nenhum contato selecionado. Escolha uma conversa na lateral.</p>
          </div>
        )}
      </div>

      {/* 3. Painel do Paciente (Direita) */}
      {!showEvolutionSettings && activeChat && (
        <div className="w-72 border-l border-slate-200/50 dark:border-slate-800 flex flex-col flex-shrink-0 p-4 space-y-5 text-left text-slate-800 dark:text-slate-200 overflow-y-auto">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Informações e Prontuário</h4>
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800">
              <User className="w-8 h-8 text-slate-400 stroke-1" />
              <div>
                <h5 className="font-bold text-xs">{activeChat.name}</h5>
                <span className="text-[10px] text-slate-400">Paciente Clínico</span>
              </div>
            </div>
          </div>

          {/* Etiquetas / Tags */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Etiquetas (Tags)
            </h4>
            <div className="flex flex-wrap gap-1">
              {activeChat.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full font-bold text-[9px]">
                  {tag}
                </span>
              ))}
              <button 
                onClick={() => updateChatTags(activeChat.patientId, [...activeChat.tags, 'Ortodontia'])}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-full border border-slate-200/40 dark:border-slate-800 font-bold text-[9px] text-slate-500"
              >
                + Adicionar Tag
              </button>
            </div>
          </div>

          {/* Notas Internas */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Notas do Atendente
            </h4>
            <textarea
              placeholder="Anotações internas sobre o atendimento..."
              value={activeChat.notes}
              onChange={(e) => updateChatNotes(activeChat.patientId, e.target.value)}
              className="w-full h-28 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Evolution Quick Info */}
          <div className="p-3 bg-secondary/5 dark:bg-secondary/10 border border-secondary/10 rounded-2xl flex items-start gap-2 text-[10px] text-slate-500">
            <ShieldAlert className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
            <span>As anotações e tags inseridas neste painel do WhatsApp são sincronizadas diretamente com a ficha clínica do paciente.</span>
          </div>
        </div>
      )}

    </div>
  );
}

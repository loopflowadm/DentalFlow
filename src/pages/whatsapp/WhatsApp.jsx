import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Send, Phone, User, Check, ShieldAlert, Tag, FileText, 
  Smile, Mic, Image, Paperclip, MoreVertical, Search, Bot, Zap,
  Smartphone, Key, Globe, Plus, AlertCircle 
} from 'lucide-react';

export default function WhatsApp() {
  const { whatsappChats, sendWhatsAppMessage, updateChatNotes, updateChatTags } = useClinic();
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
    return localStorage.getItem(`evolution_url_${clinicId}`) || 'https://api.evolution.odontocrm.com';
  });
  const [evolutionInstance, setEvolutionInstance] = useState(() => {
    return localStorage.getItem(`evolution_instance_${clinicId}`) || 'sorriso-perfeito-instance';
  });
  const [evolutionToken, setEvolutionToken] = useState(() => {
    return localStorage.getItem(`evolution_token_${clinicId}`) || 'apikey_live_evo_998877abc';
  });
  const [evolutionStatus, setEvolutionStatus] = useState(() => {
    return localStorage.getItem(`evolution_status_${clinicId}`) || 'CONNECTED';
  });

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

  // Modelos de Mensagens Rápidas
  const quickReplies = [
    { label: 'Confirmar Consulta', text: 'Olá! Confirmamos sua consulta marcada para amanhã. Podemos confirmar sua presença? 🦷' },
    { label: 'Preparo Canal', text: 'Lembramos que para o procedimento de canal é recomendado não estar em jejum absoluto. Qualquer dúvida estamos à disposição. ✨' },
    { label: 'Agradecimento', text: 'Obrigado pela visita hoje! Seu feedback é muito importante para nós. Tenha um excelente dia! 💎' }
  ];

  // Chat selecionado
  const activeChat = whatsappChats.find(c => c.patientId === selectedPatientId);

  // Inicializar o primeiro chat na carga se disponível
  useEffect(() => {
    if (whatsappChats.length > 0 && !selectedPatientId) {
      setSelectedPatientId(whatsappChats[0].patientId);
    }
  }, [whatsappChats]);

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
      <div className="w-80 border-r border-slate-200/50 dark:border-slate-800 flex flex-col flex-shrink-0 bg-slate-50/20 dark:bg-slate-950/10">
        
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
            onClick={() => setShowEvolutionSettings(!showEvolutionSettings)}
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
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-900/10">
        
        {showEvolutionSettings ? (
          /* PAINEL DE CONFIGURAÇÕES EVOLUTION API */
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 dark:text-slate-200 text-left">
            <div>
              <h3 className="text-sm font-bold font-title">Integração com Evolution API</h3>
              <p className="text-[11px] text-slate-450 mt-0.5">Defina as chaves e a URL do servidor Evolution API para processar disparos e atendimento.</p>
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

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Status da Conexão</span>
                  <p className="text-[10px] text-slate-450 mt-0.5">WhatsApp Conectado e escutando webhooks.</p>
                </div>
              </div>
              <button 
                onClick={() => setEvolutionStatus(evolutionStatus === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-250 font-bold rounded-lg border border-slate-200/50 dark:border-slate-700/50 text-[10px]"
              >
                Testar Conexão
              </button>
            </div>
          </div>
        ) : activeChat ? (
          <>
            {/* Top Bar Chat */}
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center font-bold text-slate-500 text-xs">
                  {activeChat.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white font-title">{activeChat.name}</h3>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span>IA Sofia Ativa</span>
                  </div>
                </div>
              </div>

              {/* Botões do Topo */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSimulateReceive}
                  className="px-2.5 py-1.5 bg-secondary text-white font-bold rounded-lg text-[9px] hover:opacity-90 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Receber Mensagem (Mock)
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

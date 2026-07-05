import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Bot, Send, ShieldAlert, Sparkles, Sliders, BookOpen, 
  Clock, Plus, Trash2, CheckCircle2, User, HelpCircle, AlertTriangle 
} from 'lucide-react';

export default function AIModule() {
  const { aiConfig, saveAiConfig } = useClinic();
  const { currentTheme } = useTheme();

  // Estados locais para Configurações
  const [prompt, setPrompt] = useState(aiConfig.prompt);
  const [personality, setPersonality] = useState(aiConfig.personality);
  const [hours, setHours] = useState(aiConfig.operatingHours);
  const [isActive, setIsActive] = useState(aiConfig.isActive);
  const [kb, setKb] = useState(aiConfig.knowledgeBase);

  // States do Formulário Q&A da base de conhecimento
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // States do Simulator Chat
  const [simMessages, setSimMessages] = useState([
    { sender: 'BOT', text: 'Olá! Sou a Sofia, assistente virtual inteligente da clínica Sorriso Perfeito. Como posso lhe ajudar hoje? 🦷', time: '10:00' }
  ]);
  const [simInput, setSimInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState({
    intent: 'Boas-vindas',
    confidence: '100%',
    action: 'Apresentar bot e oferecer ajuda.'
  });

  const handleSaveConfigs = () => {
    saveAiConfig({
      prompt,
      personality,
      operatingHours: hours,
      isActive,
      knowledgeBase: kb
    });
    alert('Configurações da Inteligência Artificial salvas com sucesso!');
  };

  const handleAddKb = () => {
    if (!newQuestion || !newAnswer) return;
    const newEntry = {
      id: 'kb-' + Math.random().toString(36).substr(2, 9),
      question: newQuestion,
      answer: newAnswer
    };
    const nextKb = [...kb, newEntry];
    setKb(nextKb);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleRemoveKb = (id) => {
    setKb(kb.filter(item => item.id !== id));
  };

  // Simular Respostas da IA e Detecção de Intenções
  const handleSimSend = (e) => {
    e.preventDefault();
    if (!simInput.trim()) return;

    const userMsg = {
      sender: 'USER',
      text: simInput,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setSimMessages(prev => [...prev, userMsg]);
    const queryText = simInput;
    setSimInput('');
    setIsTyping(true);

    // Processamento Simulador
    setTimeout(() => {
      let responseText = '';
      let intent = 'Outros / Desconhecido';
      let confidence = '85%';
      let action = 'Responder com base no modelo geral.';

      const lowercaseQuery = queryText.toLowerCase();

      if (lowercaseQuery.includes('agendar') || lowercaseQuery.includes('marcar') || lowercaseQuery.includes('consulta')) {
        intent = 'Agendar Consulta';
        confidence = '98%';
        responseText = 'Perfeito! Tenho horários disponíveis amanhã às 14:00 ou na sexta-feira às 10:00. Qual desses horários fica melhor para você? 🦷';
        action = 'Verificar grade e propor slots de agendamento.';
      } else if (lowercaseQuery.includes('confirmar') || lowercaseQuery.includes('vou sim') || lowercaseQuery.includes('confirmado')) {
        intent = 'Confirmar Consulta';
        confidence = '95%';
        responseText = 'Excelente! Sua consulta foi confirmada em nosso sistema. Dra. Ana Paula estará te aguardando. Até lá! ✨';
        action = 'Atualizar status da consulta para CONFIRMED.';
      } else if (lowercaseQuery.includes('cancelar') || lowercaseQuery.includes('desmarcar') || lowercaseQuery.includes('nao vou')) {
        intent = 'Cancelar Consulta';
        confidence = '92%';
        responseText = 'Entendo. Cancelei sua consulta em nosso sistema. Gostaria de reagendar para a próxima semana? 📅';
        action = 'Atualizar status da consulta para CANCELLED e disparar fluxo de reagendamento.';
      } else if (lowercaseQuery.includes('reagendar') || lowercaseQuery.includes('mudar horario')) {
        intent = 'Reagendar Consulta';
        confidence = '96%';
        responseText = 'Claro! Qual dia ou período ficaria melhor para você reagendar? Posso verificar horários na terça ou quarta.';
        action = 'Buscar slots disponíveis e mudar data da consulta.';
      } else if (lowercaseQuery.includes('convenio') || lowercaseQuery.includes('amil') || lowercaseQuery.includes('unimed')) {
        intent = 'Dúvidas - Convênios';
        confidence = '97%';
        responseText = 'Atendemos Amil Dental, Unimed Odonto, Bradesco e SulAmérica. Se seu plano for outro, podemos emitir recibo para reembolso! 🩺';
        action = 'Buscar resposta na Base de Conhecimento.';
      } else if (lowercaseQuery.includes('falar com humano') || lowercaseQuery.includes('atendente') || lowercaseQuery.includes('pessoa')) {
        intent = 'Transição Humana';
        confidence = '99%';
        responseText = 'Tudo bem! Estou transferindo nossa conversa para um atendente humano. Por favor, aguarde um momento. 🧑‍💻';
        action = 'Pausar IA no banco de dados e notificar a equipe de recepção via alerta.';
      } else {
        // Resposta base de conhecimento genérica
        responseText = 'Entendi! Vou repassar para nossa equipe de atendimento para que possam responder com precisão. Em alguns instantes eles entrarão em contato. 🦷';
      }

      const botMsg = {
        sender: 'BOT',
        text: responseText,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setSimMessages(prev => [...prev, botMsg]);
      setAiAnalysis({ intent, confidence, action });
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 overflow-hidden">
      
      {/* Coluna Esquerda: Configurações */}
      <div className="flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/40 dark:border-slate-800/60 rounded-2xl p-5 flex flex-col overflow-y-auto space-y-5 text-left text-slate-800 dark:text-slate-200 shadow-sm scrollbar-thin">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-violet-500" />
            <h3 className="text-sm font-bold font-title">Configurações Sofia IA</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Ativar Agente IA</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600" />
            </label>
          </div>
        </div>

        {/* Prompt Config */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> Prompt de Personalidade e Instruções
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs focus:outline-none resize-none font-medium leading-relaxed"
          />
        </div>

        {/* Parâmetros Operacionais */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Horário Funcionamento
            </label>
            <input
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl py-2 px-3 text-xs focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Modelo Linguagem</label>
            <select
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl py-2 px-3 text-xs focus:outline-none"
            >
              <option value="prestativo">Assistente Educada / Comercial</option>
              <option value="sofia_assistente">Sofia Assistente (Agendamentos)</option>
              <option value="tecnico">Perfil Clínico e Técnico</option>
            </select>
          </div>
        </div>

        {/* Base de Conhecimento (FAQs) */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Base de Conhecimento Local (Perguntas Frequentes)
          </label>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {kb.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/40 dark:border-slate-800/50 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h5 className="font-bold flex items-center gap-1 text-[11px]"><HelpCircle className="w-3 h-3 text-violet-500" /> {item.question}</h5>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{item.answer}</p>
                </div>
                <button 
                  onClick={() => handleRemoveKb(item.id)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Q&A Form */}
          <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-200/30 dark:border-slate-800 flex flex-col gap-2">
            <input
              type="text"
              placeholder="Pergunta freqüente do paciente..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-lg p-2 text-[11px]"
            />
            <input
              type="text"
              placeholder="Resposta automática recomendada..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-lg p-2 text-[11px]"
            />
            <button
              onClick={handleAddKb}
              className="py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded-lg border border-slate-200/50 dark:border-slate-700/50 text-[10px]"
            >
              Adicionar Resposta
            </button>
          </div>
        </div>

        {/* Ação Botão Salvar Configs */}
        <button
          onClick={handleSaveConfigs}
          className="w-full py-2.5 bg-secondary text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98]"
          style={{ backgroundColor: currentTheme.secondary_color }}
        >
          Salvar Configurações da IA
        </button>
      </div>

      {/* Coluna Direita: Simulador Interativo */}
      <div className="w-96 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/40 dark:border-slate-800/60 rounded-2xl flex flex-col overflow-hidden shadow-sm flex-shrink-0">
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500 animate-pulse" />
            <h3 className="text-xs font-bold font-title">Simulador de Conversa da IA</h3>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin flex flex-col bg-slate-50/20 dark:bg-slate-950/15">
          {simMessages.map((msg, idx) => {
            const isUser = msg.sender === 'USER';
            return (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[80%] ${
                  isUser ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div className={`p-3 rounded-2xl text-xs ${
                  isUser 
                    ? 'bg-violet-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-250 border border-slate-200/40 dark:border-slate-800 rounded-tl-none font-semibold'
                }`}>
                  <p>{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 font-semibold">{msg.time}</span>
              </div>
            );
          })}

          {isTyping && (
            <div className="self-start bg-white dark:bg-slate-800 border border-slate-200/40 dark:border-slate-800 rounded-2xl p-2 flex items-center gap-2 animate-pulse text-[10px]">
              <Bot className="w-4 h-4 text-violet-500" />
              <span>Sofia está digitando...</span>
            </div>
          )}
        </div>

        {/* Analisador de Intenções (IA Logs) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5 text-xs text-left">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-violet-500" /> Analisador de Intenções IA
          </h4>
          
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500">
            <div className="bg-white dark:bg-slate-850 p-2 rounded-lg border border-slate-200/30 dark:border-slate-800">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">Intenção Classificada</span>
              <span className="text-slate-800 dark:text-white font-bold">{aiAnalysis.intent}</span>
            </div>
            <div className="bg-white dark:bg-slate-850 p-2 rounded-lg border border-slate-200/30 dark:border-slate-800">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">Confiança IA</span>
              <span className="text-violet-500 font-extrabold">{aiAnalysis.confidence}</span>
            </div>
            <div className="col-span-2 bg-white dark:bg-slate-850 p-2 rounded-lg border border-slate-200/30 dark:border-slate-800">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">Ação Executada</span>
              <span className="text-slate-800 dark:text-white font-medium">{aiAnalysis.action}</span>
            </div>
          </div>
        </div>

        {/* Simulator Input Footer */}
        <form onSubmit={handleSimSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2 flex-shrink-0 bg-white dark:bg-slate-900/60">
          <input
            type="text"
            placeholder="Enviar mensagem para testar a IA..."
            value={simInput}
            onChange={(e) => setSimInput(e.target.value)}
            className="flex-1 bg-slate-100 dark:bg-slate-850 border border-slate-200/35 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none"
          />
          <button
            type="submit"
            className="p-2 bg-violet-600 text-white rounded-xl active:scale-95 shadow hover:opacity-95"
            style={{ backgroundColor: currentTheme.secondary_color }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}

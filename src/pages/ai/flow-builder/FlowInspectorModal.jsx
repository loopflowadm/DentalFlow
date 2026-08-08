import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Eye, ShieldCheck, CheckCircle2, AlertTriangle, 
  Bot, User, ArrowRight, Sparkles, Clock, Copy, Check 
} from 'lucide-react';
import { useClinic, DEFAULT_DENTAL_AI_PROMPT, expandAiPrompt } from '../../../context/ClinicContext';
import { useAuth } from '../../../context/AuthContext';

export default function FlowInspectorModal({ isOpen, onClose }) {
  const { clinic } = useAuth();
  const { procedures, insurancePlans, dentists } = useClinic();

  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const updateDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    updateDarkMode();
    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [activeTab, setActiveTab] = useState('trace'); // 'trace' | 'compiled_prompt'
  const [copied, setCopied] = useState(false);

  // Expansão do Prompt Mestre com os dados atuais da clínica
  const sampleClinicData = {
    clinic: {
      name: clinic?.name || clinic?.clinic_name || 'DentalFlow Odontologia',
      phone: clinic?.phone || '(83) 99999-9999',
      logradouro: clinic?.address?.logradouro || 'Av. Epitácio Pessoa, 1000',
      cidade: clinic?.address?.cidade || 'João Pessoa',
      uf: clinic?.address?.uf || 'PB'
    },
    dentists: dentists || [{ full_name: 'Dr. Lucas Ferreira', specialty: 'Ortodontia & Implantes' }],
    procedures: procedures || [{ name: 'Clareamento Dental', price: 800, category: 'Estética' }],
    insurancePlans: insurancePlans || [{ name: 'Amil Dental' }, { name: 'Bradesco Dental' }]
  };

  const compiledPrompt = expandAiPrompt(DEFAULT_DENTAL_AI_PROMPT, sampleClinicData);

  // Exemplo de Logs de Trace de Atendimento da IA
  const sampleLogs = [
    {
      id: 'log-1',
      time: '10:42:15',
      patient: 'Mariana Silva (+55 83 98877-1122)',
      input: 'Olá, gostaria de saber se vocês atendem o convênio Amil Dental e qual o valor da consulta de limpeza?',
      intent: 'Dúvida de Convênio & Procedimento',
      nodeExecuted: 'Nó 3 (Agente IA - Sofia)',
      action: 'Consultou Tabela de Convênios & Procedimentos no Banco ➔ Respondeu com Amil Dental e R$ 250,00',
      status: 'Sucesso',
      statusColor: 'emerald'
    },
    {
      id: 'log-2',
      time: '10:35:00',
      patient: 'João Pereira (+55 83 99911-4433)',
      input: 'Estou com muita dor no dente do sisal, preciso de um dentista agora por favor!!',
      intent: 'Urgência / Dor Forte',
      nodeExecuted: 'Nó 5 (Transferir p/ Humano)',
      action: 'Identificou Palavra-Chave de Urgência ➔ Silenciou IA ➔ Notificou Recepção no WhatsApp',
      status: 'Transferido',
      statusColor: 'red'
    },
    {
      id: 'log-3',
      time: '09:18:22',
      patient: 'Ana Souza (+55 83 98765-4321)',
      input: 'Qual o endereço da clínica?',
      intent: 'Localização / Endereço',
      nodeExecuted: 'Nó 1 (Mensagem Automática)',
      action: 'Expandiu tag {ENDERECO_COMPLETO} ➔ Enviou localização com link do Google Maps',
      status: 'Sucesso',
      statusColor: 'emerald'
    }
  ];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-4xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-sans transition-colors ${
          isDarkMode ? 'bg-[#121b22] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors ${
          isDarkMode ? 'bg-[#1f2c34] border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Eye className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold flex items-center gap-2">
                Inspetor de Execução & Trace da IA
                <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full font-mono">Live Debugger</span>
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Acompanhe a árvore de decisão e o prompt compilado em tempo real
              </p>
            </div>
          </div>

          <button onClick={onClose} className={`p-2 rounded-xl transition-all ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
          }`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className={`flex border-b px-6 pt-3 gap-4 transition-colors ${
          isDarkMode ? 'bg-[#0b141a] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('trace')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'trace' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Trace de Decisões (Logs Recentes)</span>
          </button>

          <button
            onClick={() => setActiveTab('compiled_prompt')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'compiled_prompt' 
                ? 'border-purple-500 text-purple-500' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>System Prompt Compilado (Ao Vivo)</span>
          </button>
        </div>

        {/* Conteudo */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
          {activeTab === 'trace' ? (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Exibindo as últimas interações no fluxo da clínica:</span>
                <span className="text-emerald-500 flex items-center gap-1 font-mono font-bold">● Conexão Webhook Ativa</span>
              </div>

              {sampleLogs.map((log) => (
                <div key={log.id} className={`border rounded-2xl p-4 space-y-3 transition-colors ${
                  isDarkMode ? 'bg-[#0b141a] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 ${
                    isDarkMode ? 'border-slate-800/60' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <User className="w-4 h-4 text-blue-500" />
                      <span>{log.patient}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        log.statusColor === 'emerald' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className={`p-3 rounded-xl border space-y-1 ${
                      isDarkMode ? 'bg-[#121b22] border-slate-800/80 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Entrada do Paciente:</span>
                      <p className="italic">"{log.input}"</p>
                    </div>

                    <div className={`p-3 rounded-xl border space-y-1 ${
                      isDarkMode ? 'bg-[#121b22] border-slate-800/80 text-purple-200' : 'bg-white border-slate-200 text-purple-900'
                    }`}>
                      <span className="text-[10px] text-purple-500 font-semibold uppercase tracking-wider block">Intenção Identificada:</span>
                      <p className="font-medium">{log.intent}</p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-start gap-2 text-xs ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800/60' : 'bg-blue-50/50 border-blue-100'
                  }`}>
                    <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-500 mr-2">{log.nodeExecuted}:</span>
                      <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{log.action}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-500 font-medium">
                  Este é o System Prompt expandido com todas as variáveis da sua clínica injetadas:
                </span>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Prompt'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={16}
                value={compiledPrompt}
                className={`w-full border rounded-2xl p-4 font-mono text-xs leading-relaxed focus:outline-none focus:border-purple-500 scrollbar-thin ${
                  isDarkMode ? 'bg-[#0b141a] border-purple-900/40 text-purple-100' : 'bg-slate-50 border-purple-200 text-purple-950'
                }`}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

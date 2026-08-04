import React, { useState } from 'react';
import { MessageSquare, Send, Bot, Zap, CheckCircle2 } from 'lucide-react';
import { useClinic } from '../../../context/ClinicContext';

export default function DevTabWhatsApp({ setMessage }) {
  const { loadData } = useClinic();
  const [patientPhone, setPatientPhone] = useState('(83) 99876-5432');
  const [patientName, setPatientName] = useState('Mariana Alves');
  const [messageText, setMessageText] = useState('Olá! Gostaria de agendar uma consulta de avaliação odontológica para essa semana.');
  const [sending, setSending] = useState(false);

  const predefinedMessages = [
    'Olá! Quanto custa a limpeza de dente?',
    'Preciso remarcar minha consulta de amanhã.',
    'Quais são os horários disponíveis para clareamento?',
    'Estou com dor de dente no siso, vocês atendem urgência?'
  ];

  const handleSimulateIncoming = async () => {
    if (!messageText.trim()) return;
    setSending(true);
    setMessage({ text: 'Simulando webhook de mensagem entrante do WhatsApp...', type: 'info' });

    setTimeout(async () => {
      try {
        if (loadData) await loadData();
        setMessage({ text: `Mensagem de ${patientName} enviada para o canal do WhatsApp com sucesso! 💬`, type: 'success' });
      } catch (err) {
        setMessage({ text: 'Falha ao disparar webhook mock do WhatsApp.', type: 'error' });
      } finally {
        setSending(false);
      }
    }, 600);
  };

  return (
    <div className="space-y-4 font-sans text-left">
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs">
        <Bot className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-emerald-900 dark:text-emerald-300">Simulador de Webhook WhatsApp IA</span>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
            Dispare mensagens entrantes simulando o comportamento de pacientes para testar a caixa de entrada e a resposta automática do Agente IA.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Nome do Paciente</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Telefone WhatsApp</label>
            <input
              type="text"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              className="w-full bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Mensagem do Paciente</label>
          <textarea
            rows={2}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium resize-none"
          />
        </div>

        {/* Sugestões de Mensagens Prontas */}
        <div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider">Modelos Rápidos:</span>
          <div className="flex flex-wrap gap-1.5">
            {predefinedMessages.map((msg, i) => (
              <button
                key={i}
                onClick={() => setMessageText(msg)}
                className="text-[10px] bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300 transition-colors text-left"
              >
                "{msg.substring(0, 30)}..."
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSimulateIncoming}
          disabled={sending || !messageText.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {sending ? <Zap className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Simular Envio de Mensagem Entrante</span>
        </button>
      </div>
    </div>
  );
}

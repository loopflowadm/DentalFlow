import React from 'react';
import { X, MessageSquare } from 'lucide-react';
import WhatsApp from '../pages/whatsapp/WhatsApp';

export default function WhatsAppDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop com blur escuro */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Painel Deslizante da Gaveta */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-4xl bg-[#111827] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header da Gaveta */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white font-title">Central WhatsApp (Atendimento Rápido)</h2>
                <p className="text-[10px] text-slate-400">Gerencie conversas e agendamentos diretos em tempo real</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Fechar Gaveta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conteúdo do WhatsApp */}
          <div className="flex-1 overflow-hidden p-4">
            <WhatsApp />
          </div>

        </div>
      </div>
    </div>
  );
}

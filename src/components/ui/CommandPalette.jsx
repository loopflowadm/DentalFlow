import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, Users, Kanban, DollarSign, Settings, 
  LayoutDashboard, ArrowRight, X, Sparkles, MessageSquare 
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, onNavigate, onOpenWhatsApp }) {
  const [query, setQuery] = useState('');

  // Fechar no Esc e capturar teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'dash', title: 'Ir para Dashboard', category: 'Navegação', icon: LayoutDashboard, tab: 'dashboard' },
    { id: 'agenda', title: 'Ir para Agenda Médica', category: 'Navegação', icon: Calendar, tab: 'agenda' },
    { id: 'pacientes', title: 'Ir para Pacientes & Prontuários', category: 'Navegação', icon: Users, tab: 'pacientes' },
    { id: 'crm', title: 'Ir para Funil CRM (Jornada)', category: 'Navegação', icon: Kanban, tab: 'crm' },
    { id: 'financeiro', title: 'Ir para Gestão Financeira', category: 'Navegação', icon: DollarSign, tab: 'financeiro' },
    { id: 'config', title: 'Ir para Configurações da Clínica', category: 'Navegação', icon: Settings, tab: 'configuracoes' },
    { id: 'wa', title: 'Abrir Central WhatsApp', category: 'Atalho Rápido', icon: MessageSquare, isWhatsApp: true }
  ];

  const filteredActions = actions.filter(act => 
    act.title.toLowerCase().includes(query.toLowerCase()) ||
    act.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (act) => {
    if (act.isWhatsApp && onOpenWhatsApp) {
      onOpenWhatsApp();
    } else if (act.tab && onNavigate) {
      onNavigate(act.tab);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Raycast Modal Window */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl p-4">
        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-left text-white">
          
          {/* Input de Busca */}
          <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-black/50">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Digite um comando ou busque uma tela... (ex: Agenda, Paciente)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lista de Resultados */}
          <div className="p-2 max-h-80 overflow-y-auto space-y-1 scrollbar-thin">
            {filteredActions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={() => handleSelect(act)}
                  className="w-full p-3 rounded-xl hover:bg-[#196BFB]/15 hover:border-[#196BFB]/30 border border-transparent flex items-center justify-between transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 group-hover:text-blue-400 group-hover:border-blue-500/30">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white font-title">{act.title}</h4>
                      <span className="text-[9px] text-slate-500 font-semibold">{act.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}

            {filteredActions.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhum comando encontrado para "{query}"
              </div>
            )}
          </div>

          {/* Footer Raycast Style */}
          <div className="px-4 py-2 bg-slate-950/60 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-bold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>FlowDent Quick Navigation</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] text-slate-400 border border-white/5">esc</kbd>
              <span>para fechar</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

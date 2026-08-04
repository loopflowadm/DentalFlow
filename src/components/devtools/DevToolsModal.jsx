import React, { useState } from 'react';
import { 
  Code, X, Database, UserCheck, MessageSquare, ShieldCheck, Monitor, Sparkles
} from 'lucide-react';
import DevTabMockData from './tabs/DevTabMockData';
import DevTabRolesTenant from './tabs/DevTabRolesTenant';
import DevTabWhatsApp from './tabs/DevTabWhatsApp';
import DevTabInspector from './tabs/DevTabInspector';
import DevTabUIDebug from './tabs/DevTabUIDebug';

export default function DevToolsModal({ isOpen, onClose, showBreakpointBadge, setShowBreakpointBadge }) {
  const [activeTab, setActiveTab] = useState('mock');
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const tabs = [
    { id: 'mock', label: 'Dados & Mock', icon: Database },
    { id: 'roles', label: 'Perfil & Tenant', icon: UserCheck },
    { id: 'whatsapp', label: 'Simulador WA', icon: MessageSquare },
    { id: 'inspector', label: 'Inspetor', icon: ShieldCheck },
    { id: 'ui', label: 'Debug Visual', icon: Monitor },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden text-left font-sans flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white font-title flex items-center gap-2">
                DevTools Suite v2.0
                <span className="text-[9px] font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Dev Mode
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Suite integrada de testes, mocks e diagnósticos do OdontoCRM.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-100/70 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 overflow-x-auto shrink-0 scrollbar-none">
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Feedback Banner */}
          {message && (
            <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between animate-in fade-in duration-150 ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300' :
              message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300' :
              'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300'
            }`}>
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="opacity-60 hover:opacity-100 p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeTab === 'mock' && <DevTabMockData setMessage={setMessage} />}
          {activeTab === 'roles' && <DevTabRolesTenant setMessage={setMessage} />}
          {activeTab === 'whatsapp' && <DevTabWhatsApp setMessage={setMessage} />}
          {activeTab === 'inspector' && <DevTabInspector setMessage={setMessage} />}
          {activeTab === 'ui' && (
            <DevTabUIDebug 
              showBreakpointBadge={showBreakpointBadge} 
              setShowBreakpointBadge={setShowBreakpointBadge}
              setMessage={setMessage} 
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-[#070A11] px-6 py-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center shrink-0 text-xs">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            Atalhos: <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-white/10 rounded">Ctrl+Shift+D</kbd> ou <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-white/10 rounded">⌘+Shift+D</kbd>
          </span>
          <button
            onClick={onClose}
            className="bg-slate-200 dark:bg-white/10 hover:bg-slate-300 text-slate-800 dark:text-white font-bold text-xs px-4 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}

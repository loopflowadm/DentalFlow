import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Search, Sun, Moon, Sparkles, Building, ChevronDown, Check } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import { mockDb } from '../lib/mockDatabase';

export default function Header({ activeTab, onSearchChange }) {
  const { user, clinic, selectClinic, supabaseActive } = useAuth();
  const { currentTheme, darkMode, toggleDarkMode } = useTheme();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showClinicSelector, setShowClinicSelector] = useState(false);

  // Mocks de Notificações
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Falta Recebida', text: 'Maria Oliveira cancelou a consulta de amanhã.', time: 'há 5 min', read: false },
    { id: 2, title: 'Novo Lead', text: 'Carlos Albuquerque se cadastrou pelo Instagram Ads.', time: 'há 10 min', read: false },
    { id: 3, title: 'Intervenção da IA', text: 'Sofia pausou o bot para João Silva. Responda no WhatsApp.', time: 'há 1 hora', read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clinics = mockDb.getClinics();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {/* Breadcrumbs */}
        <div className="flex items-center">
          <Breadcrumbs activeTab={activeTab} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Seletor de Clínica para SuperAdmin */}
        {user?.role === 'SUPER_ADMIN' && (
          <div className="relative">
            <button
              onClick={() => setShowClinicSelector(!showClinicSelector)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all border border-slate-200/50 dark:border-slate-700/50"
            >
              <Building className="w-3.5 h-3.5" />
              <span>{clinic?.name || 'Administrando SaaS'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showClinicSelector && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-850 shadow-xl border border-slate-150 dark:border-slate-800 p-1.5 z-50 text-slate-800 dark:text-white">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Selecionar Clínica
                </div>
                <button
                  onClick={() => {
                    selectClinic(null);
                    setShowClinicSelector(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                    !clinic 
                      ? 'bg-violet-500/10 text-violet-500' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350'
                  }`}
                >
                  <span>Geral / Todos</span>
                  {!clinic && <Check className="w-3.5 h-3.5" />}
                </button>
                {clinics.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      selectClinic(c);
                      setShowClinicSelector(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-left mt-0.5 ${
                      clinic?.id === c.id 
                        ? 'bg-violet-500/10 text-violet-500' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350'
                    }`}
                  >
                    <span>{c.name}</span>
                    {clinic?.id === c.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alternador de Tema Escuro / Claro */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/40 dark:border-slate-800/80 active:scale-95 transition-all text-slate-500 hover:text-slate-800 dark:hover:text-white"
          title={darkMode ? "Ativar Tema Claro" : "Ativar Tema Escuro"}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-500 fill-amber-550/20" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notificações */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all border border-slate-200/50 dark:border-slate-700/50 relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-850 shadow-xl border border-slate-150 dark:border-slate-800 p-4 z-50">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Notificações</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                  >
                    Marcar tudo como lido
                  </button>
                )}
              </div>
              
              <div className="py-1 max-h-72 overflow-y-auto space-y-1.5 mt-1.5">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-2.5 rounded-xl transition-all border text-xs text-left relative ${
                      n.read 
                        ? 'bg-transparent border-transparent text-slate-500 dark:text-slate-400' 
                        : 'bg-violet-500/5 dark:bg-violet-500/10 border-violet-500/10 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {!n.read && (
                      <span className="absolute right-3 top-3 w-1.5 h-1.5 bg-violet-500 rounded-full" />
                    )}
                    <h4 className="font-bold text-slate-800 dark:text-white">{n.title}</h4>
                    <p className="text-[11px] mt-0.5 leading-relaxed">{n.text}</p>
                    <span className="text-[9px] text-slate-400 mt-1 block font-semibold">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Perfil & Avatar */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-bold text-slate-800 dark:text-white">{user?.full_name}</span>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-slate-250 dark:border-slate-800 bg-secondary text-white font-bold flex items-center justify-center text-xs" style={{ backgroundColor: currentTheme.secondary_color }}>
            {user?.full_name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}

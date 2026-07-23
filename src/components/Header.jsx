import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  IconBell, 
  IconSearch, 
  IconSun, 
  IconMoon, 
  IconSparkles, 
  IconBuilding, 
  IconChevronDown, 
  IconCheck, 
  IconLogout, 
  IconX,
  IconPlus,
  IconCalendar,
  IconUserPlus,
  IconLayoutKanban,
  IconCurrencyDollar,
  IconBrandWhatsapp
} from '@tabler/icons-react';
import Breadcrumbs from './Breadcrumbs';
import { mockDb } from '../lib/mockDatabase';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Header({ activeTab, onSearchChange, onOpenWhatsApp, onQuickAction, onOpenCmdPalette }) {
  const { user, clinic, selectClinic, supabaseActive, logout } = useAuth();
  const { currentTheme, themeMode, setThemeMode } = useTheme();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showClinicSelector, setShowClinicSelector] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Estado da busca expansível
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Notificações
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clinics = mockDb.getClinics();

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
      {/* Esquerda: Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3.5">
          <Breadcrumbs activeTab={activeTab} />
          {!isSupabaseConfigured && (
            <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[9px] rounded-full uppercase tracking-wider select-none animate-pulse">
              Modo Demo (Sem BD)
            </span>
          )}
        </div>
      </div>

      {/* Direita: Grupo Único de Ações (Busca Lupa, + Novo, WhatsApp, Tema, Notificações, Perfil) */}
      <div className="flex items-center gap-2.5">
        
        {/* Ícone de Busca Expansível */}
        <div className="relative flex items-center">
          {!searchExpanded ? (
            <button
              onClick={() => setSearchExpanded(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-[#1A2333] dark:hover:bg-[#222d42] border border-slate-200/80 dark:border-white/10 active:scale-95 transition-all text-slate-700 dark:text-slate-300"
              title="Buscar no sistema"
            >
              <IconSearch className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2.5 h-9 w-56 sm:w-64 px-3 bg-slate-100 dark:bg-[#1A2333] border border-slate-200/80 dark:border-white/10 rounded-xl transition-all duration-300 animate-in fade-in zoom-in-95 duration-150">
              <IconSearch className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Buscar no sistema..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchExpanded(false);
                    setSearchQuery('');
                  } else if (e.key === 'Enter') {
                    if (onOpenCmdPalette) onOpenCmdPalette();
                  }
                }}
                onBlur={() => {
                  if (!searchQuery) {
                    setSearchExpanded(false);
                  }
                }}
                className="w-full bg-transparent text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none font-medium"
              />
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchExpanded(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
                title="Fechar busca"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Botão de Ação Rápida (+ Novo) Padronizado */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="h-9 flex items-center gap-1.5 px-3.5 bg-[#196BFB] hover:bg-[#155bd8] text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
            style={{ backgroundColor: currentTheme.secondary_color }}
          >
            <IconPlus className="w-4 h-4 stroke-[3]" />
            <span>Novo</span>
            <IconChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#111827] shadow-2xl border border-slate-200/80 dark:border-white/10 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
              <div className="px-3 py-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200/80 dark:border-slate-800">
                Ações Rápidas em 1 Clique
              </div>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  if (onQuickAction) onQuickAction('agenda');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors mt-1"
              >
                <IconCalendar className="w-4 h-4 text-blue-500" />
                <span>Nova Consulta</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  if (onQuickAction) onQuickAction('paciente');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                <IconUserPlus className="w-4 h-4 text-emerald-500" />
                <span>Novo Paciente</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  if (onQuickAction) onQuickAction('lead');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                <IconLayoutKanban className="w-4 h-4 text-sky-500" />
                <span>Novo Lead CRM</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  if (onQuickAction) onQuickAction('whatsapp');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                <IconBrandWhatsapp className="w-4 h-4 text-emerald-500" />
                <span>Abrir WhatsApp Completo</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  if (onQuickAction) onQuickAction('financeiro');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                <IconCurrencyDollar className="w-4 h-4 text-amber-500" />
                <span>Lançar Receita/Despesa</span>
              </button>
            </div>
          )}
        </div>

        {/* Seletor de Clínica para SuperAdmin ou Plano Enterprise */}
        {(user?.role === 'SUPER_ADMIN' || clinic?.plan_type === 'enterprise') && (
          <div className="relative">
            <button
              onClick={() => setShowClinicSelector(!showClinicSelector)}
              className="h-9 flex items-center gap-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#1A2333] dark:hover:bg-[#222d42] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all border border-slate-200/80 dark:border-white/10"
            >
              <IconBuilding className="w-3.5 h-3.5 text-blue-500" />
              <span>{clinic?.name || 'Administrando SaaS'}</span>
              {clinic?.plan_type === 'enterprise' && (
                <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-black rounded uppercase">
                  Multi-Filial
                </span>
              )}
              <IconChevronDown className="w-3 h-3" />
            </button>

            {showClinicSelector && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#111827] shadow-xl border border-slate-200/80 dark:border-white/10 p-1.5 z-50 text-slate-800 dark:text-white">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Alternar Clínica / Filial
                </div>
                <button
                  onClick={() => {
                    selectClinic(null);
                    setShowClinicSelector(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                    !clinic 
                      ? 'bg-blue-500/10 text-blue-500' 
                      : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>Visão Consolidada</span>
                  {!clinic && <IconCheck className="w-3.5 h-3.5" />}
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
                        ? 'bg-blue-500/10 text-blue-500' 
                        : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{c.name}</span>
                    {clinic?.id === c.id && <IconCheck className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alternador de 3 Temas Padronizado (w-9 h-9) */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-[#1A2333] dark:hover:bg-[#222d42] border border-slate-200/80 dark:border-white/10 active:scale-95 transition-all text-slate-700 dark:text-slate-300"
            title="Alterar Tema"
          >
            {themeMode === 'light' && <IconSun className="w-4 h-4 text-amber-500" />}
            {themeMode === 'dark' && <IconMoon className="w-4 h-4 text-indigo-400" />}
            {themeMode === 'clinic' && <IconSparkles className="w-4 h-4 text-emerald-500" />}
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-[#111827] shadow-xl border border-slate-200/80 dark:border-white/10 p-1.5 z-50 text-slate-800 dark:text-white text-xs">
              <button
                onClick={() => {
                  setThemeMode('light');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg font-semibold text-left transition-all ${
                  themeMode === 'light' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <IconSun className="w-3.5 h-3.5 text-amber-500" />
                <span>Tema Claro</span>
              </button>
              <button
                onClick={() => {
                  setThemeMode('dark');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg font-semibold text-left transition-all mt-0.5 ${
                  themeMode === 'dark' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <IconMoon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tema Escuro</span>
              </button>
              <button
                onClick={() => {
                  setThemeMode('clinic');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg font-semibold text-left transition-all mt-0.5 ${
                  themeMode === 'clinic' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <IconSparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tema da Empresa</span>
              </button>
            </div>
          )}
        </div>

        {/* Notificações Padronizado (w-9 h-9) */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-[#1A2333] dark:hover:bg-[#222d42] text-slate-700 dark:text-slate-300 transition-all border border-slate-200/80 dark:border-white/10 active:scale-95 relative"
            title="Notificações"
          >
            <IconBell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#111827] shadow-xl border border-slate-200/80 dark:border-white/10 p-4 z-50">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Notificações</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Marcar tudo como lido
                  </button>
                )}
              </div>
              
              <div className="py-1 max-h-72 overflow-y-auto space-y-1.5 mt-1.5">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-2.5 rounded-xl transition-all border text-xs text-left relative ${
                        n.read 
                          ? 'bg-transparent border-transparent text-slate-500 dark:text-slate-400' 
                          : 'bg-blue-500/10 border-blue-500/20 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {!n.read && (
                        <span className="absolute right-3 top-3 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      )}
                      <h4 className="font-bold text-slate-800 dark:text-white">{n.title}</h4>
                      <p className="text-[11px] mt-0.5 leading-relaxed">{n.text}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block font-semibold">{n.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1.5">
                    <IconBell className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sem novas notificações</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Perfil & Avatar Padronizado (w-9 h-9 rounded-xl) */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-white/10 bg-[#196BFB] hover:bg-[#155bd8] text-white font-bold flex items-center justify-center text-xs cursor-pointer select-none shadow-sm active:scale-95 transition-all"
            style={{ backgroundColor: currentTheme.secondary_color }}
            title="Perfil do Usuário"
          >
            {user?.full_name?.charAt(0) || 'D'}
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#111827] shadow-xl border border-slate-200/80 dark:border-white/10 p-1.5 z-50 text-slate-800 dark:text-white animate-in fade-in slide-in-from-top-1 duration-150 text-left">
              <div className="px-2.5 py-2 border-b border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-black text-slate-800 dark:text-white block truncate">{user?.full_name || 'Doutor(a)'}</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mt-0.5">{user?.role === 'CLINIC_OWNER' || user?.role === 'CLINIC_ADMIN' ? 'Administrador' : user?.role === 'DOCTOR' ? 'Cirurgião-Dentista' : 'Administrador'}</span>
              </div>
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  logout();
                }}
                className="w-full mt-1.5 flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
              >
                <IconLogout className="w-3.5 h-3.5" />
                <span>Sair do Sistema</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

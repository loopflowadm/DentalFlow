import React, { useState, useEffect, useRef } from 'react';
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
  IconUser,
  IconUserPlus,
  IconLayoutKanban,
  IconCurrencyDollar,
  IconBrandWhatsapp,
  IconFilter,
  IconCode
} from '@tabler/icons-react';
import Breadcrumbs from './Breadcrumbs';
import { mockDb } from '../lib/mockDatabase';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Header({ activeTab, onSearchChange, onOpenWhatsApp, onQuickAction, onOpenCmdPalette, onOpenDevTools, collapsed, setCollapsed }) {
  const { user, clinic, selectClinic, supabaseActive, logout } = useAuth();
  const { currentTheme, themeMode, setThemeMode } = useTheme();
  
  const headerRef = useRef(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showClinicSelector, setShowClinicSelector] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Fecha todos os menus abertos
  const closeAllDropdowns = () => {
    setShowQuickMenu(false);
    setShowThemeMenu(false);
    setShowNotifications(false);
    setShowUserDropdown(false);
    setShowClinicSelector(false);
  };

  // Alternadores exclusivos (abre o clicado e fecha todos os outros)
  const toggleQuickMenu = (e) => {
    if (e) e.stopPropagation();
    const nextState = !showQuickMenu;
    closeAllDropdowns();
    setShowQuickMenu(nextState);
  };

  const toggleThemeMenu = (e) => {
    if (e) e.stopPropagation();
    const nextState = !showThemeMenu;
    closeAllDropdowns();
    setShowThemeMenu(nextState);
  };

  const toggleNotifications = (e) => {
    if (e) e.stopPropagation();
    const nextState = !showNotifications;
    closeAllDropdowns();
    setShowNotifications(nextState);
  };

  const toggleUserDropdown = (e) => {
    if (e) e.stopPropagation();
    const nextState = !showUserDropdown;
    closeAllDropdowns();
    setShowUserDropdown(nextState);
  };

  // Listener para fechar os menus ao clicar fora do Header
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        closeAllDropdowns();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <header ref={headerRef} className="h-16 border-b border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-[#0D0D0D]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
      {/* Esquerda: Breadcrumbs e Botão de Filtro SubSidebar */}
      <div className="flex items-center gap-2 sm:gap-4">
        {['crm', 'pacientes', 'agenda'].includes(activeTab) && setCollapsed && (
          <button
            onClick={() => setCollapsed(prev => !prev)}
            className="flex lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition-colors items-center gap-1.5 text-xs font-bold shadow-xs active:scale-95"
            title="Abrir painel de filtros"
          >
            <IconFilter className="w-4 h-4 text-[#196BFB] dark:text-blue-400" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        )}

        <div className="flex items-center gap-3.5">
          <Breadcrumbs activeTab={activeTab} />
          {!isSupabaseConfigured && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[9px] rounded-full uppercase tracking-wider select-none animate-pulse">
              Modo Demo (Sem BD)
            </span>
          )}
        </div>
      </div>

      {/* Direita: Grupo Único de Ações (DevTools, Busca Lupa, + Novo, Tema, Notificações, Perfil) */}
      <div className="flex items-center gap-2.5">
        
        {/* Botão Opções de Desenvolvedor (Dev Tools) - Apenas Ícone à esquerda da Busca */}
        {(import.meta.env.DEV || user?.role === 'superadmin' || user?.role === 'developer' || user?.is_superadmin) && (
          <button
            onClick={onOpenDevTools}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 active:scale-95 transition-all cursor-pointer shadow-xs"
            title="Opções de Desenvolvedor (⌘+Shift+D)"
          >
            <IconCode className="w-4 h-4 text-amber-500" />
          </button>
        )}

        {/* Ícone de Busca Expansível */}
        <div className="relative flex items-center">
          {!searchExpanded ? (
            <button
              onClick={() => setSearchExpanded(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-[#0D0D0D] dark:hover:bg-[#18181B] border border-slate-200/80 dark:border-white/10 active:scale-95 transition-all text-slate-700 dark:text-slate-300"
              title="Buscar no sistema"
            >
              <IconSearch className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2.5 h-9 w-56 sm:w-64 px-3 bg-slate-100 dark:bg-[#0D0D0D] border border-slate-200/80 dark:border-white/10 rounded-xl transition-all duration-300 animate-in fade-in zoom-in-95 duration-150">
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
            onClick={toggleQuickMenu}
            className="h-9 flex items-center gap-1.5 px-3.5 bg-[#196BFB] hover:bg-[#155bd8] text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            style={{ backgroundColor: currentTheme.secondary_color }}
          >
            <IconPlus className="w-4 h-4 stroke-[3]" />
            <span>Novo</span>
            <IconChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#0D0D0D] shadow-2xl border border-slate-200/80 dark:border-white/10 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
              <div className="px-3 py-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200/80 dark:border-slate-800">
                Ações Rápidas em 1 Clique
              </div>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  if (onQuickAction) onQuickAction('agenda');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <IconCalendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Agendar Consulta</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  if (onQuickAction) onQuickAction('paciente');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors mt-0.5"
              >
                <IconUser className="w-3.5 h-3.5 text-emerald-500" />
                <span>Novo Paciente</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  if (onQuickAction) onQuickAction('lead');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors mt-0.5"
              >
                <IconSparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Novo Lead CRM</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  if (onQuickAction) onQuickAction('whatsapp');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors mt-0.5"
              >
                <IconBrandWhatsapp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Abrir WhatsApp Web</span>
              </button>
            </div>
          )}
        </div>

        {/* Alternador de 3 Temas Padronizado (w-9 h-9) */}
        <div className="relative">
          <button
            onClick={toggleThemeMenu}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-[#0D0D0D] dark:hover:bg-[#18181B] border border-slate-200/80 dark:border-white/10 active:scale-95 transition-all text-slate-700 dark:text-slate-300"
            title="Alterar Tema"
          >
            {themeMode === 'light' && <IconSun className="w-4 h-4 text-amber-500" />}
            {themeMode === 'dark' && <IconMoon className="w-4 h-4 text-indigo-400" />}
            {themeMode === 'clinic' && <IconSparkles className="w-4 h-4 text-emerald-500" />}
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-[#0D0D0D] shadow-xl border border-slate-200/80 dark:border-white/10 p-1.5 z-50 text-slate-800 dark:text-white text-xs">
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
            onClick={toggleNotifications}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-[#0D0D0D] dark:hover:bg-[#18181B] text-slate-700 dark:text-slate-300 transition-all border border-slate-200/80 dark:border-white/10 active:scale-95 relative"
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
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#0D0D0D] shadow-xl border border-slate-200/80 dark:border-white/10 p-4 z-50">
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
                      onClick={() => {
                        if (onOpenWhatsApp) onOpenWhatsApp();
                        setShowNotifications(false);
                      }}
                      className={`p-2.5 rounded-xl transition-all border text-xs text-left relative cursor-pointer hover:border-[#00a884]/50 active:scale-[0.99] ${
                        n.read 
                          ? 'bg-transparent border-transparent text-slate-500 dark:text-slate-400' 
                          : 'bg-emerald-500/10 border-emerald-500/20 text-slate-800 dark:text-slate-200'
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
            onClick={toggleUserDropdown}
            className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-white/10 bg-[#196BFB] hover:bg-[#155bd8] text-white font-bold flex items-center justify-center text-xs cursor-pointer select-none shadow-sm active:scale-95 transition-all"
            style={{ backgroundColor: currentTheme.secondary_color }}
            title="Perfil do Usuário"
          >
            {user?.full_name?.charAt(0) || 'D'}
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#0D0D0D] shadow-xl border border-slate-200/80 dark:border-white/10 p-1.5 z-50 text-slate-800 dark:text-white animate-in fade-in slide-in-from-top-1 duration-150 text-left">
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

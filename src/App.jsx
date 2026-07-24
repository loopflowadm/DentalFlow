import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { ClinicProvider } from './context/ClinicContext';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import ClinicApp from './pages/ClinicApp';
import LandingPage from './pages/LandingPage';
import Logo from './components/Logo';

function App() {
  const { user, clinic, loading } = useAuth();
  const { themeMode, currentTheme } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
  const [authInitialView, setAuthInitialView] = useState('login');

  const isDarkMode = themeMode === 'dark' || (themeMode === 'clinic' && currentTheme?.theme_base === 'dark');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden transition-colors duration-500 bg-slate-50 text-slate-800 dark:bg-black dark:text-white">
        {/* Glow de fundo sutil */}
        <div className="absolute w-[450px] h-[450px] rounded-full blur-[130px] pointer-events-none transition-all duration-500 bg-blue-400/15 dark:bg-[#196BFB]/15 -top-20 -left-20" />
        <div className="absolute w-[450px] h-[450px] rounded-full blur-[130px] pointer-events-none transition-all duration-500 bg-indigo-300/20 dark:bg-indigo-500/15 -bottom-20 -right-20" />

        <style>{`
          @keyframes loadingSweep {
            0% { left: -50%; }
            100% { left: 100%; }
          }
          .animate-loading-sweep {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 50%;
            background: linear-gradient(90deg, transparent, #196BFB, transparent);
            animation: loadingSweep 1.3s infinite cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>

        <div className="flex flex-col items-center z-10 space-y-4 select-none">
          {/* Logo oficial da marca com brilho focado diretamente no símbolo da denteira */}
          <div className="relative flex items-center justify-center py-1">
            {/* Brilho suave sob o símbolo vetorial fluido */}
            <div className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full blur-2xl animate-pulse bg-blue-500/30 dark:bg-[#196BFB]/45 pointer-events-none" />
            <Logo collapsed={false} className="w-52 sm:w-60 h-auto relative z-10 drop-shadow-[0_4px_20px_rgba(25,107,251,0.35)]" />
          </div>

          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
            Sistema de Gestão Odontológica
          </p>

          {/* Barra de Carregamento Ultra-Clean */}
          <div className="flex flex-col items-center space-y-2.5 pt-1">
            <div className="w-44 h-[3px] rounded-full overflow-hidden relative bg-slate-200 dark:bg-slate-800">
              <div className="animate-loading-sweep" />
            </div>

            <span className="text-[10px] font-bold tracking-wider uppercase animate-pulse text-slate-500 dark:text-slate-400">
              Carregando ambiente seguro...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Roteamento condicional baseado na autenticação e nas permissões (RBAC)
  if (!user) {
    if (showAuth) {
      return (
        <Login 
          initialView={authInitialView} 
          onBack={() => setShowAuth(false)} 
        />
      );
    }
    return (
      <LandingPage 
        onLogin={() => {
          setAuthInitialView('login');
          setShowAuth(true);
        }}
        onRegister={() => {
          setAuthInitialView('register');
          setShowAuth(true);
        }}
      />
    );
  }

  if (user.role === 'SUPER_ADMIN' && !clinic) {
    return <SuperAdmin />;
  }

  return (
    <ClinicProvider>
      <ClinicApp />
    </ClinicProvider>
  );
}

export default App;

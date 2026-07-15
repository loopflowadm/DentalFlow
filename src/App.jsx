import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import ClinicApp from './pages/ClinicApp';
import LandingPage from './pages/LandingPage';
import Logo from './components/Logo';

function App() {
  const { user, clinic, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authInitialView, setAuthInitialView] = useState('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-white font-sans relative overflow-hidden">
        {/* Efeito de brilho de fundo */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[100px] -top-40 -left-40 pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[100px] -bottom-40 -right-40 pointer-events-none" />

        <style>{`
          @keyframes loadingSweep {
            0% { left: -40%; }
            100% { left: 100%; }
          }
          .animate-loading-sweep {
            position: absolute;
            height: 100%;
            width: 40%;
            background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.4), transparent);
            animation: loadingSweep 1.5s infinite ease-in-out;
          }
        `}</style>

        <div className="flex flex-col items-center z-10 space-y-6">
          {/* Logo oficial da clínica (Dente + Texto) */}
          <div className="animate-pulse" style={{ animationDuration: '2.5s' }}>
            <Logo collapsed={false} className="w-56 h-auto filter drop-shadow-[0_0_20px_rgba(56,189,248,0.15)]" />
          </div>

          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
            Sistema de Gestão Odontológica
          </p>

          {/* Barra de Progresso do Loader */}
          <div className="w-40 h-[3px] bg-slate-800 rounded-full overflow-hidden relative">
            <div className="animate-loading-sweep" />
          </div>

          <span className="text-[10px] text-slate-450 font-medium tracking-wider uppercase animate-pulse">
            Carregando ambiente seguro...
          </span>
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

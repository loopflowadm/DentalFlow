import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import ClinicApp from './pages/ClinicApp';
import LandingPage from './pages/LandingPage';
import { Shield } from 'lucide-react';

function App() {
  const { user, clinic, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authInitialView, setAuthInitialView] = useState('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-slate-400 font-medium tracking-wider uppercase animate-pulse">
          Inicializando OdontoCRM...
        </span>
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

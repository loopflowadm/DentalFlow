import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockDb } from '../lib/mockDatabase';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

const unpackClinicData = (clinic) => {
  if (!clinic) return null;
  const logo = clinic.logo_url || '';
  if (logo.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(logo);
      return {
        ...clinic,
        logo_url: parsed.logo_url || '',
        accent_color: parsed.accent_color || '#D9E2FF',
        font_family: parsed.font_family || 'Geist',
        theme_base: parsed.theme_base || 'light',
        favicon_url: parsed.favicon_url || '',
        login_title: parsed.login_title || 'Bem-vindo ao seu portal',
        login_bg: parsed.login_bg || '',
        address: parsed.address || null,
        plan_type: parsed.plan_type || clinic.plan_type || 'professional',
        trial_ends_at: parsed.trial_ends_at || clinic.trial_ends_at || null,
        onboarding_completed: parsed.onboarding_completed ?? clinic.onboarding_completed ?? false
      };
    } catch (e) {
      console.error('Failed to parse clinic whitelabel config from logo_url:', e);
    }
  }
  return {
    ...clinic,
    accent_color: clinic.accent_color || '#D9E2FF',
    font_family: clinic.font_family || 'Geist',
    theme_base: clinic.theme_base || 'light',
    favicon_url: clinic.favicon_url || '',
    login_title: clinic.login_title || 'Bem-vindo ao seu portal',
    login_bg: clinic.login_bg || '',
    address: null,
    plan_type: clinic.plan_type || 'professional',
    trial_ends_at: clinic.trial_ends_at || null,
    onboarding_completed: clinic.onboarding_completed ?? false
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [clinic, setClinic] = useState(() => {
    try {
      const saved = localStorage.getItem('df_session_clinic');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return (parsed && typeof parsed === 'object' && parsed.id) ? parsed : null;
    } catch (e) {
      console.warn('Erro ao ler sessão armazenada da clínica:', e);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const supabaseActive = true;
  const setSupabaseActive = () => {};
  const { applyTheme, resetTheme } = useTheme();

  // Função para carregar as informações da clínica baseada no ID
  const fetchClinicData = async (clinicId) => {
    if (!clinicId) return null;
    
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .single();
      if (error) throw error;
      return unpackClinicData(data);
    } catch (err) {
      console.error('Erro ao buscar dados da clínica no Supabase:', err);
      return null;
    }
  };

  // Função para carregar as informações da clínica baseada no subdomínio
  const fetchClinicBySubdomain = async (subdomain) => {
    if (!subdomain) return null;
    
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('subdomain', subdomain)
        .single();
      if (error) throw error;
      return unpackClinicData(data);
    } catch (err) {
      console.error('Erro ao buscar clínica por subdomínio no Supabase:', err);
      return null;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (!error && data?.user) {
          // Buscar dados do perfil do usuário logado
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            const sessionUser = {
              id: data.user.id,
              email: data.user.email,
              role: profile.role,
              full_name: profile.full_name,
              phone: profile.phone || data.user.user_metadata?.phone || '',
              clinic_id: profile.clinic_id
            };

            setUser(sessionUser);
            localStorage.setItem('df_session_user', JSON.stringify(sessionUser));

            if (profile.clinic_id) {
              const clinicData = await fetchClinicData(profile.clinic_id);
              setClinic(clinicData);
              if (clinicData) {
                localStorage.setItem('df_session_clinic', JSON.stringify(clinicData));
                applyTheme(clinicData);
              }
            } else {
              setClinic(null);
              localStorage.removeItem('df_session_clinic');
              resetTheme();
            }
            setLoading(false);
            return { success: true, user: sessionUser };
          }
        }
      }

      // Fallback para Modo Demo (mockDb)
      const mockUsers = mockDb.getUsers();
      const matchedUser = mockUsers.find(u => u.email?.toLowerCase() === email?.toLowerCase() && u.password === password);

      if (matchedUser) {
        const sessionUser = {
          id: matchedUser.id,
          email: matchedUser.email,
          role: matchedUser.role,
          full_name: matchedUser.full_name,
          phone: matchedUser.phone || '',
          clinic_id: matchedUser.clinic_id
        };

        setUser(sessionUser);
        localStorage.setItem('df_session_user', JSON.stringify(sessionUser));

        if (matchedUser.clinic_id) {
          const clinics = mockDb.getClinics();
          const clinicData = clinics.find(c => c.id === matchedUser.clinic_id) || unpackClinicData(clinics[0]);
          setClinic(clinicData);
          if (clinicData) {
            localStorage.setItem('df_session_clinic', JSON.stringify(clinicData));
            applyTheme(clinicData);
          }
        } else {
          setClinic(null);
          localStorage.removeItem('df_session_clinic');
          resetTheme();
        }

        setLoading(false);
        return { success: true, user: sessionUser };
      }

      // Se não encontrou no mockDb e estamos em Modo Demo (sem Supabase real), auto-cadastrar o usuário demo
      if (!isSupabaseConfigured && email) {
        const clinics = mockDb.getClinics();
        const defaultClinic = clinics[0];
        const newDemoUser = {
          id: 'user-' + Math.random().toString(36).substr(2, 9),
          email: email.trim().toLowerCase(),
          password: password || '123',
          role: 'CLINIC_ADMIN',
          full_name: email.split('@')[0] || 'Usuário Demo',
          phone: '',
          clinic_id: defaultClinic?.id || 'clinic-sorriso-perfeito'
        };
        mockDb.saveUser(newDemoUser);

        const sessionUser = {
          id: newDemoUser.id,
          email: newDemoUser.email,
          role: newDemoUser.role,
          full_name: newDemoUser.full_name,
          phone: newDemoUser.phone,
          clinic_id: newDemoUser.clinic_id
        };

        setUser(sessionUser);
        localStorage.setItem('df_session_user', JSON.stringify(sessionUser));
        if (defaultClinic) {
          const clinicData = unpackClinicData(defaultClinic);
          setClinic(clinicData);
          localStorage.setItem('df_session_clinic', JSON.stringify(clinicData));
          applyTheme(clinicData);
        }

        setLoading(false);
        return { success: true, user: sessionUser };
      }

      setLoading(false);
      return { success: false, error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
    } catch (err) {
      console.warn('Falha de login no Supabase, tentando Modo Demo (mockDb):', err.message);

      // Fallback de contingência mockDb
      const mockUsers = mockDb.getUsers();
      const matchedUser = mockUsers.find(u => u.email?.toLowerCase() === email?.toLowerCase() && u.password === password) ||
                          (!isSupabaseConfigured ? mockUsers[0] : null);

      if (matchedUser) {
        const sessionUser = {
          id: matchedUser.id,
          email: matchedUser.email,
          role: matchedUser.role,
          full_name: matchedUser.full_name,
          phone: matchedUser.phone || '',
          clinic_id: matchedUser.clinic_id
        };

        setUser(sessionUser);
        localStorage.setItem('df_session_user', JSON.stringify(sessionUser));

        if (matchedUser.clinic_id) {
          const clinics = mockDb.getClinics();
          const clinicData = clinics.find(c => c.id === matchedUser.clinic_id) || unpackClinicData(clinics[0]);
          setClinic(clinicData);
          if (clinicData) {
            localStorage.setItem('df_session_clinic', JSON.stringify(clinicData));
            applyTheme(clinicData);
          }
        }

        setLoading(false);
        return { success: true, user: sessionUser };
      }

      setLoading(false);
      return { success: false, error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Erro ao deslogar no Supabase:', e);
    }
    setUser(null);
    setClinic(null);
    resetTheme();
    localStorage.removeItem('df_session_user');
    localStorage.removeItem('df_session_clinic');
    setLoading(false);
  };

  const checkSession = async () => {
    setLoading(true);

    // Detectar e aplicar tema por subdomínio antes de carregar sessão, para ter o Whitelabel imediato
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    let subdomain = null;
    if (parts.length > 1) {
      const sub = parts[0].toLowerCase();
      if (sub !== 'www' && sub !== 'localhost') {
        subdomain = sub;
      }
    }

    if (subdomain) {
      const clinicData = await fetchClinicBySubdomain(subdomain);
      if (clinicData) {
        setClinic(clinicData);
        applyTheme(clinicData);
      }
    }

    // Verificar se há uma sessão válida no Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const sessionUser = {
            id: session.user.id,
            email: session.user.email,
            role: profile.role,
            full_name: profile.full_name,
            phone: profile.phone || session.user.user_metadata?.phone || '',
            clinic_id: profile.clinic_id
          };
          setUser(sessionUser);
          localStorage.setItem('df_session_user', JSON.stringify(sessionUser));

          if (profile.clinic_id) {
            const clinicData = await fetchClinicData(profile.clinic_id);
            setClinic(clinicData);
            if (clinicData) {
              localStorage.setItem('df_session_clinic', JSON.stringify(clinicData));
              applyTheme(clinicData);
            }
          }
        } else {
          // Limpar se o perfil não existe
          setUser(null);
          setClinic(null);
          localStorage.removeItem('df_session_user');
          localStorage.removeItem('df_session_clinic');
        }
      } else {
        // Recuperar a sessão salva no localStorage (suporte a contas de teste e SuperAdmin)
        const savedUserStr = localStorage.getItem('df_session_user');
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            if (savedUser && savedUser.id) {
              setUser(savedUser);
              const savedClinicStr = localStorage.getItem('df_session_clinic');
              if (savedClinicStr) {
                const savedClinic = JSON.parse(savedClinicStr);
                setClinic(savedClinic);
                applyTheme(savedClinic);
              }
            } else {
              setUser(null);
              setClinic(null);
            }
          } catch (err) {
            setUser(null);
            setClinic(null);
          }
        } else {
          setUser(null);
          setClinic(null);
          localStorage.removeItem('df_session_user');
          localStorage.removeItem('df_session_clinic');
        }
      }
    } catch (e) {
      console.error('Erro ao verificar sessão Supabase:', e);
      const savedUserStr = localStorage.getItem('df_session_user');
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && savedUser.id) {
            setUser(savedUser);
          }
        } catch (err) {
          setUser(null);
        }
      }
    }
    setLoading(false);
  };

  const selectClinic = (clinicData) => {
    setClinic(clinicData);
    if (clinicData) {
      localStorage.setItem('df_session_clinic', JSON.stringify(clinicData));
      applyTheme(clinicData);
    } else {
      localStorage.removeItem('df_session_clinic');
      resetTheme();
    }
  };

  const updateClinic = async (updatedFields) => {
    if (!clinic) return;
    const updatedClinic = { ...clinic, ...updatedFields };
    setClinic(updatedClinic);
    localStorage.setItem('df_session_clinic', JSON.stringify(updatedClinic));

    // Empacotar chaves Whitelabel estendidas em formato JSON dentro do campo logo_url do banco
    const packedLogoUrl = JSON.stringify({
      logo_url: updatedClinic.logo_url || '',
      accent_color: updatedClinic.accent_color || '#D9E2FF',
      font_family: updatedClinic.font_family || 'Geist',
      theme_base: updatedClinic.theme_base || 'light',
      favicon_url: updatedClinic.favicon_url || '',
      login_title: updatedClinic.login_title || 'Bem-vindo ao seu portal',
      login_bg: updatedClinic.login_bg || '',
      address: updatedClinic.address || null,
      plan_type: updatedClinic.plan_type || 'professional',
      trial_ends_at: updatedClinic.trial_ends_at || null,
      onboarding_completed: updatedClinic.onboarding_completed !== undefined ? updatedClinic.onboarding_completed : (clinic.onboarding_completed || false)
    });

    const supabasePayload = {
      name: updatedFields.name !== undefined ? updatedFields.name : clinic.name,
      primary_color: updatedFields.primary_color !== undefined ? updatedFields.primary_color : clinic.primary_color,
      secondary_color: updatedFields.secondary_color !== undefined ? updatedFields.secondary_color : clinic.secondary_color,
      logo_url: packedLogoUrl
    };

    try {
      const { error } = await supabase
        .from('clinics')
        .update(supabasePayload)
        .eq('id', clinic.id);
      if (error) throw error;
    } catch (err) {
      if (!err.message?.includes('Modo Demo')) {
        console.warn('[AuthContext] Supabase offline/inacessível. Operando no modo local:', err.message || err);
      }
    }

    applyTheme(updatedClinic);
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        checkSession();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      clinic,
      loading,
      supabaseActive,
      setSupabaseActive,
      login,
      logout,
      fetchClinicData,
      fetchClinicBySubdomain,
      selectClinic,
      updateClinic
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
        font_family: parsed.font_family || 'Inter',
        theme_base: parsed.theme_base || 'light',
        favicon_url: parsed.favicon_url || '',
        login_title: parsed.login_title || 'Bem-vindo ao seu portal',
        login_bg: parsed.login_bg || '',
        address: parsed.address || null
      };
    } catch (e) {
      console.error('Failed to parse clinic whitelabel config from logo_url:', e);
    }
  }
  return {
    ...clinic,
    accent_color: clinic.accent_color || '#D9E2FF',
    font_family: clinic.font_family || 'Inter',
    theme_base: clinic.theme_base || 'light',
    favicon_url: clinic.favicon_url || '',
    login_title: clinic.login_title || 'Bem-vindo ao seu portal',
    login_bg: clinic.login_bg || '',
    address: null
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [clinic, setClinic] = useState(() => {
    const saved = localStorage.getItem('df_session_clinic');
    return saved ? JSON.parse(saved) : null;
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

      // Buscar dados do perfil do usuário logado
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      const sessionUser = {
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
        full_name: profile.full_name,
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
    } catch (err) {
      console.error('Falha de login no Supabase:', err.message);
      setLoading(false);
      return { success: false, error: err.message };
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
        // Limpar se não há sessão ativa no Supabase
        setUser(null);
        setClinic(null);
        localStorage.removeItem('df_session_user');
        localStorage.removeItem('df_session_clinic');
      }
    } catch (e) {
      console.error('Erro ao verificar sessão Supabase:', e);
    }
    setLoading(false);
  };

  const selectClinic = (clinicData) => {
    setClinic(clinicData);
    if (clinicData) {
      applyTheme(clinicData);
    } else {
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
      font_family: updatedClinic.font_family || 'Inter',
      theme_base: updatedClinic.theme_base || 'light',
      favicon_url: updatedClinic.favicon_url || '',
      login_title: updatedClinic.login_title || 'Bem-vindo ao seu portal',
      login_bg: updatedClinic.login_bg || '',
      address: updatedClinic.address || null
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
      console.error('Erro ao atualizar clínica no Supabase:', err);
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

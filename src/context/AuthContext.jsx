import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockDb } from '../lib/mockDatabase';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supabaseActive, setSupabaseActive] = useState(isSupabaseConfigured);
  const { applyTheme, resetTheme } = useTheme();

  // Função para carregar as informações da clínica baseada no ID
  const fetchClinicData = async (clinicId) => {
    if (!clinicId) return null;
    
    if (supabaseActive && supabase) {
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .eq('id', clinicId)
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Erro ao buscar dados da clínica no Supabase:', err);
        // Fallback local se falhar
        return mockDb.getClinics().find(c => c.id === clinicId) || null;
      }
    } else {
      return mockDb.getClinics().find(c => c.id === clinicId) || null;
    }
  };

  // Função para carregar as informações da clínica baseada no subdomínio
  const fetchClinicBySubdomain = async (subdomain) => {
    if (!subdomain) return null;
    
    if (supabaseActive && supabase) {
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .eq('subdomain', subdomain)
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Erro ao buscar clínica por subdomínio no Supabase:', err);
        return mockDb.getClinics().find(c => c.subdomain === subdomain) || null;
      }
    } else {
      return mockDb.getClinics().find(c => c.subdomain === subdomain) || null;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    if (supabaseActive && supabase) {
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

        if (profile.clinic_id) {
          const clinicData = await fetchClinicData(profile.clinic_id);
          setClinic(clinicData);
          if (clinicData) {
            applyTheme({
              name: clinicData.name,
              primary_color: clinicData.primary_color,
              secondary_color: clinicData.secondary_color,
              logo_url: clinicData.logo_url
            });
          }
        } else {
          setClinic(null);
          resetTheme();
        }
        setLoading(false);
        return { success: true, user: sessionUser };
      } catch (err) {
        console.error('Falha de login no Supabase:', err.message);
        setLoading(false);
        return { success: false, error: err.message };
      }
    } else {
      // Autenticação Mock Local
      const users = mockDb.getUsers();
      const matchedUser = users.find(u => u.email === email && u.password === password);
      
      if (matchedUser) {
        const sessionUser = {
          id: matchedUser.id,
          email: matchedUser.email,
          role: matchedUser.role,
          full_name: matchedUser.full_name,
          clinic_id: matchedUser.clinic_id
        };
        
        setUser(sessionUser);
        
        if (matchedUser.clinic_id) {
          const clinicData = await fetchClinicData(matchedUser.clinic_id);
          setClinic(clinicData);
          if (clinicData) {
            applyTheme({
              name: clinicData.name,
              primary_color: clinicData.primary_color,
              secondary_color: clinicData.secondary_color,
              logo_url: clinicData.logo_url
            });
          }
        } else {
          setClinic(null);
          resetTheme();
        }
        setLoading(false);
        return { success: true, user: sessionUser };
      } else {
        setLoading(false);
        return { success: false, error: 'E-mail ou senha incorretos (Simulado).' };
      }
    }
  };

  const logout = async () => {
    setLoading(true);
    if (supabaseActive && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setClinic(null);
    resetTheme();
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
        applyTheme({
          name: clinicData.name,
          primary_color: clinicData.primary_color,
          secondary_color: clinicData.secondary_color,
          logo_url: clinicData.logo_url
        });
      }
    }

    if (supabaseActive && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
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
            if (profile.clinic_id) {
              const clinicData = await fetchClinicData(profile.clinic_id);
              setClinic(clinicData);
              if (clinicData) {
                applyTheme({
                  name: clinicData.name,
                  primary_color: clinicData.primary_color,
                  secondary_color: clinicData.secondary_color,
                  logo_url: clinicData.logo_url
                });
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    setLoading(false);
  };

  const selectClinic = (clinicData) => {
    setClinic(clinicData);
    if (clinicData) {
      applyTheme({
        name: clinicData.name,
        primary_color: clinicData.primary_color,
        secondary_color: clinicData.secondary_color,
        logo_url: clinicData.logo_url
      });
    } else {
      resetTheme();
    }
  };

  const updateClinic = async (updatedFields) => {
    if (!clinic) return;
    const updatedClinic = { ...clinic, ...updatedFields };
    setClinic(updatedClinic);

    if (supabaseActive && supabase) {
      try {
        const { error } = await supabase
          .from('clinics')
          .update(updatedFields)
          .eq('id', clinic.id);
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao atualizar clínica no Supabase:', err);
      }
    } else {
      mockDb.saveClinic(updatedClinic);
    }

    applyTheme({
      name: updatedClinic.name,
      primary_color: updatedClinic.primary_color,
      secondary_color: updatedClinic.secondary_color,
      logo_url: updatedClinic.logo_url
    });
  };

  useEffect(() => {
    checkSession();
  }, [supabaseActive]);

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

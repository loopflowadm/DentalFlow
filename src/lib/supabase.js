import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Valida se as credenciais do Supabase são reais (chave JWT válida com prefixo eyJ)
const isValidJwtKey = (key) => typeof key === 'string' && (key.startsWith('eyJ') || key.length > 50);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && isValidJwtKey(supabaseAnonKey));

const createDummySupabase = () => {
  const dummyHandler = {
    get(target, prop) {
      if (prop === 'auth') {
        return {
          signInWithPassword: async () => ({ data: { user: null }, error: new Error('Supabase não configurado ou chave inválida') }),
          signOut: async () => {},
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          getUser: async () => ({ data: { user: null }, error: null })
        };
      }
      if (prop === 'from') {
        return () => {
          const createQueryBuilder = () => {
            const builderHandler = {
              get(builderTarget, builderProp) {
                if (builderProp === 'then') {
                  return (resolve) => resolve({ data: [], error: new Error('Supabase em Modo Demo') });
                }
                if (builderProp === 'catch') {
                  return (reject) => resolve({ data: [], error: new Error('Supabase em Modo Demo') });
                }
                return () => proxyBuilder;
              }
            };
            const proxyBuilder = new Proxy({}, builderHandler);
            return proxyBuilder;
          };
          return createQueryBuilder();
        };
      }
      if (prop === 'rpc') {
        return async () => ({ data: null, error: new Error('RPC não disponível em Modo Demo') });
      }
      if (prop === 'channel') {
        return () => {
          const dummyChannel = {
            on: () => dummyChannel,
            subscribe: () => dummyChannel,
            unsubscribe: () => {}
          };
          return dummyChannel;
        };
      }
      if (prop === 'removeChannel') {
        return () => {};
      }
      return () => {};
    }
  };
  return new Proxy({}, dummyHandler);
};

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  : createDummySupabase();

/**
 * Validador de Diagnóstico de Conexão com o Supabase.
 * Retorna o status real da conexão sem crashar a interface do usuário.
 */
export const checkSupabaseConnection = async () => {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      mode: 'demo',
      message: 'Aplicação rodando em Modo Demo (sem credenciais ativas do Supabase).'
    };
  }

  try {
    // Tenta uma chamada leve (auth.getSession) para validar a resposta do backend
    const { error } = await supabase.auth.getSession();
    if (error) {
      return {
        connected: false,
        mode: 'live_degraded',
        message: `Falha na autenticação do Supabase: ${error.message}`
      };
    }
    return {
      connected: true,
      mode: 'live',
      message: 'Conectado com sucesso ao Supabase PostgreSQL.'
    };
  } catch (err) {
    return {
      connected: false,
      mode: 'error',
      message: `Erro na comunicação com a API do Supabase: ${err.message}`
    };
  }
};

// Exibe status no console em ambiente de desenvolvimento
if (import.meta.env.DEV) {
  if (isSupabaseConfigured) {
    console.log('[Supabase Client] ⚡ Conectado com credenciais válidas.');
  } else {
    console.info('[Supabase Client] 🛡️ Modo Demo ativo com fallbacks graciosos.');
  }
}

// Limpa tokens antigos inválidos do localStorage para evitar loops de refresh em conexões offline/inexistentes
if (typeof window !== 'undefined') {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token') && !isSupabaseConfigured) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    // Ignora em caso de restrição do navegador
  }
}

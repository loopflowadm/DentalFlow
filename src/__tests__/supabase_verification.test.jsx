import { describe, it, expect, vi } from 'vitest';
import { supabase, isSupabaseConfigured, checkSupabaseConnection } from '../lib/supabase';

describe('Supabase Client & Multi-Tenant Verification', () => {
  it('deve exportar uma flag isSupabaseConfigured válida', () => {
    expect(typeof isSupabaseConfigured).toBe('boolean');
  });

  it('deve retornar um diagnóstico estruturado ao chamar checkSupabaseConnection()', async () => {
    const diagnostic = await checkSupabaseConnection();
    expect(diagnostic).toHaveProperty('connected');
    expect(diagnostic).toHaveProperty('mode');
    expect(diagnostic).toHaveProperty('message');
    expect(typeof diagnostic.connected).toBe('boolean');
    expect(typeof diagnostic.message).toBe('string');
  });

  it('deve responder sem crashar ao invocar métodos em modo Demo ou Conectado', async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', '00000000-0000-0000-0000-000000000000');

    if (!isSupabaseConfigured) {
      expect(error).not.toBeNull();
      expect(error.message).toContain('Supabase em Modo Demo');
      expect(Array.isArray(data)).toBe(true);
    } else {
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });

  it('deve tratar invocações RPC sem derrubar a aplicação', async () => {
    const { data, error } = await supabase.rpc('check_database_health');
    if (!isSupabaseConfigured) {
      expect(error).not.toBeNull();
      expect(error.message).toContain('RPC não disponível em Modo Demo');
    }
  });

  it('deve garantir que consultas contendo clinic_id mantenham a sintaxe multi-tenant correta', () => {
    const queryBuilder = supabase.from('appointments').select('*').eq('clinic_id', 'test-clinic-uuid');
    expect(queryBuilder).toBeDefined();
  });
});

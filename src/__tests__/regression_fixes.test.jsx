import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { mockDb } from '../lib/mockDatabase';
import { supabase } from '../lib/supabase';

// Mock Supabase session to prevent network calls during testing
vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
  data: { session: null },
  error: null
});

function ClinicSessionConsumer() {
  const { clinic, loading } = useAuth();
  if (loading) return <div data-testid="loading">Carregando...</div>;
  return <div data-testid="clinic-result">{clinic ? clinic.name : 'Nenhuma Clínica'}</div>;
}

describe('Regression Tests for Security & Stability Fixes', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Bug Fix (a): Malformed / Corrupted JSON in localStorage', () => {
    it('should safely return null for AuthContext clinic session when localStorage contains invalid JSON', async () => {
      // Injetar JSON inválido/corrompido no localStorage
      localStorage.setItem('df_session_clinic', '{{ invalid_json_structure: 12345 }');

      render(
        <ThemeProvider>
          <AuthProvider>
            <ClinicSessionConsumer />
          </AuthProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      // Não deve quebrar o componente e deve retornar 'Nenhuma Clínica'
      expect(screen.getByTestId('clinic-result')).toHaveTextContent('Nenhuma Clínica');
    });

    it('should safely reset mockDb to fallback when localStorage key contains malformed JSON', () => {
      // Injetar JSON inválido no mockDb
      localStorage.setItem('odonto_crm_clinics', 'NOT_A_JSON_STRING!!!');

      // Executar getClinics sem quebrar
      const clinics = mockDb.getClinics();
      expect(clinics).toBeDefined();
      expect(Array.isArray(clinics)).toBe(true);
      expect(clinics.length).toBeGreaterThan(0);
    });
  });

  describe('Bug Fix (b): Undefined fields in address step from CEP autofill', () => {
    // Função auxiliar que replica a regra de validação refatorada do Onboarding.jsx
    const isAddressStepValid = (endereco) => {
      const logradouroVal = (endereco?.logradouro || '').trim();
      const cidadeVal = (endereco?.cidade || '').trim();
      return Boolean(logradouroVal && cidadeVal);
    };

    it('should keep step disabled without throwing TypeError when logradouro or cidade are undefined', () => {
      const enderecoWithUndefined = {
        cep: '58000-000',
        logradouro: undefined,
        cidade: undefined,
        bairro: undefined,
        uf: 'PB'
      };

      // Não deve lançar exceção TypeError e deve retornar false
      expect(() => isAddressStepValid(enderecoWithUndefined)).not.toThrow();
      expect(isAddressStepValid(enderecoWithUndefined)).toBe(false);
    });

    it('should enable step when logradouro and cidade are valid non-empty strings', () => {
      const validEndereco = {
        cep: '58000-000',
        logradouro: 'Avenida Epitácio Pessoa',
        cidade: 'João Pessoa',
        bairro: 'Tambauzinho',
        uf: 'PB'
      };

      expect(isAddressStepValid(validEndereco)).toBe(true);
    });
  });
});

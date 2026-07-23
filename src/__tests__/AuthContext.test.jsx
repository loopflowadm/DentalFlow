import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

// Mock Supabase session responses
vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
  data: { session: null },
  error: null
});

function TestComponent() {
  const { user, clinic, loading, logout, selectClinic } = useAuth();

  if (loading) {
    return <div data-testid="loading">Carregando...</div>;
  }

  return (
    <div>
      <div data-testid="user-status">{user ? user.full_name : 'No User'}</div>
      <div data-testid="clinic-name">{clinic ? clinic.name : 'No Clinic'}</div>
      <button 
        data-testid="select-clinic-btn"
        onClick={() => selectClinic({ id: 'clinic-1', name: 'Clínica Teste' })}
      >
        Select Clinic
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should wait for checkSession to finish and allow selecting a clinic', async () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </ThemeProvider>
    );

    // Wait until loading finishes
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).toBeNull();
    });

    expect(screen.getByTestId('clinic-name')).toHaveTextContent('No Clinic');

    await act(async () => {
      screen.getByTestId('select-clinic-btn').click();
    });

    expect(screen.getByTestId('clinic-name')).toHaveTextContent('Clínica Teste');
  });

  it('should clear session state on logout', async () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).toBeNull();
    });

    await act(async () => {
      screen.getByTestId('select-clinic-btn').click();
    });

    expect(screen.getByTestId('clinic-name')).toHaveTextContent('Clínica Teste');

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(screen.getByTestId('user-status')).toHaveTextContent('No User');
    expect(screen.getByTestId('clinic-name')).toHaveTextContent('No Clinic');
  });
});

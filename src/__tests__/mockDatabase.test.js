import { describe, it, expect, beforeEach } from 'vitest';
import { mockDb } from '../lib/mockDatabase';

describe('mockDatabase Unit & Multi-tenant Isolation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default clinics', () => {
    const clinics = mockDb.getClinics();
    expect(clinics).toBeDefined();
    expect(clinics.length).toBeGreaterThanOrEqual(3);
    const sorrisoClinic = clinics.find(c => c.id === 'clinic-sorriso-perfeito');
    expect(sorrisoClinic).toBeDefined();
    expect(sorrisoClinic.name).toBe('DentalFlow');
  });

  it('should enforce multi-tenant isolation when fetching patients', () => {
    mockDb.savePatient({ id: 'p-isolation-1', clinic_id: 'clinic-sorriso-perfeito', name: 'Paciente Sorriso' });
    mockDb.savePatient({ id: 'p-isolation-2', clinic_id: 'clinic-orto-clean', name: 'Paciente Orto' });

    const sorrisoPatients = mockDb.getPatients('clinic-sorriso-perfeito');
    const ortoPatients = mockDb.getPatients('clinic-orto-clean');

    expect(sorrisoPatients.length).toBeGreaterThan(0);
    expect(ortoPatients.length).toBeGreaterThan(0);

    // Verify no patient from Orto Clean appears in Sorriso Perfeito list
    sorrisoPatients.forEach(patient => {
      expect(patient.clinic_id).toBe('clinic-sorriso-perfeito');
    });

    ortoPatients.forEach(patient => {
      expect(patient.clinic_id).toBe('clinic-orto-clean');
    });
  });

  it('should enforce multi-tenant isolation when fetching appointments', () => {
    const sorrisoApps = mockDb.getAppointments('clinic-sorriso-perfeito');
    sorrisoApps.forEach(app => {
      expect(app.clinic_id).toBe('clinic-sorriso-perfeito');
    });
  });

  it('should save a new patient and persist in localStorage', () => {
    const newPatient = {
      id: 'patient-test-100',
      clinic_id: 'clinic-sorriso-perfeito',
      name: 'Carlos Alberto',
      phone: '5511977775555',
      email: 'carlos@test.com',
      medical_history: 'Sem histórico de alergias'
    };

    mockDb.savePatient(newPatient);

    const patients = mockDb.getPatients('clinic-sorriso-perfeito');
    const saved = patients.find(p => p.id === 'patient-test-100');
    expect(saved).toBeDefined();
    expect(saved.name).toBe('Carlos Alberto');
  });

  it('should save and update clinic whitelabel configuration', () => {
    const newClinic = {
      id: 'clinic-test-new',
      name: 'Clínica Sorriso Real',
      subdomain: 'sorrisoreal',
      logo_url: '🦷',
      primary_color: '#0055FF',
      secondary_color: '#00AAFF',
      created_at: new Date().toISOString()
    };

    mockDb.saveClinic(newClinic);

    const clinics = mockDb.getClinics();
    const found = clinics.find(c => c.id === 'clinic-test-new');
    expect(found).toBeDefined();
    expect(found.name).toBe('Clínica Sorriso Real');
  });
});

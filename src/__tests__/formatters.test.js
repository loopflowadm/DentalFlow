import { describe, it, expect } from 'vitest';

// Utility functions extracted from input entry points for validation
export const formatPhone = (val) => {
  if (!val) return '';
  const nums = val.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return nums ? `(${nums}` : '';
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
};

export const generateSubdomain = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
};

export const matchClinicDomain = (email, clinics) => {
  if (!email || !email.includes('@')) return null;
  const domain = email.split('@')[1].toLowerCase();
  if (domain.includes('sorriso')) {
    return clinics.find(c => c.id === 'clinic-sorriso-perfeito') || null;
  } else if (domain.includes('orto')) {
    return clinics.find(c => c.id === 'clinic-orto-clean') || null;
  } else if (domain.includes('prime')) {
    return clinics.find(c => c.id === 'clinic-odonto-prime') || null;
  }
  return null;
};

describe('Form & Input Data Formatting Unit Tests', () => {
  describe('formatPhone', () => {
    it('should format incomplete phone numbers correctly', () => {
      expect(formatPhone('11')).toBe('(11');
      expect(formatPhone('119999')).toBe('(11) 9999');
    });

    it('should format full 11-digit Brazilian cell phone numbers', () => {
      expect(formatPhone('11999998888')).toBe('(11) 99999-8888');
      expect(formatPhone('21988887777')).toBe('(21) 98888-7777');
    });

    it('should strip non-numeric characters before formatting', () => {
      expect(formatPhone('+55 (11) 99999-8888')).toBe('(55) 11999-9988');
    });
  });

  describe('generateSubdomain', () => {
    it('should slugify clinic names without accents or special characters', () => {
      expect(generateSubdomain('Clínica Sorriso Épica')).toBe('clinicasorrisoepica');
      expect(generateSubdomain('Orto Clean 100%')).toBe('ortoclean100');
      expect(generateSubdomain('  Odonto   Prime  ')).toBe('odontoprime');
    });
  });

  describe('matchClinicDomain', () => {
    const mockClinics = [
      { id: 'clinic-sorriso-perfeito', name: 'Sorriso' },
      { id: 'clinic-orto-clean', name: 'Orto' },
      { id: 'clinic-odonto-prime', name: 'Prime' }
    ];

    it('should match email domain to clinic theme', () => {
      expect(matchClinicDomain('admin@sorriso.com', mockClinics)?.id).toBe('clinic-sorriso-perfeito');
      expect(matchClinicDomain('dr@ortoclean.com.br', mockClinics)?.id).toBe('clinic-orto-clean');
      expect(matchClinicDomain('contato@prime.com', mockClinics)?.id).toBe('clinic-odonto-prime');
    });

    it('should return null for unknown domains', () => {
      expect(matchClinicDomain('user@gmail.com', mockClinics)).toBeNull();
    });
  });
});

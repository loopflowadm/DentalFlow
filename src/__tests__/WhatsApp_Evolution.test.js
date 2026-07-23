import { describe, it, expect, vi } from 'vitest';

// Simulação da lógica de formatação de número e disparo para a Evolution API
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const digitsOnly = phone.replace(/\D/g, '');
  if (!digitsOnly) return '';
  if (!digitsOnly.startsWith('55') && digitsOnly.length <= 11) {
    return '55' + digitsOnly;
  }
  return digitsOnly;
};

export const buildEvolutionApiPayload = (phoneNumber, text) => {
  return {
    number: formatPhoneNumber(phoneNumber),
    text: text,
    options: {
      delay: 1200,
      presence: 'composing'
    }
  };
};

describe('WhatsApp & Evolution API Integration Tests', () => {
  it('should correctly format Brazilian phone numbers with DDI 55', () => {
    expect(formatPhoneNumber('11988887777')).toBe('5511988887777');
    expect(formatPhoneNumber('(83) 99999-8888')).toBe('5583999998888');
    expect(formatPhoneNumber('5511977776666')).toBe('5511977776666');
    expect(formatPhoneNumber('')).toBe('');
  });

  it('should construct a valid payload for Evolution API sendText endpoint', () => {
    const payload = buildEvolutionApiPayload('(11) 98888-7777', 'Olá, confirmando sua consulta!');
    expect(payload.number).toBe('5511988887777');
    expect(payload.text).toBe('Olá, confirmando sua consulta!');
    expect(payload.options.presence).toBe('composing');
  });
});

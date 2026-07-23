import { describe, it, expect } from 'vitest';

export const createLeadObject = ({ name, phone, procedure, estValue, priority = 'Média' }) => {
  return {
    id: 'lead-' + Math.random().toString(36).substring(2, 9),
    name: name.trim(),
    phone: phone.trim(),
    procedure: procedure || 'Avaliação Geral',
    estValue: parseFloat(estValue) || 0,
    priority,
    status: 'NOVO', // NOVO | CONTATO | AGENDADO | FECHADO | PERDIDO
    created_at: new Date().toISOString()
  };
};

export const convertLeadToPatient = (lead, clinicId) => {
  if (!lead || !lead.name) throw new Error('Lead inválido');
  return {
    id: 'patient-from-' + lead.id,
    clinic_id: clinicId,
    name: lead.name,
    phone: lead.phone,
    email: `${lead.name.toLowerCase().replace(/\s+/g, '')}@exemplo.com`,
    medical_history: `Lead convertido do CRM. Procedimento de interesse: ${lead.procedure}`,
    created_at: new Date().toISOString()
  };
};

describe('CRM Lead & Patient Conversion Integration Logic', () => {
  it('should construct a valid Lead object with default status NOVO', () => {
    const lead = createLeadObject({
      name: 'Julia Teste',
      phone: '11988887777',
      procedure: 'Limpeza',
      estValue: '250',
      priority: 'Alta'
    });

    expect(lead.id).toContain('lead-');
    expect(lead.name).toBe('Julia Teste');
    expect(lead.status).toBe('NOVO');
    expect(lead.estValue).toBe(250);
    expect(lead.priority).toBe('Alta');
  });

  it('should convert a Lead into an active Patient record', () => {
    const lead = createLeadObject({
      name: 'Mariana Lima',
      phone: '11977776666',
      procedure: 'Ortodontia',
      estValue: '1500'
    });

    const patient = convertLeadToPatient(lead, 'clinic-sorriso-perfeito');

    expect(patient.id).toContain('patient-from-');
    expect(patient.clinic_id).toBe('clinic-sorriso-perfeito');
    expect(patient.name).toBe('Mariana Lima');
    expect(patient.medical_history).toContain('Ortodontia');
  });

  it('should throw error when converting null lead', () => {
    expect(() => convertLeadToPatient(null, 'clinic-1')).toThrow('Lead inválido');
  });
});

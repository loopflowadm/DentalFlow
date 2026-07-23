import { describe, it, expect } from 'vitest';

export const filterAppointmentsByDentistAndChair = (appointments, dentistId, chairId) => {
  return appointments.filter(app => {
    const matchDentist = !dentistId || app.doctor_id === dentistId;
    const matchChair = !chairId || app.chair_id === chairId;
    return matchDentist && matchChair;
  });
};

export const createAppointmentPayload = ({ patientId, doctorId, chairId, startTime, endTime, procedure }) => {
  if (!patientId || !doctorId || !startTime) {
    throw new Error('Campos obrigatórios ausentes para o agendamento');
  }
  return {
    id: 'app-' + Math.random().toString(36).substring(2, 9),
    patient_id: patientId,
    doctor_id: doctorId,
    chair_id: chairId || 'chair-1',
    start_time: startTime,
    end_time: endTime,
    procedure: procedure || 'Consulta de Rotina',
    status: 'CONFIRMED',
    created_at: new Date().toISOString()
  };
};

describe('Agenda & Appointment Business Logic Integration Tests', () => {
  const sampleAppointments = [
    { id: '1', doctor_id: 'user-doc-1', chair_id: 'chair-1', status: 'CONFIRMED' },
    { id: '2', doctor_id: 'user-doc-2', chair_id: 'chair-1', status: 'PENDING' },
    { id: '3', doctor_id: 'user-doc-1', chair_id: 'chair-2', status: 'CONFIRMED' }
  ];

  it('should filter appointments by dentist ID', () => {
    const filtered = filterAppointmentsByDentistAndChair(sampleAppointments, 'user-doc-1', null);
    expect(filtered.length).toBe(2);
    expect(filtered.map(a => a.id)).toEqual(['1', '3']);
  });

  it('should filter appointments by chair ID', () => {
    const filtered = filterAppointmentsByDentistAndChair(sampleAppointments, null, 'chair-1');
    expect(filtered.length).toBe(2);
    expect(filtered.map(a => a.id)).toEqual(['1', '2']);
  });

  it('should create valid appointment payload', () => {
    const payload = createAppointmentPayload({
      patientId: 'patient-1',
      doctorId: 'user-doc-1',
      chairId: 'chair-1',
      startTime: '2026-07-22T09:00:00Z',
      endTime: '2026-07-22T10:00:00Z',
      procedure: 'Restauração'
    });

    expect(payload.id).toContain('app-');
    expect(payload.status).toBe('CONFIRMED');
    expect(payload.procedure).toBe('Restauração');
  });

  it('should throw error when creating appointment missing required fields', () => {
    expect(() => createAppointmentPayload({})).toThrow('Campos obrigatórios ausentes para o agendamento');
  });
});

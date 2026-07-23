import { describe, it, expect } from 'vitest';
import { DEFAULT_DENTAL_AI_PROMPT, expandAiPrompt } from '../context/ClinicContext';

describe('Dental AI Agent Prompt & Tag Expansion Integration', () => {
  it('should contain default dental AI prompt template with required tags', () => {
    expect(DEFAULT_DENTAL_AI_PROMPT).toContain('{NOME_CLINICA}');
    expect(DEFAULT_DENTAL_AI_PROMPT).toContain('{ENDERECO_COMPLETO}');
    expect(DEFAULT_DENTAL_AI_PROMPT).toContain('{LISTA_DENTISTAS}');
    expect(DEFAULT_DENTAL_AI_PROMPT).toContain('{LISTA_PROCEDIMENTOS}');
  });

  it('should dynamically expand tags with real clinic data', () => {
    const sampleClinicData = {
      clinic: { name: 'OdontoFace Sorrisos', phone: '(83) 99999-1111', logradouro: 'Av. Epitácio Pessoa', cidade: 'João Pessoa', uf: 'PB' },
      dentists: [
        { id: '1', full_name: 'Dra. Ana Paula', specialty: 'Ortodontista' }
      ],
      procedures: [
        { id: 'p1', name: 'Clareamento Dental', price: 800, category: 'Estética' }
      ],
      insurancePlans: [
        { id: 'i1', name: 'Amil Dental' }
      ]
    };

    const expanded = expandAiPrompt(DEFAULT_DENTAL_AI_PROMPT, sampleClinicData);

    expect(expanded).toContain('OdontoFace Sorrisos');
    expect(expanded).toContain('Dra. Ana Paula (Ortodontista)');
    expect(expanded).toContain('Clareamento Dental: R$ 800,00 (Estética)');
    expect(expanded).toContain('Amil Dental');
    expect(expanded).not.toContain('{NOME_CLINICA}');
  });
});

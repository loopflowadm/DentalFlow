import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { mockDb } from '../lib/mockDatabase';

const ClinicContext = createContext();

const isValidUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const DEFAULT_DENTAL_AI_PROMPT = `Você é a Sofia, da equipe de atendimento da clínica odontológica {NOME_CLINICA}.

Seu papel é conversar no WhatsApp com os pacientes da clínica de forma simpática, clara e natural — exatamente como uma recepcionista atenciosa e humana.

Informações da clínica:
- Nome: {NOME_CLINICA}
- Endereço: {ENDERECO_COMPLETO}
- Telefone / WhatsApp: {TELEFONE_CONTATO}
- Expediente: {HORARIO_FUNCIONAMENTO}

Corpo Clínico:
{LISTA_DENTISTAS}

Tratamentos e Valores:
{LISTA_PROCEDIMENTOS}

Convênios Aceitos:
{CONVENIOS_ACEITOS}

Diretrizes de Atendimento:
1. Responda com clareza, simpatia e tom direto. Evite textos longos, robotizados ou respostas genéricas.
2. Para agendamentos, ofereça 2 opções de horários e confirme os dados do paciente.
3. Informe apenas os procedimentos e valores listados acima. Se o paciente perguntar sobre algo não cadastrado, diga que vai confirmar com a recepção.
4. Em caso de dor forte, urgência ou solicitação de atendimento humano, passe o contato para a recepção imediatamente.`;

export const expandAiPrompt = (promptTemplate, { clinic, dentists, procedures, insurancePlans }) => {
  if (!promptTemplate) return '';

  const clinicName = clinic?.name || clinic?.clinic_name || 'Nossa Clínica Odontológica';
  const address = clinic?.address || (clinic?.cidade ? `${clinic?.logradouro || 'Rua Principal'}, ${clinic?.bairro || ''} - ${clinic?.cidade || ''}/${clinic?.uf || ''}` : 'Endereço da clínica');
  const phone = clinic?.phone || '(83) 99999-8888';
  const hours = clinic?.operating_hours || 'Segunda a Sexta-feira, das 08h00 às 18h00';

  const dentistsList = typeof dentists === 'string'
    ? dentists
    : (dentists && dentists.length > 0
      ? dentists.map(d => `• ${d.full_name || d.name} (${d.specialty || 'Dentista Clínico'})`).join('\n')
      : '• Corpo clínico altamente qualificado');

  const proceduresList = typeof procedures === 'string'
    ? procedures
    : (procedures && procedures.length > 0
      ? procedures.map(p => `• ${p.name}: R$ ${Number(p.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${p.category || 'Odontologia Generalista'})`).join('\n')
      : '• Consultas, Clareamento, Ortodontia, Implantes, Próteses e Limpeza');

  const plansList = typeof insurancePlans === 'string'
    ? insurancePlans
    : (insurancePlans && insurancePlans.length > 0
      ? insurancePlans.map(p => `• ${p.name || p}`).join('\n')
      : '• Particular, Amil Dental, Unimed Odonto, Bradesco Dental e SulAmérica');

  let result = promptTemplate
    .replace(/\{NOME_CLINICA\}/g, clinicName)
    .replace(/\{ENDERECO_COMPLETO\}/g, address)
    .replace(/\{TELEFONE_CONTATO\}/g, phone)
    .replace(/\{HORARIO_FUNCIONAMENTO\}/g, hours)
    .replace(/\{LISTA_DENTISTAS\}/g, dentistsList)
    .replace(/\{LISTA_PROCEDIMENTOS\}/g, proceduresList)
    .replace(/\{CONVENIOS_ACEITOS\}/g, plansList);

  return result.replace(/\{([^}\n]+)\}/g, '$1');
};

export function ClinicProvider({ children }) {
  const { clinic, user } = useAuth();

  // Estados dos Módulos
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [financeTransactions, setFinanceTransactions] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [marketingCampaigns, setMarketingCampaigns] = useState([]);
  const [aiConfig, setAiConfig] = useState({
    prompt: DEFAULT_DENTAL_AI_PROMPT,
    personality: 'sofia_assistente',
    operatingHours: '24h',
    isActive: true,
    autoSilence: true,
    knowledgeBase: [
      { id: 'kb-1', question: 'O clareamento dental dói?', answer: 'O clareamento dental moderno utiliza géis dessensibilizantes de última geração que minimizam o desconforto.' },
      { id: 'kb-2', question: 'Quais as formas de pagamento aceitas?', answer: 'Aceitamos PIX com desconto, cartões de crédito em até 12x e convênios parceiros.' }
    ]
  });

  const [whatsappChats, setWhatsappChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [accountsPayable, setAccountsPayable] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [toothRecords, setToothRecords] = useState([]);
  const [crmLeads, setCrmLeads] = useState([]);
  const [chairs, setChairs] = useState([]);
  const [dentists, setDentists] = useState([]);

  const [clinicHours, setClinicHours] = useState(() => {
    try {
      const stored = localStorage.getItem(`clinic_hours_${clinic?.id || 'default'}`);
      return stored ? JSON.parse(stored) : { start: '08:00', end: '18:00', workDays: [1, 2, 3, 4, 5, 6] };
    } catch {
      return { start: '08:00', end: '18:00', workDays: [1, 2, 3, 4, 5, 6] };
    }
  });

  const [dentistSchedules, setDentistSchedules] = useState(() => {
    try {
      const stored = localStorage.getItem(`dentist_schedules_${clinic?.id || 'default'}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [holidays, setHolidays] = useState(() => {
    try {
      const stored = localStorage.getItem(`clinic_holidays_${clinic?.id || 'default'}`);
      return stored ? JSON.parse(stored) : [
        { id: 'hol-1', title: 'Independência do Brasil', type: 'CLINIC', date: '2026-09-07' },
        { id: 'hol-2', title: 'Nossa Senhora Aparecida', type: 'CLINIC', date: '2026-10-12' },
        { id: 'hol-3', title: 'Finados', type: 'CLINIC', date: '2026-11-02' },
        { id: 'hol-4', title: 'Proclamação da República', type: 'CLINIC', date: '2026-11-15' },
        { id: 'hol-5', title: 'Natal', type: 'CLINIC', date: '2026-12-25' }
      ];
    } catch {
      return [];
    }
  });

  const saveClinicHours = (hoursObj) => {
    setClinicHours(hoursObj);
    try {
      localStorage.setItem(`clinic_hours_${clinic?.id || 'default'}`, JSON.stringify(hoursObj));
    } catch (e) {
      console.error('Erro ao salvar horário da clínica:', e);
    }
  };

  const saveDentistSchedules = (schedulesObj) => {
    setDentistSchedules(schedulesObj);
    try {
      localStorage.setItem(`dentist_schedules_${clinic?.id || 'default'}`, JSON.stringify(schedulesObj));
    } catch (e) {
      console.error('Erro ao salvar escala do dentista:', e);
    }
  };

  const saveHolidays = (holidaysList) => {
    setHolidays(holidaysList);
    try {
      localStorage.setItem(`clinic_holidays_${clinic?.id || 'default'}`, JSON.stringify(holidaysList));
    } catch (e) {
      console.error('Erro ao salvar feriados:', e);
    }
  };


  const loadChatsState = useCallback(async (patList, leadList = []) => {
    const clinicId = clinic.id;
    const patientChats = patList.map(p => {
      let savedTags = null;
      let savedNotes = null;
      try {
        const storedTags = localStorage.getItem(`chat_tags_${p.id}`);
        if (storedTags) savedTags = JSON.parse(storedTags);
        savedNotes = localStorage.getItem(`patient_notes_${p.id}`);
      } catch (e) {}
      return {
        patientId: p.id,
        name: p.name,
        unreadCount: 0,
        status: 'offline',
        tags: savedTags || ['Paciente'],
        notes: savedNotes !== null ? savedNotes : (p.notes || ''),
        isBotPaused: false,
        messages: []
      };
    });

    // Deduplicação inteligente: filtrar leads que já são pacientes ativos ou que possuem mesmo ID/telefone/nome
    const existingPatientIds = new Set(patList.map(p => p.id));
    const existingPatientPhones = new Set(patList.map(p => p.phone?.replace(/\D/g, '')).filter(Boolean));
    const existingPatientNames = new Set(patList.map(p => p.name?.trim().toLowerCase()).filter(Boolean));

    const distinctLeads = (leadList || []).filter(l => {
      if (l.is_patient) return false;
      if (l.patient_id && existingPatientIds.has(l.patient_id)) return false;
      const cleanLeadPhone = l.phone?.replace(/\D/g, '');
      if (cleanLeadPhone && existingPatientPhones.has(cleanLeadPhone)) return false;
      if (l.name && existingPatientNames.has(l.name.trim().toLowerCase())) return false;
      return true;
    });

    const leadChats = distinctLeads.map(l => {
      let savedTags = null;
      let savedNotes = null;
      try {
        const storedTags = localStorage.getItem(`chat_tags_${l.id}`);
        if (storedTags) savedTags = JSON.parse(storedTags);
        savedNotes = localStorage.getItem(`patient_notes_${l.id}`);
      } catch (e) {}
      return {
        patientId: l.id,
        name: l.name,
        unreadCount: 0,
        status: 'offline',
        tags: savedTags || ['Lead'],
        notes: savedNotes !== null ? savedNotes : (l.notes || ''),
        isBotPaused: false,
        messages: []
      };
    });

    const defaultChats = [...patientChats, ...leadChats];

    try {
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('id, patient_id, sender, message_text, created_at')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: true });

      const { data: sessionsData, error: sessErr } = await supabase
        .from('chat_sessions')
        .select('patient_id, is_bot_paused')
        .eq('clinic_id', clinicId);

      if (!error && messagesData) {
        const messagesByPatient = {};
        messagesData.forEach(msg => {
          if (!messagesByPatient[msg.patient_id]) {
            messagesByPatient[msg.patient_id] = [];
          }
          messagesByPatient[msg.patient_id].push({
            id: msg.id,
            sender: msg.sender,
            text: msg.message_text,
            time: new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
          });
        });

        const pausedSessions = {};
        if (!sessErr && sessionsData) {
          sessionsData.forEach(s => {
            pausedSessions[s.patient_id] = s.is_bot_paused;
          });
        }

        defaultChats.forEach(chat => {
          chat.isBotPaused = pausedSessions[chat.patientId] || false;
          chat.messages = messagesByPatient[chat.patientId] || [];
          if (chat.messages.length > 0) {
            chat.status = 'online';
          }
        });
      }
    } catch (err) {
      console.error('Erro ao carregar mensagens do Supabase:', err);
    }

    setWhatsappChats(defaultChats);
  }, [clinic]);

  // Escuta em Tempo Real (Supabase Realtime) para mensagens do WhatsApp
  useEffect(() => {
    if (!clinic?.id || typeof supabase?.channel !== 'function') return;
    const channel = supabase.channel('realtime_chat_messages');
    if (!channel || typeof channel.on !== 'function') return;

    channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `clinic_id=eq.${clinic.id}`
        },
        (payload) => {
          const newMsg = payload.new;
          if (!newMsg) return;

          const formattedMsg = {
            id: newMsg.id,
            sender: newMsg.sender,
            text: newMsg.message_text,
            time: new Date(newMsg.created_at || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
          };

          setWhatsappChats(prev => prev.map(chat => {
            if (chat.patientId === newMsg.patient_id) {
              if (chat.messages.some(m => m.id === newMsg.id)) return chat;
              return {
                ...chat,
                unreadCount: newMsg.sender === 'PATIENT' ? (chat.unreadCount || 0) + 1 : chat.unreadCount,
                messages: [...chat.messages, formattedMsg]
              };
            }
            return chat;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinic?.id]);

  // Carregar dados de acordo com o Supabase de forma paralela e resiliente
  const loadData = useCallback(async () => {
    if (!clinic) return;
    setLoading(true);

    const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const rawId = clinic.id || clinic.clinic_id;
    const clinicId = isUuid(rawId) 
      ? rawId 
      : rawId === 'clinic-filial-cg' ? '00000000-0000-0000-0000-000000000002'
      : rawId === 'clinic-sp-01' ? '00000000-0000-0000-0000-000000000003'
      : '00000000-0000-0000-0000-000000000001';

    // UUID falso/mapeado localmente — não tem correspondência real no banco.
    // Nunca tentar INSERT com esses IDs: o RLS rejeita com 401 pois o JWT não confirma esse clinic_id.
    const FAKE_UUIDS = [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000003',
    ];
    const isMappedFakeId = FAKE_UUIDS.includes(clinicId);

    try {
      const results = await Promise.allSettled([
        supabase.from('patients').select('*').eq('clinic_id', clinicId),
        supabase.from('appointments').select('*').eq('clinic_id', clinicId),
        supabase.from('procedures').select('*').eq('clinic_id', clinicId),
        supabase.from('insurance_plans').select('*').eq('clinic_id', clinicId),
        supabase.from('transactions').select('*').eq('clinic_id', clinicId).order('date', { ascending: false }),
        supabase.from('automations').select('*').eq('clinic_id', clinicId),
        supabase.from('marketing_campaigns').select('*').eq('clinic_id', clinicId),
        supabase.from('suppliers').select('*').eq('clinic_id', clinicId),
        supabase.from('accounts_payable').select('*').eq('clinic_id', clinicId),
        supabase.from('installments').select('*, treatment_budgets(*, patients(*))').eq('clinic_id', clinicId),
        supabase.from('medical_records').select('*').eq('clinic_id', clinicId),
        supabase.from('prescriptions').select('*').eq('clinic_id', clinicId),
        supabase.from('tooth_records').select('*').eq('clinic_id', clinicId),
        supabase.from('crm_leads').select('*').eq('clinic_id', clinicId),
        supabase.from('whatsapp_config').select('*').eq('clinic_id', clinicId).maybeSingle(),
        supabase.from('chairs').select('*').eq('clinic_id', clinicId),
        supabase.from('profiles').select('*').eq('clinic_id', clinicId).eq('role', 'DOCTOR')
      ]);

      // Função auxiliar para extrair dados resolvidos com segurança e isolar falhas individuais
      const getValue = (res, defaultValue = []) => {
        if (res.status === 'fulfilled') {
          if (res.value.error) {
            const isFetchErr = res.value.error.message?.includes('fetch') || res.value.error.details?.includes('fetch');
            const isDemoErr = res.value.error.message?.includes('Modo Demo');
            // Silencia erros de autorização/RLS (401, 403, código 42501) — esperados quando clinicId local não bate com JWT
            const isAuthErr = res.value.error.code === '42501' || res.value.error.status === 401 || 
                              res.value.error.message?.includes('permission denied') || 
                              res.value.error.message?.includes('Unauthorized') ||
                              res.value.error.message?.includes('JWT');
            if (!isFetchErr && !isDemoErr && !isAuthErr) {
              console.warn('[ClinicContext] Aviso ao carregar tabela Supabase:', res.value.error.message || res.value.error);
            }
            return defaultValue;
          }
          return res.value.data || defaultValue;
        } else {
          return defaultValue;
        }
      };


      const pData = getValue(results[0]);
      const appData = getValue(results[1]);
      const procData = getValue(results[2]);
      const planData = getValue(results[3]);
      const tData = getValue(results[4]);
      const autData = getValue(results[5]);
      const mData = getValue(results[6]);
      const supData = getValue(results[7]);
      const apData = getValue(results[8]);
      const instData = getValue(results[9]);
      const recData = getValue(results[10]);
      const presData = getValue(results[11]);
      const toothData = getValue(results[12]);
      const leadData = getValue(results[13]);
      const chairData = getValue(results[15]);
      const dentistData = getValue(results[16]);

      let waData = null;
      if (results[14].status === 'fulfilled' && !results[14].value.error) {
        waData = results[14].value.data;
      }

      let finalPatients = pData || [];
      setPatients(finalPatients);

      // Auto-seeding de Cadeiras
      // Se o clinicId é um UUID falso/mapeado: usa fallback local DIRETO (sem chamar o Supabase)
      // Se o clinicId é real mas veio vazio: tenta inserir padrões no banco
      if (chairData.length === 0) {
        const defaultChairs = [
          { name: 'Cadeira 01', clinic_id: clinicId },
          { name: 'Cadeira 02', clinic_id: clinicId }
        ];
        if (isMappedFakeId) {
          setChairs(defaultChairs.map((c, idx) => ({ id: `c-${idx + 1}`, ...c })));
        } else {
          try {
            const { data, error } = await supabase.from('chairs').insert(defaultChairs).select();
            if (!error && data && data.length > 0) {
              setChairs(data);
            } else {
              setChairs(defaultChairs.map((c, idx) => ({ id: `c-${idx + 1}`, ...c })));
            }
          } catch {
            setChairs(defaultChairs.map((c, idx) => ({ id: `c-${idx + 1}`, ...c })));
          }
        }
      } else {
        setChairs(chairData);
      }

      // Fallback para Dentistas
      if (dentistData.length === 0) {
        if (user && user.id) {
          setDentists([
            { id: user.id, full_name: user.full_name || 'Profissional Principal', role: 'DOCTOR', clinic_id: clinicId }
          ]);
        } else {
          setDentists([]);
        }
      } else {
        setDentists(dentistData);
      }

      // Auto-seeding de Procedimentos
      // Mesma lógica: pula o INSERT se o clinicId é um UUID falso/mapeado localmente
      let finalProcData = procData;
      if (procData.length === 0) {
        const defaultProcs = [
          { name: 'Consulta Geral / Avaliação', price: 150.00, category: 'Diagnóstico', color: '#10b981', clinic_id: clinicId },
          { name: 'Profilaxia (Limpeza)', price: 200.00, category: 'Prevenção', color: '#3b82f6', clinic_id: clinicId },
          { name: 'Restauração de Resina', price: 250.00, category: 'Dentística', color: '#f59e0b', clinic_id: clinicId },
          { name: 'Tratamento de Canal (Endodontia)', price: 800.00, category: 'Endodontia', color: '#ef4444', clinic_id: clinicId },
          { name: 'Exodontia Simples', price: 300.00, category: 'Cirurgia', color: '#ec4899', clinic_id: clinicId }
        ];
        if (isMappedFakeId) {
          finalProcData = defaultProcs.map((p, idx) => ({ id: `p-${idx + 1}`, ...p }));
        } else {
          try {
            const { data, error } = await supabase.from('procedures').insert(defaultProcs).select();
            if (!error && data && data.length > 0) {
              finalProcData = data;
            } else {
              finalProcData = defaultProcs.map((p, idx) => ({ id: `p-${idx + 1}`, ...p }));
            }
          } catch {
            finalProcData = defaultProcs.map((p, idx) => ({ id: `p-${idx + 1}`, ...p }));
          }
        }
      }

      const mappedAppointments = appData.map(a => {
        const p = pData.find(pat => pat.id === a.patient_id);
        const proc = finalProcData.find(pr => pr.id === a.procedure_id);
        return {
          ...a,
          patientName: p ? p.name : (a.type === 'COMPROMISSO' ? '' : 'Paciente Desconhecido'),
          patientPhone: p ? p.phone : '',
          procedureName: proc ? proc.name : (a.procedure_name || a.procedureName || 'Consulta Geral'),
          color: proc ? proc.color : (a.color || '#3b82f6'),
          chairId: a.chair_id || a.chairId || null,
          procedureId: a.procedure_id || a.procedureId || null,
          sendConfirmation: a.send_confirmation !== undefined ? a.send_confirmation : a.sendConfirmation,
          returnDays: a.return_days !== undefined ? a.return_days : a.returnDays,
          isRecurring: a.is_recurring !== undefined ? a.is_recurring : a.isRecurring,
        };
      });

      setAppointments(prev => mappedAppointments.length > 0 ? mappedAppointments : prev);

      setProcedures(finalProcData);
      setInsurancePlans(planData);
      setFinanceTransactions(prev => tData.length > 0 ? tData : prev);
      setAutomations(autData);
      setMarketingCampaigns(mData);
      setSuppliers(supData);
      setAccountsPayable(apData);
      setToothRecords(prev => toothData.length > 0 ? toothData : prev);
      setMedicalRecords(prev => recData.length > 0 ? recData : prev);
      setPrescriptions(presData);
      let finalLeadData = leadData || [];

      // Auto-sincronizar pacientes da clínica que ainda não possuem um lead no CRM
      const existingLeadPatientIds = new Set(finalLeadData.map(l => l.patient_id).filter(Boolean));
      const existingLeadPhones = new Set(finalLeadData.map(l => l.phone?.replace(/\D/g, '')).filter(Boolean));
      const existingLeadNames = new Set(finalLeadData.map(l => l.name?.trim().toLowerCase()).filter(Boolean));

      const missingPatientsAsLeads = [];
      (finalPatients || []).forEach(p => {
        const cleanPhone = p.phone?.replace(/\D/g, '');
        const normName = p.name?.trim().toLowerCase();
        const isRecorded = (p.id && existingLeadPatientIds.has(p.id)) ||
                           (cleanPhone && existingLeadPhones.has(cleanPhone)) ||
                           (normName && existingLeadNames.has(normName));

        if (!isRecorded) {
          missingPatientsAsLeads.push({
            id: `lead-sync-${p.id}`,
            clinic_id: clinicId,
            name: p.name,
            phone: p.phone || '',
            stage: 0, // Estágio 'Novo Paciente'
            priority: 'medium',
            procedure_name: 'Consulta Geral',
            is_patient: true,
            patient_id: p.id,
            created_at: p.created_at || new Date().toISOString()
          });
        }
      });

      if (missingPatientsAsLeads.length > 0) {
        finalLeadData = [...finalLeadData, ...missingPatientsAsLeads];
      }

      setCrmLeads(finalLeadData);

      const formattedInstallments = instData.map(inst => {
        const budget = inst.treatment_budgets;
        const patient = budget?.patients;
        return {
          ...inst,
          patient_id: patient?.id,
          patientName: patient ? patient.name : 'Paciente',
          description: budget ? budget.description : 'Tratamento'
        };
      });
      setInstallments(formattedInstallments);

      const cachedAiConfig = mockDb.get('odonto_crm_ai_config_' + clinicId);

      setAiConfig({
        prompt: waData?.agent_prompt || cachedAiConfig?.prompt || '',
        personality: cachedAiConfig?.personality || 'sofia_assistente',
        operatingHours: cachedAiConfig?.operatingHours || '08:00 - 18:00',
        isActive: waData?.is_active !== undefined ? waData.is_active : (cachedAiConfig?.isActive ?? true),
        flowData: cachedAiConfig?.flowData || null,
        knowledgeBase: cachedAiConfig?.knowledgeBase || [],
        aiProvider: cachedAiConfig?.aiProvider || 'openai',
        apiKey: cachedAiConfig?.apiKey || ''
      });

      // Se o Supabase não retornar dados para alguns módulos, verificar se há dados demo salvos no localStorage
      try {
        const seedStorageKey = `demo_data_${clinicId}`;
        const cachedDemo = localStorage.getItem(seedStorageKey);
        if (cachedDemo) {
          const parsed = JSON.parse(cachedDemo);
          if (mappedAppointments.length === 0 && parsed.appointments?.length > 0) {
            setAppointments(parsed.appointments);
          }
          if (tData.length === 0 && parsed.transactions?.length > 0) {
            setFinanceTransactions(parsed.transactions);
          }
          if (recData.length === 0 && parsed.medicalRecords?.length > 0) {
            setMedicalRecords(parsed.medicalRecords);
          }
          if (toothData.length === 0 && parsed.toothRecords?.length > 0) {
            setToothRecords(parsed.toothRecords);
          }
          if (apData.length === 0 && parsed.accountsPayable?.length > 0) {
            setAccountsPayable(parsed.accountsPayable);
          }
          if (instData.length === 0 && parsed.installments?.length > 0) {
            setInstallments(parsed.installments);
          }
          if (supData.length === 0 && parsed.suppliers?.length > 0) {
            setSuppliers(parsed.suppliers);
          }
          if (mData.length === 0 && parsed.marketingCampaigns?.length > 0) {
            setMarketingCampaigns(parsed.marketingCampaigns);
          }
          if (autData.length === 0 && parsed.automations?.length > 0) {
            setAutomations(parsed.automations);
          }
          if (chairData.length === 0 && parsed.chairs?.length > 0) {
            setChairs(parsed.chairs);
          }
          if (dentistData.length === 0 && parsed.dentists?.length > 0) {
            setDentists(parsed.dentists);
          }
        }
      } catch (e) {}

      // Inicializar chats do WhatsApp
      loadChatsState(finalPatients, leadData);
    } catch (err) {
      console.error('Falha crítica geral ao carregar dados do Supabase:', err);
    }

    setLoading(false);
  }, [clinic, loadChatsState]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        loadData();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [loadData]);

  // FUNÇÕES DE PERSISTÊNCIA & OPERAÇÕES (SUPABASE NATIVO)

  // PACIENTES & LEADS CRM
  const addPatient = async (newPat) => {
    const clinicId = newPat.clinic_id || clinic?.id;

    // Sincronizar foto de perfil automática do WhatsApp ou Lead do CRM pelo telefone
    const cleanPhone = (newPat.phone || '').replace(/\D/g, '');
    const matchedChat = whatsappChats.find(c => c.phone && c.phone.replace(/\D/g, '') === cleanPhone);
    const matchedLead = crmLeads.find(l => l.phone && l.phone.replace(/\D/g, '') === cleanPhone);
    const resolvedAvatar = newPat.avatar_url || newPat.photoUrl || matchedChat?.avatar || matchedLead?.avatar_url || null;

    const dbPayload = {
      name: newPat.name,
      phone: newPat.phone || '',
      email: newPat.email || null,
      clinic_id: isValidUUID(clinicId) ? clinicId : null,
      created_at: new Date().toISOString()
    };

    let createdPat = null;

    if (dbPayload.clinic_id) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .insert([dbPayload])
          .select()
          .single();
        if (!error && data) {
          createdPat = { 
            ...data, 
            cpf: newPat.cpf || null, 
            notes: newPat.notes || '',
            medical_history: newPat.medical_history || null,
            photoUrl: resolvedAvatar,
            avatar_url: resolvedAvatar 
          };
        } else if (error) {
          console.warn('[Supabase] Aviso ao cadastrar paciente no Supabase:', error.message || error);
        }
      } catch (err) {
        console.warn('[Supabase] Erro ao cadastrar paciente:', err.message || err);
      }
    }

    if (!createdPat) {
      createdPat = { 
        id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
        ...newPat, 
        photoUrl: resolvedAvatar,
        avatar_url: resolvedAvatar,
        clinic_id: clinicId 
      };
    }

    setPatients(prev => [...prev.filter(p => p.id !== createdPat.id), createdPat]);

    // Auto-sincronizar no CRM para o paciente aparecer imediatamente no Kanban / Jornada
    try {
      const cleanPhone = createdPat.phone?.replace(/\D/g, '');
      const normName = createdPat.name?.trim().toLowerCase();
      const alreadyInCrm = crmLeads.some(l => 
        (l.patient_id && l.patient_id === createdPat.id) ||
        (cleanPhone && l.phone && l.phone.replace(/\D/g, '') === cleanPhone) ||
        (normName && l.name && l.name.trim().toLowerCase() === normName)
      );

      if (!alreadyInCrm) {
        await addCrmLead({
          name: createdPat.name,
          phone: createdPat.phone || '',
          procedure_name: newPat.procedure_name || 'Consulta Geral',
          stage: 0, // Novo Paciente no CRM
          priority: newPat.priority || 'medium',
          is_patient: true,
          patient_id: createdPat.id
        });
      }
    } catch (crmErr) {
      console.warn('[CRM Sync] Aviso na sincronização do novo paciente com o CRM:', crmErr);
    }

    return createdPat;
  };

  const updatePatient = async (updatedPat) => {
    if (isValidUUID(updatedPat.id)) {
      // Sanitização estrita: enviar apenas colunas estritamente existentes na tabela 'patients' no Supabase
      const allowedKeys = ['name', 'phone', 'email', 'medical_history', 'clinic_id'];
      const dbPayload = {};

      allowedKeys.forEach(key => {
        if (updatedPat[key] !== undefined && updatedPat[key] !== null) {
          if (key === 'medical_history' && typeof updatedPat[key] === 'object') {
            dbPayload[key] = JSON.stringify(updatedPat[key]);
          } else {
            dbPayload[key] = updatedPat[key];
          }
        }
      });

      try {
        if (Object.keys(dbPayload).length > 0) {
          const { error } = await supabase
            .from('patients')
            .update(dbPayload)
            .eq('id', updatedPat.id);
          if (error) console.warn('[Supabase] Aviso ao atualizar paciente:', error.message || error);
        }
      } catch (err) {
        console.warn('[Supabase] Erro ao atualizar paciente:', err);
      }
    }

    setPatients(prev => prev.map(p => p.id === updatedPat.id ? updatedPat : p));
  };

  // CRM LEADS (Tabela crm_leads)
  const addCrmLead = async (lead) => {
    const clinicId = lead.clinic_id || clinic?.id;
    const dbPayload = {
      clinic_id: isValidUUID(clinicId) ? clinicId : null,
      name: lead.name,
      phone: lead.phone || '',
      stage: lead.stage !== undefined ? lead.stage : 0, // Novo Lead
      priority: lead.priority || 'medium',
      created_at: new Date().toISOString()
    };

    let createdLead = null;

    if (dbPayload.clinic_id) {
      try {
        const { data, error } = await supabase
          .from('crm_leads')
          .insert([dbPayload])
          .select()
          .single();
        if (!error && data) {
          createdLead = { 
            ...data, 
            avatar: lead.avatar || '👤',
            budget_amount: lead.budget_amount || 0.00,
            procedure_name: lead.procedure_name || 'Consulta Geral',
            comments: lead.comments || [],
            checklist: lead.checklist || [],
            attachments: lead.attachments || [],
            history: [{ date: new Date().toISOString(), type: 'STATUS', description: 'Lead cadastrado no CRM', user: user?.full_name || 'Profissional' }],
            is_patient: lead.is_patient, 
            patient_id: lead.patient_id 
          };
        } else if (error) {
          console.warn('[Supabase] Aviso ao cadastrar crm_lead no Supabase:', error.message || error);
        }
      } catch (err) {
        console.warn('[Supabase] Erro ao cadastrar crm_lead:', err.message || err);
      }
    }

    if (!createdLead) {
      createdLead = {
        id: 'lead-' + Date.now(),
        ...lead,
        clinic_id: clinicId,
        avatar: lead.avatar || '👤',
        budget_amount: lead.budget_amount || 0.00,
        procedure_name: lead.procedure_name || 'Consulta Geral',
        comments: lead.comments || [],
        checklist: lead.checklist || [],
        attachments: lead.attachments || [],
        history: [{ date: new Date().toISOString(), type: 'STATUS', description: 'Lead cadastrado no CRM', user: user?.full_name || 'Profissional' }],
        is_patient: lead.is_patient || false,
        patient_id: lead.patient_id || null
      };
    }

    setCrmLeads(prev => [...prev, createdLead]);

    // Atualizar chats do WhatsApp para a nova conversa aparecer instantaneamente
    setWhatsappChats(prev => {
      const exists = prev.some(c => c.patientId === createdLead.id || c.patientId === createdLead.patient_id);
      if (exists) return prev;
      return [
        ...prev,
        {
          patientId: createdLead.patient_id || createdLead.id,
          name: createdLead.name,
          unreadCount: 0,
          status: 'online',
          tags: createdLead.is_patient ? ['Paciente'] : ['Lead'],
          notes: '',
          isBotPaused: false,
          messages: []
        }
      ];
    });

    return createdLead;
  };

  const updateCrmLead = async (updatedLead) => {
    // Sanitização de colunas sintéticas que não existem na tabela crm_leads do banco
    const { 
      status, patientName, patientPhone, unreadCount, badge, 
      tags, messages, since, type, isBotPaused, patientId, 
      ...dbPayload 
    } = updatedLead;

    if (isValidUUID(updatedLead.id)) {
      const { error } = await supabase
        .from('crm_leads')
        .update(dbPayload)
        .eq('id', updatedLead.id);
      if (error) console.warn('[Supabase] Aviso ao atualizar crm_lead:', error);
    }

    setCrmLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  const deletePatient = async (patientId) => {
    const clinicId = clinic.id;
    const pat = patients.find(p => p.id === patientId);

    // 1. Excluir no banco Supabase
    if (isValidUUID(patientId)) {
      try {
        await supabase.from('patients').delete().eq('id', patientId).eq('clinic_id', clinicId);
        await supabase.from('crm_leads').delete().eq('patient_id', patientId).eq('clinic_id', clinicId);
        await supabase.from('chat_messages').delete().eq('patient_id', patientId).eq('clinic_id', clinicId);
        await supabase.from('chat_sessions').delete().eq('patient_id', patientId).eq('clinic_id', clinicId);
      } catch (err) {
        console.warn('[Supabase] Erro ao excluir paciente do banco:', err);
      }
    }

    if (pat) {
      const cleanPhone = pat.phone?.replace(/\D/g, '');
      const normName = pat.name?.trim().toLowerCase();
      const matchingLeads = crmLeads.filter(l => 
        (l.patient_id && l.patient_id === patientId) ||
        (cleanPhone && l.phone && l.phone.replace(/\D/g, '') === cleanPhone) ||
        (normName && l.name && l.name.trim().toLowerCase() === normName)
      );

      for (const mLead of matchingLeads) {
        if (isValidUUID(mLead.id)) {
          try {
            await supabase.from('crm_leads').delete().eq('id', mLead.id).eq('clinic_id', clinicId);
          } catch (e) {}
        }
      }
    }

    // 2. Atualizar estados locais
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setCrmLeads(prev => prev.filter(l => l.patient_id !== patientId && (!pat || l.name?.trim().toLowerCase() !== pat.name?.trim().toLowerCase())));
    setWhatsappChats(prev => prev.filter(c => c.patientId !== patientId));
  };

  const deleteCrmLead = async (leadId) => {
    const clinicId = clinic.id;

    if (isValidUUID(leadId)) {
      try {
        await supabase.from('crm_leads').delete().eq('id', leadId).eq('clinic_id', clinicId);
        await supabase.from('chat_messages').delete().eq('patient_id', leadId).eq('clinic_id', clinicId);
        await supabase.from('chat_sessions').delete().eq('patient_id', leadId).eq('clinic_id', clinicId);
      } catch (err) {
        console.warn('[Supabase] Erro ao excluir lead do banco:', err);
      }
    }

    setCrmLeads(prev => prev.filter(l => l.id !== leadId));
    setWhatsappChats(prev => prev.filter(c => c.patientId !== leadId));
  };

  // Converter Lead para Paciente Clínico (Mantendo o lead na jornada comercial do CRM)
  const convertLeadToPatient = async (leadId) => {
    const lead = crmLeads.find(l => l.id === leadId);
    if (!lead) return;

    // 1. Criar prontuário com histórico inicial
    const historyObj = {
      notes: `Paciente convertido a partir de Lead comercial. Interesse inicial: ${lead.procedure_name || 'Geral'}.`
    };

    // 2. Adicionar o paciente no cadastro de pacientes clínicos
    const newPat = {
      name: lead.name,
      phone: lead.phone,
      avatar_url: lead.avatar_url || lead.photoUrl || (whatsappChats.find(c => c.phone === lead.phone)?.avatar),
      medical_history: JSON.stringify(historyObj)
    };

    const patientData = await addPatient(newPat);

    // 3. Atualizar o Lead no CRM para Estágio "Fechado" (stage = 7) ou "Tratamento" (stage = 8) com badge de Paciente
    const updatedLead = {
      ...lead,
      stage: lead.stage < 7 ? 7 : lead.stage, // Mover para 'Fechado' se estiver em etapas anteriores
      is_patient: true,
      patient_id: patientData.id,
      history: [
        ...(lead.history || []),
        {
          date: new Date().toISOString(),
          type: 'CONVERSION',
          description: `Convertido em Paciente Ativo no Prontuário Clínico (ID: ${patientData.id})`,
          user: user?.full_name || 'Profissional'
        }
      ]
    };

    await updateCrmLead(updatedLead);

    // 4. Garantir que o chat no WhatsApp esteja tagueado como Paciente
    if (whatsappChats.some(c => c.phone === lead.phone || c.patientId === patientData.id)) {
      updateChatTags(patientData.id || lead.phone, ['Paciente', 'Convertido']);
    }

    return patientData;
  };



  // CONSULTAS
  const addAppointment = async (app) => {
    const clinicId = clinic.id;

    // Calcular start_time e end_time se apenas date e time forem fornecidos
    let calculatedStartTime = app.start_time || app.startTime;
    if (!calculatedStartTime && app.date) {
      const timeStr = app.time || '09:00';
      calculatedStartTime = new Date(`${app.date}T${timeStr}:00`).toISOString();
    }
    if (!calculatedStartTime) {
      calculatedStartTime = new Date().toISOString();
    }

    let calculatedEndTime = app.end_time || app.endTime;
    if (!calculatedEndTime && calculatedStartTime) {
      const durationMin = app.duration || 30;
      const endDate = new Date(new Date(calculatedStartTime).getTime() + durationMin * 60000);
      calculatedEndTime = endDate.toISOString();
    }

    const cleanApp = {
      clinic_id: isValidUUID(clinicId) ? clinicId : null,
      patient_id: (app.patient_id && isValidUUID(app.patient_id)) ? app.patient_id : ((app.patientId && isValidUUID(app.patientId)) ? app.patientId : null),
      doctor_id: (app.doctor_id && isValidUUID(app.doctor_id)) ? app.doctor_id : ((app.doctorId && isValidUUID(app.doctorId)) ? app.doctorId : null),
      start_time: calculatedStartTime,
      end_time: calculatedEndTime,
      status: app.status || 'PENDING',
      chair_id: (app.chair_id && isValidUUID(app.chair_id)) ? app.chair_id : ((app.chairId && isValidUUID(app.chairId)) ? app.chairId : null),
      room: app.room || null,
      procedure_id: (app.procedure_id && isValidUUID(app.procedure_id)) ? app.procedure_id : ((app.procedureId && isValidUUID(app.procedureId)) ? app.procedureId : null),
      observations: app.observations || null,
      title: app.title || null
    };

    let savedData;
    if (cleanApp.clinic_id && cleanApp.patient_id) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert([{ ...cleanApp, created_at: new Date().toISOString() }])
          .select()
          .single();
        
        if (!error && data) {
          savedData = data;
        } else {
          savedData = {
            id: 'app-' + Math.random().toString(36).substr(2, 9),
            ...cleanApp,
            patient_id: app.patient_id || app.patientId,
            created_at: new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn('[Supabase] Erro ao inserir consulta no Supabase, usando estado local:', err.message || err);
        savedData = {
          id: 'app-' + Math.random().toString(36).substr(2, 9),
          ...cleanApp,
          patient_id: app.patient_id || app.patientId,
          created_at: new Date().toISOString()
        };
      }
    } else {
      savedData = {
        id: 'app-' + Math.random().toString(36).substr(2, 9),
        ...cleanApp,
        patient_id: app.patient_id || app.patientId,
        created_at: new Date().toISOString()
      };
    }

    const p = patients.find(pat => pat.id === (savedData.patient_id || app.patient_id || app.patientId));
    const proc = procedures.find(pr => pr.id === savedData.procedure_id);
    const fullApp = {
      ...savedData,
      patientName: p ? p.name : (app.patientName || 'Paciente'),
      patientPhone: p ? p.phone : (app.patientPhone || ''),
      procedureName: proc ? proc.name : (app.procedureName || 'Consulta Geral'),
      color: proc ? proc.color : '#3b82f6',
      date: app.date || calculatedStartTime.split('T')[0],
      time: app.time || (calculatedStartTime.includes('T') ? calculatedStartTime.split('T')[1].substring(0, 5) : '09:00')
    };

    setAppointments(prev => [...prev, fullApp]);
    return fullApp;
  };


  const updateAppointment = async (updatedApp) => {
    const rawPatientId = updatedApp.patient_id || updatedApp.patientId;
    const rawDoctorId = updatedApp.doctor_id || updatedApp.doctorId;
    const rawChairId = updatedApp.chair_id || updatedApp.chairId;
    const rawProcId = updatedApp.procedure_id || updatedApp.procedureId;

    const cleanApp = {
      id: updatedApp.id,
      clinic_id: updatedApp.clinic_id || clinic?.id,
      patient_id: isValidUUID(rawPatientId) ? rawPatientId : null,
      doctor_id: isValidUUID(rawDoctorId) ? rawDoctorId : null,
      start_time: updatedApp.start_time || updatedApp.startTime,
      end_time: updatedApp.end_time || updatedApp.endTime,
      status: updatedApp.status || 'PENDING',
      chair_id: isValidUUID(rawChairId) ? rawChairId : null,
      room: updatedApp.room || null,
      procedure_id: isValidUUID(rawProcId) ? rawProcId : null,
      title: updatedApp.title || null,
      duration: updatedApp.duration || 30,
      observations: updatedApp.observations || null,
      send_confirmation: updatedApp.send_confirmation !== undefined ? updatedApp.send_confirmation : (updatedApp.sendConfirmation !== undefined ? updatedApp.sendConfirmation : false),
      return_days: updatedApp.return_days !== undefined ? updatedApp.return_days : (updatedApp.returnDays !== undefined ? updatedApp.returnDays : null),
      label: updatedApp.label || null,
      type: updatedApp.type || 'CONSULTA',
      is_recurring: updatedApp.is_recurring !== undefined ? updatedApp.is_recurring : (updatedApp.isRecurring !== undefined ? updatedApp.isRecurring : false),
    };

    if (isValidUUID(cleanApp.id)) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update(cleanApp)
          .eq('id', cleanApp.id);
        
        if (error) {
          if (error.code === 'PGRST204' || error.message?.includes('column')) {
            console.warn('[Supabase] Migration columns missing, updated locally only.');
          }
        }
      } catch (err) {
        console.warn('[Supabase] Error updating appointment, updated locally only:', err.message || err);
      }
    }

    const p = patients.find(pat => pat.id === rawPatientId || pat.id === cleanApp.patient_id);
    const proc = procedures.find(pr => pr.id === rawProcId || pr.id === cleanApp.procedure_id);

    setAppointments(prev => prev.map(a => a.id === updatedApp.id ? {
      ...a,
      ...updatedApp,
      ...cleanApp,
      patient_id: rawPatientId || a.patient_id,
      patientName: p ? p.name : (updatedApp.patientName || a.patientName || (cleanApp.type === 'COMPROMISSO' ? '' : 'Paciente')),
      patientPhone: p ? p.phone : (updatedApp.patientPhone || a.patientPhone || ''),
      procedureName: proc ? proc.name : (updatedApp.procedureName || a.procedureName || 'Consulta Geral'),
      color: proc ? proc.color : (updatedApp.color || a.color || '#3b82f6'),
      chair_id: rawChairId || a.chair_id,
      chairId: rawChairId || a.chair_id,
      doctor_id: rawDoctorId || a.doctor_id,
      procedure_id: rawProcId || a.procedure_id,
      procedureId: rawProcId || a.procedure_id,
      sendConfirmation: cleanApp.send_confirmation,
      returnDays: cleanApp.return_days,
      isRecurring: cleanApp.is_recurring
    } : a));
  };

  // CADEIRAS
  const addChair = async (name) => {
    const clinicId = clinic.id;
    const fresh = {
      clinic_id: clinicId,
      name,
      created_at: new Date().toISOString()
    };

    let savedData;
    try {
      const { data, error } = await supabase
        .from('chairs')
        .insert([fresh])
        .select()
        .single();
      
      if (error) throw error;
      savedData = data;
    } catch (err) {
      console.warn('[Supabase] Error inserting chair, simulating locally:', err.message || err);
      savedData = {
        id: 'chair-' + Math.random().toString(36).substr(2, 9),
        ...fresh
      };
    }

    setChairs(prev => [...prev, savedData]);
    return savedData;
  };

  const deleteChair = async (id) => {
    try {
      const { error } = await supabase
        .from('chairs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.warn('[Supabase] Error deleting chair, simulating locally:', err.message || err);
    }

    setChairs(prev => prev.filter(c => c.id !== id));
  };

  const updateChair = async (chairObj) => {
    try {
      const { error } = await supabase
        .from('chairs')
        .update({ name: chairObj.name })
        .eq('id', chairObj.id);
      if (error) throw error;
    } catch (err) {
      console.warn('[Supabase] Error updating chair, simulating locally:', err.message || err);
    }

    setChairs(prev => prev.map(c => c.id === chairObj.id ? { ...c, ...chairObj } : c));
  };

  const addDentist = (fullName) => {
    const clinicId = clinic.id;
    const newDoc = {
      id: 'doc-' + Math.random().toString(36).substr(2, 9),
      clinic_id: clinicId,
      full_name: fullName,
      role: 'DOCTOR'
    };
    setDentists(prev => [...prev, newDoc]);
    return newDoc;
  };

  // WHATSAPP MESSAGES
  const sendWhatsAppMessage = (patientId, text, sender = 'USER', type = 'text', url = null) => {
    const clinicId = clinic.id;
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      sender,
      text,
      time,
      type,
      url
    };

    setWhatsappChats(prev => prev.map(chat => {
      if (chat.patientId === patientId || chat.phone === patientId) {
        return {
          ...chat,
          unreadCount: sender === 'PATIENT' ? chat.unreadCount + 1 : 0,
          messages: [...chat.messages, newMsg]
        };
      }
      return chat;
    }));

    // Sincronizar mensagens enviadas no WhatsApp diretamente na linha do tempo do CRM
    setCrmLeads(prev => prev.map(lead => {
      const matchId = lead.id === patientId || lead.patient_id === patientId;
      const matchPhone = lead.phone && (lead.phone === patientId || patientId.includes(lead.phone.replace(/\D/g, '')));
      if (matchId || matchPhone) {
        const newCrmComment = {
          date: new Date().toISOString(),
          text,
          user: sender === 'USER' ? 'Profissional' : sender === 'BOT' ? 'IA Bot' : lead.name,
          mode: 'whatsapp'
        };
        return {
          ...lead,
          comments: [...(lead.comments || []), newCrmComment]
        };
      }
      return lead;
    }));

    // Salvar no Supabase apenas se patientId for um UUID válido no banco
    if (patientId && isValidUUID(patientId)) {
      supabase.from('chat_messages').insert({
        clinic_id: isValidUUID(clinicId) ? clinicId : null,
        patient_id: patientId,
        sender: sender,
        message_text: text
      }).then(({ error }) => {
        if (error) console.warn('[Supabase] Aviso ao persistir chat_message:', error);
      });
    }

    // DISPARAR INTEGRAÇÃO REAL COM EVOLUTION API (SE CONFIGURADA)
    if (sender === 'USER' || sender === 'BOT') {
      const savedUrl = localStorage.getItem(`evolution_url_${clinicId}`);
      const savedInstance = localStorage.getItem(`evolution_instance_${clinicId}`);
      const savedToken = localStorage.getItem(`evolution_token_${clinicId}`);
      const savedStatus = localStorage.getItem(`evolution_status_${clinicId}`) || 'CONNECTED';

      if (savedUrl && savedInstance && savedToken && savedStatus === 'CONNECTED') {
        const pat = patients.find(p => p.id === patientId);
        const phoneNumber = pat ? pat.phone.replace(/\D/g, '') : patientId.replace(/\D/g, '');

        if (phoneNumber) {
          let formattedNumber = phoneNumber;
          if (!formattedNumber.startsWith('55') && formattedNumber.length <= 11) {
            formattedNumber = '55' + formattedNumber;
          }

          console.log(`[Evolution API] Enviando mensagem manual para ${formattedNumber}...`);

          fetch(`${savedUrl.replace(/\/$/, '')}/message/sendText/${savedInstance}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': savedToken
            },
            body: JSON.stringify({
              number: formattedNumber,
              text: text,
              options: {
                delay: 1200,
                presence: "composing"
              }
            })
          }).then(response => {
            if (!response.ok) {
              console.error('[Evolution API] Erro ao enviar mensagem:', response.statusText);
            }
          }).catch(err => {
            console.error('[Evolution API] Falha na rede ao contactar Evolution API:', err);
          });
        }
      }
    }
  };

  const sendWhatsAppButtons = async (targetPhoneOrId, title, description, footerText, buttonsArray) => {
    const clinicId = clinic.id;
    const savedUrl = localStorage.getItem(`evolution_url_${clinicId}`) || 'http://179.197.225.90:8080';
    const savedInstance = localStorage.getItem(`evolution_instance_${clinicId}`) || 'dentalflow-prod';
    const savedToken = localStorage.getItem(`evolution_token_${clinicId}`) || 'dentalflow_key_secure_123456';

    const pat = patients.find(p => p.id === targetPhoneOrId);
    let phoneNumber = pat ? pat.phone.replace(/\D/g, '') : targetPhoneOrId.replace(/\D/g, '');
    if (phoneNumber && !phoneNumber.startsWith('55') && phoneNumber.length <= 11) {
      phoneNumber = '55' + phoneNumber;
    }

    try {
      const response = await fetch(`${savedUrl.replace(/\/$/, '')}/message/sendButtons/${savedInstance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': savedToken
        },
        body: JSON.stringify({
          number: phoneNumber,
          title: title,
          description: description,
          footer: footerText || 'OdontoCRM - Odontologia Especializada',
          buttons: buttonsArray
        })
      });
      return await response.json();
    } catch (err) {
      console.error('[Evolution API] Erro ao enviar botões interativos:', err);
      return null;
    }
  };

  const updateChatNotes = async (patientId, notes) => {
    setWhatsappChats(prev => prev.map(c => c.patientId === patientId ? { ...c, notes } : c));
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, notes } : p));
    try {
      if (patientId) {
        localStorage.setItem(`patient_notes_${patientId}`, notes || '');
      }
      if (clinic?.id && patientId && isValidUUID(patientId)) {
        await supabase
          .from('patients')
          .update({ notes })
          .eq('id', patientId)
          .eq('clinic_id', clinic.id);
      }
    } catch (err) {
      console.warn('[Supabase] Erro ao atualizar notas do paciente:', err);
    }
  };

  const updateChatTags = async (patientId, tags) => {
    const uniqueTags = Array.isArray(tags) ? Array.from(new Set(tags)) : [];
    setWhatsappChats(prev => prev.map(c => c.patientId === patientId ? { ...c, tags: uniqueTags } : c));
    try {
      if (patientId) {
        localStorage.setItem(`chat_tags_${patientId}`, JSON.stringify(uniqueTags));
      }
    } catch (err) {
      console.warn('[LocalStorage] Erro ao salvar tags:', err);
    }
  };

  const toggleBotSilence = async (patientId, isPaused) => {
    const clinicId = clinic.id;

    if (patientId && isValidUUID(patientId)) {
      try {
        const { error } = await supabase
          .from('chat_sessions')
          .upsert({
            clinic_id: clinicId,
            patient_id: patientId,
            is_bot_paused: isPaused,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'patient_id'
          });
        if (error) throw error;
      } catch (err) {
        console.warn('[Supabase] Erro ao alternar silenciamento do bot:', err);
      }
    }

    setWhatsappChats(prev => prev.map(chat => 
      chat.patientId === patientId 
        ? { ...chat, isBotPaused: isPaused } 
        : chat
    ));
  };

  // FINANCEIRO (Lançamento Otimista e Instantâneo)
  const addTransaction = async (t) => {
    const rawClinicId = clinic?.id || clinic?.clinic_id;
    const clinicId = isValidUUID(rawClinicId) ? rawClinicId : null;

    const fresh = {
      id: t.id || 'trans-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      clinic_id: clinicId,
      description: t.description || 'Lançamento',
      amount: typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0,
      type: t.type || 'INCOME',
      category: t.category || 'Tratamentos',
      date: t.date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    // 1. Atualização instantânea na UI (0ms de atraso)
    setFinanceTransactions(prev => [fresh, ...prev]);

    // 2. Persistência remota em segundo plano se houver UUID de clínica válido
    if (clinicId) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert([{
            clinic_id: clinicId,
            description: fresh.description,
            amount: fresh.amount,
            type: fresh.type,
            category: fresh.category,
            date: fresh.date
          }])
          .select()
          .single();

        if (!error && data) {
          setFinanceTransactions(prev => prev.map(item => item.id === fresh.id ? { ...item, id: data.id } : item));
        }
      } catch (err) {
        console.warn('[Supabase] Erro ao persistir transação remota:', err);
      }
    }
    return fresh;
  };

  // CONFIGURAÇÕES
  const saveProcedures = async (procsList) => {
    const clinicId = clinic?.id || 'default';
    setProcedures(procsList);
    try {
      localStorage.setItem(`clinic_procedures_${clinicId}`, JSON.stringify(procsList));
    } catch (e) {}

    if (isValidUUID(clinicId)) {
      try {
        await supabase.from('procedures').delete().eq('clinic_id', clinicId);
        const dbPayload = procsList.map(p => ({
          name: p.name,
          category: p.category || 'Geral',
          price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
          clinic_id: clinicId
        }));
        await supabase.from('procedures').insert(dbPayload);
      } catch (err) {}
    }
  };

  const saveInsurancePlans = async (plansList) => {
    const clinicId = clinic?.id || 'default';
    setInsurancePlans(plansList);
    try {
      localStorage.setItem(`clinic_insurance_plans_${clinicId}`, JSON.stringify(plansList));
    } catch (e) {}

    if (isValidUUID(clinicId)) {
      try {
        await supabase.from('insurance_plans').delete().eq('clinic_id', clinicId);
        const dbPayload = plansList.map(p => ({
          name: p.name,
          clinic_id: clinicId
        }));
        await supabase.from('insurance_plans').insert(dbPayload);
      } catch (err) {}
    }
  };

  const saveAiConfig = async (newConfig) => {
    const clinicId = clinic?.id;
    if (!clinicId) return;

    try {
      const mergedConfig = {
        ...aiConfig,
        ...newConfig
      };

      const { error } = await supabase
        .from('whatsapp_config')
        .upsert(
          {
            clinic_id: clinicId,
            agent_prompt: mergedConfig.prompt || '',
            is_active: mergedConfig.isActive !== undefined ? mergedConfig.isActive : true
          },
          { onConflict: 'clinic_id' }
        );

      if (error) {
        console.warn('[ClinicContext] Aviso ao salvar config de IA em whatsapp_config:', error.message);
      }

      mockDb.set('odonto_crm_ai_config_' + clinicId, mergedConfig);
      setAiConfig(mergedConfig);
    } catch (err) {
      console.error('Erro ao salvar config de IA no Supabase:', err);
    }
  };

  // AUTOMACÕES
  const addAutomation = async (aut) => {
    const clinicId = clinic.id;
    const fresh = {
      ...aut,
      clinic_id: clinicId,
      is_active: true
    };

    const { data, error } = await supabase
      .from('automations')
      .insert([fresh])
      .select()
      .single();
    if (error) throw error;
    setAutomations(prev => [...prev, data]);
  };

  const updateAutomationStatus = async (id, isActive) => {
    try {
      await supabase
        .from('automations')
        .update({ is_active: isActive })
        .eq('id', id);
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, isActive } : a));
    } catch (err) {
      console.error('Erro ao atualizar status de automação no Supabase:', err);
    }
  };

  // FORNECEDORES
  const addSupplier = async (supplier) => {
    const clinicId = clinic.id;
    const fresh = { ...supplier, clinic_id: clinicId };

    const { data, error } = await supabase
      .from('suppliers')
      .insert([fresh])
      .select()
      .single();
    if (error) throw error;
    setSuppliers(prev => [...prev, data]);
    return data;
  };

  // CONTAS A PAGAR
  const addAccountsPayable = async (payable) => {
    const clinicId = clinic.id;
    const initialStatus = payable.amount > 2000 ? 'AWAITING_APPROVAL' : 'PENDING';

    const fresh = {
      ...payable,
      clinic_id: clinicId,
      status: initialStatus,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('accounts_payable')
      .insert([fresh])
      .select()
      .single();
    if (error) throw error;
    setAccountsPayable(prev => [...prev, data]);
    return data;
  };

  const approveAccountsPayable = async (id) => {
    try {
      const { error } = await supabase
        .from('accounts_payable')
        .update({ status: 'PENDING', approved_by: user.id })
        .eq('id', id);
      if (error) throw error;

      setAccountsPayable(prev => prev.map(ap => ap.id === id ? { ...ap, status: 'PENDING', approved_by: user.id } : ap));
    } catch (err) {
      console.error('Erro ao aprovar despesa no Supabase:', err);
    }
  };

  const payAccountsPayable = async (id) => {
    const payable = accountsPayable.find(ap => ap.id === id);
    if (!payable) return;

    const updatedFields = {
      status: 'PAID',
      paid_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('accounts_payable')
        .update(updatedFields)
        .eq('id', id);
      if (error) throw error;

      setAccountsPayable(prev => prev.map(ap => ap.id === id ? { ...ap, ...updatedFields } : ap));

      await addTransaction({
        description: `Pgto Despesa - ${payable.description}`,
        amount: payable.amount,
        type: 'EXPENSE',
        category: payable.category
      });
    } catch (err) {
      console.error('Erro ao pagar despesa no Supabase:', err);
    }
  };

  // CONTAS A RECEBER / PARCELAS
  const payInstallment = async (id) => {
    const inst = installments.find(i => i.id === id);
    if (!inst) return;

    const updatedFields = {
      status: 'PAID',
      paid_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('installments')
        .update(updatedFields)
        .eq('id', id);
      if (error) throw error;

      setInstallments(prev => prev.map(i => i.id === id ? { ...i, ...updatedFields } : i));

      await addTransaction({
        description: `Rec. Parcela - ${inst.patientName || 'Paciente'} (${inst.description || 'Tratamento'})`,
        amount: inst.amount,
        type: 'INCOME',
        category: 'TREATMENT'
      });
    } catch (err) {
      console.error('Erro ao liquidar parcela no Supabase:', err);
    }
  };

  const checkPatientInadimplente = (patientId) => {
    const today = new Date();
    return installments.some(inst => {
      if (inst.patient_id !== patientId && inst.patientId !== patientId) return false;
      if (inst.status === 'PAID') return false;
      const dueDate = new Date(inst.due_date);
      const diffTime = today - dueDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 30;
    });
  };

  // Algoritmo SHA-256 em JavaScript puro para fallback seguro em conexões HTTP locais (não seguras)
  const sha256Fallback = (ascii) => {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;
    var result = '';

    var words = [];
    var asciiLength = ascii[lengthProperty] * 8;
    
    var hash = sha256Fallback.h = sha256Fallback.h || [];
    var k = sha256Fallback.k = sha256Fallback.k || [];
    var primeCounter = 0;

    var isPrime = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isPrime[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isPrime[i] = 1;
        }
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return ''; // check for non-ASCII
      words[i >> 2] |= j << (24 - (i % 4) * 8);
    }
    words[words[lengthProperty]] = ((asciiLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiLength);
    
    for (j = 0; j < words[lengthProperty];) {
      var w = words.slice(j, j += 16);
      var oldHash = hash.slice(0);
      
      hash = hash.slice(0, 8);
      
      for (i = 0; i < 64; i++) {
        var wItem = w[i];
        if (i >= 16) {
          var s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
          var s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
          wItem = w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        }
        
        var ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        var maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        var sigma0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
        var sigma1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
        
        var t1 = hash[7] + sigma1 + ch + k[i] + wItem;
        var t2 = sigma0 + maj;
        
        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }
      
      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }
    
    for (i = 0; i < 8; i++) {
      var val = hash[i];
      if (val < 0) val += maxWord;
      result += (val).toString(16).padStart(8, '0');
    }
    
    return result;
  };

  // Auxiliar para gerar assinatura criptográfica de integridade SHA-256 (RN-001)
  const generateSHA256 = async (message) => {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      console.warn('SubtleCrypto falhou ou indisponível. Usando JS fallback seguro:', e);
    }
    return sha256Fallback(message);
  };

  // Adicionar evolução clínica (RN-001 / RN-002)
  const addMedicalRecord = async (record) => {
    const clinicId = clinic.id;
    const dentistId = user?.id || 'd-1';
    const dentistName = user?.full_name || 'Dr. Pedro Ramos';

    const rawText = record.description;
    const textHash = await generateSHA256(rawText);
    const signature_hash = await generateSHA256(`${dentistId}:${textHash}`);

    const newRecord = {
      id: record.id || Math.random().toString(36).substring(2, 9),
      clinic_id: clinicId,
      patient_id: record.patient_id,
      dentist_id: dentistId,
      dentistName,
      description: rawText,
      signature_hash,
      is_adendo: record.is_adendo || false,
      parent_record_id: record.parent_record_id || null,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('medical_records')
        .insert([{
          clinic_id: clinicId,
          patient_id: record.patient_id,
          dentist_id: dentistId,
          description: rawText,
          signature_hash,
          is_adendo: record.is_adendo || false,
          parent_record_id: record.parent_record_id || null
        }])
        .select()
        .single();
      if (error) throw error;
      if (data) {
        newRecord.id = data.id;
        newRecord.created_at = data.created_at;
      }
    } catch (err) {
      console.error('Erro ao salvar evolução clínica no Supabase:', err);
    }

    setMedicalRecords(prev => [newRecord, ...prev]);
    return newRecord;
  };

  // Adicionar prescrição digital (Receitas e Atestados)
  const addPrescription = async (presc) => {
    const clinicId = clinic.id;
    const dentistId = user?.id || 'd-1';
    const dentistName = user?.full_name || 'Dr. Pedro Ramos';
    const textHash = await generateSHA256(presc.description);
    const signature_hash = await generateSHA256(`${dentistId}:${textHash}`);

    const newPresc = {
      id: presc.id || Math.random().toString(36).substring(2, 9),
      clinic_id: clinicId,
      patient_id: presc.patient_id,
      dentist_id: dentistId,
      dentistName,
      title: presc.title,
      description: presc.description,
      file_path: presc.file_path || `/storage/v1/prescriptions/${Math.random().toString(36).substring(2, 9)}.pdf`,
      signature_hash,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([{
          clinic_id: clinicId,
          patient_id: presc.patient_id,
          dentist_id: dentistId,
          title: presc.title,
          description: presc.description,
          file_path: newPresc.file_path,
          signature_hash
        }])
        .select()
        .single();
      if (error) throw error;
      if (data) {
        newPresc.id = data.id;
        newPresc.created_at = data.created_at;
      }
    } catch (err) {
      console.error('Erro ao salvar prescrição no Supabase:', err);
    }

    setPrescriptions(prev => [newPresc, ...prev]);
    return newPresc;
  };

  // Gerador de evoluções com Inteligência Artificial
  const generateAiEvolution = async (rawText) => {
    if (!rawText) return '';

    // Enriquecedor semântico profissional estruturado local (offline e fallback robusto)
    const terms = rawText.toLowerCase();
    if (terms.includes('canal') || terms.includes('endo') || terms.includes('polpa')) {
      return `Realizado tratamento endodôntico (canal) sob anestesia local infiltrativa. Concluído o preparo químico-mecânico dos condutos radiculares com irrigação abundante e obturação definitiva com guta-percha e cimento endodôntico. Oclusão checada. Sem intercorrências.`;
    } else if (terms.includes('limpeza') || terms.includes('profilaxia') || terms.includes('tártaro')) {
      return `Realizado procedimento de profilaxia clínica completa. Efetuada raspagem supragengival ultrassônica, curetagem periodontal, polimento coronário com jato de bicarbonato e aplicação tópica de flúor fosfato acidulado. Tecidos periodontais saudáveis.`;
    } else if (terms.includes('obturação') || terms.includes('restauração') || terms.includes('resina')) {
      return `Realizada restauração estética direta com resina composta fotopolimerizável. Preparo cavitário conservador sob isolamento relativo, condicionamento ácido e aplicação de sistema adesivo de alta performance. Ajustes oclusais e polimento final efetuados.`;
    } else if (terms.includes('extração') || terms.includes('cirurgia') || terms.includes('exodontia')) {
      return `Procedimento cirúrgico de exodontia sob anestesia local e bloqueio regional regional. Divulsão e sindesmotomia bem-sucedidas. Extração realizada de forma atraumática, seguida de curetagem alveolar e sutura com fio de seda. Emostasia adequada alcançada. Orientação pós-operatória prescrita.`;
    } else if (terms.includes('aparelho') || terms.includes('manutenção') || terms.includes('orto')) {
      return `Manutenção ortodôntica mensal efetuada. Troca de arcos ortodônticos e substituição das ligaduras elásticas. Verificação do alinhamento e nivelamento dos elementos dentais e avaliação de vetores de força. Higienização orientada.`;
    }

    return `Atendimento odontológico realizado: ${rawText}. Procedimento efetuado sob isolamento e controle asséptico rigoroso. Paciente confortável e orientado sobre cuidados pós-procedimento.`;
  };

  // Disparar envio de receita via WhatsApp (integração)
  const sendPrescriptionWhatsapp = async (prescriptionId) => {
    const presc = prescriptions.find(p => p.id === prescriptionId);
    if (!presc) return;
    const pat = patients.find(p => p.id === presc.patient_id);
    if (!pat) return;

    const messageText = `Olá, *${pat.name}*! Segue a sua receita/documento emitido pelo Dr. ${presc.dentistName}:\n\n📄 *${presc.title}*\n\n${presc.description}\n\nAssinatura Eletrônica ativa:\n🔑 HASH: \`${presc.signature_hash}\``;

    await sendWhatsAppMessage(pat.phone, messageText);
  };

  // Atualizar registro do dente (Odontograma FDI)
  const updateToothRecord = async (toothRec) => {
    const clinicId = clinic.id;
    const fresh = {
      id: toothRec.id || 'tooth-' + Math.random().toString(36).substr(2, 9),
      clinic_id: clinicId,
      patient_id: toothRec.patient_id,
      tooth_number: toothRec.tooth_number,
      procedure_name: toothRec.procedure_name || '',
      status: toothRec.status,
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('tooth_records')
        .upsert({
          clinic_id: clinicId,
          patient_id: toothRec.patient_id,
          tooth_number: toothRec.tooth_number,
          procedure_name: toothRec.procedure_name || '',
          status: toothRec.status,
          updated_at: fresh.updated_at
        }, {
          onConflict: 'patient_id,tooth_number'
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        fresh.id = data.id;
      }
    } catch (err) {
      console.error('Erro ao atualizar dente no Supabase:', err);
    }

    setToothRecords(prev => {
      const exists = prev.some(r => r.patient_id === toothRec.patient_id && r.tooth_number === toothRec.tooth_number);
      if (exists) {
        return prev.map(r => (r.patient_id === toothRec.patient_id && r.tooth_number === toothRec.tooth_number) ? fresh : r);
      } else {
        return [...prev, fresh];
      }
    });

    return fresh;
  };

  // Seed de Dados de Demonstração Completo e Massivo para Desenvolvimento (100% dos Módulos)
  const seedDemoData = async () => {
    const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const rawId = clinic?.id || clinic?.clinic_id;
    const clinicId = isUuid(rawId) ? rawId : '00000000-0000-0000-0000-000000000001';

    const docName = user?.full_name || 'Dr. Alexandre Silva';
    const mainDentistId = user?.id || 'd-1';
    const dentist2Id = 'd-2';
    const dentist2Name = 'Dra. Juliana Costa';

    // 1. Pacientes Clínicos Ricos com Odontograma 100% Compatível com OdontogramView.jsx
    // 1. Pacientes Clínicos Ricos com Odontograma 100% Compatível com OdontogramView.jsx
    const demoPatientsData = [
      { 
        name: 'Fernando Rocha', 
        phone: '(83) 98112-2334', 
        email: 'fernando.rocha@email.com', 
        cpf: '567.890.123-45',
        notes: 'Sensibilidade nos dentes sisos. Prefere anestesia sem vasoconstritor.',
        medical_history: JSON.stringify({
          notes: 'Paciente relata sensibilidade térmica no quadrante superior direito.',
          anamnese_estruturada: { has_alergia: 'Sim', has_alergia_detail: 'Penicilina e Dipirona', has_pressao_alta: 'Nao', has_diabetes: 'Nao' },
          odontogram: {
            teethData: {
              '16': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'restauracao', status: 'existente' } } },
              '14': { conditions: [{ condition: 'carie', status: 'planejado', face: 'mesial' }], surfaces: { mesial: { condition: 'carie', status: 'planejado' } } },
              '21': { conditions: [{ condition: 'faceta', status: 'existente', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'existente' } } },
              '26': { conditions: [{ condition: 'coroa', status: 'existente', face: 'inteiro' }], surfaces: { full: { condition: 'coroa', status: 'existente' } } },
              '36': { conditions: [{ condition: 'canal', status: 'existente', face: 'raiz' }], surfaces: { root: { condition: 'canal', status: 'existente' } } },
              '46': { conditions: [{ condition: 'implante', status: 'existente', face: 'inteiro' }], surfaces: { full: { condition: 'implante', status: 'existente' } } },
              '48': { conditions: [{ condition: 'extraido', status: 'planejado', face: 'inteiro' }], surfaces: { full: { condition: 'extraido', status: 'planejado' } } }
            },
            toothHistory: [
              { toothNumber: '16', condition: 'restauracao', conditionLabel: 'Restauração Resina', status: 'existente', face: 'Oclusal', date: '10/05/2024' },
              { toothNumber: '14', condition: 'carie', conditionLabel: 'Cárie Dental Mesial', status: 'planejado', face: 'Mesial', date: '15/05/2024' },
              { toothNumber: '21', condition: 'faceta', conditionLabel: 'Faceta Estética Cerâmica', status: 'existente', face: 'Vestibular', date: '01/06/2024' },
              { toothNumber: '26', condition: 'coroa', conditionLabel: 'Coroa Total Zircônia', status: 'existente', face: 'Inteiro', date: '08/06/2024' },
              { toothNumber: '36', condition: 'canal', conditionLabel: 'Tratamento de Canal Molar', status: 'existente', face: 'Raiz', date: '12/06/2024' },
              { toothNumber: '46', condition: 'implante', conditionLabel: 'Implante Osseointegrado', status: 'existente', face: 'Inteiro', date: '20/06/2024' },
              { toothNumber: '48', condition: 'extraido', conditionLabel: 'Exodontia Indicada', status: 'planejado', face: 'Inteiro', date: 'Hoje' }
            ],
            notes: 'Sensibilidade nos dentes sisos. Prefere anestesia sem vasoconstritor.'
          },
          treatment_plan: {
            activeStepId: 2,
            steps: [
              { id: 1, title: 'Avaliação Inicial', status: 'completed', completionDate: '01/06/2024' },
              { id: 2, title: 'Procedimentos Clínicos', status: 'active', procedures: [
                { dente: '16', nome: 'Restauração Resina', status: 'Concluído', dentista: docName, data: '05/06/2024', valor: 350 },
                { dente: '21', nome: 'Faceta Estética', status: 'Em andamento', dentista: docName, data: '12/06/2024', valor: 1800 },
                { dente: '48', nome: 'Exodontia Siso', status: 'Agendado', dentista: docName, data: '20/06/2024', valor: 450 }
              ]},
              { id: 3, title: 'Manutenção Preventiva', status: 'pending', procedures: [] }
            ],
            financialSummary: { total: 2600, paid: 2150 }
          }
        })
      },
      { 
        name: 'Ana Paula Souza', 
        phone: '(83) 98877-6655', 
        email: 'ana.paula@email.com', 
        cpf: '123.456.789-01',
        notes: 'Paciente frequente, prefere atendimentos pela manhã.',
        medical_history: JSON.stringify({
          notes: 'Manutenção ortodôntica mensal.',
          anamnese_estruturada: { has_alergia: 'Nao', has_pressao_alta: 'Nao' },
          odontogram: {
            teethData: {
              '11': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'mesial' }], surfaces: { mesial: { condition: 'restauracao', status: 'existente' } } },
              '15': { conditions: [{ condition: 'canal', status: 'existente', face: 'raiz' }], surfaces: { root: { condition: 'canal', status: 'existente' } } },
              '24': { conditions: [{ condition: 'carie', status: 'planejado', face: 'oclusal' }], surfaces: { oclusal: { condition: 'carie', status: 'planejado' } } },
              '27': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'restauracao', status: 'existente' } } },
              '33': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'vestibular' }], surfaces: { vestibular: { condition: 'restauracao', status: 'existente' } } },
              '36': { conditions: [{ condition: 'selante', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'selante', status: 'existente' } } },
              '47': { conditions: [{ condition: 'coroa', status: 'existente', face: 'inteiro' }], surfaces: { full: { condition: 'coroa', status: 'existente' } } }
            },
            toothHistory: [
              { toothNumber: '11', condition: 'restauracao', conditionLabel: 'Restauração Resina Mesial', status: 'existente', face: 'Mesial', date: '05/04/2024' },
              { toothNumber: '15', condition: 'canal', conditionLabel: 'Tratamento de Canal Pré-Molar', status: 'existente', face: 'Raiz', date: '15/05/2024' },
              { toothNumber: '24', condition: 'carie', conditionLabel: 'Cárie Oclusal Indicada', status: 'planejado', face: 'Oclusal', date: '20/05/2024' },
              { toothNumber: '27', condition: 'restauracao', conditionLabel: 'Restauração em Resina', status: 'existente', face: 'Oclusal', date: '22/05/2024' },
              { toothNumber: '33', condition: 'restauracao', conditionLabel: 'Restauração em Resina Estética', status: 'existente', face: 'Vestibular', date: '02/06/2024' },
              { toothNumber: '36', condition: 'selante', conditionLabel: 'Selante Preventivo Oclusal', status: 'existente', face: 'Oclusal', date: '10/06/2024' },
              { toothNumber: '47', condition: 'coroa', conditionLabel: 'Coroa Total de Porcelana', status: 'existente', face: 'Inteiro', date: 'Hoje' }
            ],
            notes: 'Manutenção ortodôntica mensal realizada sem queixas.'
          },
          treatment_plan: {
            activeStepId: 2,
            steps: [
              { id: 1, title: 'Avaliação e Diagnóstico', status: 'completed', completionDate: '10/05/2024' },
              { id: 2, title: 'Urgências', status: 'active', procedures: [
                { dente: '15', nome: 'Tratamento de Canal', status: 'Em andamento', dentista: dentist2Name, data: '15/05/2024', valor: 600 },
                { dente: '33', nome: 'Restauração em Resina', status: 'Agendado', dentista: dentist2Name, data: '22/05/2024', valor: 350 }
              ]},
              { id: 3, title: 'Restaurador', status: 'pending', procedures: [] },
              { id: 4, title: 'Reabilitação', status: 'pending', procedures: [] },
              { id: 5, title: 'Estética', status: 'pending', procedures: [] },
              { id: 6, title: 'Manutenção', status: 'pending', procedures: [] }
            ],
            financialSummary: { total: 3450, paid: 1200 }
          }
        })
      },
      { 
        name: 'Vanessa Lima', 
        phone: '(83) 99123-4567', 
        email: 'vanessa.lima@email.com', 
        cpf: '234.567.890-12',
        notes: 'Sensibilidade dentinária.',
        medical_history: JSON.stringify({
          notes: 'Realizando clareamento combinado.',
          anamnese_estruturada: { has_alergia: 'Sim', has_alergia_detail: 'Dipirona' },
          odontogram: {
            teethData: {
              '11': { conditions: [{ condition: 'faceta', status: 'existente', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'existente' } } },
              '12': { conditions: [{ condition: 'faceta', status: 'existente', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'existente' } } },
              '21': { conditions: [{ condition: 'faceta', status: 'existente', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'existente' } } },
              '22': { conditions: [{ condition: 'faceta', status: 'existente', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'existente' } } },
              '16': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'restauracao', status: 'existente' } } },
              '37': { conditions: [{ condition: 'canal', status: 'existente', face: 'raiz' }], surfaces: { root: { condition: 'canal', status: 'existente' } } },
              '46': { conditions: [{ condition: 'implante', status: 'planejado', face: 'inteiro' }], surfaces: { full: { condition: 'implante', status: 'planejado' } } }
            },
            toothHistory: [
              { toothNumber: '11', condition: 'faceta', conditionLabel: 'Lente Cerâmica Anterior', status: 'existente', face: 'Vestibular', date: '01/03/2024' },
              { toothNumber: '12', condition: 'faceta', conditionLabel: 'Lente Cerâmica Lateral', status: 'existente', face: 'Vestibular', date: '01/03/2024' },
              { toothNumber: '21', condition: 'faceta', conditionLabel: 'Lente Cerâmica Anterior', status: 'existente', face: 'Vestibular', date: '01/03/2024' },
              { toothNumber: '22', condition: 'faceta', conditionLabel: 'Lente Cerâmica Lateral', status: 'existente', face: 'Vestibular', date: '01/03/2024' },
              { toothNumber: '16', condition: 'restauracao', conditionLabel: 'Restauração Resina', status: 'existente', face: 'Oclusal', date: '15/04/2024' },
              { toothNumber: '37', condition: 'canal', conditionLabel: 'Tratamento de Canal', status: 'existente', face: 'Raiz', date: '10/05/2024' },
              { toothNumber: '46', condition: 'implante', conditionLabel: 'Implante Osseointegrado', status: 'planejado', face: 'Inteiro', date: 'Hoje' }
            ],
            notes: 'Sensibilidade leve prévia ao clareamento.'
          }
        })
      },
      { 
        name: 'Felisberto Alves', 
        phone: '(83) 98765-4321', 
        email: 'felisberto@email.com', 
        cpf: '345.678.901-23',
        notes: 'Tratamento ortodôntico em andamento.',
        medical_history: JSON.stringify({
          notes: 'Troca de arcos ortodônticos.',
          anamnese_estruturada: { has_pressao_alta: 'Sim' },
          odontogram: {
            teethData: {
              '16': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'restauracao', status: 'existente' } } },
              '17': { conditions: [{ condition: 'coroa', status: 'existente', face: 'inteiro' }], surfaces: { full: { condition: 'coroa', status: 'existente' } } },
              '23': { conditions: [{ condition: 'carie', status: 'planejado', face: 'distal' }], surfaces: { distal: { condition: 'carie', status: 'planejado' } } },
              '35': { conditions: [{ condition: 'canal', status: 'existente', face: 'raiz' }], surfaces: { root: { condition: 'canal', status: 'existente' } } },
              '45': { conditions: [{ condition: 'amalgama', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'amalgama', status: 'existente' } } },
              '48': { conditions: [{ condition: 'extraido', status: 'existente', face: 'inteiro' }], surfaces: { full: { condition: 'extraido', status: 'existente' } } }
            },
            toothHistory: [
              { toothNumber: '16', condition: 'restauracao', conditionLabel: 'Restauração Resina', status: 'existente', face: 'Oclusal', date: '10/02/2024' },
              { toothNumber: '17', condition: 'coroa', conditionLabel: 'Coroa Total Metalocerâmica', status: 'existente', face: 'Inteiro', date: '18/03/2024' },
              { toothNumber: '23', condition: 'carie', conditionLabel: 'Cárie Incipiente Distal', status: 'planejado', face: 'Distal', date: '05/04/2024' },
              { toothNumber: '35', condition: 'canal', conditionLabel: 'Tratamento de Canal', status: 'existente', face: 'Raiz', date: '12/05/2024' },
              { toothNumber: '45', condition: 'amalgama', conditionLabel: 'Restauração Amálgama', status: 'existente', face: 'Oclusal', date: '20/05/2024' },
              { toothNumber: '48', condition: 'extraido', conditionLabel: 'Exodontia Realizada', status: 'existente', face: 'Inteiro', date: 'Hoje' }
            ],
            notes: 'Hipertensão controlada. Paciente em tratamento de canal dente 35.'
          }
        })
      },
      { 
        name: 'Juliana Martins', 
        phone: '(83) 99887-7665', 
        email: 'juliana.martins@email.com', 
        cpf: '456.789.012-34',
        notes: 'Agendou Clareamento a Laser.',
        medical_history: JSON.stringify({
          notes: 'Primeira consulta estética.',
          odontogram: {
            teethData: {
              '11': { conditions: [{ condition: 'faceta', status: 'existente', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'existente' } } },
              '12': { conditions: [{ condition: 'faceta', status: 'existente', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'existente' } } },
              '21': { conditions: [{ condition: 'faceta', status: 'existente', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'existente' } } },
              '22': { conditions: [{ condition: 'faceta', status: 'existente', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'existente' } } },
              '26': { conditions: [{ condition: 'amalgama', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'amalgama', status: 'existente' } } },
              '46': { conditions: [{ condition: 'canal', status: 'existente', face: 'raiz' }], surfaces: { root: { condition: 'canal', status: 'existente' } } }
            },
            toothHistory: [
              { toothNumber: '11', condition: 'faceta', conditionLabel: 'Lente Cerâmica Estética', status: 'existente', face: 'Vestibular', date: '10/01/2024' },
              { toothNumber: '12', condition: 'faceta', conditionLabel: 'Lente Cerâmica Estética', status: 'existente', face: 'Vestibular', date: '10/01/2024' },
              { toothNumber: '21', condition: 'faceta', conditionLabel: 'Lente Cerâmica Estética', status: 'existente', face: 'Vestibular', date: '10/01/2024' },
              { toothNumber: '22', condition: 'faceta', conditionLabel: 'Lente Cerâmica Estética', status: 'existente', face: 'Vestibular', date: '10/01/2024' },
              { toothNumber: '26', condition: 'amalgama', conditionLabel: 'Restauração Amálgama', status: 'existente', face: 'Oclusal', date: '15/03/2024' },
              { toothNumber: '46', condition: 'canal', conditionLabel: 'Tratamento de Canal', status: 'existente', face: 'Raiz', date: 'Hoje' }
            ]
          }
        })
      },
      { 
        name: 'Patrícia Gomes', 
        phone: '(83) 99334-4556', 
        email: 'patricia.gomes@email.com', 
        cpf: '678.901.234-56',
        notes: 'Finalizou canal com sucesso.',
        medical_history: JSON.stringify({
          notes: 'Controle de endodontia dente 36.',
          odontogram: {
            teethData: {
              '16': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'restauracao', status: 'existente' } } },
              '25': { conditions: [{ condition: 'carie', status: 'planejado', face: 'distal' }], surfaces: { distal: { condition: 'carie', status: 'planejado' } } },
              '36': { conditions: [{ condition: 'canal', status: 'existente', face: 'raiz' }], surfaces: { root: { condition: 'canal', status: 'existente' } } },
              '37': { conditions: [{ condition: 'selante', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'selante', status: 'existente' } } },
              '47': { conditions: [{ condition: 'coroa', status: 'existente', face: 'inteiro' }], surfaces: { full: { condition: 'coroa', status: 'existente' } } }
            },
            toothHistory: [
              { toothNumber: '16', condition: 'restauracao', conditionLabel: 'Restauração Resina', status: 'existente', face: 'Oclusal', date: '01/02/2024' },
              { toothNumber: '25', condition: 'carie', conditionLabel: 'Cárie Dental Distal', status: 'planejado', face: 'Distal', date: '12/03/2024' },
              { toothNumber: '36', condition: 'canal', conditionLabel: 'Tratamento de Canal', status: 'existente', face: 'Raiz', date: '20/04/2024' },
              { toothNumber: '37', condition: 'selante', conditionLabel: 'Selante Preventivo', status: 'existente', face: 'Oclusal', date: '05/05/2024' },
              { toothNumber: '47', condition: 'coroa', conditionLabel: 'Coroa Total', status: 'existente', face: 'Inteiro', date: 'Hoje' }
            ]
          }
        })
      },
      { 
        name: 'Carlos Eduardo', 
        phone: '(83) 98445-5667', 
        email: 'carlos.eduardo@email.com', 
        cpf: '789.012.345-67',
        notes: 'Primeira avaliação na clínica.',
        medical_history: JSON.stringify({
          notes: 'Necessita raspagem e restaurações.',
          odontogram: {
            teethData: {
              '18': { conditions: [{ condition: 'extraido', status: 'existente', face: 'inteiro' }], surfaces: { full: { condition: 'extraido', status: 'existente' } } },
              '28': { conditions: [{ condition: 'extraido', status: 'existente', face: 'inteiro' }], surfaces: { full: { condition: 'extraido', status: 'existente' } } },
              '36': { conditions: [{ condition: 'implante', status: 'existente', face: 'inteiro' }], surfaces: { full: { condition: 'implante', status: 'existente' } } },
              '46': { conditions: [{ condition: 'carie', status: 'planejado', face: 'oclusal' }], surfaces: { oclusal: { condition: 'carie', status: 'planejado' } } },
              '47': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'mesial' }], surfaces: { mesial: { condition: 'restauracao', status: 'existente' } } }
            },
            toothHistory: [
              { toothNumber: '18', condition: 'extraido', conditionLabel: 'Exodontia Siso Superior', status: 'existente', face: 'Inteiro', date: '10/01/2023' },
              { toothNumber: '28', condition: 'extraido', conditionLabel: 'Exodontia Siso Superior', status: 'existente', face: 'Inteiro', date: '10/01/2023' },
              { toothNumber: '36', condition: 'implante', conditionLabel: 'Implante Osseointegrado', status: 'existente', face: 'Inteiro', date: '15/02/2024' },
              { toothNumber: '46', condition: 'carie', conditionLabel: 'Cárie Dental Oclusal', status: 'planejado', face: 'Oclusal', date: '20/04/2024' },
              { toothNumber: '47', condition: 'restauracao', conditionLabel: 'Restauração Resina', status: 'existente', face: 'Mesial', date: 'Hoje' }
            ]
          }
        })
      },
      { 
        name: 'Mariana Silva', 
        phone: '(83) 99556-6778', 
        email: 'mariana.silva@email.com', 
        cpf: '890.123.456-78',
        notes: 'Interesse em Lentes de Contato.',
        medical_history: JSON.stringify({
          notes: 'Moldagem inicial de facetas enviada ao laboratório.',
          odontogram: {
            teethData: {
              '11': { conditions: [{ condition: 'faceta', status: 'planejado', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'planejado' } } },
              '12': { conditions: [{ condition: 'faceta', status: 'planejado', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'planejado' } } },
              '21': { conditions: [{ condition: 'faceta', status: 'planejado', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'planejado' } } },
              '22': { conditions: [{ condition: 'faceta', status: 'planejado', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'planejado' } } },
              '36': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'restauracao', status: 'existente' } } }
            },
            toothHistory: [
              { toothNumber: '11', condition: 'faceta', conditionLabel: 'Lente Cerâmica Estética', status: 'planejado', face: 'Vestibular', date: '01/05/2024' },
              { toothNumber: '12', condition: 'faceta', conditionLabel: 'Lente Cerâmica Estética', status: 'planejado', face: 'Vestibular', date: '01/05/2024' },
              { toothNumber: '21', condition: 'faceta', conditionLabel: 'Lente Cerâmica Estética', status: 'planejado', face: 'Vestibular', date: '01/05/2024' },
              { toothNumber: '22', condition: 'faceta', conditionLabel: 'Lente Cerâmica Estética', status: 'planejado', face: 'Vestibular', date: '01/05/2024' },
              { toothNumber: '36', condition: 'restauracao', conditionLabel: 'Restauração Resina', status: 'existente', face: 'Oclusal', date: 'Hoje' }
            ]
          }
        })
      },
      {
        name: 'Lucas Mendes',
        phone: '(83) 98711-3344',
        email: 'lucas.mendes@email.com',
        cpf: '901.234.567-89',
        notes: 'Atleta, usa protetor bucal sob medida.',
        medical_history: JSON.stringify({
          notes: 'Placa de bruxismo entregue e ajustada.',
          odontogram: {
            teethData: {
              '16': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'restauracao', status: 'existente' } } },
              '26': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'restauracao', status: 'existente' } } },
              '36': { conditions: [{ condition: 'canal', status: 'existente', face: 'raiz' }], surfaces: { root: { condition: 'canal', status: 'existente' } } },
              '46': { conditions: [{ condition: 'coroa', status: 'existente', face: 'inteiro' }], surfaces: { full: { condition: 'coroa', status: 'existente' } } }
            },
            toothHistory: [
              { toothNumber: '16', condition: 'restauracao', conditionLabel: 'Restauração Resina', status: 'existente', face: 'Oclusal', date: '10/01/2024' },
              { toothNumber: '26', condition: 'restauracao', conditionLabel: 'Restauração Resina', status: 'existente', face: 'Oclusal', date: '15/02/2024' },
              { toothNumber: '36', condition: 'canal', conditionLabel: 'Tratamento de Canal Molar', status: 'existente', face: 'Raiz', date: '20/03/2024' },
              { toothNumber: '46', condition: 'coroa', conditionLabel: 'Coroa Metalocerâmica', status: 'existente', face: 'Inteiro', date: 'Hoje' }
            ]
          }
        })
      },
      {
        name: 'Renata Albuquerque',
        phone: '(83) 99622-4455',
        email: 'renata.alb@email.com',
        cpf: '012.345.678-90',
        notes: 'Gengivoplastia agendada.',
        medical_history: JSON.stringify({
          notes: 'Sessão de reavaliação periodontal pós-operatória.',
          odontogram: {
            teethData: {
              '11': { conditions: [{ condition: 'faceta', status: 'existente', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'existente' } } },
              '21': { conditions: [{ condition: 'faceta', status: 'existente', face: 'vestibular' }], surfaces: { vestibular: { condition: 'faceta', status: 'existente' } } },
              '14': { conditions: [{ condition: 'carie', status: 'planejado', face: 'oclusal' }], surfaces: { oclusal: { condition: 'carie', status: 'planejado' } } },
              '24': { conditions: [{ condition: 'carie', status: 'planejado', face: 'oclusal' }], surfaces: { oclusal: { condition: 'carie', status: 'planejado' } } }
            },
            toothHistory: [
              { toothNumber: '11', condition: 'faceta', conditionLabel: 'Lente Cerâmica Estética', status: 'existente', face: 'Vestibular', date: '01/02/2024' },
              { toothNumber: '21', condition: 'faceta', conditionLabel: 'Lente Cerâmica Estética', status: 'existente', face: 'Vestibular', date: '01/02/2024' },
              { toothNumber: '14', condition: 'carie', conditionLabel: 'Cárie Pré-Molar', status: 'planejado', face: 'Oclusal', date: '10/04/2024' },
              { toothNumber: '24', condition: 'carie', conditionLabel: 'Cárie Pré-Molar', status: 'planejado', face: 'Oclusal', date: '10/04/2024' }
            ]
          }
        })
      },
      {
        name: 'Thiago Nogueira',
        phone: '(83) 98533-5566',
        email: 'thiago.nogueira@email.com',
        cpf: '112.233.445-56',
        notes: 'Implante dente 24.',
        medical_history: JSON.stringify({
          notes: 'Tomografia computadorizada analisada sem perdas ósseas.',
          odontogram: {
            teethData: {
              '24': { conditions: [{ condition: 'implante', status: 'existente', face: 'inteiro' }], surfaces: { full: { condition: 'implante', status: 'existente' } } },
              '36': { conditions: [{ condition: 'canal', status: 'existente', face: 'raiz' }], surfaces: { root: { condition: 'canal', status: 'existente' } } },
              '46': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'restauracao', status: 'existente' } } }
            },
            toothHistory: [
              { toothNumber: '24', condition: 'implante', conditionLabel: 'Implante Titânio Pré-Molar', status: 'existente', face: 'Inteiro', date: '15/01/2024' },
              { toothNumber: '36', condition: 'canal', conditionLabel: 'Tratamento de Canal Molar', status: 'existente', face: 'Raiz', date: '20/03/2024' },
              { toothNumber: '46', condition: 'restauracao', conditionLabel: 'Restauração em Resina', status: 'existente', face: 'Oclusal', date: 'Hoje' }
            ]
          }
        })
      },
      {
        name: 'Beatriz Cavalcanti',
        phone: '(83) 99444-6677',
        email: 'beatriz.caval@email.com',
        cpf: '223.344.556-67',
        notes: 'Manutenção de aparelho ortodôntico estético.',
        medical_history: JSON.stringify({ notes: 'Troca de elásticos estéticos e ajuste de torque.' })
      },
      {
        name: 'Gabriel Pinheiro',
        phone: '(83) 98355-7788',
        email: 'gabriel.p@email.com',
        cpf: '334.455.667-78',
        notes: 'Restauração dente 46.',
        medical_history: JSON.stringify({ notes: 'Remoção de restauração de amálgama antiga.' })
      },
      {
        name: 'Helena Vasconcelos',
        phone: '(83) 99266-8899',
        email: 'helena.v@email.com',
        cpf: '445.566.778-89',
        notes: 'Avaliação de harmonização orofacial.',
        medical_history: JSON.stringify({ notes: 'Aplicação de toxina botulínica para bruxismo em masseter.' })
      },
      {
        name: 'Rodrigo Freitas',
        phone: '(83) 98177-9900',
        email: 'rodrigo.freitas@email.com',
        cpf: '556.677.889-90',
        notes: 'Consulta preventiva semestral.',
        medical_history: JSON.stringify({
          notes: 'Profilaxia e orientações de uso de fio dental.',
          anamnese_estruturada: { has_alergia: 'Nao' },
          odontogram: {
            teethData: {
              '11': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'mesial' }], surfaces: { mesial: { condition: 'restauracao', status: 'existente' } } },
              '16': { conditions: [{ condition: 'restauracao', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'restauracao', status: 'existente' } } },
              '26': { conditions: [{ condition: 'selante', status: 'existente', face: 'oclusal' }], surfaces: { oclusal: { condition: 'selante', status: 'existente' } } },
              '36': { conditions: [{ condition: 'canal', status: 'existente', face: 'raiz' }], surfaces: { root: { condition: 'canal', status: 'existente' } } }
            },
            toothHistory: [
              { toothNumber: '11', condition: 'restauracao', conditionLabel: 'Restauração Resina Mesial', status: 'existente', face: 'Mesial', date: '10/01/2024' },
              { toothNumber: '16', condition: 'restauracao', conditionLabel: 'Restauração Resina Oclusal', status: 'existente', face: 'Oclusal', date: '15/02/2024' },
              { toothNumber: '26', condition: 'selante', conditionLabel: 'Selante Preventivo Oclusal', status: 'existente', face: 'Oclusal', date: '20/03/2024' },
              { toothNumber: '36', condition: 'canal', conditionLabel: 'Tratamento de Canal Molar', status: 'existente', face: 'Raiz', date: 'Hoje' }
            ],
            notes: 'Paciente sem queixas. Profilaxia realizada com sucesso.'
          }
        })
      }
    ];

    // 2. Leads do CRM Kanban em TODAS as 5 Colunas do Pipeline (12 Leads)
    const demoLeadsData = [
      { name: 'Ana Beatriz Ferreira', phone: '(83) 98811-2233', procedure_name: 'Invisalign / Aparelho Invisível', budget_amount: 4500, stage: 0, priority: 'high', origin: 'WhatsApp' },
      { name: 'Ricardo Siqueira', phone: '(83) 99122-3344', procedure_name: 'Implante Dentário Unitário', budget_amount: 3200, stage: 0, priority: 'medium', origin: 'Instagram' },
      { name: 'Rodrigo Albuquerque', phone: '(83) 99922-3344', procedure_name: 'Implante Dentário', budget_amount: 3200, stage: 1, priority: 'high', origin: 'Indicação' },
      { name: 'Fernanda Paes', phone: '(83) 98744-5566', procedure_name: 'Ortodontia Autoligada', budget_amount: 2800, stage: 1, priority: 'medium', origin: 'WhatsApp' },
      { name: 'Camila Vasconcelos', phone: '(83) 98733-4455', procedure_name: 'Clareamento a Laser', budget_amount: 1200, stage: 2, priority: 'medium', origin: 'Site' },
      { name: 'Lucas Barbosa', phone: '(83) 99355-6677', procedure_name: 'Harmonização Orofacial', budget_amount: 5400, stage: 2, priority: 'high', origin: 'Instagram' },
      { name: 'Marcelo Oliveira', phone: '(83) 99644-5566', procedure_name: 'Prótese Protocolo Superior', budget_amount: 8500, stage: 3, priority: 'high', origin: 'WhatsApp' },
      { name: 'Sabrina Prado', phone: '(83) 98266-7788', procedure_name: 'Lentes de Contato Dental (6 elementos)', budget_amount: 7200, stage: 3, priority: 'high', origin: 'Indicação' },
      { name: 'Beatriz Mendes', phone: '(83) 98555-6677', procedure_name: 'Lentes de Contato Dental', budget_amount: 6000, stage: 4, priority: 'medium', origin: 'Instagram' },
      { name: 'Eduardo Castro', phone: '(83) 99477-8899', procedure_name: 'Clareamento Combinado', budget_amount: 1500, stage: 4, priority: 'low', origin: 'WhatsApp' },
      { name: 'Larissa Torres', phone: '(83) 98688-9900', procedure_name: 'Tratamento de Canal', budget_amount: 950, stage: 4, priority: 'high', origin: 'Site' },
      { name: 'Otávio Martins', phone: '(83) 99599-0011', procedure_name: 'Extração Siso Incluso', budget_amount: 800, stage: 0, priority: 'low', origin: 'Outros' }
    ];

    const createdPatients = [];
    try {
      for (const pat of demoPatientsData) {
        const p = await addPatient(pat);
        if (p) createdPatients.push(p);
      }
      setPatients(createdPatients);
      for (const lead of demoLeadsData) {
        await addCrmLead(lead);
      }
    } catch (e) {
      console.warn('Aviso ao semear pacientes/leads:', e);
    }

    const firstPat = createdPatients[0] || { id: 'p-1', name: 'Fernando Rocha' };
    const secondPat = createdPatients[1] || { id: 'p-2', name: 'Ana Paula Souza' };
    const thirdPat = createdPatients[2] || { id: 'p-3', name: 'Vanessa Lima' };
    const fourthPat = createdPatients[3] || { id: 'p-4', name: 'Felisberto Alves' };

    // 3. Evoluções Clínicas do Prontuário (8 Notas de Evolução Assinadas)
    const demoMedicalRecords = [
      {
        id: 'mr-1',
        clinic_id: clinicId,
        patient_id: firstPat.id,
        patient_name: firstPat.name,
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        title: 'Avaliação Inicial & Restauração Estética',
        description: 'Realizada anamnese completa e exame clínico. Identificada cárie oclusal no dente 16. Efetuada restauração com resina composta Filtek Z350 XT sob anestesia local. Oclusão checada e polimento finalizado.',
        dentist_name: docName,
        signed: true
      },
      {
        id: 'mr-2',
        clinic_id: clinicId,
        patient_id: firstPat.id,
        patient_name: firstPat.name,
        date: new Date(Date.now() - 86400000 * 10).toISOString(),
        title: 'Profilaxia e Aplicação Tópica de Flúor',
        description: 'Remoção de tártaro e placa bacteriana por ultrassom. Polimento coronário e aplicação de flúor gel 1,23%. Instruções de higiene oral orientadas ao paciente.',
        dentist_name: dentist2Name,
        signed: true
      },
      {
        id: 'mr-3',
        clinic_id: clinicId,
        patient_id: secondPat.id,
        patient_name: secondPat.name,
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        title: 'Manutenção Ortodôntica Mensal',
        description: 'Troca de ligaduras elásticas e substituição do arco nitinol superior por 0.16. Higienização orientada.',
        dentist_name: docName,
        signed: true
      },
      {
        id: 'mr-4',
        clinic_id: clinicId,
        patient_id: thirdPat.id,
        patient_name: thirdPat.name,
        date: new Date(Date.now() - 86400000 * 1).toISOString(),
        title: 'Sessão 1 de Clareamento a Laser',
        description: 'Aplicação de barreira gengival foto e gel de Peróxido de Hidrogênio a 35%. Três sessões de 15 min sob luz LED.',
        dentist_name: dentist2Name,
        signed: true
      },
      {
        id: 'mr-5',
        clinic_id: clinicId,
        patient_id: fourthPat.id,
        patient_name: fourthPat.name,
        date: new Date(Date.now() - 86400000 * 12).toISOString(),
        title: 'Moldagem de Estudo e Fotografias',
        description: 'Realizado escaneamento intraoral e registro oclusal em cera para planejamento de reabilitação.',
        dentist_name: docName,
        signed: true
      },
      {
        id: 'mr-6',
        clinic_id: clinicId,
        patient_id: createdPatients[4]?.id || 'p-5',
        patient_name: createdPatients[4]?.name || 'Juliana Martins',
        date: new Date(Date.now() - 86400000 * 4).toISOString(),
        title: 'Exodontia Simples Dente 48',
        description: 'Anestesia infiltrativa terminal. Exodontia sem intercorrências. Sutura com fio de seda 3-0. Prescrito analgésico e anti-inflamatório.',
        dentist_name: docName,
        signed: true
      },
      {
        id: 'mr-7',
        clinic_id: clinicId,
        patient_id: createdPatients[5]?.id || 'p-6',
        patient_name: createdPatients[5]?.name || 'Patrícia Gomes',
        date: new Date(Date.now() - 86400000 * 8).toISOString(),
        title: 'Obturação de Canal Molar Dente 36',
        description: 'Odontometria eletrônica confirmada. Cones de guta-percha patentes obturados com cimento AH Plus.',
        dentist_name: dentist2Name,
        signed: true
      },
      {
        id: 'mr-8',
        clinic_id: clinicId,
        patient_id: createdPatients[6]?.id || 'p-7',
        patient_name: createdPatients[6]?.name || 'Carlos Eduardo',
        date: new Date(Date.now() - 86400000 * 15).toISOString(),
        title: 'Raspagem Supragengival de Tártaro',
        description: 'Raspagem por quadrantes finalizada. Irrigação com clorexidina 0,12%.',
        dentist_name: docName,
        signed: true
      },
      {
        id: 'mr-9',
        clinic_id: clinicId,
        patient_id: createdPatients[14]?.id || 'p-15',
        patient_name: createdPatients[14]?.name || 'Rodrigo Freitas',
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        title: 'Profilaxia Preventiva & Raspagem Subgengival',
        description: 'Paciente retornou para profilaxia semestral. Removido cálculo supragengival nos dentes inferiores. Polimento com taça de borracha e pasta profilática.',
        dentist_name: docName,
        signed: true
      },
      {
        id: 'mr-10',
        clinic_id: clinicId,
        patient_id: createdPatients[13]?.id || 'p-14',
        patient_name: createdPatients[13]?.name || 'Helena Vasconcelos',
        date: new Date(Date.now() - 86400000 * 6).toISOString(),
        title: 'Aplicação de Toxina Botulínica (Masseter)',
        description: 'Aplicação de 25 unidades de Botox no músculo masseter bilateral para alívio de dor por bruxismo severo.',
        dentist_name: dentist2Name,
        signed: true
      }
    ];

    // 4. Registros de Odontograma FDI (12 Marcações nos Dentes)
    const demoToothRecords = [
      { id: 'tr-1', clinic_id: clinicId, patient_id: firstPat.id, tooth_number: 16, procedure_name: 'Restauração Resina', status: 'COMPLETED' },
      { id: 'tr-2', clinic_id: clinicId, patient_id: firstPat.id, tooth_number: 21, procedure_name: 'Faceta Estética', status: 'IN_PROGRESS' },
      { id: 'tr-3', clinic_id: clinicId, patient_id: firstPat.id, tooth_number: 36, procedure_name: 'Tratamento de Canal', status: 'COMPLETED' },
      { id: 'tr-4', clinic_id: clinicId, patient_id: firstPat.id, tooth_number: 48, procedure_name: 'Exodontia Indicada', status: 'PLANNED' },
      { id: 'tr-5', clinic_id: clinicId, patient_id: secondPat.id, tooth_number: 11, procedure_name: 'Restauração Resina', status: 'COMPLETED' },
      { id: 'tr-6', clinic_id: clinicId, patient_id: secondPat.id, tooth_number: 24, procedure_name: 'Cárie Oclusal', status: 'PLANNED' },
      { id: 'tr-7', clinic_id: clinicId, patient_id: thirdPat.id, tooth_number: 12, procedure_name: 'Clareamento Dental', status: 'IN_PROGRESS' },
      { id: 'tr-8', clinic_id: clinicId, patient_id: thirdPat.id, tooth_number: 46, procedure_name: 'Implante Dentário', status: 'PLANNED' },
      { id: 'tr-9', clinic_id: clinicId, patient_id: fourthPat.id, tooth_number: 35, procedure_name: 'Tratamento de Canal', status: 'COMPLETED' },
      { id: 'tr-10', clinic_id: clinicId, patient_id: fourthPat.id, tooth_number: 17, procedure_name: 'Prótese Fixa', status: 'IN_PROGRESS' },
      { id: 'tr-11', clinic_id: clinicId, patient_id: createdPatients[4]?.id || 'p-5', tooth_number: 26, procedure_name: 'Restauração Amálgama', status: 'COMPLETED' },
      { id: 'tr-12', clinic_id: clinicId, patient_id: createdPatients[5]?.id || 'p-6', tooth_number: 37, procedure_name: 'Selante de Fóssulas', status: 'COMPLETED' }
    ];

    // 5. Agendamentos, Tarefas e Finanças (1 ANO COMPLETO — 12 Meses de Dados de Jan a Dez)
    const todayStr = new Date().toISOString().split('T')[0];
    const yestStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const nextDaysStr = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    const sampleProcedures = [
      { name: 'Avaliação & Diagnóstico', price: 150, duration: 30, color: '#3b82f6' },
      { name: 'Restauração em Resina', price: 350, duration: 45, color: '#10b981' },
      { name: 'Profilaxia (Limpeza) & Flúor', price: 250, duration: 45, color: '#06b6d4' },
      { name: 'Tratamento de Canal (Endodontia)', price: 850, duration: 60, color: '#8b5cf6' },
      { name: 'Manutenção Ortodôntica', price: 180, duration: 30, color: '#ec4899' },
      { name: 'Clareamento a Laser', price: 1200, duration: 60, color: '#f59e0b' },
      { name: 'Exodontia Simples', price: 300, duration: 45, color: '#ef4444' },
      { name: 'Cirurgia de Implante Dentário', price: 3200, duration: 90, color: '#6366f1' },
      { name: 'Prótese Definitiva', price: 2400, duration: 60, color: '#14b8a6' },
      { name: 'Gengivoplastia Estética', price: 900, duration: 60, color: '#a855f7' }
    ];

    const sampleTimes = ['08:00', '09:00', '10:30', '14:00', '15:30', '16:30'];
    const now = new Date();
    const currentYear = now.getFullYear();

    const fullYearAppointments = [];
    const fullYearTransactions = [];
    const fullYearAccountsPayable = [];
    const fullYearInstallments = [];

    let appIdCounter = 1;
    let transIdCounter = 1;
    let apIdCounter = 1;
    let instIdCounter = 1;

    // Gerar 12 MESES completos (Janeiro a Dezembro do Ano Atual)
    for (let m = 0; m < 12; m++) {
      const daysInM = new Date(currentYear, m + 1, 0).getDate();

      for (let day = 1; day <= daysInM; day++) {
        const dateObj = new Date(currentYear, m, day);
        const dayOfWeek = dateObj.getDay();
        if (dayOfWeek === 0) continue; // Pular domingos

        const dateStr = `${currentYear}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isPast = dateObj < new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isToday = dateObj.toDateString() === now.toDateString();

        // 2 a 3 agendamentos por dia útil ao longo de todos os 12 meses
        const appointmentsCount = ((m + day) % 2) + 2;
        for (let i = 0; i < appointmentsCount; i++) {
          const patIndex = (m * 3 + day + i) % createdPatients.length;
          const pat = createdPatients[patIndex] || firstPat;
          const proc = sampleProcedures[(m + day + i) % sampleProcedures.length];
          const time = sampleTimes[i % sampleTimes.length];
          const chair = (i % 2 === 0) ? { id: 'c-1', name: 'Cadeira 01' } : { id: 'c-2', name: 'Cadeira 02' };
          const dentist = (i % 2 === 0) ? { id: mainDentistId, name: docName } : { id: dentist2Id, name: dentist2Name };

          let status = 'CONFIRMADO';
          if (isPast) status = 'CONCLUIDO';
          else if (isToday) status = (i === 0 ? 'CONCLUIDO' : (i === 1 ? 'EM_ATENDIMENTO' : 'CONFIRMADO'));

          const [h, min] = time.split(':');
          const startIso = `${dateStr}T${h}:${min}:00`;
          const endHour = String(parseInt(h) + (proc.duration >= 60 ? 1 : 0)).padStart(2, '0');
          const endMin = proc.duration % 60 === 0 ? min : '30';
          const endIso = `${dateStr}T${endHour}:${endMin}:00`;

          fullYearAppointments.push({
            id: `app-yr-${appIdCounter++}`,
            clinic_id: clinicId,
            patient_id: pat.id,
            patientName: pat.name,
            date: dateStr,
            time: time,
            start_time: startIso,
            end_time: endIso,
            status: status,
            procedure_name: proc.name,
            procedureName: proc.name,
            price: proc.price,
            amount: proc.price,
            dentist_name: dentist.name,
            dentist_id: dentist.id,
            chair_id: chair.id,
            chair_name: chair.name,
            color: proc.color,
            duration: proc.duration,
            type: 'CONSULTA'
          });

          // Transações Financeiras (Receita gerada pela consulta concluída/realizada)
          if (isPast || isToday) {
            fullYearTransactions.push({
              id: `t-yr-inc-${transIdCounter++}`,
              clinic_id: clinicId,
              description: `Recebimento - ${proc.name} (${pat.name})`,
              amount: proc.price,
              type: 'INCOME',
              category: proc.name.includes('Clareamento') ? 'Estética' : proc.name.includes('Canal') ? 'Tratamentos' : proc.name.includes('Ortodôntica') ? 'Ortodontia' : 'Tratamentos',
              date: dateStr,
              payment_method: ((day + i) % 2 === 0) ? 'PIX' : 'Cartão de Crédito',
              patient_name: pat.name
            });
          }
        }

        // Adicionar despesas operacionais periódicas no mês
        if (day % 5 === 0) {
          const expAmount = (day === 5) ? 1200.00 : (day === 10) ? 850.00 : (day === 15) ? 2400.00 : (day === 20) ? 600.00 : 900.00;
          const expCategory = (day === 5) ? 'Insumos Clínicos' : (day === 10) ? 'Utilitários' : (day === 15) ? 'Laboratório' : (day === 20) ? 'Manutenção' : 'Marketing';
          const expDesc = (day === 5) ? 'Despesa - Material Dental (Dental Cremer)' : (day === 10) ? 'Despesa - Energia & Saneamento' : (day === 15) ? 'Despesa - Laboratório ProEsthetic' : (day === 20) ? 'Despesa - Manutenção de Equipamentos' : 'Despesa - Marketing Meta Ads';

          if (isPast || isToday) {
            fullYearTransactions.push({
              id: `t-yr-exp-${transIdCounter++}`,
              clinic_id: clinicId,
              description: expDesc,
              amount: expAmount,
              type: 'EXPENSE',
              category: expCategory,
              date: dateStr,
              payment_method: 'PIX'
            });
          }
        }

        // Contas a Pagar e Parcelas mensais
        if (day % 7 === 0) {
          fullYearAccountsPayable.push({
            id: `ap-yr-${apIdCounter++}`,
            clinic_id: clinicId,
            description: `Fatura de Insumos & Laboratório (Mês ${m + 1})`,
            supplier_id: 'sup-1',
            supplier_name: 'Dental Cremer Produtos Odontológicos',
            amount: 950.00 + (day * 20),
            due_date: dateStr,
            status: isPast ? 'PAID' : 'PENDING',
            category: 'Insumos Clínicos'
          });
        }

        if (day % 3 === 0) {
          const instPat = createdPatients[(m + day) % createdPatients.length] || firstPat;
          fullYearInstallments.push({
            id: `inst-yr-${instIdCounter++}`,
            clinic_id: clinicId,
            patient_id: instPat.id,
            patientName: instPat.name,
            description: `Tratamento Odontológico (Parcela ${(day % 6) + 1}/6)`,
            amount: 380.00,
            due_date: dateStr,
            status: isPast ? 'PAID' : 'PENDING',
            installment_number: (day % 6) + 1,
            total_installments: 6
          });
        }
      }

      // Aluguel Fixo Mensal no dia 5 de cada mês dos 12 meses
      const rentDateStr = `${currentYear}-${String(m + 1).padStart(2, '0')}-05`;
      const isRentPast = new Date(currentYear, m, 5) < now;
      if (isRentPast) {
        fullYearTransactions.push({
          id: `t-rent-${m}`,
          clinic_id: clinicId,
          description: `Despesa - Aluguel do Consultório (Mês ${m + 1})`,
          amount: 3500.00,
          type: 'EXPENSE',
          category: 'Fixas',
          date: rentDateStr,
          payment_method: 'Transferência'
        });
      }
    }

    const demoAppointments = fullYearAppointments;
    const demoTransactions = fullYearTransactions;

    // 7. Corpo Clínico, Cadeiras, Procedimentos e Convênios para Configurações
    const demoDentists = [
      { id: mainDentistId, name: docName, full_name: docName, cro: 'CRO-PB 12345', specialty: 'Ortodontia & Estética', email: 'dr.alexandre@odonto.com', phone: '(83) 99888-1122', active: true },
      { id: dentist2Id, name: dentist2Name, full_name: dentist2Name, cro: 'CRO-PB 67890', specialty: 'Endodontia & Implantodontia', email: 'dra.juliana@odonto.com', phone: '(83) 99777-2233', active: true },
      { id: 'd-3', name: 'Dr. Roberto Vasconcelos', full_name: 'Dr. Roberto Vasconcelos', cro: 'CRO-PB 34567', specialty: 'Cirurgia & Traumatologia', email: 'dr.roberto@odonto.com', phone: '(83) 99666-3344', active: true }
    ];

    const demoChairs = [
      { id: 'c-1', name: 'Cadeira 01 - Master VIP', location: 'Consultório 1', status: 'AVAILABLE', active: true, color: '#3B82F6' },
      { id: 'c-2', name: 'Cadeira 02 - Ortodontia', location: 'Consultório 2', status: 'AVAILABLE', active: true, color: '#10B981' },
      { id: 'c-3', name: 'Cadeira 03 - Implante & Cirurgia', location: 'Bloco Cirúrgico', status: 'MAINTENANCE', active: true, color: '#8B5CF6' }
    ];

    const demoProcedures = [
      { id: 'pr-1', name: 'Avaliação & Diagnóstico Inicial', category: 'Consultas', price: 150.00, duration: 30, active: true },
      { id: 'pr-2', name: 'Profilaxia (Limpeza) & Flúor', category: 'Prevenção', price: 250.00, duration: 45, active: true },
      { id: 'pr-3', name: 'Restauração em Resina Composta', category: 'Dentística', price: 350.00, duration: 45, active: true },
      { id: 'pr-4', name: 'Tratamento de Canal (Endodontia Molar)', category: 'Endodontia', price: 850.00, duration: 60, active: true },
      { id: 'pr-5', name: 'Clareamento Dental a Laser', category: 'Estética', price: 1200.00, duration: 60, active: true },
      { id: 'pr-6', name: 'Manutenção Ortodôntica Mensal', category: 'Ortodontia', price: 180.00, duration: 30, active: true },
      { id: 'pr-7', name: 'Exodontia Simples', category: 'Cirurgia', price: 300.00, duration: 45, active: true },
      { id: 'pr-8', name: 'Cirurgia de Implante Dentário', category: 'Implantes', price: 3200.00, duration: 90, active: true }
    ];

    const demoAgreements = [
      { id: 'ag-1', name: 'Particular / Sem Convênio', active: true, discount: 0 },
      { id: 'ag-2', name: 'Amil Dental', active: true, discount: 15 },
      { id: 'ag-3', name: 'Bradesco Dental', active: true, discount: 20 },
      { id: 'ag-4', name: 'Unimed Odonto', active: true, discount: 10 },
      { id: 'ag-5', name: 'SulAmérica Odonto', active: true, discount: 15 }
    ];
    const demoInsurancePlans = demoAgreements;

    // 8. Fornecedores, Contas a Pagar e Parcelamentos (1 ANO COMPLETO)
    const demoSuppliers = [
      { id: 'sup-1', name: 'Dental Cremer Produtos Odontológicos', cnpj: '61.416.216/0001-44', phone: '(11) 4003-2121', email: 'vendas@dentalcremer.com.br', category: 'Material Odontológico', active: true },
      { id: 'sup-2', name: 'Laboratório ProEsthetic Próteses', cnpj: '12.345.678/0001-99', phone: '(83) 99111-2233', email: 'contato@proesthetic.com', category: 'Próteses & Moldagens', active: true },
      { id: 'sup-3', name: 'Imobiliária Prime Empreendimentos', cnpj: '45.678.901/0001-22', phone: '(83) 3244-1122', email: 'financeiro@imobiliariaprime.com', category: 'Aluguel & Imóveis', active: true },
      { id: 'sup-4', name: 'Meta Ads & Marketing Digital', cnpj: '98.765.432/0001-33', phone: '(11) 3003-9988', email: 'ads@meta.com', category: 'Publicidade', active: true }
    ];

    const demoAccountsPayable = fullYearAccountsPayable;
    const demoInstallments = fullYearInstallments;

    // 9. Campanhas de Marketing & Automações
    const demoMarketingCampaigns = [
      { id: 'mc-1', name: 'Campanha Lentes de Contato VIP', views: 1420, leads: 48, budget: 1200, conversion: 14.5, source: 'Instagram Ads' },
      { id: 'mc-2', name: 'Reativação de Pacientes Inativos', views: 890, leads: 32, budget: 450, conversion: 22.0, source: 'WhatsApp Disparo' },
      { id: 'mc-3', name: 'Invisalign & Estética Dental', views: 2300, leads: 65, budget: 1800, conversion: 12.8, source: 'Google Ads' }
    ];

    const demoAutomations = [
      { id: 'aut-1', name: 'Lembrete de Consulta 24h Antes', trigger: 'Agendamento', actions: ['Enviar WhatsApp', 'Notificar equipe'], is_active: true, runs_count: 142 },
      { id: 'aut-2', name: 'Pesquisa NPS Pós-Atendimento', trigger: 'Conclusão de Consulta', actions: ['Enviar WhatsApp'], is_active: true, runs_count: 89 },
      { id: 'aut-3', name: 'Mensagem de Aniversário Automática', trigger: 'Aniversário', actions: ['Enviar WhatsApp'], is_active: true, runs_count: 34 }
    ];

    setMedicalRecords(demoMedicalRecords);
    setToothRecords(demoToothRecords);
    setAppointments(demoAppointments);
    setFinanceTransactions(demoTransactions);
    setDentists(demoDentists);
    setChairs(demoChairs);
    saveProcedures(demoProcedures);
    saveInsurancePlans(demoInsurancePlans);
    setSuppliers(demoSuppliers);
    setAccountsPayable(demoAccountsPayable);
    setInstallments(demoInstallments);
    setMarketingCampaigns(demoMarketingCampaigns);
    setAutomations(demoAutomations);

    try {
      localStorage.setItem(`patient_notes_${firstPat.id}`, 'Paciente relata sensibilidade ao mastigar gelado no dente 16.');
      localStorage.setItem(`patient_notes_${secondPat.id}`, 'Troca de borrachinhas ortodônticas realizada.');

      const seedStorageKey = `demo_data_${clinicId}`;
      localStorage.setItem(seedStorageKey, JSON.stringify({
        appointments: demoAppointments,
        transactions: demoTransactions,
        medicalRecords: demoMedicalRecords,
        toothRecords: demoToothRecords,
        suppliers: demoSuppliers,
        accountsPayable: demoAccountsPayable,
        installments: demoInstallments,
        marketingCampaigns: demoMarketingCampaigns,
        automations: demoAutomations,
        dentists: demoDentists,
        chairs: demoChairs
      }));
    } catch (e) {}

    // Dados de demonstração armazenados com sucesso no estado local e localStorage para desenvolvimento resiliente
    console.log('[DevTools] Sistema populado com dados de demonstração completos!');
  };

  const clearAllData = async () => {
    const clinicId = clinic?.id;

    // 1. Zera IMEDIATAMENTE todos os estados locais do React (resposta instantânea na UI!)
    setPatients([]);
    setAppointments([]);
    setCrmLeads([]);
    setFinanceTransactions([]);
    setMedicalRecords([]);
    setToothRecords([]);
    setPrescriptions([]);
    setWhatsappChats([]);
    setDentists([]);
    setChairs([]);
    saveProcedures([]);
    saveInsurancePlans([]);
    setSuppliers([]);
    setAccountsPayable([]);
    setInstallments([]);
    setMarketingCampaigns([]);
    setAutomations([]);

    // 2. Limpar localStorage de anotações, tags, procedimentos e convênios
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('patient_notes_') || key.startsWith('chat_tags_') || key.startsWith('clinic_procedures_') || key.startsWith('clinic_insurance_plans_') || key.startsWith('demo_data_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}

    // 3. Deletar tabelas remotas no Supabase em ordem de dependência (chaves estrangeiras)
    if (clinicId && isValidUUID(clinicId)) {
      const tablesInOrder = [
        'appointments', 
        'crm_leads', 
        'chat_messages', 
        'chat_sessions', 
        'medical_records', 
        'tooth_records', 
        'prescriptions', 
        'transactions', 
        'patients'
      ];

      for (const tbl of tablesInOrder) {
        try {
          await supabase.from(tbl).delete().eq('clinic_id', clinicId);
        } catch (err) {
          console.warn(`[Supabase Clear] Aviso ao deletar ${tbl}:`, err);
        }
      }
    }
  };

  const contextValue = useMemo(() => ({
    patients,
    appointments,
    crmLeads,
    whatsappChats,
    financeTransactions,
    automations,
    marketingCampaigns,
    procedures,
    insurancePlans,
    aiConfig,
    loading,
    suppliers,
    accountsPayable,
    installments,
    toothRecords,
    chairs,
    dentists,
    clinicHours,
    saveClinicHours,
    dentistSchedules,
    saveDentistSchedules,
    holidays,
    saveHolidays,
    seedDemoData,
    clearAllData,
    loadData,

    addPatient,
    addChair,
    updateChair,
    deleteChair,
    addDentist,
    updatePatient,
    deletePatient,
    addAppointment,
    updateAppointment,
    addCrmLead,
    updateCrmLead,
    deleteCrmLead,
    convertLeadToPatient,
    sendWhatsAppMessage,
    sendWhatsAppButtons,
    updateChatNotes,
    updateChatTags,
    toggleBotSilence,
    addTransaction,
    saveProcedures,
    saveInsurancePlans,
    saveAiConfig,
    addAutomation,
    updateAutomationStatus,
    addSupplier,
    addAccountsPayable,
    approveAccountsPayable,
    payAccountsPayable,
    payInstallment,
    checkPatientInadimplente,
    medicalRecords,
    prescriptions,
    addMedicalRecord,
    addPrescription,
    generateAiEvolution,
    sendPrescriptionWhatsapp,
    updateToothRecord
  }), [
    patients,
    appointments,
    crmLeads,
    whatsappChats,
    financeTransactions,
    automations,
    marketingCampaigns,
    procedures,
    insurancePlans,
    aiConfig,
    loading,
    suppliers,
    accountsPayable,
    installments,
    toothRecords,
    chairs,
    dentists,
    clinicHours,
    dentistSchedules,
    holidays,
    medicalRecords,
    prescriptions,
    loadData
  ]);

  return (
    <ClinicContext.Provider value={contextValue}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    return {
      patients: [],
      appointments: [],
      crmLeads: [],
      whatsappChats: [],
      financeTransactions: [],
      procedures: [],
      insurancePlans: [],
      chairs: [],
      dentists: [],
      medicalRecords: [],
      toothRecords: [],
      loading: false,
      addPatient: async () => {},
      addCrmLead: async () => {},
      addAppointment: async () => {},
      addChair: async () => {},
      addDentist: async () => {},
      seedDemoData: async () => {},
      clearAllData: async () => {},
      loadData: async () => {}
    };
  }
  return context;
}

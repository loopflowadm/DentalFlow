import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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
    if (!clinic?.id) return;
    const channel = supabase
      .channel('realtime_chat_messages')
      .on(
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

    const clinicId = clinic.id;

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
            if (!isFetchErr) {
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

      // Fallback/auto-seeding robusto para Cadeiras
      if (chairData.length === 0) {
        try {
          const defaultChairs = [
            { name: 'Cadeira 01', clinic_id: clinicId },
            { name: 'Cadeira 02', clinic_id: clinicId }
          ];
          const { data, error } = await supabase.from('chairs').insert(defaultChairs).select();
          if (!error && data && data.length > 0) {
            setChairs(data);
          } else {
            setChairs(defaultChairs.map((c, idx) => ({ id: `c-${idx + 1}`, ...c })));
          }
        } catch (err) {
          setChairs([
            { id: 'c-1', name: 'Cadeira 01', clinic_id: clinicId },
            { id: 'c-2', name: 'Cadeira 02', clinic_id: clinicId }
          ]);
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

      // Auto-seeding robusto para Procedimentos
      let finalProcData = procData;
      if (procData.length === 0) {
        try {
          const defaultProcs = [
            { name: 'Consulta Geral / Avaliação', price: 150.00, category: 'Diagnóstico', color: '#10b981', clinic_id: clinicId },
            { name: 'Profilaxia (Limpeza)', price: 200.00, category: 'Prevenção', color: '#3b82f6', clinic_id: clinicId },
            { name: 'Restauração de Resina', price: 250.00, category: 'Dentística', color: '#f59e0b', clinic_id: clinicId },
            { name: 'Tratamento de Canal (Endodontia)', price: 800.00, category: 'Endodontia', color: '#ef4444', clinic_id: clinicId },
            { name: 'Exodontia Simples', price: 300.00, category: 'Cirurgia', color: '#ec4899', clinic_id: clinicId }
          ];
          const { data, error } = await supabase.from('procedures').insert(defaultProcs).select();
          if (!error && data && data.length > 0) {
            finalProcData = data;
          } else {
            finalProcData = defaultProcs.map((p, idx) => ({ id: `p-${idx + 1}`, ...p }));
          }
        } catch (err) {
          console.warn('Erro ao auto-semear procedimentos:', err);
        }
      }

      setAppointments(appData.map(a => {
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
      }));

      setProcedures(finalProcData);
      setInsurancePlans(planData);
      setFinanceTransactions(tData);
      setAutomations(autData);
      setMarketingCampaigns(mData);
      setSuppliers(supData);
      setAccountsPayable(apData);
      setToothRecords(toothData);
      setMedicalRecords(recData);
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

      if (waData) {
        setAiConfig({
          prompt: waData.agent_prompt || '',
          personality: 'sofia_assistente',
          operatingHours: '08:00 - 18:00',
          isActive: waData.is_active || false,
          knowledgeBase: []
        });
      }

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
    const clinicId = newPat.clinic_id || clinic.id;
    const fresh = {
      name: newPat.name,
      phone: newPat.phone || '',
      clinic_id: isValidUUID(clinicId) ? clinicId : null,
      created_at: new Date().toISOString()
    };

    let createdPat = null;

    if (fresh.clinic_id) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .insert([fresh])
          .select()
          .single();
        if (!error && data) {
          createdPat = { ...data, cpf: newPat.cpf, notes: newPat.notes || '' };
          setPatients(prev => [...prev, createdPat]);
        }
      } catch (err) {
        console.warn('[Supabase] Aviso ao cadastrar paciente:', err);
      }
    }

    if (!createdPat) {
      createdPat = { id: `p-${Date.now()}`, ...newPat, clinic_id: clinicId };
      setPatients(prev => [...prev, createdPat]);
    }

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
      console.warn('[CRM Sync] Erro ao sincronizar novo paciente com CRM:', crmErr);
    }

    return createdPat;
  };

  const updatePatient = async (updatedPat) => {
    if (isValidUUID(updatedPat.id)) {
      // Sanitização estrita: enviar apenas colunas válidas da tabela 'patients' no Supabase
      const allowedKeys = ['name', 'phone', 'cpf', 'email', 'birth_date', 'address', 'medical_history', 'notes', 'clinic_id'];
      const dbPayload = {};

      allowedKeys.forEach(key => {
        if (updatedPat[key] !== undefined) {
          dbPayload[key] = updatedPat[key];
        }
      });

      try {
        if (Object.keys(dbPayload).length > 0) {
          const { error } = await supabase
            .from('patients')
            .update(dbPayload)
            .eq('id', updatedPat.id);
          if (error) console.warn('[Supabase] Aviso ao atualizar paciente:', error);
        }
      } catch (err) {
        console.warn('[Supabase] Erro ao atualizar paciente:', err);
      }
    }

    setPatients(prev => prev.map(p => p.id === updatedPat.id ? updatedPat : p));
  };

  // CRM LEADS (Tabela crm_leads)
  const addCrmLead = async (lead) => {
    const clinicId = clinic.id;
    const fresh = {
      clinic_id: clinicId,
      name: lead.name,
      phone: lead.phone,
      avatar: lead.avatar || '👤',
      stage: lead.stage !== undefined ? lead.stage : 0, // Novo Lead
      priority: lead.priority || 'medium',
      budget_amount: lead.budget_amount || 0.00,
      procedure_name: lead.procedure_name || 'Consulta Geral',
      comments: lead.comments || [],
      checklist: lead.checklist || [],
      attachments: lead.attachments || [],
      history: [{ date: new Date().toISOString(), type: 'STATUS', description: 'Lead cadastrado no CRM', user: user?.full_name || 'Profissional' }],
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('crm_leads')
      .insert([fresh])
      .select()
      .single();
    if (error) throw error;
    setCrmLeads(prev => [...prev, data]);
    return data;
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
      time: app.time || calculatedStartTime.split('T')[1].substring(0, 5)
    };

    setAppointments(prev => [...prev, fullApp]);
    return fullApp;
  };


  const updateAppointment = async (updatedApp) => {
    const cleanApp = {
      id: updatedApp.id,
      clinic_id: updatedApp.clinic_id || clinic.id,
      patient_id: (updatedApp.patient_id && isValidUUID(updatedApp.patient_id)) ? updatedApp.patient_id : ((updatedApp.patientId && isValidUUID(updatedApp.patientId)) ? updatedApp.patientId : null),
      doctor_id: (updatedApp.doctor_id && isValidUUID(updatedApp.doctor_id)) ? updatedApp.doctor_id : ((updatedApp.doctorId && isValidUUID(updatedApp.doctorId)) ? updatedApp.doctorId : null),
      start_time: updatedApp.start_time || updatedApp.startTime,
      end_time: updatedApp.end_time || updatedApp.endTime,
      status: updatedApp.status || 'PENDING',
      chair_id: (updatedApp.chair_id && isValidUUID(updatedApp.chair_id)) ? updatedApp.chair_id : ((updatedApp.chairId && isValidUUID(updatedApp.chairId)) ? updatedApp.chairId : null),
      room: updatedApp.room || null,
      procedure_id: (updatedApp.procedure_id && isValidUUID(updatedApp.procedure_id)) ? updatedApp.procedure_id : ((updatedApp.procedureId && isValidUUID(updatedApp.procedureId)) ? updatedApp.procedureId : null),
      title: updatedApp.title || null,
      duration: updatedApp.duration || 30,
      observations: updatedApp.observations || null,
      send_confirmation: updatedApp.send_confirmation !== undefined ? updatedApp.send_confirmation : (updatedApp.sendConfirmation !== undefined ? updatedApp.sendConfirmation : false),
      return_days: updatedApp.return_days !== undefined ? updatedApp.return_days : (updatedApp.returnDays !== undefined ? updatedApp.returnDays : null),
      label: updatedApp.label || null,
      type: updatedApp.type || 'CONSULTA',
      is_recurring: updatedApp.is_recurring !== undefined ? updatedApp.is_recurring : (updatedApp.isRecurring !== undefined ? updatedApp.isRecurring : false),
    };

    try {
      const { error } = await supabase
        .from('appointments')
        .update(cleanApp)
        .eq('id', cleanApp.id);
      
      if (error) {
        if (error.code === 'PGRST204' || error.message.includes('column')) {
          console.warn('[Supabase] Migration columns missing, updated locally only.');
        } else {
          throw error;
        }
      }
    } catch (err) {
      console.warn('[Supabase] Error updating appointment, updated locally only:', err.message || err);
    }

    const p = patients.find(pat => pat.id === cleanApp.patient_id);
    const proc = procedures.find(pr => pr.id === cleanApp.procedure_id);

    setAppointments(prev => prev.map(a => a.id === cleanApp.id ? {
      ...a,
      ...cleanApp,
      patientName: p ? p.name : (cleanApp.type === 'COMPROMISSO' ? '' : 'Paciente Desconhecido'),
      patientPhone: p ? p.phone : '',
      procedureName: proc ? proc.name : 'Consulta Geral',
      color: proc ? proc.color : '#3b82f6',
      chairId: cleanApp.chair_id,
      procedureId: cleanApp.procedure_id,
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

  // FINANCEIRO
  const addTransaction = async (t) => {
    const clinicId = clinic.id;
    const fresh = {
      ...t,
      clinic_id: clinicId,
      date: t.date || new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([fresh])
      .select()
      .single();
    if (error) throw error;
    setFinanceTransactions(prev => [data, ...prev]);
  };

  // CONFIGURAÇÕES
  const saveProcedures = async (procsList) => {
    const clinicId = clinic.id;

    try {
      await supabase.from('procedures').delete().eq('clinic_id', clinicId);
      await supabase.from('procedures').insert(procsList.map(p => ({ ...p, clinic_id: clinicId })));
      setProcedures(procsList);
    } catch (err) {
      console.error('Erro ao atualizar procedimentos no Supabase:', err);
    }
  };

  const saveInsurancePlans = async (plansList) => {
    const clinicId = clinic.id;

    try {
      await supabase.from('insurance_plans').delete().eq('clinic_id', clinicId);
      await supabase.from('insurance_plans').insert(plansList.map(p => ({ ...p, clinic_id: clinicId })));
      setInsurancePlans(plansList);
    } catch (err) {
      console.error('Erro ao atualizar convênios no Supabase:', err);
    }
  };

  const saveAiConfig = async (config) => {
    const clinicId = clinic.id;

    try {
      await supabase
        .from('whatsapp_config')
        .upsert({
          clinic_id: clinicId,
          agent_prompt: config.prompt,
          is_active: config.isActive
        });
      setAiConfig(config);
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

  return (
    <ClinicContext.Provider value={{
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

      addPatient,
      addChair,
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
      updateChatNotes,
      updateChatTags,
      toggleBotSilence,
      addTransaction,
      saveProcedures,
      saveInsurancePlans,
      aiConfig,
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
    }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  return useContext(ClinicContext);
}

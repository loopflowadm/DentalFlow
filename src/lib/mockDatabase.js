const STORAGE_KEYS = {
  CLINICS: 'odonto_crm_clinics',
  PROFILES: 'odonto_crm_profiles',
  PATIENTS: 'odonto_crm_patients',
  APPOINTMENTS: 'odonto_crm_appointments',
  WHATSAPP: 'odonto_crm_whatsapp_config',
  USERS: 'odonto_crm_users' // Para simulação de login
};

const initialClinics = [
  {
    id: 'clinic-sorriso-perfeito',
    name: 'ODONTO CRM',
    subdomain: 'sorriso',
    logo_url: '/logo-brand.png',
    primary_color: '#03269A', // Deep Blue
    secondary_color: '#1855FD', // Bright Electric Blue
    created_at: new Date().toISOString()
  },
  {
    id: 'clinic-orto-clean',
    name: 'Orto Clean',
    subdomain: 'ortoclean',
    logo_url: '✨',
    primary_color: '#1e3a8a', // Azul Marinho
    secondary_color: '#2563eb', // Azul Royal
    created_at: new Date().toISOString()
  },
  {
    id: 'clinic-odonto-prime',
    name: 'Odonto Prime',
    subdomain: 'prime',
    logo_url: '💎',
    primary_color: '#881337', // Vinho/Rose
    secondary_color: '#be123c', // Rosa Prime
    created_at: new Date().toISOString()
  }
];

const initialUsers = [
  {
    id: 'user-super-admin',
    email: 'admin@saas.com',
    password: '123',
    role: 'SUPER_ADMIN',
    full_name: 'Administrador Geral',
    clinic_id: null
  },
  {
    id: 'user-sorriso-admin',
    email: 'admin@sorriso.com',
    password: '123',
    role: 'CLINIC_ADMIN',
    full_name: 'Dra. Cláudia Silva',
    clinic_id: 'clinic-sorriso-perfeito'
  },
  {
    id: 'user-sorriso-doctor',
    email: 'pedro@sorriso.com',
    password: '123',
    role: 'DOCTOR',
    full_name: 'Dr. Pedro Ramos',
    clinic_id: 'clinic-sorriso-perfeito'
  },
  {
    id: 'user-orto-admin',
    email: 'admin@orto.com',
    password: '123',
    role: 'CLINIC_ADMIN',
    full_name: 'Dr. Carlos Souza',
    clinic_id: 'clinic-orto-clean'
  }
];

const initialPatients = [];

const initialAppointments = [];

const initialWhatsApp = [
  {
    id: 'wa-1',
    clinic_id: 'clinic-sorriso-perfeito',
    instance_name: 'sorriso-bot',
    api_key: 'sk_live_sorrisolink_abc123',
    agent_prompt: 'Olá, sou a Sofia, assistente virtual da Sorriso Perfeito. Meu objetivo é lhe ajudar a agendar ou reagendar sua consulta.',
    is_active: true
  },
  {
    id: 'wa-2',
    clinic_id: 'clinic-orto-clean',
    instance_name: 'orto-clean-bot',
    api_key: 'sk_live_ortolink_xyz789',
    agent_prompt: 'Olá! Sou o assistente virtual da Orto Clean. Posso te ajudar a gerenciar seus horários de manutenção do aparelho.',
    is_active: false
  }
];

// Helper para ler/escrever LocalStorage
const get = (key, fallback) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  let parsed;
  try {
    parsed = JSON.parse(data);
  } catch (e) {
    console.warn(`[mockDb] Dados corrompidos na chave "${key}". Resetando para o padrão:`, e);
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  
  // Migração automática de branding da logo
  if (key === STORAGE_KEYS.CLINICS && Array.isArray(parsed)) {
    let changed = false;
    const idx = parsed.findIndex(c => c.id === 'clinic-sorriso-perfeito');
    if (idx > -1 && (parsed[idx].name === 'Sorriso Perfeito' || parsed[idx].primary_color === '#0f766e' || !parsed[idx].logo_url || parsed[idx].logo_url === '')) {
      parsed[idx].name = 'ODONTO CRM';
      parsed[idx].primary_color = '#03269A';
      parsed[idx].secondary_color = '#1855FD';
      parsed[idx].logo_url = '/logo-brand.png';
      changed = true;
    }
    
    // Corrigir mojibake de emojis salvos no localStorage
    parsed.forEach(c => {
      if (c.logo_url === 'ðŸ’Ž' || c.logo_url === '💎' || c.logo_url?.includes('ðŸ')) {
        if (c.logo_url === 'ðŸ’Ž') {
          c.logo_url = '💎';
          changed = true;
        } else if (c.logo_url === 'ðŸ¦·' || c.logo_url === 'ðŸ·') {
          c.logo_url = '🦷';
          changed = true;
        } else if (c.logo_url && c.logo_url.length > 2 && c.logo_url.includes('ð')) {
          c.logo_url = '🦷';
          changed = true;
        }
      }
    });

    if (changed) {
      localStorage.setItem(key, JSON.stringify(parsed));
    }
  }
  return parsed;
};

const set = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockDb = {
  getClinics: () => get(STORAGE_KEYS.CLINICS, initialClinics),
  saveClinic: (clinic) => {
    const clinics = mockDb.getClinics();
    const index = clinics.findIndex(c => c.id === clinic.id);
    if (index > -1) {
      clinics[index] = clinic;
    } else {
      clinics.push(clinic);
    }
    set(STORAGE_KEYS.CLINICS, clinics);
    return clinic;
  },
  getUsers: () => get(STORAGE_KEYS.USERS, initialUsers),
  saveUser: (user) => {
    const users = mockDb.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    set(STORAGE_KEYS.USERS, users);
    return user;
  },
  getPatients: (clinicId) => {
    const patients = get(STORAGE_KEYS.PATIENTS, initialPatients);
    return clinicId ? patients.filter(p => p.clinic_id === clinicId) : patients;
  },
  savePatient: (patient) => {
    const patients = get(STORAGE_KEYS.PATIENTS, initialPatients);
    const index = patients.findIndex(p => p.id === patient.id);
    if (index > -1) {
      patients[index] = patient;
    } else {
      patients.push(patient);
    }
    set(STORAGE_KEYS.PATIENTS, patients);
    return patient;
  },
  getAppointments: (clinicId) => {
    const appointments = get(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    return clinicId ? appointments.filter(a => a.clinic_id === clinicId) : appointments;
  },
  saveAppointment: (appointment) => {
    const appointments = get(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    const index = appointments.findIndex(a => a.id === appointment.id);
    if (index > -1) {
      appointments[index] = appointment;
    } else {
      appointments.push(appointment);
    }
    set(STORAGE_KEYS.APPOINTMENTS, appointments);
    return appointment;
  },
  getWhatsAppConfig: (clinicId) => {
    const configs = get(STORAGE_KEYS.WHATSAPP, initialWhatsApp);
    return configs.find(c => c.clinic_id === clinicId) || {
      clinic_id: clinicId,
      instance_name: '',
      api_key: '',
      agent_prompt: '',
      is_active: false
    };
  },
  saveWhatsAppConfig: (config) => {
    const configs = get(STORAGE_KEYS.WHATSAPP, initialWhatsApp);
    const index = configs.findIndex(c => c.clinic_id === config.clinic_id);
    if (index > -1) {
      configs[index] = config;
    } else {
      configs.push(config);
    }
    set(STORAGE_KEYS.WHATSAPP, configs);
    return config;
  }
};

-- ==========================================
-- SCRIPT DE INICIALIZAÇÃO: ODONTO CRM (SUPABASE + RLS)
-- ==========================================

-- 1. Tabela de Clínicas (Tenants)
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(10) DEFAULT '#0f172a',
    secondary_color VARCHAR(10) DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Clínicas
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- 2. Tabela de Perfis de Usuários (Profiles)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CLINIC_ADMIN', -- 'SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Tabela de Pacientes (Patients)
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    medical_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Pacientes
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 3b. Tabela de Cadeiras (Chairs)
CREATE TABLE public.chairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Cadeiras
ALTER TABLE public.chairs ENABLE ROW LEVEL SECURITY;

-- 4. Tabela de Consultas/Agendamentos (Appointments)
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE, -- Nullable para Blocker (Compromisso) e Tarefas
    doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Nullable para Tarefas
    chair_id UUID REFERENCES public.chairs(id) ON DELETE SET NULL,
    room VARCHAR(255) DEFAULT NULL,
    procedure_id UUID REFERENCES public.procedures(id) ON DELETE SET NULL,
    title VARCHAR(255) DEFAULT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 30,
    observations TEXT DEFAULT NULL,
    send_confirmation BOOLEAN DEFAULT FALSE,
    return_days INTEGER DEFAULT NULL,
    label VARCHAR(100) DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
    type VARCHAR(50) DEFAULT 'CONSULTA', -- 'CONSULTA', 'COMPROMISSO', 'TAREFA'
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Consultas
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 5. Configuração de Automação do WhatsApp (WhatsApp Config)
CREATE TABLE public.whatsapp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID UNIQUE NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    instance_name VARCHAR(100),
    api_key TEXT,
    agent_prompt TEXT DEFAULT 'Você é a assistente virtual da clínica odontológica. Seu objetivo é ajudar pacientes a agendarem, confirmarem ou reagendarem consultas de forma simpática e rápida.',
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para WhatsApp Config
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- DEFINIÇÃO DAS POLÍTICAS DE SEGURANÇA (RLS)
-- ==========================================

-- Função auxiliar para obter o clinic_id do JWT do usuário logado (de forma segura através da tabela de perfis)
CREATE OR REPLACE FUNCTION public.get_auth_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Função auxiliar para verificar se o usuário é Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role') = 'SUPER_ADMIN',
    false
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- 1. Políticas para CLINICS
-- Leitura pública do logotipo/cores baseado no subdomínio (necessário para a tela de login)
CREATE POLICY clinics_read_public ON public.clinics
    FOR SELECT USING (true);

-- Modificação apenas por Super Admins
CREATE POLICY clinics_all_super_admin ON public.clinics
    FOR ALL USING (public.is_super_admin());

-- Permitir inserção pública para novas clínicas (cadastro inicial)
CREATE POLICY clinics_insert_public ON public.clinics
    FOR INSERT WITH CHECK (true);

-- Permitir que membros de uma clínica atualizem os dados da sua própria clínica (Branding)
CREATE POLICY clinics_update_owner ON public.clinics
    FOR UPDATE USING (id = public.get_auth_clinic_id() OR public.is_super_admin());


-- 2. Políticas para PROFILES
-- Usuários podem ver perfis da mesma clínica
CREATE POLICY profiles_select_clinic ON public.profiles
    FOR SELECT USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- Usuários administradores locais podem atualizar perfis da própria clínica
CREATE POLICY profiles_modify_clinic ON public.profiles
    FOR ALL USING (
        (clinic_id = public.get_auth_clinic_id() AND (
            SELECT role FROM public.profiles WHERE id = auth.uid()
        ) = 'CLINIC_ADMIN') 
        OR public.is_super_admin()
    );


-- 3. Políticas para PATIENTS
-- Apenas usuários da própria clínica podem ler/escrever pacientes
CREATE POLICY patients_all_clinic ON public.patients
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());


-- 3b. Políticas para CHAIRS
-- Apenas usuários da própria clínica podem ler/escrever cadeiras
CREATE POLICY chairs_all_clinic ON public.chairs
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());


-- 4. Políticas para APPOINTMENTS
-- Apenas usuários da própria clínica podem ler/escrever consultas
CREATE POLICY appointments_all_clinic ON public.appointments
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());


-- 5. Políticas para WHATSAPP CONFIG
-- Apenas administradores locais da clínica podem gerenciar a configuração do WhatsApp
CREATE POLICY whatsapp_config_all_clinic ON public.whatsapp_config
    FOR ALL USING (
        (clinic_id = public.get_auth_clinic_id() AND (
            SELECT role FROM public.profiles WHERE id = auth.uid()
        ) = 'CLINIC_ADMIN') 
        OR public.is_super_admin()
    );


-- ========================================================
-- ADICIONADO PARA PRODUÇÃO: FORNECEDORES E CONTAS A PAGAR
-- ========================================================

-- Adicionar colunas de compatibilidade a tabelas existentes
ALTER TABLE public.installments 
    ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) DEFAULT NULL;

ALTER TABLE public.whatsapp_config 
    ADD COLUMN IF NOT EXISTS whatsapp_status VARCHAR(50) DEFAULT 'DISCONNECTED';

-- 6. Tabela de Fornecedores (Suppliers)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY suppliers_all_clinic ON public.suppliers
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- 7. Tabela de Contas a Pagar (Accounts Payable)
CREATE TABLE IF NOT EXISTS public.accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMP WITH TIME ZONE,
    category VARCHAR(100) NOT NULL,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_path VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY accounts_payable_all_clinic ON public.accounts_payable
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());


-- ========================================================
-- MÓDULO CLÍNICO E PRESCRIÇÃO DIGITAL (SOFIA IA)
-- ========================================================

-- Tabela de Registros Clínicos (Evoluções)
CREATE TABLE public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    signature_hash VARCHAR(64) NOT NULL, -- SHA256 da evolução (RN-001)
    is_adendo BOOLEAN DEFAULT FALSE,     -- Identifica se é retificação (RN-002)
    parent_record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Registros Clínicos
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Registros Clínicos (Imutabilidade: apenas leitura e inserção)
CREATE POLICY medical_records_select ON public.medical_records
    FOR SELECT USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

CREATE POLICY medical_records_insert ON public.medical_records
    FOR INSERT WITH CHECK (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());


-- Tabela de Prescrições Digitais (Receitas, Atestados)
CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,         -- Nome do modelo/tipo (ex: Receita Analgésica)
    description TEXT NOT NULL,           -- Corpo da prescrição
    file_path VARCHAR(512),              -- Caminho do PDF gerado no Storage
    signature_hash VARCHAR(64) NOT NULL, -- SHA256 da assinatura digital
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Prescrições
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Prescrições (Imutabilidade: apenas leitura e inserção)
CREATE POLICY prescriptions_select ON public.prescriptions
    FOR SELECT USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

CREATE POLICY prescriptions_insert ON public.prescriptions
    FOR INSERT WITH CHECK (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());


-- Tabela de Registros de Dentes (Odontograma FDI)
CREATE TABLE public.tooth_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    tooth_number INT NOT NULL,
    procedure_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'NEED_TREATMENT', -- 'NEED_TREATMENT', 'TREATED', 'IMPLANT', 'MISSING'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (patient_id, tooth_number)
);

-- Habilitar RLS para Registros de Dentes
ALTER TABLE public.tooth_records ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Registros de Dentes
CREATE POLICY tooth_records_all_clinic ON public.tooth_records
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());


-- Tabela de Leads Comerciais do CRM
CREATE TABLE public.crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    avatar VARCHAR(50) DEFAULT '👤',
    stage INT DEFAULT 0, -- 0 a 11 (Novo Paciente, Primeiro Contato, etc.)
    priority VARCHAR(50) DEFAULT 'medium', -- 'high', 'medium', 'low'
    budget_amount NUMERIC(10, 2) DEFAULT 0.00,
    procedure_name VARCHAR(255) DEFAULT 'Consulta Geral',
    comments JSONB DEFAULT '[]'::jsonb,
    checklist JSONB DEFAULT '[]'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Leads
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Leads
CREATE POLICY crm_leads_all_clinic ON public.crm_leads
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());


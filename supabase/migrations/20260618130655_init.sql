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

-- 4. Tabela de Consultas/Agendamentos (Appointments)
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
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

-- Função auxiliar para obter o clinic_id do JWT do usuário logado
CREATE OR REPLACE FUNCTION public.get_auth_clinic_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'clinic_id', '')::UUID;
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

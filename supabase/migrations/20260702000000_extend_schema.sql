-- ========================================================
-- EXPANSÃO DE TABELAS SAAS: CRM LEADS, AUTOMACÕES E CONFIGS
-- ========================================================

-- 1. Estender a tabela public.patients com colunas para o Funil Comercial (CRM)
ALTER TABLE public.patients 
    ADD COLUMN IF NOT EXISTS stage INTEGER DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium',
    ADD COLUMN IF NOT EXISTS avatar VARCHAR(50) DEFAULT '👤',
    ADD COLUMN IF NOT EXISTS budget_amount NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS procedure_name VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS responsible_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Tabela de Automações (Automations)
CREATE TABLE IF NOT EXISTS public.automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger VARCHAR(100) NOT NULL,
    actions TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Automações
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Automações
DROP POLICY IF EXISTS automations_all_clinic ON public.automations;
CREATE POLICY automations_all_clinic ON public.automations
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- 3. Tabela de Procedimentos Clínicos (Procedures)
CREATE TABLE IF NOT EXISTS public.procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    category VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Procedimentos
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Procedimentos
DROP POLICY IF EXISTS procedures_all_clinic ON public.procedures;
CREATE POLICY procedures_all_clinic ON public.procedures
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- 4. Tabela de Convênios / Planos (Insurance Plans)
CREATE TABLE IF NOT EXISTS public.insurance_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Convênios
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Convênios
DROP POLICY IF EXISTS insurance_plans_all_clinic ON public.insurance_plans;
CREATE POLICY insurance_plans_all_clinic ON public.insurance_plans
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- 5. Tabela de Campanhas de Marketing (Marketing Campaigns)
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    views INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    budget NUMERIC(10, 2) DEFAULT 0.00,
    conversion NUMERIC(5, 2) DEFAULT 0.00,
    source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Marketing
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Marketing
DROP POLICY IF EXISTS marketing_campaigns_all_clinic ON public.marketing_campaigns;
CREATE POLICY marketing_campaigns_all_clinic ON public.marketing_campaigns
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

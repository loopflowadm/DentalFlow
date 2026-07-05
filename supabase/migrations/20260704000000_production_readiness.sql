-- ========================================================
-- MIGRAÇÃO: FORNECEDORES, CONTAS A PAGAR E COMPATIBILIDADE DE APIs
-- ========================================================

-- 1. Criar Tabela de Fornecedores (Suppliers)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Fornecedores
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Fornecedores
CREATE POLICY suppliers_all_clinic ON public.suppliers
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());


-- 2. Criar Tabela de Contas a Pagar (Accounts Payable)
CREATE TABLE IF NOT EXISTS public.accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'AWAITING_APPROVAL', 'PENDING', 'PAID', 'OVERDUE'
    paid_at TIMESTAMP WITH TIME ZONE,
    category VARCHAR(100) NOT NULL, -- 'SUPPLIES', 'RENT', 'COMMISSION', 'SALARY', 'OTHER'
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_path VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Contas a Pagar
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Contas a Pagar
CREATE POLICY accounts_payable_all_clinic ON public.accounts_payable
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());


-- 3. Atualizações de Colunas Faltantes para Compatibilidade

-- Adicionar external_id na tabela installments se não existir
ALTER TABLE public.installments 
    ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) DEFAULT NULL;

-- Adicionar whatsapp_status na tabela whatsapp_config se não existir
ALTER TABLE public.whatsapp_config 
    ADD COLUMN IF NOT EXISTS whatsapp_status VARCHAR(50) DEFAULT 'DISCONNECTED';

-- ========================================================
-- EXPANSÃO DE MÓDULOS SAAS: FINANCEIRO E LIVE CHAT
-- ========================================================

-- 1. Orçamentos de Tratamento (Treatment Budgets)
CREATE TABLE public.treatment_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.treatment_budgets ENABLE ROW LEVEL SECURITY;

-- 2. Itens do Orçamento (Treatment Items)
CREATE TABLE public.treatment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES public.treatment_budgets(id) ON DELETE CASCADE,
    tooth_number INTEGER, -- Número do dente do FDI Odontograma (11-48) ou NULL se geral
    procedure_name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    dentist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    commission_percent NUMERIC(5, 2) DEFAULT 0.00, -- Percentual de comissão do dentista (ex: 40.00)
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED'
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.treatment_items ENABLE ROW LEVEL SECURITY;

-- 3. Parcelas do Orçamento (Installments)
CREATE TABLE public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES public.treatment_budgets(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'OVERDUE'
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50), -- 'PIX', 'CREDIT_CARD', 'CASH', 'BOLETO'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

-- 4. Transações Financeiras / Fluxo de Caixa (Transactions)
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'INCOME', 'EXPENSE'
    category VARCHAR(100), -- 'TREATMENT', 'SALARY', 'RENT', 'SUPPLIES', 'OTHER'
    installment_id UUID REFERENCES public.installments(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. Sessões de Chat (Chat Sessions - Pausa da IA)
CREATE TABLE public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID UNIQUE NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    is_bot_paused BOOLEAN DEFAULT FALSE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Mensagens de Chat (Chat Messages - Histórico de WhatsApp)
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL, -- 'PATIENT', 'BOT', 'USER'
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;


-- ========================================================
-- DEFINIÇÃO DE POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ========================================================

-- Políticas para TREATMENT BUDGETS
CREATE POLICY treatment_budgets_all_clinic ON public.treatment_budgets
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- Políticas para TREATMENT ITEMS
CREATE POLICY treatment_items_all_clinic ON public.treatment_items
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- Políticas para INSTALLMENTS
CREATE POLICY installments_all_clinic ON public.installments
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- Políticas para TRANSACTIONS
CREATE POLICY transactions_all_clinic ON public.transactions
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- Políticas para CHAT SESSIONS
CREATE POLICY chat_sessions_all_clinic ON public.chat_sessions
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- Políticas para CHAT MESSAGES
CREATE POLICY chat_messages_all_clinic ON public.chat_messages
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

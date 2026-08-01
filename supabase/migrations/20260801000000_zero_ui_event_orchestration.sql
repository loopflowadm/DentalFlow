-- ==============================================================================
-- FLOWDENT / ODONTOCRM - MIGRATION: ZERO-UI EVENT ORCHESTRATION & CASCADE
-- Data: 2026-08-01
-- Objetivo: Reatividade autônoma entre WhatsApp -> Pacientes -> CRM -> Agenda -> Prontuário -> Financeiro
-- ==============================================================================

-- 1. Garantir existência da tabela crm_leads
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    stage VARCHAR(50) DEFAULT 'NOVO_LEAD', -- 'NOVO_LEAD', 'CONTATADO', 'AGENDADO', 'ORCAMENTO', 'GANHO', 'PERDIDO'
    procedure_name VARCHAR(255),
    value NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    requires_confirmation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_crm_leads_isolation ON public.crm_leads;
CREATE POLICY tenant_crm_leads_isolation ON public.crm_leads
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- 2. Garantir existência da tabela financial_transactions
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    type VARCHAR(50) NOT NULL DEFAULT 'INCOME', -- 'INCOME', 'EXPENSE'
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'CANCELLED'
    category VARCHAR(100) DEFAULT 'TREATMENT',
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_financial_isolation ON public.financial_transactions;
CREATE POLICY tenant_financial_isolation ON public.financial_transactions
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- 3. Tabela de Eventos do Sistema (System Events Queue)
CREATE TABLE IF NOT EXISTS public.system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'WHATSAPP',
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PROCESSED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_system_events_isolation ON public.system_events;
CREATE POLICY tenant_system_events_isolation ON public.system_events
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

CREATE INDEX IF NOT EXISTS idx_system_events_clinic ON public.system_events(clinic_id, created_at DESC);

-- 4. Procedure Transacional para Cascata Autônoma Zero-UI
CREATE OR REPLACE FUNCTION public.fn_process_whatsapp_incoming_event(
    p_clinic_id UUID,
    p_phone TEXT,
    p_name TEXT,
    p_intent JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_patient_id UUID;
    v_lead_id UUID;
    v_appointment_id UUID;
    v_medical_record_id UUID;
    v_financial_id UUID;
    v_doctor_id UUID;
    v_is_ambiguous BOOLEAN := COALESCE((p_intent->>'is_ambiguous')::boolean, false);
    v_complaint TEXT := COALESCE(p_intent->>'complaint', 'Consulta Geral / Avaliação');
    v_procedure TEXT := COALESCE(p_intent->>'procedure', 'Avaliação Odontológica');
    v_amount NUMERIC(10, 2) := COALESCE((p_intent->>'estimated_amount')::numeric, 150.00);
    v_start_time TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
    v_result JSONB;
BEGIN
    -- 4.1 Identificar ou criar Paciente
    SELECT id INTO v_patient_id
    FROM public.patients
    WHERE clinic_id = p_clinic_id AND (phone = p_phone OR phone = REPLACE(p_phone, '+58', ''))
    LIMIT 1;

    IF v_patient_id IS NULL THEN
        INSERT INTO public.patients (clinic_id, name, phone, medical_history)
        VALUES (p_clinic_id, COALESCE(p_name, 'Paciente WhatsApp'), p_phone, 'Cadastrado automaticamente via WhatsApp')
        RETURNING id INTO v_patient_id;
    END IF;

    -- 4.2 Identificar ou criar Oportunidade no CRM
    SELECT id INTO v_lead_id
    FROM public.crm_leads
    WHERE clinic_id = p_clinic_id AND patient_id = v_patient_id
    LIMIT 1;

    IF v_lead_id IS NULL THEN
        INSERT INTO public.crm_leads (clinic_id, patient_id, name, phone, stage, procedure_name, value, requires_confirmation)
        VALUES (p_clinic_id, v_patient_id, COALESCE(p_name, 'Paciente WhatsApp'), p_phone, 'AGENDADO', v_procedure, v_amount, v_is_ambiguous)
        RETURNING id INTO v_lead_id;
    ELSE
        UPDATE public.crm_leads
        SET stage = 'AGENDADO',
            requires_confirmation = v_is_ambiguous,
            procedure_name = v_procedure,
            value = v_amount
        WHERE id = v_lead_id;
    END IF;

    -- 4.3 Obter um médico (doctor_id) padrão da clínica caso não informado
    IF p_intent->>'doctor_id' IS NOT NULL THEN
        v_doctor_id := (p_intent->>'doctor_id')::uuid;
    ELSE
        SELECT id INTO v_doctor_id
        FROM public.profiles
        WHERE clinic_id = p_clinic_id
        LIMIT 1;
    END IF;

    -- Define horário do agendamento
    IF p_intent->>'start_time' IS NOT NULL THEN
        v_start_time := (p_intent->>'start_time')::timestamptz;
        v_end_time := COALESCE((p_intent->>'end_time')::timestamptz, v_start_time + INTERVAL '45 minutes');
    ELSE
        v_start_time := NOW() + INTERVAL '1 day';
        v_end_time := v_start_time + INTERVAL '45 minutes';
    END IF;

    -- 4.4 Criar Agendamento na Agenda
    IF v_doctor_id IS NOT NULL THEN
        INSERT INTO public.appointments (clinic_id, patient_id, doctor_id, start_time, end_time, status)
        VALUES (
            p_clinic_id,
            v_patient_id,
            v_doctor_id,
            v_start_time,
            v_end_time,
            CASE WHEN v_is_ambiguous THEN 'PENDING' ELSE 'CONFIRMED' END
        )
        RETURNING id INTO v_appointment_id;
    END IF;

    -- 4.5 Prontuário Clínico: Rascunho 'Aguardando Atendimento'
    IF v_doctor_id IS NOT NULL THEN
        INSERT INTO public.medical_records (clinic_id, patient_id, dentist_id, description, signature_hash)
        VALUES (
            p_clinic_id,
            v_patient_id,
            v_doctor_id,
            'Aguardando Atendimento — Queixa principal extraída via WhatsApp: ' || v_complaint,
            encode(digest(NOW()::text || v_patient_id::text, 'sha256'), 'hex')
        )
        RETURNING id INTO v_medical_record_id;
    END IF;

    -- 4.6 Financeiro: Pré-lançamento / Orçamento Pendente
    INSERT INTO public.financial_transactions (clinic_id, patient_id, description, amount, type, status, category)
    VALUES (
        p_clinic_id,
        v_patient_id,
        'Pré-Faturamento: ' || v_procedure,
        v_amount,
        'INCOME',
        'PENDING',
        'TREATMENT'
    )
    RETURNING id INTO v_financial_id;

    -- 4.7 Registrar Log de Auditoria Silencioso
    INSERT INTO public.audit_logs (clinic_id, user_id, action, details)
    VALUES (
        p_clinic_id,
        v_doctor_id,
        'AUTOMATED_EVENT_CASCADE',
        jsonb_build_object(
            'phone', p_phone,
            'patient_id', v_patient_id,
            'lead_id', v_lead_id,
            'appointment_id', v_appointment_id,
            'medical_record_id', v_medical_record_id,
            'financial_id', v_financial_id,
            'is_ambiguous', v_is_ambiguous
        )::text
    );

    -- 4.8 Registrar Evento no Barramento
    INSERT INTO public.system_events (clinic_id, event_type, source, payload, status)
    VALUES (
        p_clinic_id,
        'WHATSAPP_AUTO_CASCADE',
        'WHATSAPP',
        jsonb_build_object(
            'patient_id', v_patient_id,
            'lead_id', v_lead_id,
            'appointment_id', v_appointment_id,
            'medical_record_id', v_medical_record_id,
            'financial_id', v_financial_id
        ),
        'PROCESSED'
    );

    v_result := jsonb_build_object(
        'success', true,
        'patient_id', v_patient_id,
        'lead_id', v_lead_id,
        'appointment_id', v_appointment_id,
        'medical_record_id', v_medical_record_id,
        'financial_id', v_financial_id,
        'is_ambiguous', v_is_ambiguous
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

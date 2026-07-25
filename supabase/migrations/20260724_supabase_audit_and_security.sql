-- ==============================================================================
-- FLOWDENT / ODONTOCRM - SUPABASE POSTGRES BEST PRACTICES & AUDIT MIGRATION
-- Data: 2026-07-24
-- Diretrizes: Skill supabase-postgres-best-practices, Isolamento Multi-tenant & LGPD
-- ==============================================================================

-- 1. Habilitar Extensão de Busca Vetorial pgvector (para o Agente Sofia e IA)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Habilitar Row-Level Security (RLS) em 100% das Tabelas Operacionais
ALTER TABLE IF EXISTS public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_semantic_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.treatment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prescriptions ENABLE ROW LEVEL SECURITY;

-- 3. Garantir Políticas de Isolamento Rigoroso de Tenant por clinic_id

-- 3.1 Patients
DROP POLICY IF EXISTS tenant_patients_isolation ON public.patients;
CREATE POLICY tenant_patients_isolation ON public.patients
    FOR ALL USING (
        clinic_id = public.get_auth_clinic_id()
        OR public.is_super_admin()
    );

-- 3.2 Appointments
DROP POLICY IF EXISTS tenant_appointments_isolation ON public.appointments;
CREATE POLICY tenant_appointments_isolation ON public.appointments
    FOR ALL USING (
        clinic_id = public.get_auth_clinic_id()
        OR public.is_super_admin()
    );

-- 3.3 CRM Leads
DROP POLICY IF EXISTS tenant_crm_leads_isolation ON public.crm_leads;
CREATE POLICY tenant_crm_leads_isolation ON public.crm_leads
    FOR ALL USING (
        clinic_id = public.get_auth_clinic_id()
        OR public.is_super_admin()
    );

-- 3.4 Financial Transactions
DROP POLICY IF EXISTS tenant_financial_isolation ON public.financial_transactions;
CREATE POLICY tenant_financial_isolation ON public.financial_transactions
    FOR ALL USING (
        clinic_id = public.get_auth_clinic_id()
        OR public.is_super_admin()
    );

-- 3.5 AI Semantic Memory
DROP POLICY IF EXISTS tenant_ai_memory_isolation ON public.ai_semantic_memory;
CREATE POLICY tenant_ai_memory_isolation ON public.ai_semantic_memory
    FOR ALL USING (
        clinic_id = public.get_auth_clinic_id()
        OR public.is_super_admin()
    );

-- 3.6 Audit Logs
DROP POLICY IF EXISTS tenant_audit_logs_isolation ON public.audit_logs;
CREATE POLICY tenant_audit_logs_isolation ON public.audit_logs
    FOR ALL USING (
        clinic_id = public.get_auth_clinic_id()
        OR public.is_super_admin()
    );


-- 4. Otimização de Performance: Índices Compostos e Foreign Key Indexes
-- (Diretrizes: query-missing-indexes e schema-design do Supabase Best Practices)

-- 4.1 Pacientes
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_name ON public.patients(clinic_id, name ASC);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_created ON public.patients(clinic_id, created_at DESC);

-- 4.2 Agendamentos
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_start ON public.appointments(clinic_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dentist_id ON public.appointments(dentist_id);

-- 4.3 Leads do CRM
CREATE INDEX IF NOT EXISTS idx_crm_leads_clinic_id ON public.crm_leads(clinic_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_clinic_status ON public.crm_leads(clinic_id, status);

-- 4.4 Transações Financeiras
CREATE INDEX IF NOT EXISTS idx_financial_clinic_id ON public.financial_transactions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_financial_clinic_date ON public.financial_transactions(clinic_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_patient_id ON public.financial_transactions(patient_id);

-- 4.5 Memória de IA Vetorial
CREATE INDEX IF NOT EXISTS idx_ai_semantic_memory_clinic ON public.ai_semantic_memory(clinic_id);
CREATE INDEX IF NOT EXISTS idx_ai_semantic_memory_patient ON public.ai_semantic_memory(patient_id);

-- 4.6 Logs de Auditoria LGPD
CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic_created ON public.audit_logs(clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);


-- 5. Função RPC de Diagnóstico de Saúde do Banco (Database Health Diagnostic)
CREATE OR REPLACE FUNCTION public.check_database_health()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    rls_unprotected_count INT;
    vector_installed BOOLEAN;
BEGIN
    -- Contar tabelas sem RLS no schema public
    SELECT COUNT(*) INTO rls_unprotected_count
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
      AND c.relrowsecurity = FALSE;

    -- Checar extensão pgvector
    SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
    ) INTO vector_installed;

    result := jsonb_build_object(
        'status', CASE WHEN rls_unprotected_count = 0 THEN 'OPTIMAL' ELSE 'WARNING' END,
        'unprotected_tables', rls_unprotected_count,
        'vector_extension_active', vector_installed,
        'checked_at', NOW()
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

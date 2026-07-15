-- ========================================================
-- MIGRAÇÃO: CADEIRAS E EXTENSÃO DE CONSULTAS (AGENDA CRM)
-- ========================================================

-- 1. Criar Tabela de Cadeiras (Chairs)
CREATE TABLE IF NOT EXISTS public.chairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Cadeiras
ALTER TABLE public.chairs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Cadeiras
DROP POLICY IF EXISTS chairs_all_clinic ON public.chairs;
CREATE POLICY chairs_all_clinic ON public.chairs
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

-- 2. Alterar a tabela appointments para tornar patient_id e doctor_id anuláveis (DROP NOT NULL)
-- Isso permite compromissos (bloqueios) sem pacientes e tarefas sem doutor/paciente vinculados.
ALTER TABLE public.appointments ALTER COLUMN patient_id DROP NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN doctor_id DROP NOT NULL;

-- 3. Adicionar novas colunas em appointments
ALTER TABLE public.appointments 
    ADD COLUMN IF NOT EXISTS chair_id UUID REFERENCES public.chairs(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS room VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS procedure_id UUID REFERENCES public.procedures(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 30,
    ADD COLUMN IF NOT EXISTS observations TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS send_confirmation BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS return_days INTEGER DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS label VARCHAR(100) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'CONSULTA',
    ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- 4. Adicionar índice composto para performance
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_type ON public.appointments (clinic_id, type);

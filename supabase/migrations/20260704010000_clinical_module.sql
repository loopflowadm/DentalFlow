-- ========================================================
-- MIGRAÇÃO: MÓDULO CLÍNICO E PRESCRIÇÃO DIGITAL (SOFIA IA)
-- ========================================================

-- 1. Tabela de Registros Clínicos (Evoluções)
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    signature_hash VARCHAR(64) NOT NULL, -- SHA256 da evolução (RN-001)
    is_adendo BOOLEAN DEFAULT FALSE,     -- Identifica se é retificação (RN-002)
    parent_record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL, -- Se for adendo, linka com o original
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Registros Clínicos
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Registros Clínicos
DROP POLICY IF EXISTS medical_records_all_clinic ON public.medical_records;
CREATE POLICY medical_records_all_clinic ON public.medical_records
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());


-- 2. Tabela de Prescrições Digitais (Receitas, Atestados)
CREATE TABLE IF NOT EXISTS public.prescriptions (
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

-- Políticas de RLS para Prescrições
DROP POLICY IF EXISTS prescriptions_all_clinic ON public.prescriptions;
CREATE POLICY prescriptions_all_clinic ON public.prescriptions
    FOR ALL USING (clinic_id = public.get_auth_clinic_id() OR public.is_super_admin());

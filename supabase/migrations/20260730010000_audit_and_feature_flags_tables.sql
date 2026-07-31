-- ==============================================================================
-- TABELAS DE AUDITORIA LGPD E FEATURE FLAGS PARA O SUPERADMIN
-- ==============================================================================

-- 1. Tabela de Logs de Auditoria LGPD
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Feature Flags Globais
CREATE TABLE IF NOT EXISTS public.system_flags (
    id VARCHAR(100) PRIMARY KEY,
    enabled BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_flags ENABLE ROW LEVEL SECURITY;

-- Permitir leitura de flags por todos os usuários autenticados
DROP POLICY IF EXISTS read_system_flags ON public.system_flags;
CREATE POLICY read_system_flags ON public.system_flags FOR SELECT USING (true);

DROP POLICY IF EXISTS write_system_flags ON public.system_flags;
CREATE POLICY write_system_flags ON public.system_flags FOR ALL USING (true);

-- Seed de Flags padrão
INSERT INTO public.system_flags (id, enabled) VALUES
('odontograma-3d-v2', true),
('receita-digital-assina-pf', false),
('ai-diagnostico-assistido', true),
('whatsapp-evolution-v2', false)
ON CONFLICT (id) DO NOTHING;

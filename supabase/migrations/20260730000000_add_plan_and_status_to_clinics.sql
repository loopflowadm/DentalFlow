-- ======================================================
-- MIGRATION: ADICIONAR PLANO E STATUS À TABELA DE CLÍNICAS
-- ======================================================

ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'Pro',
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Atualizar valores de demonstração se a tabela contiver dados
UPDATE public.clinics 
SET plan = 'Enterprise' 
WHERE subdomain = 'sorriso' AND plan IS NULL;

UPDATE public.clinics 
SET status = 'suspended', plan = 'Starter' 
WHERE subdomain = 'prime' AND status IS NULL;

-- ==============================================================================
-- FLOWDENT / ODONTOCRM — SCRIPT DE SEED PARA TESTES DA EVOLUTION API E WEBHOOK
-- Executar no SQL Editor do Supabase para registrar a Clínica e a Instância WhatsApp
-- ==============================================================================

BEGIN;

-- 1. Inserir ou atualizar Clínica de Teste
INSERT INTO public.clinics (id, name, subdomain, primary_color, secondary_color)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Clínica OdontoCRM Teste',
    'odontocrm-test',
    '#0f172a',
    '#3b82f6'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, subdomain = EXCLUDED.subdomain;

-- 2. Inserir Cadeira Inicial
INSERT INTO public.chairs (id, clinic_id, name)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Cadeira Principal 01'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Inserir Procedimentos Padrão (para a IA Sofia consultar preços e categorias)
INSERT INTO public.procedures (id, clinic_id, name, category, price)
VALUES 
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Limpeza Odontológica (Profilaxia)', 'Preventiva', 150.00),
    ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Avaliação Geral e Consulta', 'Diagnóstico', 100.00)
ON CONFLICT (id) DO NOTHING;

-- 4. Inserir Configuração da Instância do WhatsApp na Evolution API
INSERT INTO public.whatsapp_config (clinic_id, instance_name, api_key, agent_prompt, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'odonto-crm',
    'odonto-secret-key',
    'Você é a Sofia, assistente virtual simpática da Clínica OdontoCRM. Seu objetivo é ajudar pacientes a agendarem consultas de forma rápida e cordial.',
    true
)
ON CONFLICT (clinic_id) DO UPDATE 
SET instance_name = EXCLUDED.instance_name, 
    api_key = EXCLUDED.api_key, 
    is_active = EXCLUDED.is_active;

COMMIT;

SELECT 'Clínica e Instância odonto-crm registradas com sucesso!' AS status;

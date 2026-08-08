-- ==============================================================================
-- FLOWDENT / ODONTOCRM - SCRIPT DE RESET TRANSACTIONAL (SEM LIMIT 100)
-- ==============================================================================
-- IMPORTANTE NO SUPABASE SQL EDITOR:
-- No canto inferior direito da tela (ao lado do botão RUN), 
-- mude o seletor de "Limit 100" para "No limit".
-- ==============================================================================

BEGIN;

SET session_replication_role = 'replica';

DELETE FROM public.audit_logs;
DELETE FROM public.ai_semantic_memory;
DELETE FROM public.chat_messages;
DELETE FROM public.chat_sessions;
DELETE FROM public.whatsapp_config;
DELETE FROM public.prescriptions;
DELETE FROM public.treatment_items;
DELETE FROM public.tooth_records;
DELETE FROM public.medical_records;
DELETE FROM public.financial_transactions;
DELETE FROM public.accounts_payable;
DELETE FROM public.installments;
DELETE FROM public.crm_leads;
DELETE FROM public.appointments;
DELETE FROM public.patients;
DELETE FROM public.procedures;
DELETE FROM public.insurance_plans;
DELETE FROM public.chairs;
DELETE FROM public.suppliers;
DELETE FROM public.marketing_campaigns;
DELETE FROM public.automations;
DELETE FROM public.profiles;
DELETE FROM public.clinics;

SET session_replication_role = 'origin';

COMMIT;

SELECT 'Banco de dados zerado com sucesso!' AS status;

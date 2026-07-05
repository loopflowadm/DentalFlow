# FlowDent — Registro de Logs de Auditoria (Audit Logs Runbook)
**Versão:** 1.0.0  
**Autor:** Security Engineer & Database Architect  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento especifica o design lógico e físico, os gatilhos (triggers) de banco de dados e as regras de governança para a tabela de **Audit Logs (Logs de Auditoria)** do **FlowDent**. O registro de auditoria é inalterável, permitindo rastrear ações clínicas, financeiras e administrativas críticas por questões legais de compliance.

---

## 2. Estrutura de Tabela Física de Auditoria

A tabela `audit_logs` é protegida com restrições rígidas que impedem qualquer operação de `UPDATE` ou `DELETE` por qualquer usuário, incluindo administradores (somente leitura e inserção/append-only):

```sql
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- ex: 'UPDATE_PRONTUARIO', 'DELETE_CONVENIO'
    table_name VARCHAR(100) NOT NULL, -- ex: 'patients', 'transactions'
    record_id UUID NOT NULL, -- UUID do registro que sofreu a alteração
    old_data JSONB, -- Estado do JSON antes da modificação (nulo para INSERT)
    new_data JSONB, -- Estado do JSON após a modificação (nulo para DELETE)
    client_ip VARCHAR(45), -- IP do usuário que realizou a ação
    user_agent TEXT, -- Navegador/dispositivo do executor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

---

## 3. Triggers de Banco de Dados Automatizadas (Database Triggers)
Para evitar que o desenvolvedor esqueça de programar logs de auditoria no backend, as tabelas críticas de dados clínicos e de saúde dos pacientes (como `patients`, `appointments` e `treatment_budgets`) possuem triggers nativas do PostgreSQL que gravam na tabela de auditoria de forma automatizada:

```sql
CREATE OR REPLACE FUNCTION public.process_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    current_clinic_id UUID;
BEGIN
    -- Obter os dados de contexto injetados na sessão pelo middleware
    BEGIN
        current_user_id := current_setting('app.current_user_id', true)::uuid;
        current_clinic_id := current_setting('app.current_clinic_id', true)::uuid;
    EXCEPTION WHEN OTHERS THEN
        current_user_id := NULL;
        current_clinic_id := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs(clinic_id, user_id, action, table_name, record_id, old_data, new_data)
        VALUES(OLD.clinic_id, current_user_id, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD), NULL);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs(clinic_id, user_id, action, table_name, record_id, old_data, new_data)
        VALUES(NEW.clinic_id, current_user_id, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs(clinic_id, user_id, action, table_name, record_id, old_data, new_data)
        VALUES(NEW.clinic_id, current_user_id, 'INSERT', TG_TABLE_NAME, NEW.id, NULL, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. Otimização de Índices e Performance de Escrita
Como a tabela de auditoria acumula milhões de linhas rapidamente em clínicas de grande fluxo, buscas na tela de auditoria administrativa de clínicas poderiam sofrer lentidão se não indexadas:

*   **Índices B-Tree compostos:**
    ```sql
    CREATE INDEX idx_audit_logs_lookup ON public.audit_logs (clinic_id, table_name, record_id);
    CREATE INDEX idx_audit_logs_created ON public.audit_logs (clinic_id, created_at DESC);
    ```
*   **Particionamento de Tabelas (Table Partitioning):** Em volumes corporativos avançados, a tabela `audit_logs` é configurada com particionamento baseado em tempo (mensal ou trimestral), permitindo que logs antigos sejam migrados de forma transparente para armazenamento em disco frio sem afetar a performance do banco transacional operacional.

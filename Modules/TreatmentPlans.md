# Módulo: Planos de Tratamento (Treatment Plans Module Specification)
**Versão:** 1.0.0  
**Autor:** Principal Product Manager & Financial Analyst  
**Status:** Aprovado  

---

## 1. Objetivo
O objetivo do módulo de **Planos de Tratamento** é estruturar as propostas clínicas e financeiras geradas pelos dentistas para os pacientes. O módulo reúne procedimentos, dentes associados, valores negociados, comissões dos profissionais e formas de parcelamento, servindo como o contrato de prestação de serviços odontológicos.

---

## 2. Descrição e Escopo
O módulo permite agrupar múltiplos procedimentos em uma única proposta unificada. O dentista insere os dentes associados do odontograma, o sistema calcula os custos com base na tabela de preços da clínica e gera as opções de desconto e parcelamento para apresentação visual ao paciente.

### Dentro do Escopo (In Scope)
*   Agrupamento de múltiplos procedimentos clínicos em um orçamento unificado.
*   Cálculo automático de valores totais, margens de desconto permitidas e comissão de dentistas.
*   Assinatura de aprovação do plano (digitalmente pelo paciente).
*   Geração automática de parcelas de cobrança e faturas vinculadas após a aprovação.

### Fora do Escopo (Out of Scope)
*   Emissão de Nota Fiscal de Serviços eletrônica (NFS-e) (gerenciada pelo módulo de **Invoices**).
*   Cobrança recorrente de mensalidade do plano (gerenciada por **Financeiro**).

---

## 3. Regras de Negócio
*   **RN-001: Desconto Máximo Permitido:** O sistema possui travas de limite de desconto no orçamento. Dentistas comuns podem dar descontos de no máximo **10%** no plano de tratamento. Descontos de **11% a 20%** exigem liberação via senha do cargo de `CLINIC_ADMIN` ou `CLINIC_OWNER`.
*   **RN-002: Vinculação de Comissão:** O percentual de comissão do dentista executor é definido no momento da aprovação do orçamento, com base no cadastro do profissional na tabela `profiles`. Alterações posteriores no cadastro do dentista não afetam retroativamente os orçamentos já aprovados.
*   **RN-003: Validação de Dente e Procedimento:** Procedimentos que dependem de dentes específicos (ex: *Canal*, *Implante*) exigem obrigatoriamente a seleção do número do dente na tabela de itens. Procedimentos gerais (ex: *Limpeza*, *Clareamento*) podem ser lançados sem dente vinculado (`tooth_number = NULL`).

---

## 4. Fluxo e Casos de Uso (Use Cases)

### Caso de Uso: Aprovar Plano de Tratamento
*   **Atores:** Dentista / Recepcionista / Paciente.
*   **Fluxo Principal:**
    1.  O paciente avalia o plano de tratamento impresso ou digital na tela.
    2.  O operador clica em *Aprovar Orçamento*.
    3.  Seleciona a forma de pagamento (ex: *Parcelado no Cartão em 5x*).
    4.  O paciente realiza a assinatura digital na tela.
    5.  **Ação do Sistema:**
        *   Altera o status do orçamento na tabela `treatment_budgets` para `APPROVED`.
        *   Gera as 5 parcelas de cobrança na tabela `installments` com as respectivas datas de vencimento mensais.
        *   Dispara o evento `treatment_budget.approved`.
        *   Atualiza o status dos dentes associados no odontograma para "Tratado" ou "Em Tratamento".

---

## 5. Banco de Dados e Relacionamentos
Estrutura relacional para orçamentos e itens:

```sql
CREATE TABLE public.treatment_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.treatment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES public.treatment_budgets(id) ON DELETE CASCADE,
    tooth_number INTEGER,
    procedure_name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    dentist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

---

## 6. Endpoints & Payloads da API
*   **Aprovar Orçamento:**
    *   `POST /api/v1/clinical/budgets/{id}/approve`
    *   *Payload:* `{ "paymentMethod": "CREDIT_CARD", "installments": 5 }`
    *   *Response (`200 OK`):* `{ "success": true, "message": "Orçamento aprovado e parcelas financeiras geradas com sucesso." }`

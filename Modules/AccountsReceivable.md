# Módulo: Contas a Receber (Accounts Receivable Module Specification)
**Versão:** 1.0.0  
**Autor:** Principal Product Manager & Financial Architect  
**Status:** Aprovado  

---

## 1. Objetivo
O objetivo do módulo de **Contas a Receber** é gerenciar e rastrear todos os recebimentos pendentes e quitados dos pacientes referentes a tratamentos aprovados, gerando faturas, links de cobrança digital (Pix/Cartão/Boleto) e automatizando a régua de cobrança de inadimplentes.

---

## 2. Descrição e Escopo
Este módulo detalha o fracionamento do pagamento acordado no plano de tratamento. Ele se conecta aos gateways de pagamento parceiros para gerar códigos de barra de boletos ou chaves Pix cópia e cola e escuta os eventos de recebimento para liquidar automaticamente as parcelas pendentes da ficha do paciente.

### Dentro do Escopo (In Scope)
*   Visualização e gestão de parcelas agrupadas por status (A Vencer, Pago, Atrasado).
*   Geração manual e automática de links de cobrança Pix e boleto via API do Asaas/Stripe.
*   Conciliação automática de recebíveis recebidos por webhooks.
*   Painel de controle de renegociação de dívidas de parcelas vencidas.

### Fora do Escopo (Out of Scope)
*   Controle de despesas internas da clínica (gerenciado por **Contas a Pagar**).
*   Geração de notas fiscais (gerenciada por **Invoices**).

---

## 3. Regras de Negócio
*   **RN-001: Bloqueio de Prontuário por Inadimplência:** Se o paciente possuir qualquer parcela vencida há mais de **30 dias**, o sistema deve bloquear o agendamento de consultas eletivas (não emergenciais) e marcar a flag do prontuário como `INADIMPLENTE` na tela.
*   **RN-002: Lançamento de Juros e Multas:** Parcelas pagas após a data de vencimento calculam automaticamente a incidência de multa de **2%** mais juros de mora de **1% ao mês**, lançando o excedente pago como acréscimo financeiro no fluxo de caixa.
*   **RN-003: Fluxo de Conciliação:** Uma parcela somente muda o status para `PAID` após o recebimento do payload do webhook do Asaas confirmando o recebimento (`PAYMENT_RECEIVED`). O dentista não pode marcar manualmente a parcela como paga se o paciente pagou no gateway digital (evitando fraudes e furos de caixa).

---

## 4. Fluxo e Casos de Uso (Use Cases)

### Caso de Uso: Conciliar Recebimento de Pix
*   **Atores:** Gateway de Pagamento (Asaas/Stripe).
*   **Fluxo Principal:**
    1.  O paciente escaneia o QR Code do Pix de sua parcela e efetua o pagamento.
    2.  O Asaas processa e liquida o Pix instantaneamente.
    3.  O Asaas envia um webhook com evento `PAYMENT_RECEIVED` para a rota pública do backend da FlowDent.
    4.  **Ação do Sistema:**
        *   Verifica a assinatura digital da requisição para validar a autenticidade.
        *   Mapeia o `paymentId` enviado para a respectiva parcela na tabela `installments`.
        *   Atualiza o status da parcela para `PAID`.
        *   Gera um lançamento automático de receita na tabela `transactions`.
        *   Dispara o evento `transaction.paid`.
        *   Atualiza o estado da tela da secretária e do painel do financeiro via WebSockets.

---

## 5. Banco de Dados e Relacionamentos
Estrutura das parcelas de orçamentos médicos:

```sql
CREATE TABLE public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES public.treatment_budgets(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'OVERDUE'
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50), -- 'PIX', 'CREDIT_CARD', 'CASH', 'BOLETO'
    external_id VARCHAR(255), -- ID de rastreamento no gateway Asaas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

---

## 6. Endpoints & Payloads da API
*   **Gerar Cobrança Pix:**
    *   `POST /api/v1/finance/installments/{id}/generate-pix`
    *   *Response (`200 OK`):* `{ "success": true, "pixCode": "00020126360014br.gov.bcb.pix...", "qrCodeBase64": "iVBORw0KGgoAAAAN..." }`

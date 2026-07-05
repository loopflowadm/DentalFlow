# Módulo: Contas a Pagar (Accounts Payable Module Specification)
**Versão:** 1.0.0  
**Autor:** Principal Product Manager & Financial Analyst  
**Status:** Aprovado  

---

## 1. Objetivo
O objetivo do módulo de **Contas a Pagar** é gerenciar e monitorar todas as obrigações financeiras da clínica (despesas operacionais, compra de suprimentos clínicos de fornecedores, comissões de dentistas e folha de pagamento), garantindo o controle rigoroso dos custos e evitando atrasos que gerem multas e restrições.

---

## 2. Descrição e Escopo
O módulo de Contas a Pagar centraliza a entrada de notas fiscais de despesas e os agendamentos de pagamentos. Ele oferece um fluxo de aprovação hierárquico para gastos elevados, permitindo conciliação por upload de comprovantes bancários e controle de custos fixos e variáveis.

### Dentro do Escopo (In Scope)
*   Cadastro de despesas recorrentes (ex: *Aluguel*, *Wi-Fi*, *Energia Elétrica*) com duplicação automática mensal.
*   Registro de despesas variáveis de compras vinculadas ao módulo de **Estoque e Fornecedores**.
*   Fluxo de aprovação de despesas com limites de alçada por cargo administrativo.
*   Upload e associação de arquivos de boletos e comprovantes de pagamento (PDF/Imagens).

### Fora do Escopo (Out of Scope)
*   Conciliação automática via integração de conta bancária por API (Open Banking) (gerenciada por **Financeiro**).
*   Geração de cobranças para clientes (gerenciada por **Contas a Receber**).

---

## 3. Regras de Negócio
*   **RN-001: Alçada de Aprovação de Despesas:** Despesas cadastradas na clínica com valor acima de **R$ 2.000,00** exigem aprovação explícita e assinatura eletrônica do cargo `CLINIC_OWNER` ou `CLINIC_ADMIN` antes de serem marcadas como pagas.
*   **RN-002: Vinculação de Fornecedor:** Compras de insumos e materiais cirúrgicos devem ser obrigatoriamente vinculadas a um fornecedor ativo cadastrado na tabela `suppliers`.
*   **RN-003: Lançamento de Comissão Pós-Tratamento:** As comissões devidas aos dentistas por procedimentos concluídos devem ser inseridas automaticamente na tabela de contas a pagar com a categoria `COMMISSION` e vencimento padrão no dia 10 do mês subsequente.

---

## 4. Fluxo e Casos de Uso (Use Cases)

### Caso de Uso: Registrar e Aprovar Compra de Insumos
*   **Atores:** Financeiro / Gestor.
*   **Fluxo Principal:**
    1.  O financeiro cadastra uma nova despesa: Compra de 50 caixas de luvas de látex, Valor: *R$ 2.500,00*, Fornecedor: *Dental Cremer*.
    2.  O sistema salva a despesa na tabela `accounts_payable` com o status `AWAITING_APPROVAL` (por exceder o limite de R$ 2.000,00).
    3.  O sistema envia uma notificação push para o celular da Dra. Mariana (Dona da Clínica).
    4.  A Dra. Mariana abre a notificação, revisa os detalhes e clica em *Aprovar Despesa*.
    5.  **Ação do Sistema:**
        *   Altera o status da despesa para `PENDING` (liberada para pagamento).
        *   Lança o registro no fluxo de caixa previsto da clínica.
        *   Registra a assinatura eletrônica da aprovação no histórico de auditoria.

---

## 5. Banco de Dados e Relacionamentos
Estrutura das contas a pagar:

```sql
CREATE TABLE public.accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'AWAITING_APPROVAL', 'PENDING', 'PAID', 'OVERDUE'
    paid_at TIMESTAMP WITH TIME ZONE,
    category VARCHAR(100) NOT NULL, -- 'SUPPLIES', 'RENT', 'COMMISSION', 'SALARY', 'OTHER'
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_path VARCHAR(512), -- PDF do boleto ou comprovante
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

---

## 6. Endpoints & Payloads da API
*   **Aprovar Despesa:**
    *   `POST /api/v1/finance/payables/{id}/approve`
    *   *Response (`200 OK`):* `{ "success": true, "message": "Despesa aprovada e liberada para pagamento." }`

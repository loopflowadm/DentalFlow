# Módulo: Módulo Financeiro Geral (Finance Module Specification)
**Versão:** 1.0.0  
**Autor:** Principal Product Manager & Financial Architect  
**Status:** Aprovado  

---

## 1. Objetivo
O objetivo do módulo **Financeiro** é centralizar toda a contabilidade operacional da clínica, gerindo lançamentos de receitas e despesas, fluxo de caixa em tempo real, DRE consolidado por filial e a conciliação bancária das faturas dos pacientes.

---

## 2. Descrição e Escopo
Este módulo fornece a visão macroscópica da saúde financeira da clínica. Ele consolida informações vindas de parcelas pagas de tratamentos (módulo de contas a receber) e compras de materiais (módulo de contas a pagar), fornecendo relatórios estatísticos para auditorias contábeis dos gestores da clínica.

### Dentro do Escopo (In Scope)
*   Fluxo de caixa consolidado diário, semanal e mensal com gráficos interativos.
*   Categorização automática de transações (ex: *Aluguel*, *Materiais Clínicos*, *Comissões*).
*   Lançamento manual de receitas e despesas diversas da clínica.
*   Geração de Demonstrativo de Resultados do Exercício (DRE) operacional.

### Fora do Escopo (Out of Scope)
*   Emissão de faturas automáticas para pacientes (gerenciado por **Invoices**).
*   Calculo de folha de pagamento de funcionários (gerido externamente por sistemas de RH).

---

## 3. Regras de Negócio
*   **RN-001: Categorização Padrão Obrigatória:** Nenhuma transação pode ser gravada na tabela `transactions` sem uma categoria contábil explícita (ex: `TREATMENT`, `SUPPLIES`, `RENT`, `COMMISSION`, `SALARY`, `OTHER`).
*   **RN-002: Fechamento de Caixa:** O sistema deve permitir o fechamento diário do caixa físico da recepção. Uma vez fechado o caixa do dia, nenhuma transação com data retroativa àquele dia pode ser inserida ou alterada sem aprovação do cargo `CLINIC_OWNER`.
*   **RN-003: Dedução de Taxa de Recebimento:** Receitas originadas de gateways digitais (Pix/Cartão) devem registrar o valor bruto recebido e a taxa descontada de intermediação do provedor separadamente, permitindo auditar o lucro líquido real da clínica.

---

## 4. Fluxo e Casos de Uso (Use Cases)

### Caso de Uso: Lançamento Manual de Despesa
*   **Atores:** Secretária / Financeiro.
*   **Fluxo Principal:**
    1.  O financeiro acessa a aba *Financeiro* e clica em *Lançar Despesa*.
    2.  Preenche: Valor (ex: *R$ 1.200,00*), Categoria (*Aluguel*), Descrição (*Aluguel da Sala 2 - Junho*) e Data de Vencimento.
    3.  Clica em *Salvar*.
    4.  **Ação do Sistema:**
        *   Cria o registro com status `PENDING` (ou `PAID` se marcar como pago).
        *   Dispara o evento `transaction.created`.
        *   Atualiza o gráfico do DRE previsto da clínica em tempo real.
        *   Registra a alteração na tabela de logs de auditoria.

---

## 5. Banco de Dados e Relacionamentos
Estrutura de dados das transações financeiras:

```sql
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'INCOME' ou 'EXPENSE'
    category VARCHAR(100) NOT NULL, -- 'TREATMENT', 'SALARY', 'RENT', 'SUPPLIES', 'OTHER'
    installment_id UUID REFERENCES public.installments(id) ON DELETE SET NULL, -- Se vinculado a tratamento
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

---

## 6. Endpoints & Payloads da API
*   **Listar Transações Financeiras:**
    *   `GET /api/v1/finance/transactions`
    *   *Parâmetros de Query:* `startDate`, `endDate`, `type`
    *   *Response (`200 OK`):* `{ "success": true, "data": [ { "id": "uuid", "amount": 1200.00, "type": "EXPENSE", "category": "RENT" } ] }`

# Módulo: CRM Comercial e Funil de Vendas (CRM Module Specification)
**Versão:** 1.0.0  
**Autor:** Principal Product Manager & Lead Architect  
**Status:** Aprovado  

---

## 1. Objetivo
O objetivo do módulo de **CRM** é gerenciar o ciclo de vida comercial de atração de novos leads (pacientes interessados em tratamentos) desde o primeiro contato publicitário ou indicação até o fechamento e assinatura digital do primeiro plano de tratamento, maximizando a taxa de conversão clínica.

---

## 2. Descrição e Escopo
O CRM do FlowDent centraliza os potenciais clientes em um quadro Kanban dinâmico. O sistema qualifica automaticamente os leads usando o **Agente SDR IA**, calcula a prioridade e o valor estimado do tratamento e gera lembretes automáticos baseados nas interações do funil.

### Dentro do Escopo (In Scope)
*   Quadro Kanban interativo com 12 colunas operacionais e arrasto nativo (drag-and-drop).
*   Gaveta lateral detalhada do lead (timeline de atividades, checklist de tarefas, anotações rápidas e galeria de documentos).
*   Sincronização bidirecional entre o lead e o contato de WhatsApp do paciente.
*   Simulador de entrada de leads e classificação de urgência clínica.

### Fora do Escopo (Out of Scope)
*   Gestão financeira pós-fechamento (gerenciada exclusivamente pelo módulo de **Financeiro**).
*   Agendamento clínico definitivo (gerenciado pelo módulo de **Agenda**).

---

## 3. Regras de Negócio
*   **RN-001: Mapeamento de Lead para Paciente:** Um registro de lead no CRM é representado por uma linha na tabela `patients` onde o campo `stage` (etapa) possui um valor inteiro de `0` a `11`. Quando o lead fecha o tratamento, `stage` é definido como `NULL`, promovendo-o automaticamente a **Paciente Regular**.
*   **RN-002: Rebaixamento e Resgate:** Se um lead passar mais de **7 dias** sem nenhuma interação em etapas frias (ex: "Sem Resposta"), o **Agente SDR IA** dispara um fluxo automático de resgate amigável e altera a prioridade do lead para `LOW`.
*   **RN-003: Bloqueio de Duplicidade:** O sistema impede a criação de múltiplos leads ativos associados ao mesmo número de telefone (`phone`). Se um lead tentar entrar novamente por um anúncio, o sistema atualiza o lead existente adicionando um registro na timeline: *"Lead tentou nova conversão por anúncio: [Campanha]"*.

---

## 4. Fluxo e Casos de Uso (Use Cases)

### Caso de Uso: Mover Lead no Kanban e Disparar Ação
*   **Ator:** Secretária/Comercial.
*   **Fluxo Principal:**
    1.  O usuário clica no card do paciente "Julio Cesar" na coluna *Novos Leads* (Stage 0).
    2.  Arrasta e solta o card na coluna *Consulta Agendada* (Stage 2).
    3.  **Ação do Sistema:**
        *   Abre uma mini-gaveta perguntando qual profissional atenderá e qual a data.
        *   Ao salvar, o status do lead é atualizado no banco.
        *   Dispara o evento `lead.crm.stage_changed`.
        *   Cria automaticamente o compromisso na tabela `appointments` como `PENDING`.
        *   O Agente Sofia envia a mensagem de confirmação da consulta pelo WhatsApp.

---

## 5. Wireframe em Texto (Gaveta Lateral do Lead)
```
┌────────────────────────────────────────────────────────┐
│ GAVETA LATERAL DO LEAD: JULIO CESAR         [X] Fechar  │
├────────────────────────────────────────────────────────┤
│ Nome: Julio Cesar       | Telefone: 5511999999999      │
│ Interesse: Implante     | Orçamento Estimado: R$ 3.500 │
├────────────────────────────────────────────────────────┤
│ [ Aba: Linha do Tempo ]  [ Aba: Notas ]  [ Aba: Tarefas ]│
├────────────────────────────────────────────────────────┤
│ • 03/07 14:00 - Lead criado via Instagram Ads          │
│ • 03/07 14:05 - Mensagem WhatsApp enviada pela IA Sofia │
│ • 03/07 14:10 - Paciente solicitou agendamento         │
│ • [ ] Ligar para confirmar anestesia (Prazo: Amanhã)   │
├────────────────────────────────────────────────────────┤
│ [ Campo de Texto: Enviar mensagem WhatsApp... ] [Enviar]│
└────────────────────────────────────────────────────────┘
```

---

## 6. Banco de Dados e Relacionamentos
O CRM compartilha a tabela de pacientes adicionando metadados de vendas:

```sql
ALTER TABLE public.patients ADD COLUMN stage INTEGER CHECK (stage >= 0 AND stage <= 11);
ALTER TABLE public.patients ADD COLUMN priority VARCHAR(50) DEFAULT 'MEDIUM';
ALTER TABLE public.patients ADD COLUMN procedure_name VARCHAR(255);
ALTER TABLE public.patients ADD COLUMN budget_amount NUMERIC(10,2) DEFAULT 0.00;
```

---

## 7. Endpoints & Payloads da API
*   **Mover Etapa do Lead:**
    *   `PATCH /api/v1/crm/leads/{id}/stage`
    *   *Payload:* `{ "newStage": 2 }`
    *   *Response (`200 OK`):* `{ "success": true, "data": { "id": "uuid", "stage": 2 } }`

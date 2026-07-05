# FlowDent — Catálogo de Eventos e Mensageria (Event-Driven Architecture)
**Versão:** 1.0.0  
**Autor:** Principal Software Architect & Tech Lead  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve os padrões de eventos de domínio, a topologia de filas do **BullMQ / Redis** e o **Catálogo de Eventos** oficiais do ecossistema do **FlowDent**. O produto utiliza processamento reativo de eventos para acionar agentes de IA, rodar automações, enviar e-mails e atualizar o histórico de prontuário dos pacientes em tempo real.

---

## 2. Topologia de Filas (BullMQ Queues)
As tarefas e eventos assíncronos são roteados em cinco filas dedicadas com níveis de concorrência e prioridades específicas:

1.  **`whatsapp-inbound-queue` (Concorrência: Alta):** Recebe os webhooks brutos de entrada da Evolution API. Processa a transcrição e decide a resposta da Sofia.
2.  **`whatsapp-outbound-queue` (Concorrência: Média):** Responsável por despachar mensagens e mídias de texto de volta aos celulares dos pacientes de forma cadenciada para evitar bloqueios de SPAM do WhatsApp.
3.  **`automation-engine-queue` (Concorrência: Média):** Executa os nós lógicos do construtor de automações (DAG execution).
4.  **`financial-commission-queue` (Concorrência: Baixa):** Processa os repasses e comissionamentos pós-tratamento.
5.  **`notifications-email-queue` (Concorrência: Baixa):** Processa o envio de e-mails corporativos transacionais e SMS.

---

## 3. Catálogo de Eventos de Domínio (Domain Events)

Abaixo estão definidos os principais eventos de domínio gerados pela plataforma e quais consumidores (módulos) reagem a eles:

| Nome do Evento | Origem (Publisher) | Descrição | Consumidores (Subscribers) |
| :--- | :--- | :--- | :--- |
| **`patient.created`** | Módulo Pacientes | Um novo paciente ou lead é cadastrado. | SDR IA, Central WhatsApp, CRM Leads |
| **`appointment.booked`** | Módulo Agenda | Uma consulta é agendada no calendário. | Sofia IA, Reminders Engine (Timer) |
| **`appointment.status.changed`**| Módulo Agenda | Consulta mudou de status (ex: FALTA). | Automation Engine, CRM Timeline |
| **`treatment_budget.approved`** | Módulo Financeiro | O orçamento é aprovado pelo paciente. | Financial Commission, Inventory |
| **`chat.message_received`** | Central WhatsApp | O paciente enviou mensagem na Evolution. | Sofia IA, CRM Drawer Alert |
| **`transaction.paid`** | Módulo Financeiro | Boleto ou Pix do tratamento compensou. | Accounts Receivable, Commission Engine |

---

## 4. Idempotência e Prevenção de Processamento Duplicado
Em uma arquitetura baseada em eventos distribuída, pode ocorrer o disparo em duplicidade do mesmo evento devido a retransmissões de rede (At-Least-Once Delivery). Para evitar criar cobranças duplicadas ou registrar dois agendamentos idênticos:

*   **Chave de Idempotência (`Idempotency-Key`):** Todas as mensagens enfileiradas devem possuir uma chave única derivada dos dados do evento (ex: `hash(clinic_id + appointment_id + status + timestamp)`).
*   **Armazenamento de Chaves (Redis Dedicado):**
    *   Antes de processar um Job, o Worker consulta o Redis buscando a chave de idempotência.
    *   Se a chave já existir com o status `PROCESSING` ou `COMPLETED`, o Worker ignora a mensagem silenciosamente.
    *   Se a chave não existir, o Worker a insere com expiração de **24 horas** e executa a tarefa.

# Módulo: Agenda e Compromissos Clínicos (Agenda Module Specification)
**Versão:** 1.0.0  
**Autor:** Principal Product Manager & Lead Architect  
**Status:** Aprovado  

---

## 1. Objetivo
O objetivo do módulo de **Agenda** é coordenar os horários de atendimento dos dentistas, salas de consultório e a marcação de consultas de pacientes, otimizando o fluxo de atendimentos presenciais e maximizando o aproveitamento do tempo dos profissionais da clínica.

---

## 2. Descrição e Escopo
A Agenda é a tela central de controle de operações diárias da clínica. Secretárias visualizam todas as salas e profissionais de forma unificada, enquanto dentistas acessam sua agenda de forma filtrada em seus celulares. A agenda é realtime, sincronizada com a IA Sofia e integrada ao financeiro.

### Dentro do Escopo (In Scope)
*   Visualizações de calendário por Dia, Semana, Mês e Colunas de Salas/Cadeiras.
*   Bloqueio e liberação de horários de folga ou plantão (Shifts) dos profissionais.
*   Reagendamento rápido via arrastar e soltar (drag-and-drop) de blocos de horários.
*   Sinalização de status de comparecimento (Agendado, Confirmado, Aguardando na Recepção, Em Atendimento, Concluído, Falta).

### Fora do Escopo (Out of Scope)
*   Prontuários e fichas clínicas (lançadas pelo módulo de **Pacientes**).
*   Configuração inicial de faturamento e taxas de consulta (gerenciado por **Financeiro**).

---

## 3. Regras de Negócio
*   **RN-001: Bloqueio contra Double Booking (Duplo Agendamento):** O sistema impede que o mesmo dentista ou a mesma sala (`doctor_id` ou `room_id`) possua duas consultas ativas no mesmo intervalo de tempo.
*   **RN-002: Vinculação de Status ao CRM:** Alterar o status de uma consulta para `CANCELLED` (Falta/Cancelamento) dispara um alerta automático de resgate para o Agente Sofia e move o card do lead de volta para a coluna correspondente no CRM.
*   **RN-003: Bloqueio de Agendamento Retroativo:** Consultas eletivas normais não podem ser agendadas em datas e horários passados em relação à hora do servidor.

---

## 4. Fluxo e Casos de Uso (Use Cases)

### Caso de Uso: Reagendar Consulta por Arraste (Drag-and-Drop)
*   **Atores:** Recepcionista.
*   **Fluxo Principal:**
    1.  A secretária visualiza a agenda do dia em colunas de profissionais.
    2.  Clica e arrasta o compromisso do paciente "Julio Cesar" (atualmente às 14h) para o slot livre das 16h da coluna do Dr. Pedro.
    3.  **Ação do Sistema:**
        *   Verifica se o Dr. Pedro está disponível às 16h (sem choque de horários).
        *   Atualiza as colunas `start_time` e `end_time` na tabela `appointments` no banco.
        *   Dispara o evento `appointment.updated`.
        *   Dispara uma notificação via WebSocket para atualizar a tela de outros usuários.
        *   Gera um registro no histórico de auditoria (`audit_logs`).

---

## 5. Wireframe em Texto (Agenda - Visualização em Colunas)
```
┌────────────────────────────────────────────────────────┐
│ AGENDA - 03/07/2026                 [Dia] [Semana] [Mês]│
├────────────────────────────────────────────────────────┤
│ Hora  | Dr. Pedro Rocha       | Dra. Ana Clara         │
├───────┼───────────────────────┼────────────────────────┤
│ 09:00 | [ Julio Cesar (Conf) ]| [ (Livre)            ] │
│ 10:00 | [ Maria Silva (Confirm| [ Carlos Reis (Confirm)│
│ 11:00 | [ (Livre)            ]| [ (Livre)            ] │
│ 12:00 | [ (Almoço)           ]| [ (Almoço)           ] │
│ 13:00 | [ João Souza (Aguard) ]| [ (Livre)            ] │
└────────────────────────────────────────────────────────┘
```

---

## 6. Banco de Dados e Relacionamentos
Estrutura de dados para gestão de consultas e salas:

```sql
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    room_id VARCHAR(50), -- Identificação física da sala
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

---

## 7. Endpoints & Payloads da API
*   **Criar Nova Consulta:**
    *   `POST /api/v1/appointments`
    *   *Payload:* `{ "patient_id": "uuid", "doctor_id": "uuid", "start_time": "2026-07-03T14:00:00Z" }`
    *   *Response (`201 Created`):* `{ "success": true, "data": { "id": "uuid", "start_time": "..." } }`

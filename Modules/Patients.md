# Módulo: Gestão de Pacientes (Patients Module Specification)
**Versão:** 1.0.0  
**Autor:** Principal Product Manager  
**Status:** Aprovado  

---

## 1. Objetivo
O objetivo do módulo de **Pacientes** é centralizar o cadastro civil, histórico de saúde, anamnese detalhada, evoluções clínicas sequenciais e galeria de exames de imagem dos pacientes atendidos pela clínica, garantindo conformidade com a LGPD e agilidade no acesso às informações médicas.

---

## 2. Descrição e Escopo
O módulo é a base de dados de saúde da plataforma. Cada paciente possui uma ficha unificada acessível pelos dentistas e secretárias (com escopos de visualização distintos). Nele são registradas alergias, medicamentos de uso contínuo, ficha de evolução diária e o odontograma de acompanhamento.

### Dentro do Escopo (In Scope)
*   Cadastro e edição de dados pessoais e de contato com validação de CPF.
*   Questionário de Anamnese digital assinado digitalmente pelo paciente.
*   Evolução clínica contínua (linha do tempo de tratamentos).
*   Visualização de arquivos e laudos de exames radiográficos.

### Fora do Escopo (Out of Scope)
*   Agendamento direto (gerenciado pelo módulo de **Agenda**).
*   Gestão de inadimplência e cobrança ativa (gerenciada por **Financeiro** e **Cobrança IA**).

---

## 3. Regras de Negócio
*   **RN-001: CPF Único por Clínica:** O sistema não permite cadastrar mais de um paciente com o mesmo CPF na mesma clínica (`clinic_id`), mas permite o mesmo CPF em clínicas distintas (SaaS isolado).
*   **RN-002: Imutabilidade das Evoluções Clínicas:** Uma evolução clínica inserida e assinada pelo dentista no prontuário não pode ser editada ou apagada em nenhuma circunstância. Correções devem ser feitas por meio de um novo lançamento de retificação ("Adendo Clínico") datado e assinado.
*   **RN-003: Alerta de Alergia Crítica:** Caso a anamnese registre que o paciente possui alguma alergia grave (ex: *Látex*, *Anestésicos*), o sistema deve exibir um banner vermelho brilhante e fixo no topo de todas as abas da ficha do paciente para chamar a atenção do profissional.

---

## 4. Fluxo e Casos de Uso (Use Cases)

### Caso de Uso: Lançar Evolução Clínica
*   **Ator:** Dentista.
*   **Fluxo Principal:**
    1.  O dentista acessa a aba *Evoluções* na ficha do paciente.
    2.  Clica em *Nova Evolução*.
    3.  Digita o texto (ex: *"Realizado isolamento absoluto e obturação do canal no dente 16"*).
    4.  Clica em *Assinar e Concluir*.
    5.  **Ação do Sistema:**
        *   Gera assinatura eletrônica baseada no token de sessão do profissional.
        *   Grava na tabela de histórico de evolução do paciente.
        *   Dispara o evento `patient.record.updated`.
        *   Cria log na auditoria inalterável (`audit_logs`).

---

## 5. Wireframe em Texto (Ficha do Paciente - Visualização Geral)
```
┌────────────────────────────────────────────────────────┐
│ FICHA DO PACIENTE: CARLOS ALBUQUERQUE       [X] Fechar  │
├────────────────────────────────────────────────────────┤
│ [ALERTA: Alérgico a Dipirona e Látex ⚠️]               │
├────────────────────────────────────────────────────────┤
│ [ Aba: Cadastral ]  [ Aba: Anamnese ]  [ Aba: Evolução ]│
│ [ Aba: Odontograma ] [ Aba: Documentos ]               │
├────────────────────────────────────────────────────────┤
│ Histórico de Evoluções Clínicas:                       │
│ ────────────────────────────────────────────────────── │
│ 03/07/2026 - Dr. Pedro Rocha (Dentista)                │
│ "Finalizado tratamento do canal do dente 16 com resina"│
│ ────────────────────────────────────────────────────── │
│ 28/06/2026 - Dr. Pedro Rocha (Dentista)                │
│ "Iniciado tratamento endodôntico do dente 16"          │
└────────────────────────────────────────────────────────┘
```

---

## 6. Banco de Dados e Relacionamentos
Estrutura de dados básica dos pacientes (complementada pelas tabelas do CRM):

```sql
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    birth_date DATE,
    medical_history JSONB NOT NULL DEFAULT '{}'::jsonb, -- Anamnese e dados médicos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

---

## 7. Endpoints & Payloads da API
*   **Buscar Ficha Completa do Paciente:**
    *   `GET /api/v1/patients/{id}`
    *   *Response (`200 OK`):* `{ "success": true, "data": { "id": "uuid", "name": "Carlos", "cpf": "...", "medical_history": { ... } } }`

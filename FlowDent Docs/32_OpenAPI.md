# FlowDent — Especificação da API Restful (OpenAPI / Swagger)
**Versão:** 1.0.0  
**Autor:** Tech Lead  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve a especificação técnica dos endpoints públicos e privados da API Restful do **FlowDent** seguindo o padrão **OpenAPI 3.0.0**. Esta especificação orienta a integração do frontend web, aplicativo móvel e sistemas integradores de terceiros.

---

## 2. Endpoints do Módulo de Pacientes (Patients)

### 1. Criar Paciente / Lead
*   **Rota:** `POST /api/v1/patients`
*   **Autenticação:** JWT Obrigatório (`CLINIC_OWNER`, `CLINIC_ADMIN`, `RECEPTIONIST`)
*   **Payload da Requisição (Request Body):**
```json
{
  "name": "Carlos Albuquerque",
  "phone": "5511999999999",
  "email": "carlos@gmail.com",
  "priority": "HIGH",
  "stage": 0,
  "procedure_name": "Implante Dentário",
  "budget_amount": 3500.00
}
```
*   **Resposta de Sucesso (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "id": "pat_c882194b-14d2-45e3-8ad4-1c4ba2e316e1",
    "clinic_id": "clinic-sorriso-perfeito-uuid",
    "name": "Carlos Albuquerque",
    "phone": "5511999999999",
    "email": "carlos@gmail.com",
    "priority": "HIGH",
    "stage": 0,
    "procedure_name": "Implante Dentário",
    "budget_amount": 3500.00,
    "created_at": "2026-07-03T15:52:00.000Z"
  }
}
```

---

## 3. Endpoints do Módulo de Agenda (Appointments)

### 1. Listar Consultas
*   **Rota:** `GET /api/v1/appointments`
*   **Parâmetros de Query:**
    *   `startDate` (formato `YYYY-MM-DD`, obrigatório)
    *   `endDate` (formato `YYYY-MM-DD`, obrigatório)
    *   `doctorId` (opcional, UUID)
*   **Resposta de Sucesso (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "app_21541fb0-d40d-4df6-9d41-410c3b88b0a9",
      "clinic_id": "clinic-sorriso-perfeito-uuid",
      "patient": {
        "id": "pat_c882194b-14d2-45e3-8ad4-1c4ba2e316e1",
        "name": "Carlos Albuquerque"
      },
      "doctor_id": "doc_82194b",
      "start_time": "2026-07-04T10:00:00.000Z",
      "end_time": "2026-07-04T11:00:00.000Z",
      "status": "CONFIRMED"
    }
  ]
}
```

### 2. Agendar Nova Consulta
*   **Rota:** `POST /api/v1/appointments`
*   **Payload da Requisição:**
```json
{
  "patient_id": "pat_c882194b-14d2-45e3-8ad4-1c4ba2e316e1",
  "doctor_id": "doc_82194b",
  "start_time": "2026-07-04T10:00:00.000Z",
  "status": "CONFIRMED"
}
```
*   **Resposta de Sucesso (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "id": "app_21541fb0-d40d-4df6-9d41-410c3b88b0a9",
    "clinic_id": "clinic-sorriso-perfeito-uuid",
    "patient_id": "pat_c882194b-14d2-45e3-8ad4-1c4ba2e316e1",
    "doctor_id": "doc_82194b",
    "start_time": "2026-07-04T10:00:00.000Z",
    "end_time": "2026-07-04T11:00:00.000Z",
    "status": "CONFIRMED",
    "created_at": "2026-07-03T19:00:00.000Z"
  }
}
```
*   **Resposta de Erro de Conflito (`409 Conflict`):**
```json
{
  "success": false,
  "errorCode": "APPOINTMENT_COLLISION",
  "message": "O profissional ou a sala de atendimento selecionada já possui uma consulta agendada nesse horário.",
  "timestamp": "2026-07-03T19:00:00.000Z"
}
```

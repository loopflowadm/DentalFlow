# FlowDent — Guia de Webhooks (Webhooks Specification)
**Versão:** 1.0.0  
**Autor:** Principal Integrations Engineer & Security Lead  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento especifica os pontos de entrada (Inbound Webhooks) que a FlowDent escuta de terceiros e os eventos que a plataforma pode disparar para sistemas externos das clínicas (Outbound Webhooks). Ele detalha as assinaturas de segurança, tratamento de erros e payloads de dados padrão.

---

## 2. Inbound Webhooks (Recebimento de Dados)

O backend do FlowDent disponibiliza rotas públicas protegidas por assinatura para receber eventos de gateways e mensagerias:

### Webhook 1: Evolution API (WhatsApp Message Upsert)
*   **Endpoint:** `POST /api/v1/webhooks/whatsapp/messages`
*   **Objetivo:** Receber mensagens de texto, imagens e áudios que os pacientes enviam no WhatsApp.
*   **Validação de Segurança:** O cabeçalho da requisição deve conter o token de validação (`apikey`) correspondente ao configurado na tabela `whatsapp_config`.
*   **Payload JSON Exemplo (Evolution API):**
```json
{
  "event": "messages.upsert",
  "instance": "clinica-sorriso-perfeito",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "MSG_8210948A"
    },
    "message": {
      "conversation": "Quero confirmar o meu horário de amanhã"
    },
    "pushName": "Julio Cesar"
  }
}
```

### Webhook 2: Asaas Gateway (Confirmação de Pagamento)
*   **Endpoint:** `POST /api/v1/webhooks/payments/asaas`
*   **Objetivo:** Identificar compensação de faturas Pix, Cartão e Boleto.
*   **Validação de Segurança:** Verificação do token do cabeçalho `asaas-access-token` contra o hash salvo nas credenciais da clínica.
*   **Payload JSON Exemplo:**
```json
{
  "event": "PAYMENT_RECEIVED",
  "payment": {
    "id": "pay_9210948a",
    "customer": "cust_821048",
    "value": 150.00,
    "netValue": 147.50,
    "billingType": "PIX",
    "paymentDate": "2026-07-03T15:52:00Z"
  }
}
```

---

## 3. Outbound Webhooks (Disparo de Eventos)

Clínicas podem cadastrar URLs no painel de configurações para receber eventos de alteração de estado no CRM e na agenda.

### Cabeçalhos de Segurança Obrigatórios Enviados
*   **`X-FlowDent-Event`:** O tipo de evento disparado (ex: `lead.crm.stage_changed`).
*   **`X-FlowDent-Signature`:** Assinatura digital gerada a partir do cálculo do HMAC-SHA256 do corpo do JSON enviado usando a chave secreta (Webhook Secret) da clínica como senha:
    ```typescript
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    ```

### Payload de Disparo de Evento do CRM (`lead.crm.stage_changed`)
```json
{
  "event": "lead.crm.stage_changed",
  "timestamp": "2026-07-03T15:52:00.000Z",
  "clinicId": "clinic-sorriso-perfeito-uuid",
  "data": {
    "leadId": "pat_21541fb0-d40d-4df6-9d41-410c3b88b0a9",
    "name": "Julio Cesar",
    "phone": "5511999999999",
    "previousStage": 0,
    "newStage": 1,
    "stageName": "Contato Realizado",
    "budgetAmount": 1500.00
  }
}
```

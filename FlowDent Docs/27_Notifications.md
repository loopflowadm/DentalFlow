# FlowDent — Arquitetura de Notificações (Notifications Guide)
**Versão:** 1.0.0  
**Autor:** Principal Integrations Developer  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento especifica a infraestrutura de disparo, preferências e canais de **Notificações** do **FlowDent**. O sistema gerencia o envio de alertas transacionais em tempo real para profissionais da clínica e mensagens de confirmação de consultas, alertas de faturas e campanhas para pacientes através de múltiplos canais.

---

## 2. Canais de Entrega e Provedores (Providers)

O despachador de notificações utiliza a biblioteca modular do backend para escolher o canal ideal dependendo da regra de negócio:

| Canal | Destinatário | Provedor de Entrega | Tipo de Conteúdo |
| :--- | :--- | :--- | :--- |
| **In-App (Alerta Interno)**| Funcionários | WebSockets (Socket.io) | Alertas sonoros, banners de chegada de pacientes. |
| **Push Notification** | Funcionários / Portal | Firebase Cloud Messaging (FCM) | Alertas em dispositivos móveis e navegadores em background. |
| **WhatsApp Message** | Pacientes | Evolution API | Lembretes da Sofia, links de Pix de parcelas, pós-operatório. |
| **E-mail Transacional** | Funcionários / Pacientes | Resend / SendGrid | Links de redefinição de senha, faturas de mensalidade SaaS. |
| **SMS Gateway** | Pacientes | Twilio / Zenvia | Alerta reserva de segurança caso WhatsApp falhe. |

---

## 3. Gestão de Preferências de Notificação (User Preferences)
Para evitar o descumprimento de leis de privacidade de dados e evitar incomodar pacientes com mensagens inconvenientes:

*   **Tabela de Preferências do Paciente (`patient_notification_preferences`):**
    *   Gerencia flags liga/desliga para cada canal de notificação (WhatsApp, E-mail, SMS).
    *   Tipos de mensagens configuráveis: *Marketing*, *Lembretes de Consulta*, *Cobranças Financeiras*.
*   **Opt-Out Automático:** Toda mensagem promocional ou de marketing enviada por WhatsApp pela Evolution API deve conter ao final um texto padrão como: *"Caso não queira mais receber nossas mensagens, responda SAIR"*. Ao receber a mensagem "SAIR", o agente Sofia identifica e altera automaticamente a flag correspondente na tabela de preferências para bloquear novos envios promocionais.

---

## 4. Rastreabilidade de Entrega (Delivery Tracking Status)
Todos os disparos de notificações transacionais são registrados na tabela `notification_history` com os seguintes status de ciclo de vida:

1.  **`ENQUEUED`:** Job de notificação criado e enviado à fila do BullMQ.
2.  **`SENT`:** Provedor externo (ex: Resend ou Evolution API) aceitou a requisição de envio com sucesso.
3.  **`DELIVERED`:** Confirmação de recebimento (Destaque duplo azul no WhatsApp ou confirmação de abertura no e-mail recebidos via Webhook do provedor).
4.  **`FAILED`:** Erro de envio (Número de celular inválido, e-mail inexistente, falha de conexão). O motor registra a mensagem de erro específica no log do banco para depuração rápida.

# FlowDent — Catálogo de Integrações Externas (Integrations Architecture)
**Versão:** 1.0.0  
**Autor:** Principal Integrations Engineer  
**Status:** Aprovado  

---

## 2. Evolution API (Integração WhatsApp)
A Evolution API é o canal primário de contato da IA Sofia e da Central Omnichannel com os pacientes.

### I. Geração do QR Code de Instância
1.  O administrador da clínica acessa as configurações e clica em "Conectar WhatsApp".
2.  O backend NestJS faz uma chamada `POST /instance/create` enviando o nome da clínica como id da instância.
3.  A Evolution API gera uma nova instância e retorna um base64 com a imagem do QR Code.
4.  O frontend exibe o QR Code na tela. O usuário lê com o aplicativo do celular.
5.  O webhook de eventos de status da Evolution altera a coluna `whatsapp_status` para `CONNECTED` no banco de dados da clínica, liberando o chat.

---

## 3. Asaas / Stripe (Integração Financeira e Pagamentos)
A FlowDent utiliza gateways de pagamento (Asaas no Brasil e Stripe internacional) para gerenciar a cobrança das assinaturas SaaS e automatizar a cobrança de parcelas de tratamentos dos pacientes.

### I. Fluxo de Geração de PIX de Tratamento
1.  Ao aprovar um plano de tratamento com parcelamento em PIX, o financeiro clica em "Gerar Cobrança".
2.  O backend faz uma chamada `POST /payments/charge` enviando os dados do paciente (nome, CPF, valor) para o Asaas.
3.  O Asaas gera o Pix copia-e-cola e o QR Code dinâmico, retornando-os no payload.
4.  O backend insere os links na tabela `installments` e enfileira uma tarefa automática no BullMQ para que a Sofia envie o link PIX no WhatsApp do paciente.
5.  Ao pagar, o Asaas dispara um webhook `PAYMENT_RECEIVED` para a nossa API, que altera o status da parcela para `PAID` e lança a receita no fluxo de caixa da clínica.

---

## 4. Google Calendar API (Sincronização de Agenda)
Para permitir que os dentistas visualizem seus horários em seus smartphones pessoais através do Google Calendar padrão:

*   **Sincronização Bidirecional:**
    *   **Local -> Google:** Sempre que uma consulta é criada, alterada ou reagendada no FlowDent, disparado um evento `appointment.updated` que enfileira um Job para criar/atualizar o respectivo evento na Google Calendar API usando o token OAuth2 associado ao dentista.
    *   **Google -> Local:** Um webhook cadastrado na Google Calendar API escuta alterações feitas diretamente pelo celular do dentista e atualiza correspondente a agenda no FlowDent, bloqueando o horário para evitar conflitos (Double Booking).

---

## 5. Resiliência de Integração: Circuit Breaker e Timeout
Para evitar que a lentidão em APIs terceiras derrube ou trave o backend do FlowDent:
*   **Timeouts Estritos:** Todas as conexões HTTP de integração externa usam timeout obrigatório de **5 segundos**.
*   **Circuit Breaker Pattern:** Se as chamadas para a Evolution API ou Asaas falharem consecutivamente mais de 10 vezes em um período de 1 minuto, o disjuntor (Circuit Breaker) se abre. As requisições seguintes para essa integração falham imediatamente (Fast Fail), evitando enfileirar jobs inúteis e poupando conexões do pool. O sistema tenta restabelecer a conexão (Half-Open) após 5 minutos.

# FlowDent — Critérios de Aceite das Funcionalidades (Acceptance Criteria)
**Versão:** 1.0.0  
**Autor:** QA Lead & Product Owner  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve os **Critérios de Aceite (Acceptance Criteria)** detalhados para homologação e testes das funcionalidades críticas do **FlowDent**. O cumprimento destes cenários de teste é obrigatório para que qualquer nova feature seja liberada para produção.

---

## 2. Cenários de Aceite: Odontograma (Modo Pincel Rápido)

### Cenário 1: Pintura rápida e persistência de dados
*   **Dado** que o dentista está visualizando o odontograma de um paciente com o "Modo Pincel Rápido" ativo,
*   **E** selecionou o procedimento *"Canal"* e o status *"Necessita Tratamento"*,
*   **Quando** ele clicar no dente número 36,
*   **Então** o dente 36 deve mudar visualmente de cor na tela instantaneamente (tempo de resposta < 50ms),
*   **E** um item de histórico de evolução deve ser gerado no prontuário: *"Dente 36: Canal - Necessita Tratamento"*,
*   **E** a transação de débito pendente deve ser criada no contas a receber do paciente.

### Cenário 2: Prevenção de cliques indesejados no modo clássico
*   **Dado** que o dentista está com o "Modo Seleção (Clássico)" ativo no odontograma,
*   **Quando** ele clicar em qualquer dente na tela,
*   **Então** o sistema **não deve** alterar a cor do dente diretamente,
*   **Mas deve** abrir a gaveta lateral direita de histórico detalhado daquele dente específico.

---

## 3. Cenários de Aceite: Sofia IA (Agendamento Autônomo)

### Cenário 1: Reagendamento bem-sucedido via WhatsApp
*   **Dado** que a IA Sofia está ativa para o paciente Julio Cesar no WhatsApp,
*   **E** o paciente envia a mensagem *"Gostaria de mudar minha consulta de amanhã às 10h para sexta às 14h"*,
*   **Quando** a Edge Function processar a mensagem,
*   **Então** a IA deve chamar a ferramenta `get_available_slots` para a data da próxima sexta-feira,
*   **E** se o horário de 14h estiver livre, deve chamar `book_appointment` cancelando a consulta de amanhã e marcando a nova,
*   **E** enviar a confirmação de sucesso para o WhatsApp do paciente,
*   **E** emitir um alerta na tela da recepção via WebSocket com sinal sonoro.

---

## 4. Cenários de Aceite: Isolamento de Dados (SaaS Security)

### Cenário 1: Bloqueio de injeção de Tenant ID na API
*   **Dado** que um usuário mal-intencionado está autenticado com credenciais da Clínica A,
*   **Quando** ele disparar um payload POST de cadastro de paciente enviando o `clinic_id` da Clínica B no JSON,
*   **Então** o servidor (NestJS interceptor) deve ignorar o ID do JSON, extrair o ID real do JWT do usuário,
*   **E** gravar o registro associando ao ID real da Clínica A no banco de dados.
*   **E** se tentar ler uma rota GET passando id da Clínica B, o sistema deve retornar erro `403 Forbidden` ou `404 Not Found`.

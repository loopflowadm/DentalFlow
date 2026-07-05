# FlowDent — Construtor de Automações (Automation Architecture)
**Versão:** 1.0.0  
**Autor:** Tech Lead & Principal Software Architect  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve as especificações técnicas de design, execução e engine do **Construtor de Automações** do **FlowDent**. A arquitetura prevê um motor de processamento baseado em grafos direcionados (DAG - Directed Acyclic Graph) proprietário, permitindo que os gestores das clínicas criem fluxos de trabalho visuais (semelhantes a ferramentas como n8n, Make ou Zapier) totalmente integrados ao ecossistema do ERP.

---

## 2. Tipos de Nós Suportados no Construtor

O construtor visual de fluxos suporta quatro categorias de nós operacionais:

```
  ┌────────────────────────────────────────────────────────┐
  │ 1. GATILHOS (Triggers)                                 │
  │    • Consulta Marcada   • Nova Falta   • Fatura Vencida │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │ 2. CONDIÇÕES (Filter Nodes)                            │
  │    • Prioridade é Alta? • Tem WhatsApp cadastrado?     │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │ 3. AÇÕES (Action Nodes)                                │
  │    • Mover Card no CRM  • Enviar WhatsApp  • Criar Pix │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │ 4. PROCESSADORES ESPECIAIS                             │
  │    • Timer (Aguardar)   • Nó de IA (Sofia)             │
  └────────────────────────────────────────────────────────┘
```

---

## 3. Especificação do Grafo (JSON DAG Schema)
As automações são salvas no banco de dados na tabela `automations` em formato JSON estruturado contendo a definição de nós (`nodes`) e conexões (`edges`):

```json
{
  "automationId": "aut_4821a92c-63b7-4c81-8b9a-4c2847ffb0aa",
  "name": "Recuperação de Pacientes Ausentes",
  "active": true,
  "nodes": [
    {
      "id": "node_1",
      "type": "trigger",
      "name": "appointment.cancelled_absence",
      "config": {}
    },
    {
      "id": "node_2",
      "type": "condition",
      "name": "check_patient_priority",
      "config": {
        "field": "patient.priority",
        "operator": "equals",
        "value": "HIGH"
      }
    },
    {
      "id": "node_3",
      "type": "action",
      "name": "whatsapp.send_template",
      "config": {
        "templateName": "paciente_ausente_alta_prioridade",
        "delaySeconds": 3600
      }
    }
  ],
  "edges": [
    {
      "source": "node_1",
      "target": "node_2"
    },
    {
      "source": "node_2",
      "target": "node_3",
      "condition": "true"
    }
  ]
}
```

---

## 4. Motor de Execução Assíncrona (DAG Engine Runtime)

O motor de automação é executado de forma assíncrona para garantir que falhas externas (timeouts de API ou e-mail) não afetem a transação principal:

1.  **Interceptador de Eventos (Event Listener):** Um evento de domínio é disparado no NestJS (ex: `appointment.cancelled`).
2.  **Verificador de Automações:** A classe `AutomationEngine` pesquisa no PostgreSQL todas as automações ativas que possuam esse gatilho configurado.
3.  **Enfileiramento de Fluxo:** Para cada automação encontrada, um registro de execução (`automation_executions`) é criado no banco de dados e um job é enviado para a fila **`automation-queue`** do Redis.
4.  **Consumo do Job (Worker Execution):**
    *   O Worker de automações lê o estado do grafo JSON.
    *   Inicia a execução a partir do nó `trigger`.
    *   Passa o contexto de dados do evento (dados do paciente, da consulta) como variáveis acessíveis aos nós filhos.
    *   Processa as condições e ramifica o fluxo.
    *   Para nós que possuem atraso programado (ex: *Aguardar 2 horas*), o Worker salva o estado atual do fluxo de execução no banco e enfileira um Job com atraso no BullMQ (`delay: 7200000`).

---

## 5. Tratamento de Erros, Loops e Retries
*   **Controle de Loops Infinitos:** O motor possui um limitador interno de execuções de nós por fluxo (`MAX_NODES_PER_EXECUTION = 100`). Se a contagem ultrapassar esse valor na mesma execução, o fluxo é marcado como `FALHADO` por segurança.
*   **Mecanismo de Retry para Integrações Externas:** Nós de envio de WhatsApp ou integrações via Webhook que falharem devido a erros de rede receberão automaticamente **3 tentativas de reenvio**, utilizando política de *Backoff Exponencial* (atraso de 2min, depois 5min, depois 15min) gerenciado nativamente pelo BullMQ.
*   **Logs de Execução Detalhados:** Toda execução gera linhas na tabela `automation_logs`, permitindo que o gestor da clínica veja exatamente quais nós foram percorridos e qual foi o payload de dados em cada etapa da automação, facilitando depurações diretamente pela interface de configurações da clínica.

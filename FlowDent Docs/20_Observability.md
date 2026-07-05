# FlowDent — Observabilidade e Monitoramento (Observability & APM)
**Versão:** 1.0.0  
**Autor:** Principal Site Reliability Engineer (SRE)  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve os padrões de monitoramento, coleta de métricas, rastreamento distribuído de requisições (tracing) e gestão de logs centralizados do **FlowDent**. O objetivo é garantir visibilidade em tempo real sobre a saúde do ecossistema, permitindo identificar gargalos de latência, erros de IA e falhas em segundo plano de forma proativa.

---

## 2. Pilares da Observabilidade

A infraestrutura é monitorada sob três dimensões principais:

```
  ┌────────────────────────────────────────────────────────┐
  │ 1. LOGS CENTRALIZADOS (Winston / Loki / Datadog)       │
  │    • Registro detalhado estruturado em formato JSON    │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │ 2. APM & MÉTRICAS (Prometheus / Grafana)                │
  │    • CPU/RAM, conexões no Postgres, consumo de Filas    │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │ 3. TRACING DISTRIBUÍDO (OpenTelemetry / Jaeger)        │
  │    • Rastreia o caminho completo de ponta a ponta      │
  └────────────────────────────────────────────────────────┘
```

---

## 3. Registro de Logs Estruturados (Structured Logging)
Todos os logs gerados pela aplicação backend (NestJS) devem ser gravados em formato **JSON estruturado** no console (stdout) para coleta e agregação automática por agentes (como Datadog Agent, Vector ou FluentBit):

### Exemplo de Log JSON de Erro Tratado
```json
{
  "timestamp": "2026-07-03T15:52:00.000Z",
  "level": "error",
  "message": "Falha na chamada ao webhook do Evolution API",
  "clinicId": "clinic-sorriso-perfeito-uuid",
  "userId": "usr_pedro-dentista",
  "correlationId": "corr_c882194b-14d2-45e3-8ad4-1c4ba2e316e1",
  "context": {
    "url": "https://api.evolution.com/message/sendText",
    "statusCode": 504,
    "attempt": 2
  },
  "stack": "Error: Timeout of 5000ms exceeded\n    at Timeout._onTimeout..."
}
```

*Regra de Ouro: Nunca salve informações pessoais sensíveis (como nome do paciente ou CPF) nos logs para manter conformidade com a LGPD. Use apenas os identificadores UUID.*

---

## 4. Rastreamento Distribuído (OpenTelemetry Tracing)
Para diagnosticar gargalos em transações complexas que trafegam entre o monolito, o Supabase, as filas do Redis e a API externa do Gemini:

*   **Propagação do Span:** A biblioteca **OpenTelemetry SDK** é inicializada junto com o backend. Cada requisição HTTP de entrada gera um `Trace ID` exclusivo.
*   **Acompanhamento da Fila:** Quando um evento é enviado para a fila do Redis via BullMQ, o `Correlation ID` e os metadados do Span do OpenTelemetry são passados nas opções do Job, permitindo que o Worker continue o rastreamento sob o mesmo fluxo visual no painel de monitoramento (APM).

---

## 5. Captura de Erros e Alertas de Produção (Sentry & Slack)
*   **Integração com Sentry:** O SDK do **Sentry** é inicializado no frontend e no backend. Qualquer erro `500` (não tratado) ou falha crítica em segundo plano é capturado e agrupado no Sentry.
*   **Políticas de Alerta:**
    *   **Prioridade Alta:** Estouro repentino de erros 5xx (> 2% das requisições em 5 min) ou falha de conexão com o banco de dados. Dispara alertas sonoros imediatos via PagerDuty/Opsgenie para a equipe de plantão (SRE).
    *   **Prioridade Média:** Falhas recorrentes no webhook do WhatsApp da Evolution API ou erro de processamento de IA. Dispara notificações automáticas em canais dedicados no Slack da equipe de engenharia.
    *   **Prioridade Baixa:** Alertas de lentidão de queries (> 500ms). Consolidados em relatórios diários de otimização de banco de dados.

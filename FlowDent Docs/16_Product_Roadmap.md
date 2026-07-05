# FlowDent — Cronograma de Desenvolvimento (Product Roadmap)
**Versão:** 1.0.0  
**Autor:** Principal Product Manager & Tech Lead  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve o plano de desenvolvimento faseado (Roadmap) do **FlowDent**. O plano é estruturado em quatro fases estratégicas, permitindo validar o produto comercialmente com clínicas reais (fase de tração) enquanto a engenharia escala as complexidades de IA, automações e multi-filiais de grande porte.

---

## 2. Visão Geral do Roadmap

```
  ┌────────────────────────────────────────────────────────┐
  │ FASE 1: Core ERP & Multi-Tenant (Mês 1 - 2)            │
  │ • Cadastro de Clínicas   • Agenda Base   • Banco RLS    │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │ FASE 2: CRM & Agilidade Odontológica (Mês 3 - 4)       │
  │ • Funil Kanban  • Odontograma Pincel  • Central Chat    │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │ FASE 3: Agentes de IA Sofia e Finanças (Mês 5 - 6)     │
  │ • IA Sofia WhatsApp • Cobrança Autônoma • DRE Financeiro│
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │ FASE 4: Hiper-Automação & Enterprise (Mês 7+)          │
  │ • Construtor n8n-like  • Multi-Filiais • Open API Portal│
  └────────────────────────────────────────────────────────┘
```

---

## 3. Detalhamento das Fases

### Fase 1: Fundação do Sistema (Mês 1 ao Mês 2) [CONCLUÍDO]
*   **Foco:** Infraestrutura básica e usabilidade padrão de ERP odontológico.
*   **Recursos do Produto:**
    *   Arquitetura de Banco de Dados PostgreSQL Supabase com RLS ativa.
    *   Painel de Login com suporte a modo simulação local (LocalStorage) e banco real.
    *   Agenda clínica básica (filtros por sala, profissional e visualizações diária/mensal).
    *   Cadastro primário de pacientes, convênios aceitos e controle de acesso (RBAC).

### Fase 2: CRM de Vendas e Ficha Odontológica Ágil (Mês 3 ao Mês 4) [ATUAL / EM EXECUÇÃO]
*   **Foco:** Agilizar o trabalho dos profissionais e capturar novas vendas de leads.
*   **Recursos do Produto:**
    *   CRM Comercial Kanban com 12 etapas configuráveis e gaveta lateral de atividades (timeline, checklist de tarefas).
    *   Odontograma FDI Interativo com suporte a **Modo Pincel Rápido** para lançamento de procedimentos clínicos em lote sem menus flutuantes.
    *   Central de Chat WhatsApp (Evolution API) integrada com sincronização do histórico do paciente em tempo real.
    *   Auditoria e log de alterações clínicas.

### Fase 3: Sofia IA e Cobranças Autônomas (Mês 5 ao Mês 6)
*   **Foco:** Introduzir Inteligência Artificial como assistente de negócios (SaaS Diferenciado).
*   **Recursos do Produto:**
    *   Orquestrador de IA Sofia (LangGraph) ativo na nuvem via Deno/Supabase Edge Functions.
    *   Function Calling integrado à Sofia para consultar slots livres e efetuar agendamentos.
    *   Transcrição de áudio do paciente usando Whisper API.
    *   Agente de Cobrança Financeira ativo integrando alertas de PIX e negociações automatizadas por WhatsApp.

### Fase 4: Hiper-Automação e Escalabilidade Enterprise (Mês 7 em diante)
*   **Foco:** Grandes redes de franquias, whitelabel avançado e integrações com terceiros.
*   **Recursos do Produto:**
    *   Construtor Visual de Automações (n8n-like) com nós de e-mail, SMS, WhatsApp e gateways de pagamento (Pix/Cartão).
    *   Módulo Multi-Filiais completo com compartilhamento de profissionais e controle de estoque centralizado.
    *   Developer Portal com documentação Swagger OpenAPI para integração de sistemas externos das clínicas.

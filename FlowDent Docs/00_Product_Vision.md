# FlowDent — Visão do Produto & Estratégia de Mercado
**Versão:** 1.0.0  
**Autor:** Principal Product Manager & Lead Architect  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento define a visão estratégica, o posicionamento de mercado, a proposta de valor e a direção tecnológica de longo prazo do **FlowDent** (SaaS Enterprise de ERP + CRM + Inteligência Artificial para Clínicas Odontológicas). Ele serve como a "estrela guia" para o desenvolvimento do ecossistema, orientando decisões de produto, design de experiência e arquitetura de engenharia.

---

## 2. Visão Geral do Produto
O **FlowDent** é uma plataforma multitenant whitelabel projetada para centralizar a gestão clínica, o relacionamento comercial (CRM) e a automação de canais de atendimento em clínicas odontológicas brasileiras. Diferente de concorrentes tradicionais que focam apenas no registro burocrático (prontuários e faturamento simples), o FlowDent é construído em torno de **inteligência autônoma** e **automação orientada a eventos**, reduzindo o trabalho administrativo de dentistas e secretárias a quase zero.

---

## 3. Análise Competitiva (Diferenciais Estratégicos)

Para superar os concorrentes consolidados no mercado brasileiro, o FlowDent ataca diretamente as fraquezas estruturais de cada um:

| Concorrente | Fraqueza Identificada | Proposta de Valor FlowDent |
| :--- | :--- | :--- |
| **Clinicorp** | Interface complexa, curva de aprendizado íngreme, lentidão e automações rígidas. | UX limpa estilo *Linear/Vercel*, performance sub-segundo e construtor visual de automações dinâmicas (n8n-like). |
| **Simples Dental** | Recursos de IA limitados, WhatsApp centralizado apenas para mensagens manuais. | Agentes de IA integrados (Sofia, SDR, Cobrança) que agendam e respondem sozinhos, integrados a webhooks. |
| **Dental Office** | Arquitetura legada, dificuldades de escalabilidade e API fechada. | API aberta Restful/GraphQL whitelabel com arquitetura baseada em eventos (Event-Driven) e microsserviços. |
| **Codental** | Simples demais para clínicas enterprise ou franquias de grande porte. | Isolamento lógico robusto por RLS (Row-Level Security), suporte a multi-filiais, governança e logs de auditoria detalhados. |
| **Controle Odonto** | Interface antiga, pouca agilidade clínica no odontograma (excesso de cliques). | Odontograma com Modo Pincel Rápido (Quick Paint Brush) e atalhos globais de teclado (CMD+K). |

---

## 4. Pilares de Produto (Core Pillars)

### I. Inteligência Artificial Nativa
Agentes de IA especializados que operam sobre grafos de estados estruturados (LangGraph + Vercel AI SDK), simulando funcionários humanos em diferentes áreas:
*   **Sofia (Agente de Agendamento):** Negocia horários, reagenda e cancela consultas em linguagem natural no WhatsApp.
*   **SDR (Pré-Vendas):** Qualifica leads de campanhas do Instagram/Google Ads e os insere no funil do CRM com estimativa de orçamento.
*   **Cobrança Autônoma:** Entra em contato com pacientes inadimplentes, oferece links de PIX/Cartão e renegocia parcelamentos de tratamentos concluídos.

### II. Hiper-Automação Visual (Automation Engine)
Um construtor de automações nativo no estilo *n8n/Make*, permitindo que o gestor da clínica crie fluxos condicionais arrastando blocos (ex: *Se* consulta confirmada *então* enviar lembrete com foto do doutor *e* criar tarefa no CRM).

### III. Agilidade Clínica Avançada (UX Premium)
Inspirado na usabilidade do *Linear*, *Stripe* e *Raycast*:
*   Atalhos de teclado globais (`CMD+K` para busca universal rápida, `Esc` para fechar painéis).
*   Odontograma FDI rápido que permite lançar tratamentos em lote com o modo pincel, eliminando menus flutuantes desnecessários.

### IV. Escalabilidade Multitenant Realtime
Arquitetura baseada em banco de dados compartilhado com políticas rígidas de Row-Level Security (RLS) no PostgreSQL, garantindo isolamento total de dados entre clínicas concorrentes, associada a WebSockets para sincronização instantânea.

---

## 5. Personas do Sistema

### 1. Dra. Mariana Costa (Dona da Clínica / Administradora)
*   **Objetivos:** Reduzir custos operacionais, monitorar o faturamento previsto do mês e evitar a evasão de pacientes do CRM.
*   **Necessidades:** Painéis visuais de Business Intelligence consolidados, relatórios financeiros precisos e automações de marketing que funcionem sozinhas.

### 2. Dr. Pedro Rocha (Dentista Clínico)
*   **Objetivos:** Lançar a evolução clínica do paciente no menor tempo possível para focar no atendimento técnico.
*   **Necessidades:** Odontograma rápido, visualização simples do prontuário, acesso rápido ao histórico de imagens.

### 3. Camila Alves (Recepcionista)
*   **Objetivos:** Controlar a agenda diária e as confirmações de consultas sem precisar ligar manualmente para cada paciente.
*   **Necessidades:** Central de WhatsApp organizada, alertas visuais de chegada de pacientes e IA Sofia cuidando do fluxo de confirmação.

---

## 6. Decisões Arquiteturais Fundamentais
*   **Backend:** Monolito Modular construído em **NestJS** (TypeScript), facilitando a separação estrita de domínios (DDD) para futura migração para microsserviços quando necessário.
*   **Banco de Dados:** **PostgreSQL** com isolamento de dados via **Row-Level Security (RLS)** e indexação geográfica/vetorial (`pgvector`) para busca de prontuários com busca semântica por IA.
*   **Mensageria e Filas:** **Redis + BullMQ** para gerenciar o processamento distribuído de mensagens de WhatsApp, e-mails de automação e triggers da agenda.
*   **Orquestração de IA:** **LangGraph** para fluxos de conversa orientados a estados e decisão de ferramentas (Function Calling) com o modelo **Gemini-2.5-Flash** para respostas rápidas e **Gemini-2.5-Pro** para auditorias clínicas.

---

## 7. Critérios Gerais de Sucesso
*   **Performance:** Tempo de resposta das APIs críticas < 100ms.
*   **Disponibilidade:** SLA de 99.9% para a API do WhatsApp e o Dashboard operacional.
*   **Adoção de IA:** > 75% dos agendamentos recorrentes ou triagens iniciais resolvidos sem intervenção de secretárias humanas.

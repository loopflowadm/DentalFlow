# FlowDent — Requisitos Não Funcionais (NFRD)
**Versão:** 1.0.0  
**Autor:** Principal Software Architect  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento especifica os Requisitos Não Funcionais do sistema **FlowDent**. Ele define as restrições técnicas, métricas de performance, padrões de segurança, escalabilidade e conformidades legais necessárias para suportar um ecossistema SaaS de nível enterprise.

---

## 2. Performance e Eficiência

### NFR-001: Latência da API
*   **Requisito:** 95% de todas as chamadas de API de leitura (GET) para dados estruturados devem responder em **menos de 100 milissegundos** sob carga normal.
*   **Implementação:** Cache agressivo de dados estáticos ou pouco alterados (como configurações da clínica, dados cadastrais primários) no **Redis**, com invalidação baseada em eventos.

### NFR-002: Carregamento do Painel (FCP)
*   **Requisito:** O tempo para exibição do primeiro conteúdo legível (First Contentful Paint - FCP) da interface operacional da clínica deve ser inferior a **1.5 segundos** em conexões de internet 4G estáveis.
*   **Implementação:** Code-splitting por rotas no bundler (Vite), carregamento assíncrono de gráficos e componentes pesados e compressão de imagens via CDN.

### NFR-003: Renderização do Odontograma
*   **Requisito:** O tempo de resposta visual ao clicar e pintar um dente na arcada dentária (Modo Pincel) deve ser instantâneo (inferior a **50 milissegundos**), garantindo resposta táctil suave.

---

## 3. Segurança e Privacidade (LGPD / HIPAA Compliant)

### NFR-004: Isolamento de Dados por RLS (Multi-Tenant)
*   **Requisito:** Garantir que nenhuma clínica consiga ler ou editar dados de outra em nenhuma circunstância.
*   **Implementação:** Utilização obrigatória de Row-Level Security (RLS) nativo do PostgreSQL. Todas as tabelas devem possuir a coluna `clinic_id` associada à política:
    ```sql
    CREATE POLICY clinic_isolation_policy ON patients
    FOR ALL USING (clinic_id = current_setting('app.current_clinic_id', true));
    ```

### NFR-005: Criptografia de Dados Sensíveis
*   **Requisito:** Dados pessoais sensíveis dos prontuários médicos e dados de cartões dos clientes devem ser criptografados.
*   **Implementação:** Criptografia em trânsito usando TLS 1.3 obrigatório e criptografia em repouso usando o padrão AES-256 no banco de dados.

### NFR-006: Rastreabilidade (Audit Log)
*   **Requisito:** Qualquer alteração em prontuários clínicos, orçamentos ou dados sensíveis dos pacientes deve gerar um registro de auditoria inalterável.
*   **Implementação:** Trigger no banco de dados que intercepta operações de `UPDATE` e `DELETE` e insere o estado anterior, o novo estado, o ID do usuário executor e o IP na tabela `audit_logs`.

---

## 4. Confiabilidade e Disponibilidade (Reliability)

### NFR-007: SLA do Sistema
*   **Requisito:** A plataforma FlowDent deve manter uma disponibilidade (uptime) média de **99.9% ao ano** para o ERP e CRM, e **99.5%** para o processador de envio de mensagens do WhatsApp.

### NFR-008: Tolerância a Falhas e Recuperação (RTO / RPO)
*   **RTO (Recovery Time Objective):** Tempo máximo para restaurar o sistema em caso de queda catastrófica deve ser inferior a **30 minutos**.
*   **RPO (Recovery Point Objective):** Perda máxima tolerada de dados em caso de sinistro deve ser de **5 minutos** (backups incrementais automatizados de banco de dados).

---

## 5. Escalabilidade e Arquitetura Multi-Tenant
*   **NFR-009: Escalabilidade Linear de Conexões de WhatsApp:** O motor do WhatsApp (Evolution API) deve ser orquestrado via Kubernetes/Docker Swarm para escalar horizontalmente. Se a quantidade de conexões de canais ultrapassar 100, um novo container réplica deve ser provisionado de forma automatizada pelo orquestrador.
*   **NFR-010: Cache de Sessão:** O estado de login e sessões ativas de WebSocket devem ser compartilhados via cluster **Redis**, permitindo que servidores de aplicação caiam ou reiniciem sem desconectar as secretárias ativas.

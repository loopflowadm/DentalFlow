# FlowDent — Guia de Implantação e CI/CD (Deployment Runbook)
**Versão:** 1.0.0  
**Autor:** Principal DevOps & Infrastructure Engineer  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve os fluxos de deploy, integração contínua (CI), entrega contínua (CD), infraestrutura de hospedagem e gestão de variáveis de ambiente do **FlowDent**. A arquitetura visa automatizar 100% da publicação do código em ambientes de teste (Staging) e produção com zero downtime.

---

## 2. Topologia de Infraestrutura de Hospedagem

A infraestrutura é dividida por serviços para otimizar performance e custos:

```
  ┌────────────────────────────────────────────────────────┐
  │ 1. FRONTEND PORTAL (Vercel Edge Network)                │
  │    • HTML/JS Estático   • Certificados SSL automáticos   │
  └───────────────────────────┬────────────────────────────┘
                              │ Comunicação HTTPS
  ┌───────────────────────────▼────────────────────────────┐
  │ 2. BACKEND API MODULE (AWS Fargate / GCP Cloud Run)    │
  │    • Docker Containers  • Auto-scaling horizontal      │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │ 3. BANCO E SERVIÇOS (Supabase Enterprise & Redis)     │
  │    • PostgreSQL DB      • pgvector   • BullMQ Queue    │
  └────────────────────────────────────────────────────────┘
```

---

## 3. Pipeline de Integração e Entrega Contínua (GitHub Actions)
Toda alteração de código enviada para o repositório principal no GitHub passa pelo fluxo de testes e deploy automatizado:

### Gatilhos e Jobs de Pull Request (Staging)
1.  **Gatilho:** Commit na branch `main` ou abertura de Pull Request.
2.  **Lint & Formatação:** Valida regras de escrita com ESLint e Prettier.
3.  **Execução de Testes:**
    *   Executa testes unitários (`npm run test:unit`).
    *   Executa testes de integração com Testcontainers Postgres (`npm run test:integration`).
4.  **Construção do Build:** Garante que o projeto compila sem erros de tipagem TypeScript (`npm run build`).
5.  **Deploy em Staging:**
    *   O frontend é publicado na Vercel como *Preview Deployment*.
    *   O backend é empacotado em uma imagem Docker, enviado para o registro privado (AWS ECR) e atualizado no ambiente de homologação.

### Deploy em Produção (CD)
O deploy em produção é acionado apenas após a aprovação manual de um líder técnico no GitHub Releases:
*   **Database Migrations:** O pipeline executa as novas migrations no Supabase de produção utilizando a ferramenta **Prisma Migrations** ou CLI do Supabase. Em caso de falha na migração, o pipeline aborta o deploy automaticamente (Rollback).
*   **Blue-Green Deployment:** O container do NestJS é atualizado utilizando a estratégia Blue-Green na AWS/GCP. Os novos containers entram no ar e passam por *Health Checks*. Somente quando saudáveis, o Load Balancer redireciona o tráfego de usuários para a nova versão, desligando a antiga sem gerar interrupção do sistema.

---

## 4. Gerenciamento de Variáveis de Ambiente (Secrets)

As variáveis de ambiente devem ser salvas nos gerenciadores de secrets (Vercel Dashboard e AWS Secrets Manager) e nunca comitadas no GitHub:

### Principais Variáveis de Ambiente Requeridas
*   **`NODE_ENV`:** Define o ambiente ativo (`development`, `staging`, `production`).
*   **`DATABASE_URL` / `DIRECT_URL`:** Strings de conexão segura com o pooler (Supavisor) e conexão direta para migrations do PostgreSQL.
*   **`JWT_SECRET`:** Chave privada para assinatura e validação dos tokens JWT.
*   **`REDIS_URL`:** Endereço de acesso ao cluster Redis para o BullMQ e Cache.
*   **`GEMINI_API_KEY`:** Chave de acesso à API do Gemini para os agentes de IA.
*   **`EVOLUTION_API_BASE_URL` / `EVOLUTION_API_KEY`:** Endereços e chaves de segurança da API de integração do WhatsApp.

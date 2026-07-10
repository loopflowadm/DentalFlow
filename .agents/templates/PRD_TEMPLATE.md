# Documento de Requisitos de Produto (PRD) — [Nome da Feature]

## 1. Visão Geral
Descreva brevemente a funcionalidade, o problema que ela resolve e o impacto esperado para as clínicas odontológicas ou pacientes.

## 2. Requisitos de Negócio & Multi-tenant
*   **Tenant Isolation:** Como essa feature lida com dados de clínicas diferentes?
*   **LGPD:** Há tratamento de dados clínicos ou pessoais sensíveis? Como serão protegidos?
*   **Regras de Comissão/Faturamento:** Afeta cálculos de lucros, comissões de dentistas ou fluxo de caixa?

## 3. Experiência do Usuário (UI/UX)
*   **Design Tokens:** Segue os padrões do [12_Design_System.md](file:///c:/Users/thaci/.gemini/antigravity-ide/scratch/odonto-crm/FlowDent%20Docs/12_Design_System.md)?
*   **Telas:** Quais modais, gavetas laterais (Drawers) ou páginas serão modificadas?
*   **Estilo macOS:** Descreva os hovers, micro-animações com Framer Motion e efeitos táteis de botões.

## 4. Arquitetura Técnica & Banco de Dados (Supabase)
*   **Novas Tabelas/Colunas:** Liste se haverá alterações no `supabase-schema.sql`.
*   **Queries:** Descreva as principais consultas necessárias e como o filtro de `clinic_id` será aplicado.

## 5. Critérios de Aceitação (DoD)
*   [ ] Requisito A funciona conforme esperado.
*   [ ] Requisito B trata cenários de erro do Supabase sem travar.
*   [ ] Interface está adaptada para Light/Dark Mode com contraste legível.
*   [ ] Testes unitários e manuais executados com sucesso.

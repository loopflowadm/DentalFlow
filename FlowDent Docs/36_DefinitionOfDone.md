# FlowDent — Critérios de Definição de Conclusão (Definition of Done - DoD)
**Versão:** 1.0.0  
**Autor:** Principal Tech Lead & QA Lead  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento especifica a lista de verificação da **Definição de Conclusão (Definition of Done - DoD)** aplicada a todas as tarefas de desenvolvimento, correções de bugs e novas funcionalidades no **FlowDent**. Nenhuma atividade é considerada concluída ou pronta para deploy em produção se não satisfizer todos os critérios listados neste documento.

---

## 2. Checklists de Conclusão (DoD Checklist)

### 1. Qualidade e Padrões de Código (Code Quality)
- [ ] O código segue estritamente as regras definidas no documento de [Coding Standards](file:///c:/Users/thaci/.gemini/antigravity-ide/scratch/odonto-crm/FlowDent%20Docs/18_Coding_Standards.md) (nomenclatura, SOLID, tratamento de exceções).
- [ ] Tipagem TypeScript completa. É estritamente proibido o uso do tipo `any` sem justificativa documentada.
- [ ] Zero avisos (warnings) e erros de linting ao executar `npm run lint`.
- [ ] Comentários e docstrings adicionados em classes e funções de regra de negócio complexa (como repasses financeiros e algoritmos de grafos da IA).

### 2. Cobertura de Testes Automatizados (Testing)
- [ ] Testes unitários cobrem todas as regras de negócio novas criadas (mínimo de 80% de cobertura de linhas).
- [ ] Testes de integração criados para validar a integridade de dados e a persistência no banco de dados (ex: novos endpoints de API).
- [ ] Execução bem-sucedida do teste de vazamento de dados de Tenant (RLS Test) para novos modelos persistidos.
- [ ] Execução bem-sucedida de testes E2E do fluxo de ponta a ponta na esteira de CI (`npm run test:e2e`).

### 3. Revisão de Código e Integração (Code Review & Integration)
- [ ] Pull Request (PR) revisado e aprovado por pelo menos um Engenheiro Sênior ou Tech Lead.
- [ ] Build de produção compilado sem erros (`npm run build`).
- [ ] Código integrado com a branch principal (`main`) sem gerar conflitos de mesclagem.

### 4. Segurança e Privacidade (Security & Compliance)
- [ ] Validação de RLS ativa no banco de dados para novas tabelas criadas.
- [ ] Novas chaves e tokens de APIs externas cadastrados de forma segura nas secrets do servidor, sem hardcode no repositório.
- [ ] Sanitização ativa em campos de input e forms contra injeção de scripts (XSS).

### 5. Performance e Monitoramento (Performance & Observability)
- [ ] O tempo de resposta do novo endpoint de API é inferior a **100ms** em ambiente de homologação.
- [ ] Logs estruturados JSON e telemetria básica (APM spans) implementados para novos fluxos assíncronos de workers.
- [ ] Erros críticos rastreáveis configurados no monitoramento do Sentry.

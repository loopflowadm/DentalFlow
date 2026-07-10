---
name: odontocrm-review
description: Diretrizes e checklist automático de code review para garantir segurança, qualidade de código e conformidade com o design tokens antes de commitar ou concluir tarefas.
---

# Skill: OdontoCRM Code Review Checklist

Esta skill estabelece o checklist de revisão automática (Code Review) que o agente deve realizar antes de entregar qualquer funcionalidade ou propor uma mudança no repositório.

## Checklist de Qualidade de Código (DoD - Definition of Done)

Antes de finalizar qualquer tarefa, revise mentalmente os seguintes 4 pilares:

### 1. UX/UI & Design System Alignment
*   **Fontes:** O componente utiliza a fonte `Outfit` para títulos e `Inter` para o corpo de texto?
*   **Design Tokens:** As cores seguem os tokens de tons neutros (Navy Black `#0b0f19` para dark background, Slate 850 `#151c2c` para cartões)?
*   **Elementos macOS:** Botões principais implementam o estilo tátil macOS Depth Button (cantos de 12px `rounded-xl`, borda sutil, hover translate-y-0.5 e active scale-98)?
*   **Animações:** Painéis e modais utilizam o efeito spring de transição do Framer Motion?

### 2. Segurança e Multi-tenant (Supabase)
*   **Tenant Isolation:** Toda consulta ou mutação na API do Supabase possui o filtro `.eq('clinic_id', clinicId)`?
*   **Auth State:** A ação exige autenticação? A sessão foi devidamente validada?
*   **Campos Sensíveis:** Há logs adequados caso informações críticas do paciente (histórico médico, prontuário, comissões) tenham sido editadas?

### 3. Padrões de Código e Clean Code
*   **Nomenclatura:** Nomes de pastas e arquivos usam `kebab-case`? Nome do componente usa `PascalCase`? Funções e variáveis em `camelCase`?
*   **SRP (Responsabilidade Única):** O arquivo possui lógica excessiva? Lógicas pesadas ou de consulta ao banco foram extraídas para hooks reutilizáveis ou isoladas?
*   **Effects Cleanups:** Os hooks `useEffect` utilizados possuem funções de cleanup adequadas para evitar vazamento de memória ou chamadas duplicadas?

### 4. Git e Versionamento
*   **Conventional Commit:** A mensagem de commit proposta segue a padronização Conventional Commits (ex: `feat(pacientes): adiciona campo de anamnese` ou `style(dashboard): melhora sombras dos cards executivos`)?

---

## Como Aplicar a Revisão
Sempre que concluir o desenvolvimento de um componente ou página, execute um auto-exame com base nesta skill e relate os itens verificados no walkthrough de conclusão de tarefa.

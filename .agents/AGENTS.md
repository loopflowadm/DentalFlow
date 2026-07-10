# Regras de Desenvolvimento — OdontoCRM

Este arquivo define os padrões globais obrigatórios para o desenvolvimento do **OdontoCRM (FlowDent)**. Qualquer agente que interaja com este repositório deve ler e respeitar estritamente estas diretrizes.

---

## 1. Fonte Única de Verdade (Single Source of Truth)

Todas as definições detalhadas de requisitos de negócio, segurança, banco de dados e arquitetura estão centralizadas na pasta [FlowDent Docs](file:///c:/Users/thaci/.gemini/antigravity-ide/scratch/odonto-crm/FlowDent%20Docs). 
Sempre que receber uma tarefa, consulte prioritariamente os seguintes arquivos antes de planejar alterações:
*   **Arquitetura Geral:** [04_System_Architecture.md](file:///c:/Users/thaci/.gemini/antigravity-ide/scratch/odonto-crm/FlowDent%20Docs/04_System_Architecture.md)
*   **Banco de Dados:** [05_Database_Architecture.md](file:///c:/Users/thaci/.gemini/antigravity-ide/scratch/odonto-crm/FlowDent%20Docs/05_Database_Architecture.md)
*   **Design System:** [12_Design_System.md](file:///c:/Users/thaci/.gemini/antigravity-ide/scratch/odonto-crm/FlowDent%20Docs/12_Design_System.md)
*   **UI/UX:** [13_UI_UX_Guidelines.md](file:///c:/Users/thaci/.gemini/antigravity-ide/scratch/odonto-crm/FlowDent%20Docs/13_UI_UX_Guidelines.md)
*   **Padrões de Código:** [18_Coding_Standards.md](file:///c:/Users/thaci/.gemini/antigravity-ide/scratch/odonto-crm/FlowDent%20Docs/18_Coding_Standards.md)
*   **LGPD:** [23_LGPD.md](file:///c:/Users/thaci/.gemini/antigravity-ide/scratch/odonto-crm/FlowDent%20Docs/23_LGPD.md)
*   **Segurança:** [22_Security.md](file:///c:/Users/thaci/.gemini/antigravity-ide/scratch/odonto-crm/FlowDent%20Docs/22_Security.md)

---

## 2. Stack Tecnológica e Arquitetura do Frontend

O projeto é uma aplicação Single Page Application (SPA):
*   **Core:** React 19 + Vite.
*   **Roteamento:** `react-router-dom` (v7+).
*   **Estilização:** Tailwind CSS 3.4 + PostCSS + Autoprefixer.
*   **Animações:** Framer Motion.
*   **Ícones:** Lucide React.
*   **Banco & Infraestrutura:** Supabase client (`@supabase/supabase-js`).

### Convenção de Pastas do Frontend
*   `src/components/`: Componentes reutilizáveis globais (ex: Botões, Modais, Inputs).
*   `src/context/`: Contextos globais de estado (ex: `AuthContext`, `ClinicContext`).
*   `src/lib/`: Instanciação de clientes externos (ex: `supabase.js`).
*   `src/pages/`: Páginas e rotas da aplicação, divididas por módulos (ex: `pages/dashboard/Dashboard.jsx`, `pages/agenda/`, `pages/pacientes/`).
*   `src/assets/`: Imagens, logotipos e mídias estáticas.

---

## 3. Padrões de Código (Coding Standards)

*   **Nomenclatura:**
    *   **Pastas e Arquivos:** Usar `kebab-case` para arquivos de componentes, hooks e páginas (ex: `patient-record-card.jsx`, `use-clinic-data.js`).
    *   **Componentes React e Classes:** Usar `PascalCase` (ex: `DashboardCard`, `ClinicProvider`).
    *   **Funções, Métodos e Variáveis:** Usar `camelCase` (ex: `const activePatients = ...`, `function calculateCommission()`).
    *   **Banco de Dados:** Tabelas, colunas, chaves estrangeiras e índices em `snake_case` (ex: `clinic_id`, `chat_messages`).
*   **Clean Code:**
    *   Evite lógica pesada de negócio dentro do ciclo de renderização dos componentes.
    *   Extraia lógicas de integração com o Supabase ou manipulações complexas para hooks customizados.
    *   Respeite o **Princípio de Responsabilidade Única (SRP)**: mantenha os componentes focados e fáceis de testar.

---

## 4. UI/UX & Design System (macOS Depth UI)

O visual do OdontoCRM deve impressionar pela qualidade e refinamento, inspirado no estilo moderno da Apple, Linear e Vercel:
*   **Tipografia:** Fonte `Outfit` para títulos e métricas, e `Inter` para textos, tabelas e inputs.
*   **Cores Neutras e Fundo:** Fundos escuros usam um tom azulado escuro (`#0b0f19` - Navy Black) e cartões usam `#151c2c` (Slate 850) para profundidade visual.
*   **Botões táteis (macOS Depth Button):**
    *   Default: Cantos arredondados (`rounded-xl` / 12px), borda interna suave (`border-white/10` ou `border-black/5`), sombra leve.
    *   Hover: Glow suave e elevação sutil (`hover:-translate-y-0.5`).
    *   Active: Efeito físico de clique (`active:scale-[0.98]`).
*   **Inputs:** Cantos arredondados (12px), fundo com opacidade (`bg-black/30`), borda sutil, mudando para a cor de destaque da clínica no foco.
*   **Animações:** Use `framer-motion` para transições suaves de abas e modais, utilizando curvas de mola amortecidas (spring physics) em vez de durações estáticas secas.

---

## 5. Segurança & Isolamento Multitenant (Multi-clínica)

Como o sistema é um SaaS multi-clínica, o isolamento dos dados é um requisito crítico de segurança:
1.  **Sempre aplique o filtro de clínica (`clinic_id`)** em todas as consultas feitas ao Supabase, a menos que o escopo seja explicitamente SuperAdmin.
2.  **Variáveis de Sessão:** Sempre valide a sessão do usuário através do `AuthContext` antes de carregar dados operacionais.
3.  **Logs:** Ações críticas de alteração financeira, prontuários de pacientes e alterações de permissões devem registrar logs descritivos.
4.  **LGPD:** Dados de saúde e prontuários odontológicos são sensíveis. Garanta que informações de prontuários nunca sejam exibidas sem autenticação e que campos de identificação pessoal sejam tratados de forma segura.

---

## 6. Padrões de Commit e Fluxo de Trabalho (Git Flow)

Adotamos **Conventional Commits** para manter o histórico claro. O formato do commit deve ser:
`tipo(escopo): descrição curta em português`

**Tipos permitidos:**
*   `feat`: Nova funcionalidade (ex: `feat(agenda): adiciona bloqueio de horários`)
*   `fix`: Correção de bug (ex: `fix(auth): corrige expiração de token no supabase`)
*   `docs`: Alteração na documentação (ex: `docs(readme): atualiza instruções de setup`)
*   `style`: Alterações de formatação, estilo visual, CSS ou design (sem alterar lógica de código)
*   `refactor`: Alteração de código que não corrige bug nem adiciona funcionalidade
*   `test`: Adição ou modificação de testes
*   `chore`: Atualizações de build, pacotes npm, etc.

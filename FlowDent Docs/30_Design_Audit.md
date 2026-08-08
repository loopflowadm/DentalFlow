# 30 — Auditoria de Alinhamento Visual & Motion (Design Audit)

**Data:** 2026-08-08
**Escopo:** Todas as telas, componentes compartilhados e submódulos do OdontoCRM (React 19 + Vite + Tailwind 3.4 + Framer Motion).
**Referenciais:** AGENTS.md (fonte única de verdade) + skills `odontocrm-ui` (Design System macOS Depth UI) e `apple-design` (princípios Apple de interface/motion).

---

## 1. Resumo executivo

- **90 achados:** 12 CRÍTICOS · 53 MÉDIOS · 25 POLISH, em ~45 arquivos.
- Por cluster: Chrome/Navegação 27 (4/17/6) · Gestão 17 (3/9/5) · CRM+Pacientes 18 (4/11/3) · Agenda+WhatsApp 28 (1/16/11).

### Os 5 problemas transversais (afetam o app inteiro)

1. **Acessibilidade de teclado nula** — zero `focus-visible`/`focus:ring` em ~31+ inputs; cards/logo/notificações são `<div onClick>` sem `role="button"`/`tabIndex`; odontograma e fluxo-builder não operáveis por teclado.
2. **Animações mortas em massa** — as classes `animate-in`/`fade-in`/`zoom-in-95`/`slide-in-from-*`/`animate-fadeIn` NÃO têm efeito: o plugin `tailwindcss-animate` não está instalado (`tailwind.config.js` `plugins: []`). Modais, gavetas e menus abrem/fecham instantaneamente. AGENTS.md manda Framer Motion com spring physics.
3. **Tokens azulados legados** — superfícies em `#182730`/`#111c24`/`#0c141a`/`#121b22`/`slate-800/850/900`/`#0b0f19`/`#151c2c` violam o preto neutro (`black`/`#0D0D0D`/`#18181B`). Pior nos módulos IA (`AIModule.jsx` + `flow-builder/*`, paleta WhatsApp inteira + CTA verde `#00a884`) e no odontograma (~30 superfícies).
4. **Primitivos do DS ignorados** — `ui/Button`, `ui/Card`, `ui/Badge` quase não são usados; cada tela reinventa botões com `bg-blue-600` vs `bg-[#196BFB]` vs `bg-secondary` (3 convenções) e física de pressão inconsistente (`active:scale-95` vs `active:scale-[0.98]` vs classe inválida `active:scale-98`).
5. **Zero suporte a `prefers-reduced-motion`/`prefers-reduced-transparency`** em todo o `src`, com animações contínuas (Logo `<animateTransform>` 10–14s, `animate-ping`, `animate-bounce`, `animate-pulse`) sempre ativas.

---

## 2. Metodologia

- Checklist definido na skill `odontocrm-design-audit` (7 eixos: tokens, tipografia, motion, materiais/depth, estados, acessibilidade, consistência).
- Auditoria por cluster com subagentes paralelos, cada achado com `arquivo:linha` + evidência.
- Severidade: **CRITICO** (quebra legibilidade/uso ou divergência grave de token) · **MEDIO** (spring ausente, empty state ausente, material fora do padrão, tracking/leading errado) · **POLISH** (detalhe fino).

### Decisão de tokens aplicada (fonte única de verdade = AGENTS.md)

| Elemento | Token correto (dark) | Proibido (legado) |
|---|---|---|
| Shell/fundo | `black` (`dark:bg-black`) | `#0b0f19`, `#090D16` |
| Superfícies/cards/modais | `#0D0D0D` (`dark:bg-[#0D0D0D]`) | `#151c2c`, `slate-800/850/900` |
| Inputs | `black` / `black/30` | — |
| Hover de superfície | `#18181B` (`dark:hover:bg-[#18181B]`) | `#222d42` |
| Sub-navegação | `#080808` | — |
| Accent primário | `#196BFB` (Electric Blue) | `bg-blue-600`, `#1855FD` |
| Verde WhatsApp | `#00a884`/`#008069` (marca, aceito NO módulo WhatsApp) | usar como accent fora do WhatsApp |
| Sucesso/Aviso/Erro | `#10b981` / `#f59e0b` / `#ef4444` | — |

---

## 3. Achados por eixo

### 3.1 Tokens (12 CRÍTICOS incl. 8 aqui)

**CRÍTICO — tons azulados legados em módulos inteiros:**
- `src/pages/ai/AIModule.jsx` (44–47, 439, 447, 465–466, 481–482, 503, 510, 523, 535–580, 602, 635–636, 654–655, 675–677, 727, 740, 752, 787, 800–811, 819, 837, 872, 884–909, 922, 930, 936, 955, 959, 979, 990, 997, 1040–1088, 1117–1145) — módulo IA inteiro na paleta WhatsApp proibida (`#182730`, `#111c24`, `#0c141a`, `#0b141a`, `#1f2c34`, `#080d11`), CTA primário `bg-[#00a884]`.
- `src/pages/ai/flow-builder/VisualFlowBuilder.jsx` (332, 336, 378, 400, 414, 434, 454, 474, 494, 530, 542), `FlowInspectorModal.jsx` (94, 99, 125, 163, 186, 193, 232), `customNodes.jsx` (17, 22, 27, 60, 77, 91, 101, 133, 141, 201, 212, 245, 270, 281, 316, 330, 341, 373) — idem, com `border-slate-800` em todas as superfícies.
- Odontograma — ~30 superfícies dark em `bg-slate-950/900/800`: `PlanoTratamentoView.jsx` (558, 380, 487, 504, 615–671), `ToolsSidebar.jsx` (69, 99, 111, 121, 175, 227, 237, 245, 256, 266, 278, 318–348), `OdontogramView.jsx` (437, 475, 485, 492, 501), `PeriodontogramView.jsx` (114, 158, 182, 198), `DentalArch.jsx` (112, 221), `TreatmentPlanView.jsx` (160), `ToothModal.jsx` (53, 97, 113, 138, 162), `LegendModal.jsx` (24, 67).
- `src/pages/LandingPage.css:1659` — `.landing-offer` gradiente com `#0b0f19 → #0f172a` (proibido).

**CRÍTICO — accents divergentes (3 convenções no mesmo app):** `bg-secondary` (Financeiro, Configurações, Automações, Pacientes) × `bg-blue-600` (Dashboard:688, Relatorios:267, Configurações:1462, Pacientes/odontograma) × `bg-[#196BFB]` (Header, Sidebar, CRM, DentalArch) × verde `#00a884` (AIModule). **MEDIO:** `#1855FD`/`#03269A` fora do accent (SuperAdmin), `accent-blue-600` em checkbox (Login:437).

**MÉDIOS — tokens azulados pontuais:**
- `Login.jsx:284,304` (`bg-slate-900`, `bg-slate-950/60`); `ClinicApp.jsx:195,200,217,246` (tela "clínica suspensa" em `#090D16`/`slate-900/800`).
- Divisores `dark:border-slate-800`: `Header.jsx:211,329,388`, `Sidebar.jsx:1130`, `Financeiro.jsx` (modais/inputs), `Configuracoes.jsx:1369,1379,1496,1515,1525,1646,1666,1678,1710,1982,2035,2130,2209,2248` — usar `dark:border-white/5-10`.
- `text-slate-850`: `Financeiro.jsx:367,370,483,581,734,804,873`, `Marketing.jsx:141,184,196`.
- `ui/Button.jsx:28` (`dark:hover:bg-[#222d42]`→`#18181B`), `ui/Badge.jsx:22` (`bg-slate-800`).
- Tooltips/backdrops `bg-slate-900/95`, `bg-slate-950/60`: `Sidebar.jsx:208,266,345,610`, `ui/CommandPalette.jsx:111`, `WhatsAppDrawer.jsx:34`.
- SuperAdmin inteiro em família slate azulada (`bg-slate-800/20`, `bg-slate-900/60`, `#121827`) — anotado como possível console admin, mas fora do DS.
- WhatsApp.jsx usa paleta própria `#0c141a`×37, `#111c24`×40, `#182730`×25, `#1f2c34`×76, `#080d11`×10 (réplica do tema do WhatsApp) — verde de marca OK, neutros divergem do resto do app.

### 3.2 Tipografia

**MÉDIOS:**
- `text-[8px]`/`text-[9px]` abaixo da escala mínima do DS (10px): `CRM.jsx:564,387,440,640,646,872`, `Pacientes.jsx:990,1076,1818,1834,1965,1982,2087,2093,2099,2207,1990`, `Configuracoes.jsx:737`, `Automacoes.jsx:240,277,376`, `ToolsSidebar.jsx:241`, `DentalArch.jsx:203`, `PlanoTratamentoView.jsx:461–507`, `VisaoGeralView.jsx:161,215`.
- `tracking-widest/wider` em uppercase 9–10px (reduz legibilidade): `CRM.jsx:717,857`, `Pacientes.jsx:1139,1701,1982,2207`, `DentalArch.jsx:106,203,215`, `PlanoTratamentoView.jsx:461–507`, `VisaoGeralView.jsx:81,117,142,161,215,223`.
- `LandingPage.css:7` — página usa fonte **Geist** (DS = Outfit/Inter); há mistura com Outfit em `.landing-offer__plan-title`.
- `WhatsApp.jsx:686` — "Conversas" sem `font-title` (demais títulos usam Outfit).

### 3.3 Motion (animações mortas + springs)

**MÉDIOS — animações CSS mortas (sem `tailwindcss-animate`, `plugins: []`):** 48+ ocorrências em `src`:
- `Header.jsx:157,210,387`, `Sidebar.jsx:346,1129`, `ui/CommandPalette.jsx:52,58`, `WhatsAppDrawer.jsx:12,18` (gaveta abre sem movimento, sem AnimatePresence).
- WhatsApp.jsx — 6 modais (1632, 1737, 1834, 1910, 1962, 1997) com `animate-in zoom-in-95` mortas e sem Framer Motion.
- `Financeiro.jsx:616,793,862`; `Configuracoes.jsx:569,1169,1347,1576,1646,1710,1791,1982,2035,2130,2209,2248`; `CRM.jsx:334`; `Pacientes.jsx:984,1108,1752,1857,2010,2048,2118`; `PlanoTratamentoView.jsx:556,586`; `VisaoGeralView.jsx:71`; `SuperAdmin.jsx:806`.
- Exceção correta: `Agenda.jsx:1410–1414,1585–1589` usam Framer Motion spring + AnimatePresence.

**MÉDIOS — spring/tween:**
- `Onboarding.jsx:253` (tween `easeOut`; contraexemplo correto em 852), `ToothModal.jsx:58`, `LegendModal.jsx:29` (tween em vez de spring 300/25), `FlowInspectorModal.jsx:2,85,89–92` (único Framer Motion do cluster, sem AnimatePresence e sem spring).
- `SuperAdmin.jsx:358–388,806` — troca de abas sem spring.
- `Agenda.jsx:2208–2211` — `motion.div` sem `transition` spring + classe morta redundante.

**MÉDIOS — feedback de pressão inconsistente:** `active:scale-95` (~pervasivo) vs `active:scale-[0.98]` vs **classe inválida** `active:scale-98` (`Onboarding.jsx:727,918`). Nenhum com `active:shadow-inner` (o padrão macOS Depth pede escala + sombra inset).

**MÉDIOS — Logo SVG anima infinitamente** (`Logo.jsx:33–39,99–104`, `<animateTransform>` 10–14s `repeatCount="indefinite"`) sem `prefers-reduced-motion`.

### 3.4 Materiais & depth

**MÉDIOS:**
- `Header.jsx:108` — `backdrop-blur-md` morto: o header vive dentro do card opaco `dark:bg-[#0D0D0D]` (ClinicApp.jsx:296), sem translucidez real. `ui/Card.jsx:16` idem.
- `Sidebar.jsx:295` — bottom nav mobile 100% opaco, sem blur sobre conteúdo.
- WhatsApp.jsx headers de chat/painel opacos (`#0c141a`) sem translucidez — justificável pela réplica do WhatsApp, mas fora do padrão de material do app.
- Destrutivos com `window.confirm` nativo (`Configuracoes.jsx:366,395,447,469`, `AIModule.jsx:208`, `VisualFlowBuilder.jsx:324`) em vez de diálogo do DS.
- Affordance falsa: `Dashboard.jsx:509` KPI card com `hover:-translate-y-0.5` sem ser clicável.

### 3.5 Estados de feedback

**MÉDIOS:**
- **`window.alert()` ×14 na Agenda** (729, 734, 751, 787, 793, 823, 829, 857, 867, 869, 872, 906, 966, 985) — diálogo nativo bloqueante e não-tematizado para ações benignas.
- Empty states ausentes: lista de conversas do WhatsApp (779–844), Agenda sem consultas (531/547), `Marketing.jsx` campanhas (104–114) e landing pages (124–147), parcelas de Pagamentos (Pacientes 1803–1846), Evoluções (Pacientes 1978–1997), Anexos do Plano (PlanoTratamentoView 278–299).
- Envio de mensagem no WhatsApp sem indicador visual (otimista, 555–560).
- `SuperAdmin.jsx:192,850` — health check falho mostra `-1ms` em vez de estado de erro.

### 3.6 Acessibilidade (12 CRÍTICOS incl. aqui)

**CRÍTICOS:**
- **Zero `focus-visible`/foco de teclado visível em todo o `src`** + **~31 inputs** com `focus:outline-none` sem `focus:border`/`ring`: `Financeiro.jsx:402,419,636,649,657,670,813,823,833,843,882,895,905,915,929`, `Configuracoes.jsx:1666,1678,1687,1730,1743,1752,1767,1821,1899,1932,1965,2002,2016`, `Automacoes.jsx:216`, `FlowInspectorModal.jsx:231`, `customNodes.jsx:147`.
- **Cards/itens clicáveis são `<div onClick>` sem semântica** (`Sidebar.jsx:731,877,203`, `Header.jsx:344`) — navegação por teclado impossível no CRM/lista de pacientes.
- **Contraste quebrado no light mode**: `WhatsApp.jsx:1501` (textarea `text-slate-300` sobre `bg-[#f8f9fa]`, contraste ~1.4:1), `LegendModal.jsx:75` (`text-slate-200` sobre `bg-white`), `ToothModal.jsx:87,105,130` (labels `text-slate-300` sobre `bg-white`), divisores fixos `border-white/10` em light (`ToothModal.jsx:66,152`, `LegendModal.jsx:37,90`).
- **Odontograma não operável por teclado** — SVGs interativos (Pacientes 2843–3042, AnatomicalToothSVG, DentalArch, TeethSVGRegistry) só mouse/touch.

**MÉDIOS:**
- Zero `prefers-reduced-motion`/`useReducedMotion` em todo o app (com `animate-ping` AIModule:468,970; `animate-bounce` AIModule:1066; `animate-pulse` Dashboard:666; Logo).
- Botões só-ícone sem `aria-label`/`title`: WhatsApp (~13: emoji/paperclip/mic/send 1237–1267, filtro 687, fechar modais 1638–1968, remover tag 1434,1662), Agenda (1030,1041,1427,1599,2121), Pacientes/odontograma (fechar modais ~10), Marketing:157, FlowInspectorModal:116–120, AIModule:1128, Sidebar logout 279, CommandPalette X 71.
- Modais sem semântica de dialog (`role="dialog"`, `aria-modal`, focus trap): `ui/CommandPalette.jsx:49`, `WhatsAppDrawer.jsx:9`.
- `prefers-reduced-motion`/`prefers-reduced-transparency` ausentes nos springs de Agenda (1407–1414, 1582–1589) e painéis do WhatsApp/SuperAdmin.
- `WhatsApp.jsx:671` — `select-none` na raiz impede copiar texto de mensagens/telefone.

### 3.7 Consistência

**CRÍTICOS:**
- **Primitivos do DS ignorados** — `ui/Button`, `ui/Card`, `ui/Badge` não usados no cluster Chrome/Gestão; `ui/Card` só em Relatorios:8; cada tela reinventa botões com tokens divergentes. Raiz da divergência de tokens do app.
- **3 mecanismos de tema diferentes**: Agenda usa `dark:` + Framer Motion spring; WhatsApp usa `isDarkMode` JS + paleta própria; SuperAdmin é 100% dark hardcoded.
- **Componentes órfãos**: `PatientHeader.jsx` e `PatientTabsNav.jsx` não importados — header (Pacientes 913–1047) e abas (1050–1082) duplicados inline.

**MÉDIOS:**
- Duas libs de ícones no mesmo app: `@tabler/icons-react` (Sidebar, Header) e `lucide-react` (resto).
- Tab switcher ativo em 2 convenções: `dark:bg-[#0D0D0D]` (Dashboard 447–463, Financeiro 277) vs `dark:bg-[#18181B]` (Configuracoes 543, Marketing 62).
- WhatsApp modais sem exit (divs + classes mortas) vs Agenda com spring/AnimatePresence — mesma ação com comportamento diferente.
- CTA primário triplo (ver 3.1).

**POLISH:**
- `Breadcrumbs.jsx:24` logo com `cursor-pointer` sem `onClick`.
- Classes inválidas fora da escala: `w-13 h-13` (LandingPage:556), `z-60`/`z-45`/`z-70`/`-left-45` (Sidebar 196,345,208,266; Login 293), `hover:scale-102` (TeethSVGRegistry:283), `active:scale-98` (Onboarding 727,918).
- `hover:scale-[1.03]` em `motion.div` (LandingPage 292–337; Logo 77) — Framer controla `transform` e sobrescreve o hover CSS.
- Âncoras quebradas na landing ("Recursos"/"Para Clínicas"→`#segunda-feira`, "Depoimentos"→`#demonstracao`) + `id="demonstracao"` duplicado (LandingPage:630,777).
- `Avatar` gradiente `from-blue-600 to-indigo-700` (Agenda:1438) — azuis fora da paleta.

---

## 4. Ordem de correção recomendada

**Fase 1 — Correções críticas (contraste/uso):**
1. Light-mode legível: WhatsApp:1501, LegendModal:75, ToothModal:87/105/130 + divisores `border-white/10` fixos.
2. Foco de teclado visível: padronizar inputs com `focus:ring-2`/`focus:border-[#196BFB]` (começar pelos ~31 inputs de Financeiro/Configurações).
3. Semântica de clique: `<div onClick>` → `<button>`/`role="button"` + `tabIndex` (Sidebar, Header).

**Fase 2 — Migração de animações (mata as classes mortas):**
4. Instalar/resolver as classes `animate-*`: **migrar para Framer Motion + AnimatePresence com spring `{type:'spring', stiffness:300, damping:25}`** nos modais/gavetas (WhatsApp 6 modais, WhatsAppDrawer, CommandPalette, Financeiro 3, Configurações 8+, CRM, Pacientes). Remover classes `animate-in`/`zoom-in-95`/`fade-in` mortas.
5. Padronizar feedback de pressão: `active:scale-[0.98] active:shadow-inner` (substituir `scale-95`, corrigir `scale-98`).
6. Respeitar `prefers-reduced-motion` (cross-fade) e `prefers-reduced-transparency` (superfícies opacas) via `useReducedMotion`.

**Fase 3 — Tokens (convergir para o DS):**
7. Migrar IA (`AIModule.jsx`, `flow-builder/*`) e odontograma (~30 superfícies) de tons azulados → `black`/`#0D0D0D`/`#18181B`.
8. Unificar accent primário em `#196BFB` (remover `bg-blue-600` e `bg-secondary` onde diverge).
9. Trocar `window.alert()` da Agenda por feedback inline/toast do DS; criar diálogo de confirmação do DS para destrutivos.
10. Padronizar `ui/Button`/`ui/Card`/`ui/Badge` nos módulos (reuso de primitivos).

**Fase 4 — Polish:**
11. Remover classes Tailwind inválidas (`w-13`, `z-60`, `scale-102`, `scale-98`), corrigir âncoras/id duplicado da landing, `select-none` do WhatsApp, affordances mortas (Breadcrumbs), fonte Geist→Outfit na landing, `text-[8px]`→mín. 10px, tracking em uppercase 9–10px.
12. Remover/importar componentes órfãos (PatientHeader, PatientTabsNav), uniformizar lib de ícones, empty states faltantes.

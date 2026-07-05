# FlowDent — Design System & Design Tokens
**Versão:** 1.0.0  
**Autor:** Principal UX/UI Designer  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento especifica o **Design System** e a especificação de tokens de design visuais do **FlowDent**. A experiência visual é inspirada em ferramentas de referência em design digital, como *Linear*, *Vercel*, *Stripe* e *Raycast*, buscando estética minimalista, micro-interações táteis rápidas e contraste robusto para uso clínico contínuo (Light e Dark Mode).

---

## 2. Tipografia
A plataforma utiliza duas famílias de fontes do Google Fonts, garantindo contraste hierárquico claro entre títulos e dados operacionais:

*   **Títulos e Destaques (Headers):** **`Outfit`** (Pesos: `600 Semibold`, `700 Bold`, `800 Extrabold`). Usada para títulos de páginas, modais, métricas principais e nomes de pacientes na ficha.
*   **Corpo de Texto (Body / Interface):** **`Inter`** (Pesos: `300 Light`, `400 Regular`, `500 Medium`, `600 Semibold`). Usada para textos explicativos, inputs, tabelas, prontuários e cards.

---

## 3. Paleta de Cores & Design Tokens

As cores do FlowDent são organizadas em tokens semânticos que mudam de acordo com o tema selecionado (Light/Dark):

### 1. Cores da Marca (Dinâmicas Whitelabel)
*   **`primary` (Cor Primária):** Define a identidade da clínica (Normalmente `#0f172a` Slate Escuro).
*   **`secondary` (Cor Secundária):** Usada para botões principais, links ativos e elementos de sucesso (Normalmente `#3b82f6` Azul ou `#10b981` Esmeralda).
*   **`accent` (Cor de Destaque):** Tons violetas ou índigos para IA e automações.

### 2. Tons Neutros de Fundo (Tinting Neutrals)
Para evitar que o tema escuro pareça cinza sem vida, adicionamos uma sutil tonalidade da cor primária ou azulada aos fundos escuros, criando profundidade tridimensional:

| Token Semântico | Light Mode | Dark Mode (Premium) |
| :--- | :--- | :--- |
| **`background`** | `#f8fafc` (Slate 50) | `#0b0f19` (Navy Black) |
| **`surface-card`** | `#ffffff` (Pure White) | `#151c2c` (Slate 850) |
| **`surface-popover`** | `#ffffff` (Pure White) | `#1d2433` (Slate 800) |
| **`border-base`** | `#e2e8f0` (Slate 200) | `#222b3d` (Border Slate) |
| **`text-primary`** | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) |
| **`text-secondary`** | `#475569` (Slate 600) | `#94a3b8` (Slate 400) |

---

## 4. Componentes e Estados (Component Catalog)

### I. Botão Físico macOS (macOS Depth Button)
*   **Visual:** Cantos arredondados (`rounded-xl` / 12px), borda interna suave simulando relevo, gradiente sutil.
*   **Estados:**
    *   *Default:* Semipop com sombra leve.
    *   *Hover:* Efeito de glow translúcido, elevação suave (`-translate-y-0.5`).
    *   *Active:* Encolhimento físico (`scale-[0.98]`), sombra interna (`shadow-inner`).

### II. Inputs e Campos de Formulário
*   **Visual:** Fundo escuro com opacidade (`bg-black/30`), borda fina cinza-clara, ícone descritivo na esquerda, cantos arredondados de 12px.
*   **Estados:**
    *   *Default:* Borda `border-white/10`.
    *   *Focus:* Borda assume a cor secundária whitelabel, anel de foco sutil de 2px.
    *   *Error:* Borda vermelha `border-red-500`, mensagem de validação abaixo em vermelho claro.

---

## 5. Micro-animações e Transições (Framer Motion / Tailwind)
*   **Transições Globais:** Todos os hovers de botões e links utilizam a duração padrão de **150ms** com curva de aceleração suave (`transition-all duration-150 ease-in-out`).
*   **Transição de Abas:** Entrada de novos painéis operacionais utilizam efeito de slide-in vertical amortecido (Framer Motion: `initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}`).
*   **Carregamento de Ações (Loading Spinners):** Spinners de botões utilizam rotação contínua linear (`animate-spin`) com borda superior transparente.

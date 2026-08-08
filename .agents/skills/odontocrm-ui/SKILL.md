---
name: odontocrm-ui
description: Focada em validar e criar telas seguindo o Design System do OdontoCRM (Estilo macOS Depth UI, Tailwind CSS, transições Framer Motion).
---

# Skill: OdontoCRM UI/UX (macOS Depth UI)

Esta skill fornece instruções e diretrizes práticas para criar interfaces que parecem "táteis", inspiradas no estilo macOS (Depth UI), com micro-animações fluidas e contrastes refinados.

## Diretrizes do Design System

### 1. Tipografia e Hierarquia
*   **Títulos e Métricas (Outfit):** Use a fonte `Outfit` com pesos `font-bold` (700) ou `font-black` (900). Adicione a classe `font-title` se configurado ou aplique diretamente em títulos de modais, cabeçalhos de tabelas importantes e cards de métricas.
*   **Textos e Tabelas (Inter):** Use a fonte `Inter` para prontuários, inputs, parágrafos de explicação e listagens.
*   **Letras Minúsculas em Badges/Labels:** Badges e sub-títulos pequenos devem usar `text-[10px]` ou `text-[9px]`, com `font-bold` ou `font-extrabold` e rastreamento leve (`tracking-wider` ou `tracking-widest`).

### 2. Efeito Físico macOS (macOS Depth Button)
Todo botão principal deve passar a sensação física de profundidade e clique:
*   **Base:** Cantos arredondados generosos (`rounded-xl` / 12px), borda interna sutil e sombra fina.
*   **Código de Exemplo (Tailwind):**
    ```jsx
    <button className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-bold text-xs shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-white/10 transition-all duration-150 ease-in-out hover:-translate-y-0.5 active:scale-[0.98] active:shadow-inner flex items-center gap-1.5">
      <Plus className="w-4 h-4" />
      Confirmar
    </button>
    ```

### 3. Cores Semânticas e Fundos
O tema escuro usa **preto neutro** (sem tom azulado). Evite `slate-800/850/900` (`#161e2e`/`#0f1624`/`#080d19`), `#0b0f19` e `#151c2c` — substitua pela família neutra abaixo:
*   **Fundo da Aplicação (Dark Mode):** `black` (`dark:bg-black`) — shell externo.
*   **Superfícies/Cards/Modais/Header (Dark Mode):** `#0D0D0D` (`dark:bg-[#0D0D0D]`).
*   **Sub-navegação (SubSidebar, Dark Mode):** `#080808` (`dark:bg-[#080808]`).
*   **Inputs/campos inset (Dark Mode):** `black` (`dark:bg-black`) ou `dark:bg-black/30` sobre superfície.
*   **Hover em superfícies (Dark Mode):** `#18181B` (`dark:hover:bg-[#18181B]`) ou `dark:hover:bg-white/10`.
*   **Badges/Chips (Dark Mode):** `dark:bg-white/5`, `dark:bg-white/10`.
*   **Bordas finas de divisores:** `border-slate-200/80` (Light) ou `dark:border-white/5` / `dark:border-white/10` (Dark).
*   **Accent/Brand:** `#196BFB` (Electric Blue) para botões primários e destaques.
*   **Success/Accent Colors:**
    *   Sucesso: `#10b981` (Emerald).
    *   Aviso/Aguardando: `#f59e0b` (Amber).
    *   Erro/Cancelado: `#ef4444` (Red).

### 4. Micro-animações com Framer Motion
Para alternância de abas, abertura de modais ou revelação de seções, sempre use animações amortecidas (spring physics):
*   **Configuração recomendada:**
    ```jsx
    import { motion } from 'framer-motion';

    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="..."
    >
      {conteudo}
    </motion.div>
    ```

### 5. Inputs Modernos
Evite inputs padrão sem estilo. O input ideal possui:
*   Fundo levemente escurecido e opaco (`bg-black/30` ou `bg-slate-50/50`).
*   Borda sutil (`border-slate-200/40` ou `border-white/10`).
*   Ícone decorativo posicionado à esquerda para dar contexto.
*   Foco suave aplicando anel e borda na cor principal.

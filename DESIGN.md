---
version: alpha
name: FlowDent / DentalFlow
colors:
  primary: "#0b0f19"
  secondary: "#196bfb"
  accent: "#d9e2ff"
  background: "#0b0f19"
  surface: "#151c2c"
  border: "rgba(255,255,255,0.1)"
  success: "#22c55e"
  warning: "#eab308"
  danger: "#ef4444"
typography:
  fontFamily: Geist, sans-serif
  h1:
    fontFamily: Geist
    fontWeight: 900
  body:
    fontFamily: Geist
    fontWeight: 400
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
rounded:
  default: 12px
  button: 12px
---

# Contrato de Design (DESIGN.md) - Odonto CRM Whitelabel

Este documento estabelece as diretrizes estéticas e os tokens de design do projeto **Odonto CRM**, servindo como contrato visual para desenvolvedores e agentes de IA, em conformidade com a especificação oficial `design.md` do Google Labs.

---

## 🎨 Paleta de Cores e Tokens Dinâmicos (White-label)

O sistema de cores do Odonto CRM é flexível. Em vez de utilizar classes de cores estáticas do Tailwind (como `bg-slate-900`), utilizamos **Variáveis CSS** mapeadas no `:root`. Isso permite que o Super Admin altere as cores da clínica logada em tempo real.

### CSS Custom Properties Mapeadas (`src/index.css`)
```css
:root {
  /* Cores padrão do sistema (Slate & Blue) */
  --color-primary: 15 23 42;    /* Equivale a slate-900 (RGB) */
  --color-secondary: 59 130 246; /* Equivale a blue-500 (RGB) */
  --color-accent: 99 102 241;   /* Equivale a indigo-500 (RGB) */
  --color-background: 248 250 252; /* Equivale a slate-50 (RGB) */
  --color-surface: 255 255 255;  /* Equivale a white (RGB) */
  --color-border: 226 232 240;   /* Equivale a slate-200 (RGB) */
  
  /* Status */
  --color-success: 34 197 94;   /* green-500 */
  --color-warning: 234 179 8;   /* yellow-500 */
  --color-danger: 239 68 68;    /* red-500 */
  --color-info: 6 182 212;      /* cyan-500 */
}
```

---

## 📐 Tipografia

Buscamos uma combinação elegante e funcional:
- **Títulos (Headings) e Corpo (Body):** Família de fontes **Geist** (`'Geist', sans-serif`). Excelente legibilidade, visual moderno, curvas limpas e sofisticação premium em todas as telas de prontuários, tabelas e agendas.

---

## 💎 Linguagem Visual: Apple macOS Depth UI

Para conferir um visual Premium, adotamos a estética **Depth UI** (Flat Moderno com profundidade tátil):

1. **Volume Físico (Efeito de Botão Físico):**
   Os botões primários devem conter uma borda interna levemente iluminada no topo e sombra projetada suave.
   - *Tailwind classes:* `shadow-[0_1px_2px_rgba(0,0,0,0.1),_0_0_0_1px_rgba(0,0,0,0.05)_inset,_0_1px_0_0_rgba(255,255,255,0.2)_inset]`
   
2. **Cards estilo macOS (Glassmorphism & Border Glow):**
   Cards e painéis usam fundo levemente translúcido se for o caso, bordas finas com baixa opacidade e sombras em múltiplas camadas para suavidade.
   - *CSS/Tailwind:* `bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.03),_0_1px_1px_rgba(0,0,0,0.01)]`

3. **Micro-interações:**
   - **Hover:** Transições de transformações suaves (`transition-all duration-200 hover:-translate-y-0.5`).
   - **Active:** Feedback de clique real (`active:scale-[0.98]`).

---

## 📂 Diretrizes de Componentes

### 1. Botão Primário Tátil
```html
<button class="relative overflow-hidden bg-primary text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_0_rgba(255,255,255,0.2)_inset] hover:-translate-y-0.5 active:scale-[0.97] active:shadow-inner">
  Confirmar Consulta
</button>
```

### 2. Card Premium (Vibe Apple)
```html
<div class="bg-white/90 backdrop-blur-md border border-slate-200/40 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02),_0_1px_2px_rgba(0,0,0,0.01)] hover:-translate-y-0.5 transition-transform duration-300">
  <h3 class="text-lg font-bold text-slate-800">Paciente</h3>
  <p class="text-sm text-slate-500">Dr. Pedro Ramos</p>
</div>
```

---

## 🔄 Fluxo de Resolução de Cores do Inquilino

1. O usuário entra em `http://odontocrm.com/login` (ou através de um subdomínio).
2. O sistema faz uma requisição ao Supabase para verificar a clínica associada a esse usuário ou domínio.
3. Após recuperar o registro da clínica (ex: `{ primary_color: '#1e3a8a', secondary_color: '#0d9488', logo_url: '...' }`):
4. O `ThemeContext` roda uma função utilitária para converter essas cores em RGB e injetar no `:root` do documento:
   ```javascript
   document.documentElement.style.setProperty('--color-primary', '30 58 138');
   document.documentElement.style.setProperty('--color-secondary', '13 148 136');
   ```
5. Todo o CSS que consome as variáveis dinâmicas se ajusta instantaneamente, aplicando a nova identidade visual.

---
name: odontocrm-design-audit
description: Auditoria de alinhamento visual, motion e consistência do OdontoCRM. Use quando for auditar ou revisar telas do app para alinhá-las ao Design System macOS Depth UI (odontocrm-ui) e aos princípios de interface/motion da Apple (apple-design). Verifica tokens, tipografia, springs, materiais/depth, estados de feedback, acessibilidade e consistência entre módulos, gerando achados com arquivo:linha e prioridade.
---

# OdontoCRM Design Audit

Checklist único de auditoria para alinhar **todo o app** ao Design System do OdontoCRM (`odontocrm-ui`) e aos princípios Apple (`apple-design`). Use os dois referenciais em conjunto: o DS define os **tokens e componentes**, o apple-design define **como o movimento e a hierarquia devem se comportar**.

## Como executar

1. Leia as skills `odontocrm-ui` e `apple-design` antes de auditar.
2. Audite por cluster de arquivos (nunca arquivo solto sem contexto do módulo).
3. Para cada arquivo, registre apenas achados **com `arquivo:linha`** e **prioridade** (`CRITICO` / `MEDIO` / `POLISH`).
4. Não sugira mudança que contradiga outra regra do checklist — se houver conflito, registre ambos e marque `CONFLITO`.
5. Ao final, consolide em relatório agrupado por eixo e por severidade.

## Eixos de auditoria

### 1. Design tokens (fonte: AGENTS.md + odontocrm-ui)
- Fundo dark NEUTRO (sem tom azulado): shell/fundo `black` (`dark:bg-black`); superfícies/cards/modais `#0D0D0D` (`dark:bg-[#0D0D0D]`); inputs `black`.
- **PROIBIDO (legado):** `#0b0f19`, `#151c2c`, `slate-800/850/900`, `#121827` — tons azulados antigos. Qualquer azul neutro tipo `#182730`, `#111c24`, `#0c141a` também é divergência (exceto o verde de marca do WhatsApp `#00a884`/`#008069`, anotado como intenção).
- Accent oficial: `#196BFB` (Electric Blue), Navy `#03269A`. Sucesso `#10b981`, Aviso `#f59e0b`, Erro `#ef4444`.
- Bordas finas: `border-slate-200/50` (light) / `border-white/5` ou `border-white/10` (dark).
- Procure valores hardcoded inconsistentes que divergem — registre com o valor encontrado.
- Verifique paridade claro/escuro: cada tela tem `dark:` para o mesmo elemento?

### 2. Tipografia (fontes: odontocrm-ui + apple-design §15)
- Títulos/métricas: fonte `Outfit` (`font-title`), pesos `font-bold`/`font-black`.
- Corpo/tabelas: `Inter`.
- Badges/labels: `text-[9px]`/`text-[10px]`, `font-bold`, `tracking-wider/widest`.
- **Tracking size-specific** (apple-design): título grande com `-0.02em`, corpo próximo de `0` — nunca um único `letter-spacing` para tudo.
- **Leading inverso**: títulos grandes com line-height justo, corpo folgado.
- Hierarquia construída com **peso + tamanho + leading** em conjunto, não só tamanho.
- Escala com `rem`/`em` (não px fixo) para respeitar ajuste de fonte do usuário.

### 3. Motion & springs (fontes: AGENTS.md + odontocrm-ui §4 + apple-design §1-6)
- AGENTS.md manda **Framer Motion** com spring physics. Padrão DS: `{ type: 'spring', stiffness: 300, damping: 25 }` (equivalente a damping 1.0, sem overshoot).
- **CLASSES CSS `animate-in`/`fade-in`/`zoom-in-95`/`slide-in-from-*`/`animate-fadeIn` SÃO MORTAS** — o plugin `tailwindcss-animate` NÃO está instalado (`tailwind.config.js` tem `plugins: []`). Todo elemento que anima SÓ com essas classes na prática NÃO anima → registrar como MEDIO "sem animação" e recomendar Framer Motion.
- Feedback no pointer-down, não só no hover/release: `active:scale-[0.98]` + `active:shadow-inner` presente nos botões primários.
- Sem atrasos/latências artificiais desnecessárias no caminho de input.
- **Interrupção**: transições devem ser interrompíveis — preferir springs (animam do valor atual) a `@keyframes`/transições CSS fixas em elementos interativos.
- **Bounce só para momentum**: sem overshoot em fade-in de menu; bounce é aceitável em gesture com "flick" (ex.: abas/drawers).
- Contraste `prefers-reduced-motion: reduce` → cross-fade em vez de slide/spring; `prefers-reduced-transparency: reduce` → superfícies opacas.

### 4. Materiais & depth (fonte: apple-design §12)
- Nav/toolbar/sheets **translúcidos** (`backdrop-filter: blur()`) com conteúdo rolando por baixo — ou justifique a barra opaca.
- Material mais pesado em regiões estruturais (sidebar); mais leve em elementos interativos. **Nunca empilhar superfície clara translúcida sobre outra**.
- Superfícies maiores = blur mais forte + sombra mais profunda.
- Modal → scrim + fundo empurrado para trás. Painel paralelo não-bloqueante → translucidez sem scrim.
- Texto sobre superfícies translúcidas: contraste maior, peso maior, leve bump de letter-spacing.
- **Materialize, não só fade**: animar blur + scale juntos na entrada/saída de superfícies glass.
- Efeito de borda de scroll (fade/máscara) em vez de divisor 1px rígido onde UI flutuante sobrepõe conteúdo.

### 5. Estados de feedback (fontes: apple-design §16 + odontocrm-ui)
- Quatro tipos: **status, conclusão, aviso, erro** — cada ação significativa confirma, cada problema é avisado.
- **Empty states** em todas as listas/tabelas (nunca tela "morta" sem explicação + CTA).
- Loading states (skeleton/spinner) em carregamentos assíncronos.
- Estados disabled/error de inputs visíveis.
- Hover/active/focus em todos os elementos clicáveis.
- Botões destrutivos exigem confirmação (uso criterioso de `confirm`).

### 6. Acessibilidade (fontes: apple-design §14 + §16)
- Foco visível (`focus-visible`) em todos os elementos interativos.
- Contraste de texto adequado (especialmente sobre cores de fundo coloridas/translúcidas).
- `aria-label`/`title` em botões somente-ícone.
- `prefers-reduced-motion` e `prefers-reduced-transparency` respeitados.
- **Wayfinding**: toda tela responde "Onde estou? Para onde posso ir? O que há aqui? Como saio?"
- Labels diretos e específicos (nomear pelo conteúdo, não por guarda-chuvas genéricos).

### 7. Consistência entre módulos
- Mesma ação usa o **mesmo componente** (ex.: botão primário, card de métrica, empty state) em todas as telas.
- Componentes compartilhados existentes (`ui/Button`, `ui/Card`, `ui/Badge`) são usados ou há re-implementação duplicada?
- Mesmos padrões de modal, tabela, filtro, form entre módulos.
- Contraste entre módulos: padrões **idênticos** para a mesma coisa = consistência; diferenças propositais = anotar a intenção.

## Formato do relatório

```
# Auditoria de Design — OdontoCRM

## Resumo executivo
- X críticos / Y médios / Z polish em N arquivos.

## Achados por eixo
### Tokens
- [CRITICO] src/pages/...:linha — descrição
- [MEDIO] ...

### Tipografia
...

## Top inconsistências entre módulos
...

## Recomendação de ordem de correção
1. ...
```

## Regras de severidade
- **CRITICO**: quebra de legibilidade/uso (contraste, foco invisível, botão morto, sobreposição), divergência grave de token que destoa do resto do app.
- **MEDIO**: spring/motion inexistente onde o DS manda, estado vazio ausente, material/depth fora do padrão, tracking/leading claramente errado.
- **POLISH**: detalhes finos (bounce indevido, sombra exagerada, `letter-spacing` levemente fora, duplicação leve).

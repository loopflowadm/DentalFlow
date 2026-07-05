# FlowDent — Mecanismo de Busca Global (Search Architecture)
**Versão:** 1.0.0  
**Autor:** Tech Lead & Principal Database Engineer  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve a arquitetura do mecanismo de **Busca Global** do **FlowDent**. O sistema implementa uma barra de busca rápida (Command Palette) acionada por atalho de teclado (`CMD+K`) e um sistema híbrido de busca textual rápida (Full-Text Search) e busca semântica por inteligência artificial para que os usuários localizem qualquer informação instantaneamente.

---

## 2. Experiência de Interface: Paleta de Comandos (`CMD+K`)
*   **Visual:** Uma janela modal flutuante que se abre centralizada na tela com um fundo escurecido e desfocado.
*   **Velocidade:** Resultados aparecem conforme o usuário digita (Debounce de **150ms** no lado do cliente), com tempo de resposta de pesquisa inferior a **30 milissegundos** no servidor.
*   **Ações Inteligentes (Command Actions):** Além de buscar registros, a paleta aceita comandos de ação direta para agilizar a operação (ex: digitar *"Criar paciente"* seleciona a ação que abre a tela de cadastro; digitar *"Ver agenda"* muda a aba ativa).

---

## 3. Busca Híbrida no Banco de Dados (Textual + Semântica)

O motor de busca do FlowDent combina duas tecnologias complementares para entregar resultados precisos:

```
  ┌────────────────────────────────────────────────────────┐
  │ USUÁRIO DIGITA: "Maria com dor no molar"               │
  └───────────────────────────┬────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
  ┌───────────▼──────────────────┐┌───────────▼──────────────────┐
  │ 1. Busca Lexical (Full-Text) ││ 2. Busca Semântica (Vector)  │
  │ • Postgres to_tsquery        ││ • Embedding Gemini-2.5-Flash │
  │ • Index GIN (Palavras exatas)││ • Proximidade de Cosseno HNSW│
  └───────────┬──────────────────┘└───────────┬──────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              │ Combina Resultados (RRF)
  ┌───────────────────────────▼────────────────────────────┐
  │ RESULTADOS: Paciente Maria Oliveira (Dente 16 dolorido)│
  └────────────────────────────────────────────────────────┘
```

### I. Busca Textual Lexical (PostgreSQL tsvector)
Utiliza a pesquisa textual nativa do Postgres indexada por índices GIN em colunas unificadas de busca (ex: nome, CPF, prontuário, telefone):

```sql
-- Query executada no banco de dados filtrada por tenant
SELECT id, name, phone, ts_rank(search_vector, to_tsquery('portuguese', 'maria:*')) AS rank
FROM public.patients
WHERE clinic_id = current_setting('app.current_clinic_id', true)::uuid
  AND search_vector @@ to_tsquery('portuguese', 'maria:*')
ORDER BY rank DESC
LIMIT 10;
```

### II. Busca Semântica (pgvector HNSW)
*   **Uso:** Quando o dentista faz uma busca conceitual no prontuário (ex: *"pacientes cardíacos"* ou *"procedimentos de implante concluídos"*).
*   **Funcionamento:** O termo é convertido em um vetor utilizando a API de embeddings do Gemini. A query faz uma busca no banco usando a extensão `pgvector` por menor distância de cosseno (`<=>`), retornando dados contextuais mesmo que as palavras exatas não coincidam.

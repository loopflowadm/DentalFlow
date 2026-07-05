# Módulo: Odontograma FDI Interativo (Odontogram Module Specification)
**Versão:** 1.0.0  
**Autor:** Principal UX Designer & Lead Database Architect  
**Status:** Aprovado  

---

## 1. Objetivo
O objetivo do módulo de **Odontograma** é fornecer uma representação visual interativa da arcada dentária do paciente (notação FDI), permitindo que o dentista registre rapidamente intervenções, anomalias e tratamentos em lote com o menor número de cliques possível, integrando as marcações diretamente ao prontuário e ao financeiro.

---

## 2. Descrição e Escopo
O odontograma exibe graficamente os 32 dentes permanentes divididos em quadrantes. Ele suporta dois modos operacionais: Modo Seleção (para detalhar um dente por vez e ver seu histórico individual) e o **Modo Pincel Rápido** (para pintar múltiplos dentes em lote selecionando previamente o procedimento e o status).

### Dentro do Escopo (In Scope)
*   Renderização vetorial SVG de alta performance dos 32 dentes da arcada adulta.
*   Modo Pincel Rápido com barra de ferramentas flutuante de status e procedimentos.
*   Sinalização de cores padronizada (ex: Vermelho para *Necessita Tratamento*, Azul para *Tratado*).
*   Geração automática de itens de evolução clínica e pendências de faturamento financeiro ao pintar.

### Fora do Escopo (Out of Scope)
*   Assinatura de receitas digitais (gerenciada por **Clínico**).
*   Lançamento de cirurgias hospitalares complexas fora da arcada padrão.

---

## 3. Regras de Negócio
*   **RN-001: Padrão de Notação FDI:** A numeração dos dentes deve seguir a notação internacional da Federação Dentária Internacional (FDI), numerando os quadrantes:
    *   *Quadrante 1 (Superior Direito):* Dentes 11 ao 18.
    *   *Quadrante 2 (Superior Esquerdo):* Dentes 21 ao 28.
    *   *Quadrante 3 (Inferior Esquerdo):* Dentes 31 ao 38.
    *   *Quadrante 4 (Inferior Direito):* Dentes 41 ao 48.
*   **RN-002: Lançamento Automático Financeiro:** Marcar um dente como "Necessita Tratamento" cria automaticamente um item no orçamento em aberto do paciente com o valor padrão do procedimento selecionado. Marcar como "Tratado" liquida o item do orçamento.
*   **RN-003: Histórico por Dente:** Cada dente armazena seu histórico individual de marcações. Ao pintar um dente que já possui histórico, o sistema apenas acrescenta a nova linha de log sem apagar o histórico de tratamentos anteriores dele.

---

## 4. Fluxo e Casos de Uso (Use Cases)

### Caso de Uso: Pintar Dente com Pincel Rápido
*   **Atores:** Dentista.
*   **Fluxo Principal:**
    1.  O dentista abre a ficha de odontograma do paciente.
    2.  Ativa o *Modo Pincel*.
    3.  Na barra de ferramentas, seleciona: Procedimento: *Canal*, Status: *Necessita Tratamento*.
    4.  Clica sobre o desenho do dente 16 e do dente 17.
    5.  **Ação do Sistema:**
        *   Muda o preenchimento SVG dos dentes 16 e 17 para a cor vermelha (latência < 50ms).
        *   Cria registros de pendência clínica na tabela do paciente.
        *   Gera pendência no contas a receber do paciente.
        *   Emite um alerta visual flutuante (Toast) confirmando a pintura.

---

## 5. Wireframe em Texto (Painel e Toolbar do Odontograma)
```
┌────────────────────────────────────────────────────────┐
│ ODONTOGRAMA FDI INTERATIVO                             │
├────────────────────────────────────────────────────────┤
│ [ Modo: Pincel 🖌️ ]  Procedimento: [ Canal     ] [v]    │
│                      Status:       [ Vermelho  ] [v]    │
├────────────────────────────────────────────────────────┤
│        Superior:                                       │
│        [18] [17] [16] [15] [14] [13] [12] [11]         │
│        [21] [22] [23] [24] [25] [26] [27] [28]         │
│                                                        │
│        Inferior:                                       │
│        [48] [47] [46] [45] [44] [43] [42] [41]         │
│        [31] [32] [33] [34] [35] [36] [37] [38]         │
├────────────────────────────────────────────────────────┤
│ * Legenda: [■ Vermelho: Necessita] [■ Azul: Concluído] │
└────────────────────────────────────────────────────────┘
```

---

## 6. Banco de Dados e Relacionamentos
O estado do odontograma é armazenado de forma flexível em um objeto JSONB na tabela do paciente para garantir carregamento instantâneo do estado completo da arcada:

```sql
-- Estrutura interna do campo JSONB 'odontogram' em public.patients
{
  "dentes": {
    "16": {
      "status": "NECESSITA_TRATAMENTO",
      "procedure": "Canal",
      "updated_at": "2026-07-03T15:52:00Z"
    },
    "26": {
      "status": "TRATADO",
      "procedure": "Limpeza",
      "updated_at": "2026-06-15T10:00:00Z"
    }
  }
}
```

---

## 7. Endpoints & Payloads da API
*   **Atualizar Arcada (Pintar Dentes):**
    *   `PATCH /api/v1/patients/{id}/odontogram`
    *   *Payload:* `{ "toothNumber": 16, "status": "NECESSITA_TRATAMENTO", "procedure": "Canal" }`
    *   *Response (`200 OK`):* `{ "success": true, "data": { "toothNumber": 16, "status": "NECESSITA_TRATAMENTO" } }`

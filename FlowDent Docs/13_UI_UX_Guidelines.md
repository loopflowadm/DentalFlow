# FlowDent — Diretrizes de UI/UX (UX Guidelines & Agility)
**Versão:** 1.0.0  
**Autor:** Principal UX Designer  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve as diretrizes de experiência do usuário (UX) e usabilidade aplicadas no **FlowDent**. O foco principal é a **agilidade clínica** e a redução da carga cognitiva, otimizando o fluxo de trabalho de dentistas e secretárias através de atalhos rápidos, componentes inteligentes e layouts consistentes.

---

## 2. Atalhos de Teclado Globais (Keyboard Shortcuts)
Clínicas odontológicas de alto fluxo demandam agilidade. Os profissionais devem conseguir navegar pelo sistema sem retirar as mãos do teclado sempre que possível.

### Mapeamento de Atalhos Críticos
*   **`CMD + K` / `CTRL + K` (Busca Universal):** Abre instantaneamente a barra de busca flutuante para procurar pacientes, consultas ou configurações de qualquer tela da aplicação.
*   **`ESC` (Fechar Gavetas e Painéis):** Fecha modais abertos, drawers (gavetas) laterais ou cancela o modo de edição ativo.
*   **`ALT + A` (Nova Consulta):** Abre a tela de agendamento na agenda.
*   **`ALT + P` (Modo Pincel Odontograma):** Ativa/Desativa o modo pincel rápido na aba de odontograma quando a ficha de um paciente estiver aberta.

### Implementação Técnica do Listener React
```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpenSearchModal(true);
    }
    if (e.key === 'Escape') {
      setOpenSearchModal(false);
      setOpenDrawer(false);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 3. Comportamento das Gavetas Laterais (Slide-over Drawer)
Em vez de abrir modais centrais que bloqueiam totalmente o contexto anterior, o FlowDent prioriza gavetas laterais (Slide-overs) que deslizam da direita para a esquerda:

*   **Uso:** Detalhes de um Lead no CRM Kanban, Ficha rápida de consulta na Agenda e histórico de evoluções.
*   **Comportamento:**
    *   **Animação:** Deslizar suave a partir da direita (`x: 0` a partir de `x: 100%`) com desfoque de fundo (`backdrop-blur-sm bg-slate-950/20`).
    *   **Área Externa:** Clicar na área com desfoque externa à gaveta (Overlay) salva as alterações automaticamente como rascunho e fecha a gaveta.
    *   **Conteúdo Interno:** Organizado em abas internas verticais ou horizontais bem definidas para evitar barras de rolagem infinitas.

---

## 4. Agilidade Clínica no Odontograma FDI
O Odontograma é a tela mais utilizada pelo dentista. Exigir que o dentista clique em um dente, depois em um menu, selecione o procedimento, clique em salvar e confirme em um modal de confirmação para cada dente é inaceitável.

### Diretriz do Modo Pincel Rápido (Quick Paint Mode)
*   **Cursor visual:** Quando o modo pincel está ativo, o cursor do mouse se transforma em um ícone de pincel colorido que representa o status do tratamento selecionado.
*   **Confirmação visual instantânea:** O clique no dente altera sua cor na hora e exibe um **Feedback Toast** discreto de 1.5s no canto inferior direito informando: *"Procedimento adicionado ao histórico do dente 16"*.
*   **Salvamento Automático (Auto-Save):** Toda alteração é salva no banco de dados local (com sincronização assíncrona) 1 segundo após o último clique (Debounce), eliminando o botão "Salvar Ficha".

---

## 5. Estados Vazios (Empty States)
Nenhuma tela do sistema deve apresentar apenas uma mensagem sem graça como *"Nenhum dado encontrado"*.
*   **Componente de Empty State:** Deve conter uma ilustração vetorial minimalista, um título explicativo do motivo da ausência de dados, um texto descritivo amigável e um botão de ação primária destacado (ex: *"Você ainda não cadastrou nenhum fornecedor. Clique abaixo para adicionar o primeiro"*).

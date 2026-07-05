# FlowDent — Requisitos Funcionais (FRD)
**Versão:** 1.0.0  
**Autor:** Lead Product Manager  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve os requisitos funcionais detalhados do sistema **FlowDent**. Ele detalha os recursos que os usuários poderão utilizar em todos os módulos operacionais da plataforma.

---

## 2. Matriz de Requisitos Funcionais (Módulos Críticos)

| ID | Módulo | Requisito Funcional | Descrição | Nível de Prioridade |
| :--- | :--- | :--- | :--- | :--- |
| **RF-001** | **CRM** | Kanban Comercial Dinâmico | Exibir as 12 etapas do funil de vendas em colunas interativas, permitindo arrastar os leads (drag-and-drop). | Alta |
| **RF-002** | **CRM** | Gaveta Lateral de Detalhes | Exibir timeline de atividades do lead, anotações rápidas, tarefas pendentes, históricos e arquivos carregados. | Alta |
| **RF-003** | **Pacientes** | Ficha do Paciente | Apresentar histórico de anamnese, prontuários, evoluções clínicas sequenciais e odontograma. | Alta |
| **RF-004** | **Pacientes** | Odontograma com Modo Pincel | Permitir selecionar um procedimento clínico e aplicar diretamente a dentes individuais com cliques em lote, sem janelas modais intermediárias. | Alta |
| **RF-005** | **Agenda** | Calendário Multi-Visualização | Oferecer filtros por dia, semana, mês, consultórios/salas e profissionais, permitindo drag-and-drop para reagendar. | Alta |
| **RF-006** | **WhatsApp** | Central Omnichannel | Chat integrado onde atendentes humanos conversam, geram links de agendamento e assumem a conversa pausando a IA. | Alta |
| **RF-007** | **AI** | Agendador Sofia | A IA deve processar o áudio ou texto do paciente, interagir chamando APIs locais para buscar horários e agendar. | Alta |
| **RF-008** | **Automações** | Editor Visual de Regras | Interface gráfica para arrastar nós de gatilhos, condições de filtro (ex: prioridade) e ações automáticas (ex: enviar mensagem). | Média |
| **RF-009** | **Financeiro** | Fluxo de Caixa Integrado | Registro automático de receitas vinculadas a pagamentos efetuados e despesas de fornecedores com fluxo de DRE. | Média |

---

## 3. Especificação Detalhada de Fluxos Operacionais

### Fluxo 1: Lançamento Clínico no Odontograma FDI (Pincel Rápido)
*   **Atores:** Dentista.
*   **Ação:** O dentista entra na aba **Odontograma** da ficha do paciente.
*   **Fluxo de Execução:**
    1.  O sistema apresenta a arcada dentária com 32 dentes no padrão de notação FDI.
    2.  O dentista ativa o botão de alternância para o **Modo Pincel Rápido**.
    3.  Seleciona o procedimento (ex: *Restauração de Resina*) e o status do dente (ex: *Necessita Tratamento*).
    4.  O dentista clica diretamente no dente 16 e 26.
    5.  **Ações do Sistema em Tempo Real:**
        *   A cor do dente muda instantaneamente na tela.
        *   Adiciona uma linha no histórico de evolução: *"Dente 16: Restauração de Resina - Necessita Tratamento"*.
        *   Gera um item de orçamento pendente no financeiro do paciente.
        *   Persiste os dados localmente (se offline) e sincroniza via Supabase.

### Fluxo 2: Confirmação de Consulta por IA (Sofia)
*   **Atores:** IA Sofia, Paciente.
*   **Fluxo de Execução:**
    1.  O sistema roda um Job assíncrono (BullMQ) 24h antes da consulta.
    2.  A Sofia envia uma mensagem de confirmação via WhatsApp para o paciente.
    3.  O paciente responde com um áudio: *"Oi, eu não vou conseguir ir amanhã, posso trocar para quinta às duas da tarde?"*.
    4.  O webhook da Evolution API recebe o áudio e aciona a Edge Function.
    5.  A Edge Function converte o áudio em texto (Whisper) e aciona a Sofia (LangGraph).
    6.  **Ações da Sofia:**
        *   Identifica a intenção de reagendamento.
        *   Chama a ferramenta `get_available_slots` pesquisando quinta-feira.
        *   Se houver o horário das 14:00h livre, chama `book_appointment`, atualizando a consulta antiga para cancelada e inserindo a nova.
        *   Responde ao paciente: *"Tudo certo! Cancelei a consulta de amanhã e te agendei para quinta às 14:00h. Te vejo lá! 🦷✨"*.
        *   Envia uma notificação sonora na tela da secretária.

---

## 4. Matriz de Permissões Funcionais (RBAC)

Para garantir a integridade dos dados clínicos e financeiros, o acesso aos recursos é limitado por cargos:

| Recurso | Super Admin | Gestor da Clínica | Dentista | Secretária | Financeiro |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Configurar Integração Supabase/Evolution | **Sim** | Não | Não | Não | Não |
| Cadastrar Clínicas e Temas (Whitelabel) | **Sim** | Não | Não | Não | Não |
| Visualizar DRE Financeiro e Lucro Bruto | **Sim** | **Sim** | Não | Não | **Sim** |
| Alterar Prontuário e Evolução Clínica | Não | **Sim** | **Sim** | Não | Não |
| Visualizar e Reagendar Agenda Geral | Não | **Sim** | **Sim** (Apenas sua) | **Sim** | Não |
| Gerenciar Construtor de Automações | **Sim** | **Sim** | Não | Não | Não |

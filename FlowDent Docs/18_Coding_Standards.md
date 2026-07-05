# FlowDent — Padrões de Código e Diretrizes de Engenharia (Coding Standards)
**Versão:** 1.0.0  
**Autor:** Principal Engineer & Tech Lead  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento formaliza as regras de estilo de código, padrões de nomenclatura, boas práticas de engenharia e diretrizes de desenvolvimento do **FlowDent**. O cumprimento destas normas é obrigatório para todas as equipes de engenharia, garantindo a manutenibilidade, legibilidade e manuseio seguro do código TypeScript tanto no backend (NestJS) quanto no frontend (React).

---

## 2. Diretrizes Gerais de Desenvolvimento (SOLID & Clean Code)

As seguintes regras devem ser respeitadas em todos os níveis do sistema:

*   **Princípio de Responsabilidade Única (SRP):** Cada arquivo de classe, hook ou componente deve realizar apenas **uma função específica**. Se um Use Case do CRM estiver calculando comissão ou enviando WhatsApp, divida-o disparando eventos para a fila.
*   **Princípio Aberto/Fechado (OCP):** Comportamentos novos devem ser injetados por meio de herança ou polimorfismo de interfaces. Por exemplo, novos tipos de nós do construtor de automações devem estender a classe abstrata `AutomationNode` sem modificar o motor de execução principal.
*   **Inversão de Dependências (DIP):** Camadas de aplicação (Use Cases) não devem depender diretamente de clientes de banco ou SDKs externos (ex: Prisma, Evolution API). Devem depender de interfaces de repositórios/gateways declaradas na camada de domínio.

---

## 3. Padrões de Nomenclatura (Naming Conventions)
*   **Pastas e Arquivos:** Usar `kebab-case` para todas as pastas e arquivos de componentes/recursos (ex: `create-patient.use-case.ts`, `odontogram-panel.tsx`).
*   **Classes, Interfaces e Enums:** Usar `PascalCase` (ex: `PatientRepository`, `IAuthService`, `AppointmentStatus`).
*   **Variáveis e Funções:** Usar `camelCase` (ex: `const activePatients = ...`, `function calculateCommission()`).
*   **Tabelas e Colunas no Banco:** Usar `snake_case` em todas as tabelas e colunas do PostgreSQL (ex: `chat_messages`, `is_bot_paused`).

---

## 4. Tratamento de Erros e Exceções Padronizado
Erros não devem vazar para o cliente de forma genérica. Todo o backend implementa um padrão de tratamento de exceções baseado em **Domain Exceptions**:

1.  **Exceção de Domínio:** Se uma regra de negócio for violada, lançamos uma exceção estendendo a classe base `DomainException` (ex: `throw new PatientInadimplenteException()`).
2.  **Filtro Global de Exceções (NestJS HttpFilter):** Captura todas as exceções não tratadas.
    *   Se for uma `DomainException`, mapeia para o status HTTP adequado (geralmente `400` ou `409`) e retorna uma resposta JSON limpa para o cliente.
    *   Se for um erro de sistema (banco, timeout), registra o stack trace completo no monitoramento e retorna um erro genérico `500` amigável sem expor detalhes sensíveis de infraestrutura.

```typescript
// Estrutura de Retorno de Erro HTTP Padronizado
{
  "success": false,
  "errorCode": "PATIENT_INADIMPLENTE",
  "message": "O paciente possui parcelas vencidas há mais de 30 dias.",
  "timestamp": "2026-07-03T15:52:00.000Z",
  "path": "/api/v1/appointments"
}
```

---

## 5. Práticas Específicas de React (Frontend)
*   **Sem Efeitos Colaterais no Render:** Funções executadas durante o ciclo de renderização do React devem ser puras. Chamadas de rede e escritas no localStorage pertencem exclusivamente a eventos ou hooks `useEffect`.
*   **Uso Correto de Contexto:** Contextos (como `ClinicContext` e `AuthContext`) devem gerenciar apenas dados compartilhados globalmente por múltiplos módulos (como informações do usuário logado ou estado de sincronização). Estados específicos de componentes locais devem permanecer restritos ao hook `useState` do próprio componente ou de sua gaveta lateral para evitar renderizações em cascata desnecessárias.

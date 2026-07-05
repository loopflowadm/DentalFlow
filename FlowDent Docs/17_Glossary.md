# FlowDent — Glossário do Produto (Glossary)
**Versão:** 1.0.0  
**Autor:** Lead Technical Writer  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento reúne e conceitua termos técnicos, termos médicos odontológicos e conceitos de negócio utilizados em toda a documentação do **FlowDent**. O glossário garante o alinhamento de comunicação entre desenvolvedores, gestores de produto, profissionais de marketing e clientes.

---

## 2. Termos Técnicos (Tecnologia & Arquitetura)

*   **Row-Level Security (RLS):** Mecanismo de segurança do PostgreSQL que filtra quais linhas de uma tabela podem ser retornadas ou manipuladas por uma determinada transação, baseando-se no ID da clínica (Tenant) ativa.
*   **Directed Acyclic Graph (DAG):** Um grafo direcionado acíclico, ou seja, uma rede de nós conectados onde não existem loops de retorno infinitos. É a estrutura de dados utilizada para salvar as automações no banco e guiar a execução do motor visual de tarefas.
*   **pgvector:** Extensão nativa do PostgreSQL que permite salvar e consultar coleções de vetores (embeddings), utilizada na busca semântica e na memória de longo prazo das inteligências artificiais.
*   **Embeddings:** Representações numéricas de texto geradas por modelos de linguagem que capturam o significado semântico de palavras ou frases, facilitando buscas por similaridade.
*   **Retrieval-Augmented Generation (RAG):** Técnica que consiste em buscar fatos externos relevantes em uma base de dados vetorial e injetá-los no prompt do modelo de linguagem antes de gerar a resposta, garantindo respostas embasadas.
*   **Correlation ID:** Identificador exclusivo gerado no início de uma requisição ou evento que é propagado por todas as filas (BullMQ, Redis) e logs, permitindo rastrear o fluxo completo de uma transação distribuída nos servidores.
*   **Role-Based Access Control (RBAC):** Controle de acesso baseado em funções, onde as permissões do usuário dentro da aplicação são dadas de acordo com o seu cargo/função (ex: Dentista, Secretária, Administrador).

---

## 3. Termos Clínicos (Odontologia & Operação)

*   **Notação FDI:** Sistema internacional de numeração dentária criado pela Federação Dentária Internacional. A arcada adulta é dividida em 4 quadrantes (1 a 4) e cada quadrante possui 8 dentes (1 a 8). Por exemplo, o dente "16" é o primeiro molar superior direito.
*   **Odontograma:** Representação gráfica ou visual da arcada dentária de um paciente. Utilizado pelos dentistas para registrar procedimentos realizados, tratamentos pendentes, lesões de cárie e implantes de forma rápida.
*   **Anamnese:** Questionário ou entrevista inicial preenchida pelo paciente detalhando seu histórico médico, alergias, cirurgias anteriores e problemas de saúde crônicos. Essencial para garantir a segurança dos procedimentos.
*   **Evolução Clínica:** Registro sequencial datado que o dentista lança no prontuário após cada atendimento do paciente, detalhando os procedimentos realizados, anestésicos utilizados e as orientações pós-operatórias fornecidas.
*   **Plano de Tratamento:** Proposta comercial e clínica gerada pelo dentista reunindo um conjunto de procedimentos odontológicos recomendados para solucionar os problemas bucais do paciente, associados a orçamentos e parcelamentos.

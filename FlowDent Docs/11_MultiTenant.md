# FlowDent — Arquitetura Multi-Tenant (Multi-Tenancy Guide)
**Versão:** 1.0.0  
**Autor:** Principal Lead Architect  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve os padrões e mecanismos de **Multi-Tenancy** do **FlowDent**. O produto é projetado como uma plataforma SaaS Whitelabel de alta densidade compartilhando a mesma infraestrutura computacional e lógica de banco de dados (Shared Database), com isolamento estrito de inquilinos (Tenants), suporte a domínios personalizados e customização estética dinâmica.

---

## 2. Abordagem de Isolamento: Banco de Dados Compartilhado (Logical Isolation)

Diferente de modelos de isolamento físico (banco de dados por cliente), que encarecem o custo de infraestrutura e dificultam atualizações de schema, a FlowDent adota **Banco de Dados Compartilhado com Isolamento Lógico (RLS)**:

*   **Tabela Principal:** A tabela `clinics` define o inquilino raiz.
*   **Filtro Universal:** Todas as tabelas filhas (ex: `patients`, `appointments`, `inventories`, `transactions`) possuem uma chave estrangeira `clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE`.
*   **Chave Única nos Índices:** Todos os índices de busca e chaves primárias compostas incluem `clinic_id` como o primeiro elemento do índice, forçando o planejador de queries do PostgreSQL a pesquisar apenas dentro da partição lógica do inquilino.

---

## 3. Resolução do Tenant por Requisição (Tenant Resolution)

O sistema descobre qual é a clínica ativa na requisição com base nos seguintes métodos de roteamento, processados em ordem de prioridade pelo Middleware:

```
  ┌────────────────────────────────────────────────────────┐
  │ 1. HEADER HTTP 'Authorization' (JWT Token)              │
  │    • Lê claim 'user_metadata.clinic_id' do token.      │
  └───────────────────────────┬────────────────────────────┘
                              │ Se ausente (Acesso Anônimo/Whitelabel)
  ┌───────────────────────────▼────────────────────────────┐
  │ 2. DOMÍNIO DE ORIGEM (Host Header)                      │
  │    • Busca clínica cadastrada com domínio 'app.cli.com'│
  └───────────────────────────┬────────────────────────────┘
                              │ Se ausente
  ┌───────────────────────────▼────────────────────────────┐
  │ 3. SUBDOMÍNIO PADRÃO (Tenant Subdomain)                │
  │    • Extrai 'clinica-a' de 'clinica-a.flowdent.com.br' │
  └────────────────────────────────────────────────────────┘
```

---

## 4. Domínios Personalizados e Gerenciamento de SSL
Clínicas de grande porte ou franquias podem usar seus próprios domínios (ex: `app.sorrisoperfeito.com.br`) em vez do subdomínio da plataforma.

### Arquitetura de Roteamento de Domínios
1.  **Apontamento DNS:** O cliente cria um registro CNAME apontando seu domínio próprio para `cname.flowdent.com.br`.
2.  **Roteamento Vercel / Cloudflare:** A plataforma utiliza a **Vercel Domains API** (ou **Cloudflare SSL for SaaS**) para gerenciar a injeção do domínio de forma programática.
3.  **Geração de SSL:** A Vercel/Cloudflare emite e renova os certificados SSL/TLS automaticamente para os domínios adicionados via API.
4.  **Resolução no Backend:** O backend NestJS recebe o cabeçalho `Host` da requisição e pesquisa na tabela `clinics` o registro correspondente, retornando os arquivos e o tema customizado daquela clínica.

---

## 5. Whitelabel e Tematização Dinâmica
Para que a experiência seja totalmente transparente, a FlowDent injeta as definições estéticas da clínica durante a inicialização do frontend:

*   **Endpoints de Configuração:** O frontend realiza uma chamada anônima `GET /auth/theme-config` passando o subdomínio ou domínio atual.
*   **Dados de Retorno (JSON Schema):**
    ```json
    {
      "clinicId": "clinic-sorriso-perfeito-uuid",
      "name": "Sorriso Perfeito",
      "logoUrl": "https://cdn.flowdent.com.br/logos/sorriso.png",
      "primaryColor": "#0f172a",
      "secondaryColor": "#10b981",
      "accentColor": "#6366f1",
      "iconType": "🦷"
    }
    ```
*   **Aplicação de Estilo:** O React armazena essa configuração no `ThemeContext`, convertendo as cores HEX em variáveis CSS e injetando-as no elemento raiz do documento (`document.documentElement.style.setProperty`), modificando instantaneamente o visual do painel sem necessidade de rebuild.

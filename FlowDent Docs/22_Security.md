# FlowDent — Diretrizes de Segurança (Security Guidelines)
**Versão:** 1.0.0  
**Autor:** Principal Security Architect & Tech Lead  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento reúne as práticas de desenvolvimento seguro, configurações de rede, políticas de criptografia e mitigação de vulnerabilidades do **FlowDent**. O objetivo é blindar o ecossistema SaaS contra vazamento de dados, ataques cibernéticos e acessos não autorizados de acordo com as melhores práticas de mercado (OWASP Top 10 e ISO 27001).

---

## 2. Segurança de Rede e Firewalls (WAF & CORS)

*   **Web Application Firewall (WAF):** Todo o tráfego da plataforma é intermediado pelo Cloudflare WAF. O firewall é configurado para mitigar ataques DDoS, bloquear requisições de IPs suspeitos de bots conhecidos e prevenir tentativas de injeção de scripts (SQLi, XSS).
*   **Políticas de CORS (Cross-Origin Resource Sharing):**
    *   **API Principal:** O backend aceita requisições apenas de domínios explicitamente cadastrados no whitelist (ex: `*.flowdent.com.br` e domínios CNAME homologados das clínicas).
    *   **Developer Portal:** Acesso liberado de qualquer origem (`*`) apenas para rotas que utilizam validação por chaves de API restritas (`/api/v1/public/*`).
*   **TLS Obrigatório:** Todas as requisições HTTP e conexões de WebSocket devem utilizar criptografia em trânsito com protocolo **TLS 1.3** obrigatório (requisições HTTP são redirecionadas automaticamente para HTTPS).

---

## 3. Prevenção a Vulnerabilidades (OWASP Mitigations)

### I. Prevenção contra SQL Injection (SQLi)
*   **Regra de Código:** É proibido construir instruções SQL concatenando strings de variáveis enviadas pelo usuário.
*   **Prática:** Todas as interações com o banco de dados PostgreSQL devem utilizar parâmetros preparados (Prepared Statements) fornecidos nativamente pelo Prisma ORM ou Query Builder:
    ```typescript
    // Incorreto
    const query = `SELECT * FROM patients WHERE name = '${req.query.name}'`;
    
    // Correto
    const patients = await prisma.patients.findMany({
      where: { name: { contains: req.query.name } }
    });
    ```

### II. Prevenção contra Cross-Site Scripting (XSS)
*   **Sanitização de Entradas:** Todas as strings recebidas nos corpos das requisições devem passar por filtros de sanitização (usando bibliotecas como `dompurify` ou `class-validator` com sanitizadores de HTML) para remover elementos `<script>` ou eventos `onload`/`onerror`.
*   **Exibição Segura no React:** Evitar o uso da propriedade `dangerouslySetInnerHTML` no React. Se for estritamente necessária (ex: para renderizar anamneses formatadas de portais externos), sanitizar a string previamente no lado do cliente.

### III. Proteção contra Injeção de Parâmetros e Mass Assignment
*   **Uso de DTOs e Validadores:** Toda rota do NestJS deve validar o corpo da requisição usando a classe `ValidationPipe` do `class-validator`, garantindo que atributos não permitidos (como `role` ou `clinic_id`) sejam removidos do payload (opção `whitelist: true`).

---

## 4. Gestão e Rotação de Secrets
*   **Zero Hardcoding:** Nenhuma chave de criptografia, senha de banco de dados ou token de API externa pode ser inserida diretamente no código fonte da aplicação.
*   **Armazenamento Seguro:** As chaves de produção são injetadas como variáveis de ambiente gerenciadas no AWS Secrets Manager e na Vercel.
*   **Rotação Periódica:** Secrets de bancos de dados e chaves de acesso a parceiros de e-mail e SMS passam por rotação automática a cada **90 dias** gerenciada por scripts automatizados de infraestrutura.

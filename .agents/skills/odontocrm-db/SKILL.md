---
name: odontocrm-db
description: Diretrizes de persistência e consultas seguras no Supabase, isolamento de tenant (multi-clinic) e conformidade LGPD.
---

# Skill: OdontoCRM Database & Tenant Security

Esta skill orienta o agente na construção de queries, mutações de dados e tratamentos de persistência usando o Supabase client de forma segura, garantindo o isolamento multi-clínica (Multi-tenant) e a proteção de dados clínicos confidenciais (LGPD).

## Princípios de Consultas Seguras no Supabase

### 1. Isolamento Rigoroso de Tenant (Multi-clinic)
Como o sistema é um SaaS multi-clínica, **todas as requisições** ao Supabase devem ser filtradas pelo `clinic_id` da clínica ativa do usuário autenticado. 
*   **Sempre verifique** se o `user.clinic_id` ou o contexto da clínica (`useClinic()` ou `useAuth()`) está disponível e validado antes de disparar queries para tabelas clínicas (como `patients`, `appointments`, `crm_leads`, `financials`).
*   **Exemplo Prático (Filtro Obrigatório):**
    ```javascript
    // ✅ CORRETO: Consulta isolada pelo tenant da clínica
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', user.clinic_id);
    ```
    ```javascript
    // ❌ INCORRETO: Risco de vazamento de dados de outras clínicas
    const { data, error } = await supabase
      .from('patients')
      .select('*');
    ```

### 2. Mapeamento de Nomenclatura (snake_case vs. camelCase)
*   As colunas e tabelas do banco de dados PostgreSQL utilizam `snake_case` (ex: `clinic_id`, `full_name`, `appointment_date`, `is_active`).
*   No frontend, você pode usar os dados mapeados diretamente ou converter. Certifique-se de que ao enviar dados em mutações (`insert`/`update`), utilize os nomes das propriedades em `snake_case` correspondentes à tabela do Supabase.

### 3. Conformidade com a LGPD (Dados de Saúde Sensíveis)
*   **Dados de Prontuário:** Informações de anamnese, tratamentos dentários executados, prescrições e imagens de exames são dados sensíveis. Nunca exponha dados de saúde em telas públicas sem autenticação.
*   **Consentimento e Exclusão:** As operações de exclusão física de pacientes devem ser controladas ou marcadas como inativação lógica (`is_active = false`), a menos que haja solicitação explícita sob as regras da LGPD, registrando um log específico.
*   **Logs de Auditoria:** Para alterações financeiras importantes ou edição de prontuários clínicos, envie registros de auditoria para a tabela `audit_logs` registrando quem alterou, qual recurso, e a data/hora.

### 4. Tratamento de Erros de Conexão e API
Nunca permita que um erro do Supabase quebre a interface do usuário. Sempre envolva as chamadas em blocos `try/catch` e exiba estados amigáveis de erro ou notificações via toast.
*   **Estrutura Recomendada:**
    ```javascript
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', user.clinic_id);
        
      if (error) throw error;
      setAppointments(data);
    } catch (err) {
      console.error('Erro ao buscar consultas:', err.message);
      // Notificar usuário de forma amigável
      setErrorState('Não foi possível carregar as consultas da agenda. Tente novamente.');
    } finally {
      setLoading(false);
    }
    ```

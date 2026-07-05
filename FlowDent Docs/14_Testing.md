# FlowDent — Estratégia de Testes (Testing Strategy)
**Versão:** 1.0.0  
**Autor:** QA Lead & Principal Engineer  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento define a pirâmide de testes e os padrões de validação de qualidade de software do **FlowDent**. O ecossistema exige uma cobertura rigorosa de testes automatizados para garantir a estabilidade do sistema multi-tenant, prevenir vazamentos de dados entre clínicas e validar os fluxos complexos de IA e automação.

---

## 2. Pirâmide de Testes e Ferramentas

A estratégia de controle de qualidade é dividida em três níveis complementares:

```
          / \
         /   \      E2E (Playwright) - Cobertura: ~10% (Caminhos Críticos)
        / E2E \
       /───────\
      /  INTEG  \   Integração (NestJS + Testcontainers) - Cobertura: ~30%
     /───────────\
    /   UNITÁRI  \  Unitários (Vitest / Jest) - Cobertura: ~60%
   /───────────────\
```

---

## 3. Testes Unitários (Unit Testing)
*   **Foco:** Testar entidades de domínio, objetos de valor e utilitários isolados, sem acesso a banco de dados ou redes.
*   **Ferramentas:** **Vitest** (ou Jest) devido à velocidade de execução instantânea integrada ao ecossistema Vite.
*   **Regra de Ouro:** Todas as regras matemáticas de comissão de dentistas, cálculos de parcelas financeiras e validações de schemas JSON de automações devem possuir 100% de cobertura de testes unitários.

---

## 4. Testes de Integração (Integration Testing)
*   **Foco:** Validar a comunicação entre camadas (Controllers -> Use Cases -> Repositories) e a persistência no banco de dados real.
*   **Ferramentas:** `supertest` para chamadas de API simuladas e **Testcontainers** para subir uma instância Docker temporária e real do PostgreSQL durante a execução dos testes.

### Validação Crítica: Teste de Vazamento de Dados (RLS Leak Test)
Este teste é obrigatório em todas as suítes de repositório. Ele simula duas clínicas paralelas e garante que a Clínica A não consiga obter registros da Clínica B mesmo executando o mesmo método:

```typescript
describe('Patients Repository - RLS Tenant Isolation', () => {
  it('should prevent Tenant A from accessing Tenant B patients', async () => {
    // 1. Criar pacientes para Clinica A e Clinica B no banco de teste
    const patientA = await db.patients.create({ clinicId: 'tenant-a-uuid', name: 'Paciente A' });
    const patientB = await db.patients.create({ clinicId: 'tenant-b-uuid', name: 'Paciente B' });

    // 2. Definir o Tenant A na sessão da conexão do Postgres
    await db.setLocalSession('app.current_clinic_id', 'tenant-a-uuid');

    // 3. Buscar todos os pacientes
    const patients = await repository.findAll();

    // 4. Asserção: Apenas o paciente da Clinica A deve retornar
    expect(patients.length).toBe(1);
    expect(patients[0].id).toBe(patientA.id);
    expect(patients.find(p => p.id === patientB.id)).toBeUndefined();
  });
});
```

---

## 5. Testes de Ponta a Ponta (E2E / Browser Testing)
*   **Foco:** Testar a experiência completa do usuário no navegador simulando cliques, digitação e fluxos visuais completos.
*   **Ferramentas:** **Playwright** pela performance superior na execução em navegadores headless (Chromium, Firefox, WebKit).
*   **Caminho Crítico Testado no E2E:**
    *   **Fluxo de Odontograma:** Acessar a ficha do paciente, ativar o Modo Pincel, clicar em 3 dentes, verificar se os dentes mudaram de cor na tela e se o histórico de evolução clínica foi atualizado instantaneamente na listagem sem recarregar.
    *   **Login Automatizado Whitelabel:** Acessar a URL whitelabel, clicar em logar, verificar se o dashboard personalizado com as cores da clínica renderiza corretamente e se os tokens JWT são salvos de forma segura nos cookies da sessão.

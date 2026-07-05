# FlowDent — Autorização e Controle de Acesso (Authorization & RBAC)
**Versão:** 1.0.0  
**Autor:** Principal Security Architect  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve os mecanismos de **Autorização** e controle de acesso baseado em papéis/cargos (RBAC - Role-Based Access Control) do **FlowDent**. O sistema impede que usuários realizem ações não autorizadas ou visualizem informações fora do seu escopo de atuação profissional dentro e fora da clínica.

---

## 2. Cargos (Roles) e Escopo de Acesso

O ecossistema reconhece seis perfis estruturais de atuação, com direitos de acesso hierárquicos:

```
  ┌────────────────────────────────────────────────────────┐
  │ 1. SUPER_ADMIN (Whitelabel / SaaS Global)              │
  │    • Acesso total a todas as clínicas, faturas, etc.    │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │ 2. CLINIC_OWNER (Dono da Clínica)                      │
  │    • Acesso total aos dados de sua própria clínica.    │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │ 3. CLINIC_ADMIN (Gerente de Unidade)                   │
  │    • Cadastro de funcionários, estoques, agenda geral. │
  └───────────┬───────────────┼───────────────┬────────────┘
              │               │               │
  ┌───────────▼───┐   ┌───────▼───────┐   ┌───▼────────────┐
  │ 4. DOCTOR     │   │ 5. FINANCIAL  │   │ 6. RECEPTIONIST│
  │ • Prontuários │   │ • Contas Ap/Ar│   │ • Agendamentos │
  │ • Evoluções   │   │ • Fluxo Caixa │   │ • Central Chat │
  └───────────────┘   └───────────────┘   └────────────────┘
```

---

## 3. Matriz Granular de Acesso a Recursos

A tabela abaixo especifica os privilégios de acesso a cada endpoint ou funcionalidade da aplicação:

| Recurso / Ação | SUPER_ADMIN | CLINIC_OWNER | CLINIC_ADMIN | DOCTOR | FINANCIAL | RECEPTIONIST |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Configurar Layout Whitelabel | **Sim** | Não | Não | Não | Não | Não |
| Visualizar Faturamento Geral | **Sim** | **Sim** | **Sim** | Não | **Sim** | Não |
| Concluir Orçamento / Tratamento | Não | **Sim** | **Sim** | **Sim** | Não | Não |
| Lançar Evolução no Prontuário | Não | **Sim** | **Sim** | **Sim** | Não | Não |
| Lançar Despesa (Contas a Pagar) | Não | **Sim** | **Sim** | Não | **Sim** | Não |
| Agendar/Remarcar Consultas | Não | **Sim** | **Sim** | **Sim** (Própria) | Não | **Sim** |
| Configurar Fluxos da IA Sofia | **Sim** | **Sim** | **Sim** | Não | Não | Não |
| Visualizar Chat / Conversas WhatsApp | Não | **Sim** | **Sim** | **Sim** | Não | **Sim** |

---

## 4. Implementação técnica no NestJS (Guards & Decorators)
A validação de permissões no backend ocorre por meio de interceptadores e decoradores personalizados que interceptam a requisição antes de sua execução pelo Controller.

### Exemplo de implementação do Decorador de Funções
```typescript
// Roles Decorator
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Controller Usage
@Controller('finance/budgets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BudgetController {
  @Post()
  @Roles('CLINIC_OWNER', 'CLINIC_ADMIN', 'DOCTOR')
  async createBudget(@Body() dto: CreateBudgetDto, @Req() req) {
    return this.createBudgetUseCase.execute(dto, req.user);
  }
}
```

---

## 5. Implementação no Banco de Dados (Policies & Triggers RBAC)
Para garantir que as restrições de acesso permaneçam protegidas mesmo se houver falha no código NestJS, o PostgreSQL aplica validações de funções de usuário nas políticas RLS:

```sql
-- Função auxiliar para extrair o cargo do usuário autenticado no JWT
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS VARCHAR AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role',
    'GUEST'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Política de escrita na tabela de prontuários clínicos
CREATE POLICY doctor_write_record ON public.medical_records
    FOR INSERT OR UPDATE
    WITH CHECK (
        clinic_id = public.get_auth_clinic_id() 
        AND (
            public.get_auth_user_role() = 'DOCTOR' 
            OR public.get_auth_user_role() = 'CLINIC_OWNER'
        )
    );
```
O banco de dados rejeitará automaticamente qualquer query de gravação (`INSERT` ou `UPDATE`) na tabela `medical_records` que for disparada por conexões cujo JWT possua cargos diferentes de `DOCTOR` ou `CLINIC_OWNER`.

# Módulo: Prontuários e Ficha Clínica (Clinical Module Specification)
**Versão:** 1.0.0  
**Autor:** Principal Product Manager & Lead Architect  
**Status:** Aprovado  

---

## 1. Objetivo
O objetivo do módulo **Clínico** é gerenciar o histórico de saúde, evoluções diárias, laudos de exames radiográficos e receitas/atestados emitidos para os pacientes atendidos pela clínica, garantindo integridade de dados e segurança jurídica para os profissionais.

---

## 2. Descrição e Escopo
Este módulo fornece as ferramentas necessárias para que o dentista registre as intervenções clínicas. Nele, o profissional realiza o preenchimento da anamnese estruturada, visualiza evoluções passadas ordenadas cronologicamente, emite prescrições de medicamentos assinadas digitalmente e registra observações importantes de segurança.

### Dentro do Escopo (In Scope)
*   Linha do tempo (timeline) contínua e imutável de evoluções clínicas.
*   Emissão de receitas, atestados e termos de consentimento pré-configurados.
*   Questionário de anamnese digital integrado ao preenchimento móvel do paciente.
*   Importação e galeria de imagens de exames complementares (radiografias, tomografias).

### Fora do Escopo (Out of Scope)
*   Controle de orçamentos e lançamentos financeiros (gerenciado exclusivamente por **Financeiro**).
*   Configuração do odontograma interativo (gerenciado pelo módulo de **Odontograma**).

---

## 3. Regras de Negócio
*   **RN-001: Assinatura Eletrônica Obrigatória:** Toda evolução clínica gravada deve ser vinculada à assinatura eletrônica criptografada do profissional (UUID do perfil do dentista associado ao hash do texto gravado), impossibilitando adulterações futuras.
*   **RN-002: Retificação por Adendo:** Em caso de erro de escrita em evoluções passadas, o dentista não edita a linha antiga. Ele deve usar a função *Lançar Adendo*, que cria uma sub-linha na evolução correspondente contendo o texto corretivo, data atual e nova assinatura.
*   **RN-003: Alertas Médicos Críticos:** Informações clínicas marcadas na anamnese como de alto risco (ex: *Cardiopatia*, *Hemofilia*, *Grávida*) devem habilitar alertas de bloqueio na interface, impedindo que o profissional feche a aba sem ler as contraindicações de anestésicos.

---

## 4. Fluxo e Casos de Uso (Use Cases)

### Caso de Uso: Emissão de Prescrição Digital
*   **Atores:** Dentista.
*   **Fluxo Principal:**
    1.  O dentista acessa a aba *Receitas* na ficha do paciente.
    2.  Seleciona um modelo pré-cadastrado (ex: *Receita Analgésica Padrão*).
    3.  O sistema preenche as informações do paciente e do dentista de forma automática.
    4.  O dentista clica em *Emitir e Assinar*.
    5.  **Ação do Sistema:**
        *   Gera um arquivo PDF contendo o carimbo de data, dados da clínica e do dentista.
        *   Calcula o hash sha256 do arquivo e armazena na tabela `prescriptions`.
        *   Dispara o envio automático da receita em PDF via WhatsApp para o paciente.
        *   Lança o registro no histórico de auditoria.

---

## 5. Wireframe em Texto (Emissão de Receita)
```
┌────────────────────────────────────────────────────────┐
│ EMISSÃO DE RECEITA DIGITAL                  [X] Fechar  │
├────────────────────────────────────────────────────────┤
│ Paciente: Carlos Albuquerque | Profissional: Dr. Pedro │
├────────────────────────────────────────────────────────┤
│ Selecionar Modelo: [ Receita Analgésica Padrão    ] [v]│
├────────────────────────────────────────────────────────┤
│ Prescrição (Texto):                                    │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Uso Oral:                                          │ │
│ │ 1. Amoxicilina 500mg ------ Tomar 1 comprimido de  │ │
│ │ 8 em 8 horas por 7 dias.                           │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ [ ] Enviar PDF automaticamente no WhatsApp do paciente │
├────────────────────────────────────────────────────────┤
│ [ Cancelar ]                             [ Emitir PDF ]│
└────────────────────────────────────────────────────────┘
```

---

## 6. Banco de Dados e Relacionamentos
Estrutura de dados para o histórico clínico e receitas:

```sql
CREATE TABLE public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    signature_hash VARCHAR(64) NOT NULL, -- SHA256 da evolução
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_path VARCHAR(512) NOT NULL, -- Caminho do PDF no storage privado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

---

## 7. Endpoints & Payloads da API
*   **Criar Registro Clínico (Evolução):**
    *   `POST /api/v1/clinical/records`
    *   *Payload:* `{ "patient_id": "uuid", "description": "Obturação realizada no dente 16" }`
    *   *Response (`201 Created`):* `{ "success": true, "data": { "id": "uuid", "signature_hash": "..." } }`

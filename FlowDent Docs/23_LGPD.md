# FlowDent — Diretrizes de Conformidade LGPD (LGPD Compliance)
**Versão:** 1.0.0  
**Autor:** Data Protection Officer (DPO) & Legal Team  
**Status:** Aprovado  

---

## 1. Objetivo do Documento
Este documento descreve os fluxos operacionais, estruturas de dados e regras técnicas do **FlowDent** para garantir conformidade integral com a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)**. Ele orienta como o sistema protege e gerencia os dados pessoais e dados de saúde sensíveis dos pacientes e funcionários.

---

## 2. Bases Legais e Gestão de Consentimento (Consent Management)

O tratamento de dados de saúde no FlowDent é fundamentado principalmente nas bases de **Tutela da Saúde** e **Consentimento Explícito**:

### Fluxo de Consentimento do Paciente
1.  **Primeiro Acesso:** Ao ser cadastrado na clínica, o paciente recebe um link por WhatsApp/SMS para preencher a anamnese digital no Portal do Paciente.
2.  **Exibição dos Termos:** A interface apresenta o **Termo de Consentimento Livre e Esclarecido (TCLE)** descrevendo de forma clara quais dados são coletados (histórico bucal, exames de imagem, contatos) e qual a finalidade do processamento (agendamentos, tratamentos e emissão de notas fiscais).
3.  **Assinatura Digital:** O paciente assina digitalmente a concordância na tela do celular. A assinatura gera um registro persistido na tabela `patient_consents`, armazenando o IP, o timestamp do clique, a versão do termo e o hash da assinatura para auditorias futuras.

---

## 3. Direitos dos Titulares de Dados (Data Subject Rights)

O FlowDent disponibiliza no portal do paciente e no painel administrativo interfaces específicas para atender aos direitos garantidos pela LGPD:

### I. Direito de Acesso e Portabilidade
O paciente pode solicitar a qualquer momento um relatório exportado de seus dados pessoais. O sistema disponibiliza o download de um arquivo JSON estruturado e um PDF assinado digitalmente contendo:
*   Dados cadastrais completos.
*   Histórico completo de evoluções e anamnese clínica.
*   Galeria de exames de imagem anexados.

### II. Direito de Retificação
Permite corrigir dados incompletos, inexatos ou desatualizados diretamente pelo Portal do Paciente ou solicitando à recepção da clínica.

### III. Direito de Exclusão e Anonimização
*   **Regra de Negócio Crítica (Conflito de Leis):** Se o paciente solicitar a exclusão de sua ficha ("Direito ao Esquecimento"), a clínica tem a obrigação legal perante o Conselho Federal de Odontologia (CFO) e órgãos fiscais de manter o prontuário por **20 anos** e o histórico de transações financeiras.
*   **Implementação:** O sistema executa a **Anonimização Parcial**:
    *   Dados de contato (e-mail, telefone, endereço, CPF) são apagados ou substituídos por valores dummy (ex: `Paciente Anonimizado - 71a812b`).
    *   O prontuário clínico e as transações financeiras continuam salvos sem nenhuma vinculação com a identidade do paciente real, preservando dados agregados para estatísticas epidemiológicas e faturamento contábil da clínica.

---

## 4. Minimização e Retenção de Logs
*   **Logs de Acesso:** Logs que contenham IPs de acesso e horários de login são limpos automaticamente do banco de dados após **180 dias** (exigência do Marco Civil da Internet).
*   **Conversas de WhatsApp:** Textos de mensagens no chat são compactados e arquivados em repositório frio após **2 anos** da última interação, liberando espaço no banco operacional sem perda de histórico.

---

## 5. Plano de Resposta a Incidentes de Vazamento (Data Breach Runbook)
Caso os sistemas de monitoramento identifiquem uma quebra de segurança com suspeita de vazamento de dados de pacientes:
1.  **Bloqueio:** O DPO e a equipe de segurança suspendem temporariamente as APIs afetadas e isolam o banco de dados.
2.  **Identificação:** Mapeia-se o escopo do vazamento (quais clínicas e pacientes foram impactados) por meio da análise do `Correlation ID` nos logs agregados.
3.  **Notificação:** A FlowDent notificará por escrito a **Autoridade Nacional de Proteção de Dados (ANPD)** e as clínicas afetadas em até **48 horas**, detalhando a natureza do incidente, medidas de mitigação adotadas e os riscos previstos.

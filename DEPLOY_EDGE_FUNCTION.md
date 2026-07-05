                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''   # 🚀 Como Publicar a Supabase Edge Function (IA Sofia WhatsApp)

Esta pasta contém o código da **Edge Function** (`supabase/functions/whatsapp-agent`) que atua como o webhook inteligente da *Evolution API*. Ela processa mensagens de WhatsApp em tempo real, executa ações no banco de dados (Function Calling para consultar slots e agendar consultas) e responde ao paciente de forma autônoma usando a IA.

Siga os passos abaixo para publicar a função no seu projeto Supabase de produção.

---

## 📋 Pré-requisitos
1. Certifique-se de ter o **Supabase CLI** instalado na sua máquina. Se não tiver, instale com:
   ```bash
   npm install -g supabase
   ```
2. Faça login na sua conta do Supabase pelo terminal:
   ```bash
   supabase login
   ```
3. Vincule a CLI ao seu projeto (use a referência do projeto `rxjwfzknxatoozbuhqtr`):
   ```bash
   supabase link --project-ref rxjwfzknxatoozbuhqtr
   ```

---

## 🔑 Passo 1: Configurar as Secrets (Chaves e URLs)
Para que a Edge Function funcione, ela precisa acessar chaves de API com segurança. Defina as variáveis de ambiente do projeto rodando os comandos abaixo no seu terminal (substitua os valores de exemplo pelas chaves reais):

```bash
# 1. Definir a chave de API do Gemini para processamento inteligente
supabase secrets set GEMINI_API_KEY="SUA_CHAVE_GEMINI_API_AQUI"

# 2. Definir a URL base da Evolution API onde as mensagens serão despachadas
supabase secrets set EVOLUTION_API_BASE_URL="https://sua-evolution-api-domain.com"
```

*Nota: As chaves `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetadas automaticamente pelo Supabase para as Edge Functions, você não precisa configurá-las manualmente.*

---

## 🚀 Passo 2: Fazer o Deploy da Função
Publique o código no servidor da Supabase rodando:

```bash
supabase functions deploy whatsapp-agent --no-verify-jwt
```

* **`--no-verify-jwt`**: Essencial para que a Evolution API possa disparar requisições para o Webhook sem precisar enviar o cabeçalho Bearer JWT do Supabase.*

---

## 🎯 Passo 3: Configurar o Webhook na Evolution API
Após o deploy bem-sucedido, a Supabase gerará uma URL pública para a sua função, que terá o seguinte formato:
`https://rxjwfzknxatoozbuhqtr.supabase.co/functions/v1/whatsapp-agent`

1. Acesse o painel da sua **Evolution API**.
2. Vá nas configurações de **Webhooks** da sua instância.
3. Ative o Webhook para o evento **`MESSAGES_UPSERT`**.
4. Cole a URL pública da Edge Function gerada pelo Supabase.
5. Salve as configurações.

Pronto! A partir desse momento, cada mensagem de WhatsApp recebida pela instância ativará a Sofia IA, registrando as mensagens no painel do atendente no CRM e interagindo com os pacientes.

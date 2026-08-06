import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Configurações do cabeçalho de resposta CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Tratar requisição OPTIONS de pré-voo (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    // Inicializar cliente admin do Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ler corpo da requisição do Webhook da Evolution API
    const body = await req.json();
    console.log("Recebido Webhook do WhatsApp:", JSON.stringify(body));

    // Validar se é um evento de mensagem recebida
    if (body.event !== "messages.upsert") {
      return new Response(JSON.stringify({ message: "Ignorado (Não é messages.upsert)" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messageData = body.data;
    if (!messageData) {
      return new Response(JSON.stringify({ error: "Dados ausentes na requisição" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const remoteJid = messageData.key?.remoteJid;
    const isFromMe = messageData.key?.fromMe;

    // Ignorar mensagens enviadas pelo próprio bot
    if (isFromMe) {
      return new Response(JSON.stringify({ message: "Mensagem enviada pelo bot. Ignorado." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ignorar mensagens de grupos ou transmissões (broadcast)
    if (remoteJid && (remoteJid.endsWith("@g.us") || remoteJid.endsWith("@broadcast"))) {
      return new Response(JSON.stringify({ message: "Mensagem de grupo ou broadcast. Ignorado." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const senderPhone = remoteJid.split("@")[0];
    
    // Restringir a resposta para o número de teste apenas se LIMIT_TO_TEST_NUMBER for true
    const limitToTest = Deno.env.get("LIMIT_TO_TEST_NUMBER") !== "false";
    const allowedTestPhone = Deno.env.get("TEST_PHONE_NUMBER");
    
    if (limitToTest && allowedTestPhone && senderPhone !== allowedTestPhone) {
      console.log(`Mensagem recebida de ${senderPhone}. Ignorando pois a trava de número de teste (${allowedTestPhone}) está ativa.`);
      return new Response(JSON.stringify({ message: `Ignorado. Apenas o número de testes configurado está ativo no momento.` }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const senderName = body.data.pushName || "Paciente";
    const instanceName = body.instance;

    // Extrair o conteúdo em texto ou botão interativo da mensagem
    let messageText = "";
    let buttonId = "";
    const msg = messageData.message;
    if (msg) {
      if (msg.conversation) {
        messageText = msg.conversation;
      } else if (msg.extendedTextMessage?.text) {
        messageText = msg.extendedTextMessage.text;
      } else if (msg.buttonsResponseMessage) {
        buttonId = msg.buttonsResponseMessage.selectedButtonId || "";
        messageText = msg.buttonsResponseMessage.selectedDisplayText || buttonId;
      } else if (msg.templateButtonReplyMessage) {
        buttonId = msg.templateButtonReplyMessage.selectedId || "";
        messageText = msg.templateButtonReplyMessage.selectedDisplayText || buttonId;
      } else if (msg.interactiveResponseMessage) {
        try {
          const params = JSON.parse(msg.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson || "{}");
          buttonId = params.id || "";
          messageText = params.display_text || buttonId;
        } catch (_) {
          messageText = "Botão Clicado";
        }
      }
    }

    if (!messageText.trim() && !buttonId) {
      return new Response(JSON.stringify({ message: "Mensagem vazia ou tipo não suportado. Ignorado." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Buscar a configuração da clínica baseada no nome da instância
    const { data: waConfig, error: waError } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("instance_name", instanceName)
      .single();

    if (waError || !waConfig) {
      console.error("Configuração do WhatsApp não encontrada para a instância:", instanceName, waError);
      return new Response(JSON.stringify({ error: "Instância não cadastrada no CRM" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validação de Segurança: Exigir token de validação se fornecido
    const requestApiKey = req.headers.get("apikey") || req.headers.get("x-api-key") || req.headers.get("authorization");
    const expectedSecret = waConfig.api_key || Deno.env.get("WHATSAPP_WEBHOOK_SECRET");
    
    if (requestApiKey && expectedSecret && requestApiKey !== expectedSecret) {
      console.warn(`[Segurança] Token de webhook incorreto recebido para a instância: ${instanceName}`);
      return new Response(JSON.stringify({ error: "Não autorizado. Token inválido." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Se a automação estiver desativada na clínica, ignoramos
    if (!waConfig.is_active) {
      return new Response(JSON.stringify({ message: "Automação desativada para esta clínica." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Carregar informações da Clínica (Tenant)
    const { data: clinic } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", waConfig.clinic_id)
      .single();

    if (!clinic) {
      return new Response(JSON.stringify({ error: "Clínica não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Buscar ou criar o Paciente no CRM
    let { data: patient } = await supabase
      .from("patients")
      .select("*")
      .eq("clinic_id", clinic.id)
      .eq("phone", senderPhone)
      .maybeSingle();

    if (!patient) {
      const { data: newPatient, error: createPatErr } = await supabase
        .from("patients")
        .insert({
          clinic_id: clinic.id,
          name: senderName,
          phone: senderPhone,
          medical_history: JSON.stringify({
            notes: "Criado automaticamente pelo contato de WhatsApp",
            odontogram: {},
            evolutions: [],
            exams: []
          })
        })
        .select()
        .single();
      
      if (createPatErr) {
        console.error("Erro ao cadastrar paciente automático:", createPatErr);
      } else {
        patient = newPatient;
      }
    }

    // Registrar a mensagem recebida e verificar se a IA está pausada
    if (patient) {
      // Salvar a mensagem de entrada na tabela chat_messages
      const { error: msgErr } = await supabase
        .from("chat_messages")
        .insert({
          clinic_id: clinic.id,
          patient_id: patient.id,
          sender: "PATIENT",
          message_text: messageText
        });
      if (msgErr) console.error("Erro ao salvar mensagem recebida no chat:", msgErr);

      // TRATAMENTO AUTOMÁTICO DE RESPOSTAS DE BOTÕES (CONFIRMAÇÃO / REAGENDAMENTO)
      // O buttonId de confirmação vem como: btn_confirm|YYYY-MM-DD|HH:MM
      const isConfirm = buttonId.startsWith('btn_confirm');
      const isReschedule = buttonId === 'btn_reschedule' || messageText.toLowerCase().includes('reagendar') || messageText === '2';

      if (isConfirm) {
        const parts = buttonId.split('|');
        const apptDate = parts[1]; // YYYY-MM-DD
        const apptHour = parts[2]; // HH:MM

        const evolutionBase = Deno.env.get("EVOLUTION_API_BASE_URL") || "http://179.197.225.90:8080";
        let replyText = `Perfeito, ${patient.name}! Sua consulta foi confirmada. Te esperamos! 🦷`;

        // Criar agendamento no banco se temos data e hora
        if (apptDate && apptHour) {
          const startTime = new Date(`${apptDate}T${apptHour}:00-03:00`);
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

          const { data: newAppt, error: apptErr } = await supabase
            .from("appointments")
            .insert({
              clinic_id: clinic.id,
              patient_id: patient.id,
              title: `Consulta — ${patient.name}`,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              status: "CONFIRMED",
              notes: "Confirmado pelo paciente via botão no WhatsApp."
            })
            .select("id")
            .single();

          if (apptErr) {
            console.error("[Botão Confirmar] Erro ao criar agendamento:", apptErr);
          } else {
            console.log(`[Botão Confirmar] Agendamento criado: ${newAppt?.id}`);
            // Formatar data para exibição
            const [year, month, day] = apptDate.split('-');
            replyText = `Marcado! Consulta confirmada para ${day}/${month} às ${apptHour}. Te esperamos! 🦷`;
          }
        }

        await fetch(`${evolutionBase.replace(/\/$/, '')}/message/sendText/${instanceName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": waConfig.api_key },
          body: JSON.stringify({
            number: senderPhone,
            text: replyText,
            options: { delay: 800, presence: "composing" }
          })
        });

        // Salvar no histórico
        await supabase.from("chat_messages").insert({
          clinic_id: clinic.id,
          patient_id: patient.id,
          sender: "BOT",
          message_text: replyText
        });

        return new Response(JSON.stringify({ success: true, action: "CONFIRMED", responseText: replyText }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (isReschedule) {
        const evolutionBase = Deno.env.get("EVOLUTION_API_BASE_URL") || "http://179.197.225.90:8080";
        const replyText = `Sem problema! Qual data e horário prefere para reagendar? 😊`;

        await fetch(`${evolutionBase.replace(/\/$/, '')}/message/sendText/${instanceName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": waConfig.api_key },
          body: JSON.stringify({
            number: senderPhone,
            text: replyText,
            options: { delay: 800, presence: "composing" }
          })
        });

        await supabase.from("chat_messages").insert({
          clinic_id: clinic.id,
          patient_id: patient.id,
          sender: "BOT",
          message_text: replyText
        });

        return new Response(JSON.stringify({ success: true, action: "RESCHEDULE_REQUESTED", responseText: replyText }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 4. Se não temos chave de IA configurada nas variáveis de ambiente, falhamos
    if (!geminiApiKey) {
      console.error("Variável GEMINI_API_KEY não definida.");
      return new Response(JSON.stringify({ error: "Configuração do servidor de IA ausente" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Módulo do Agente de IA: Chamar Gemini com suporte a Function Calling
    const nowBR = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const todayISO = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })).toISOString().split("T")[0];
    const tomorrowISO = new Date(new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })).getTime() + 86400000).toISOString().split("T")[0];

    const systemPrompt = `Você é a Sofia, assistente de agendamento da clínica ${clinic.name} via WhatsApp.

REGRAS ABSOLUTAS DE COMUNICAÇÃO — NUNCA QUEBRE ESTAS REGRAS:
1. MENSAGENS CURTAS: Máximo 2 frases por resposta. WhatsApp não é e-mail.
2. UMA PERGUNTA POR VEZ: Nunca faça mais de uma pergunta na mesma mensagem.
3. SEM LISTAS: Nunca use "1. 2. 3." nem bullets. Escreva como uma pessoa conversando.
4. EMOJIS: No máximo 1 por mensagem, só quando natural.
5. SEM FORMALIDADES EXCESSIVAS: Não use "Prezado(a)", "Informo que", "Segue abaixo". Fale como um humano.

EXEMPLOS DE RESPOSTA CORRETA:
✅ "Para amanhã temos 09h, 14h e 16h. Qual prefere?"
✅ "Às 14h está disponível! Confirmo sua limpeza para amanhã às 14h?"

EXEMPLOS DE RESPOSTA ERRADA (NUNCA FAÇA):
❌ "Olá! Fico feliz em ajudá-lo. Temos os seguintes horários disponíveis: 1. 09h00 2. 14h00 3. 16h00. Qual seria de sua preferência?"

FLUXO OBRIGATÓRIO DE AGENDAMENTO:
- Passo 1: Paciente pede horário → chame get_available_slots para a data pedida → responda só os horários livres em 1 frase.
- Passo 2: Paciente escolhe horário → chame send_confirmation_buttons (data + hora escolhidas). NUNCA peça confirmação em texto.
- Passo 3: Paciente clica no botão de confirmar → chame book_appointment.

CONTEXTO:
- Paciente: ${patient?.name || senderName}
- Agora: ${nowBR}
- Hoje (ISO): ${todayISO} | Amanhã (ISO): ${tomorrowISO}
- Funcionamento: Seg-Sex, 08h às 18h. Intervalos de 1h (08, 09, 10, 11, 14, 15, 16, 17).
${waConfig.agent_prompt ? `- Instruções da clínica: ${waConfig.agent_prompt}` : ""}`;

    // Lógica das Ferramentas executadas localmente pela Edge Function
    const executeTool = async (name: string, args: any) => {
      console.log(`Executando ferramenta de banco de dados: ${name}`, args);
      
      if (name === "get_available_slots") {
        const queryDate = args.date; // Espera YYYY-MM-DD
        if (!queryDate) return { error: "Parâmetro 'date' é obrigatório." };

        // Definir slots teóricos de atendimento
        const workingHours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

        // Buscar consultas existentes para aquela data
        const startOfDay = new Date(`${queryDate}T00:00:00`).toISOString();
        const endOfDay = new Date(`${queryDate}T23:59:59`).toISOString();

        const { data: apps, error } = await supabase
          .from("appointments")
          .select("start_time, status")
          .eq("clinic_id", clinic.id)
          .neq("status", "CANCELLED")
          .gte("start_time", startOfDay)
          .lte("start_time", endOfDay);

        if (error) {
          console.error("Erro ao buscar agenda:", error);
          return { error: "Erro ao consultar agenda." };
        }

        // Mapear horas ocupadas
        const busyHours = (apps || []).map(a => {
          const d = new Date(a.start_time);
          return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
        });

        // Filtrar slots livres
        const freeSlots = workingHours.filter(h => !busyHours.includes(h));

        return {
          date: queryDate,
          available_slots: freeSlots,
          message: freeSlots.length > 0 
            ? `Horários livres para o dia ${queryDate}: ${freeSlots.join(", ")}`
            : `Desculpe, não temos horários livres para o dia ${queryDate}.`
        };
      }

      if (name === "send_confirmation_buttons") {
        const { date, hour, display_date } = args;
        if (!date || !hour) return { error: "Parâmetros 'date' e 'hour' são obrigatórios." };

        const evolutionBase = Deno.env.get("EVOLUTION_API_BASE_URL") || "http://179.197.225.90:8080";
        const label = display_date || `${date} às ${hour}`;

        const btnPayload = {
          number: senderPhone,
          title: `🦷 ${clinic.name}`,
          description: `Confirma sua consulta para ${label}?`,
          footer: "Responda com um dos botões abaixo:",
          buttons: [
            { type: "reply", displayText: "✅ Confirmar", id: `btn_confirm|${date}|${hour}` },
            { type: "reply", displayText: "🔄 Outro horário", id: "btn_reschedule" }
          ]
        };

        let btnSent = false;
        try {
          const btnRes = await fetch(`${evolutionBase}/message/sendButtons/${instanceName}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": waConfig.api_key },
            body: JSON.stringify(btnPayload)
          });
          const btnJson = await btnRes.json();
          console.log("[Botões] Resposta Evolution:", JSON.stringify(btnJson));
          btnSent = btnRes.ok || btnJson.key?.id;
        } catch (e: any) {
          console.warn("[Botões] Falha ao enviar botões, usando texto:", e.message);
        }

        // Fallback: se botões falharem, envia texto simples com as opções
        if (!btnSent) {
          const fallbackText = `Confirma sua consulta para ${label}?\n\nResponda:\n*1* - Confirmar ✅\n*2* - Ver outro horário 🔄`;
          await fetch(`${evolutionBase}/message/sendText/${instanceName}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": waConfig.api_key },
            body: JSON.stringify({ number: senderPhone, text: fallbackText, options: { delay: 800 } })
          });
        }

        // Salvar no chat e encerrar — não precisamos de texto do Gemini
        if (patient) {
          await supabase.from("chat_messages").insert({
            clinic_id: clinic.id,
            patient_id: patient.id,
            sender: "BOT",
            message_text: `[Botões enviados] Confirma consulta para ${label}?`
          });
        }

        // Sinaliza para a Edge Function que deve retornar sem chamar Gemini de novo
        throw new DOMException(`__BUTTONS_SENT__:${label}`, "AbortError");
      }

      if (name === "book_appointment") {
        const { date, hour } = args;
        if (!date || !hour) return { error: "Parâmetros 'date' e 'hour' são obrigatórios." };

        // Normalizar hora — aceita "14:00" ou "14h" ou "14"
        const hourClean = hour.replace("h", ":").replace(/:$/, ":00").padEnd(5, "0:0").substring(0, 5);
        const hourPadded = hourClean.includes(":") ? hourClean : `${hourClean}:00`;

        // Construir datas no fuso de São Paulo convertidas para UTC
        const startLocalStr = `${date}T${hourPadded}:00`;
        const startTime = new Date(startLocalStr + "-03:00"); // BRT = UTC-3
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        // INSERT direto e confiável na tabela appointments
        const { data: newAppt, error: apptErr } = await supabase
          .from("appointments")
          .insert({
            clinic_id: clinic.id,
            patient_id: patient?.id || null,
            title: `Consulta — ${patient?.name || senderName}`,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: "CONFIRMED",
            notes: `Agendado via WhatsApp pela Sofia. Procedimento: Consulta Odontológica.`
          })
          .select("id")
          .single();

        if (apptErr) {
          console.error("[book_appointment] Erro ao criar agendamento:", apptErr);
          return { error: `Não foi possível registrar o agendamento: ${apptErr.message}` };
        }

        console.log(`[book_appointment] Agendamento criado com ID: ${newAppt?.id}`);
        return {
          success: true,
          appointment_id: newAppt?.id,
          message: `Consulta confirmada para ${patient?.name || senderName} em ${date} às ${hourPadded}.`
        };
      }

      if (name === "pause_bot") {
        const { error } = await supabase
          .from("chat_sessions")
          .upsert({
            clinic_id: clinic.id,
            patient_id: patient.id,
            is_bot_paused: true,
            updated_at: new Date().toISOString()
          }, { onConflict: "patient_id" });

        if (error) {
          console.error("Erro ao pausar o bot:", error);
          return { error: "Não foi possível pausar o atendimento." };
        }

        return { success: true, message: "Bot pausado. Um atendente humano assumirá em instantes." };
      }

      return { error: "Função não encontrada." };
    };

    // Definição das declarações das ferramentas enviadas ao Gemini
    const toolsDeclaration = [
      {
        functionDeclarations: [
          {
            name: "get_available_slots",
            description: "Busca os horários livres em uma data específica. Use sempre que o paciente mencionar uma data ou pedir horários disponíveis.",
            parameters: {
              type: "OBJECT",
              properties: {
                date: {
                  type: "STRING",
                  description: "A data no formato YYYY-MM-DD. Ex: se hoje é 2026-08-05 e paciente diz 'amanhã', use 2026-08-06."
                }
              },
              required: ["date"]
            }
          },
          {
            name: "send_confirmation_buttons",
            description: "Envia uma mensagem interativa com botões 'Confirmar' e 'Outro horário' para o paciente. Use OBRIGATORIAMENTE quando o paciente escolher um horário específico — NUNCA peça confirmação em texto livre.",
            parameters: {
              type: "OBJECT",
              properties: {
                date: {
                  type: "STRING",
                  description: "Data escolhida no formato YYYY-MM-DD."
                },
                hour: {
                  type: "STRING",
                  description: "Hora escolhida no formato HH:MM (ex: 14:00)."
                },
                display_date: {
                  type: "STRING",
                  description: "Texto legível para exibir ao paciente. Ex: 'amanhã (6/ago) às 14h'."
                }
              },
              required: ["date", "hour", "display_date"]
            }
          },
          {
            name: "book_appointment",
            description: "Cria o agendamento confirmado no sistema. Use APENAS quando o paciente clicar no botão de confirmação (id começa com btn_confirm). NUNCA use sem confirmação explícita.",
            parameters: {
              type: "OBJECT",
              properties: {
                date: {
                  type: "STRING",
                  description: "Data no formato YYYY-MM-DD."
                },
                hour: {
                  type: "STRING",
                  description: "Hora no formato HH:MM (ex: 14:00)."
                }
              },
              required: ["date", "hour"]
            }
          },
          {
            name: "pause_bot",
            description: "Pausa o atendimento automático e transfere para um humano. Use quando o paciente pedir para falar com atendente, demonstrar urgência ou dor forte.",
            parameters: {
              type: "OBJECT",
              properties: {}
            }
          }
        ]
      }
    ];

    // Buscar as últimas 10 mensagens do histórico de conversa para dar contexto ao Gemini
    const { data: historyData } = await supabase
      .from("chat_messages")
      .select("sender, message_text")
      .eq("patient_id", patient.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const contents = [];

    if (historyData && historyData.length > 0) {
      // Reverter o histórico para ficar na ordem cronológica (antigas primeiro)
      const sortedHistory = [...historyData].reverse();
      for (const msg of sortedHistory) {
        contents.push({
          role: msg.sender === "PATIENT" ? "user" : "model",
          parts: [{ text: msg.message_text }]
        });
      }
    } else {
      // Se não houver histórico, adiciona pelo menos a mensagem atual
      contents.push({
        role: "user",
        parts: [{ text: messageText }]
      });
    }

    // Certificar de que a última mensagem do array de conteúdos é a do usuário atual
    if (contents.length > 0 && contents[contents.length - 1].role !== "user") {
      contents.push({
        role: "user",
        parts: [{ text: messageText }]
      });
    }

    // 4. Chamar a Gemini API (gemini-1.5-flash)
    if (!geminiApiKey) {
      console.error("Variável GEMINI_API_KEY não definida.");
      return new Response(JSON.stringify({ error: "Configuração do servidor de IA (Gemini) ausente" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiSystemPrompt = `${systemPrompt}\n\nIMPORTANTE: Você NÃO possui suporte a execução de código Python. Suas únicas ferramentas são: get_available_slots, send_confirmation_buttons, book_appointment, pause_bot.`;

    // Usar exclusivamente gemini-flash-latest (modelo com cota ativa)
    const candidateUrls = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`
    ];

    const fetchGeminiResilient = async (payload: any) => {
      let lastErr = "";
      for (const url of candidateUrls) {
        // Timeout de 8s por chamada para evitar travamento
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          const resJson = await res.json();

          if (res.ok && !resJson.error) {
            console.log(`[Gemini] Sucesso com: ${url.split('/models/')[1]?.split(':')[0]}`);
            return resJson;
          }

          lastErr = resJson.error?.message || res.statusText;
          console.warn(`[Gemini Fallback] ${url.split('/models/')[1]?.split(':')[0]}: ${lastErr.substring(0, 100)}`);

          // Se o modelo não existe (404) ou não é suportado, não tente de novo — vá para o próximo
          if (res.status === 404 || lastErr.includes("not found") || lastErr.includes("not supported")) {
            continue;
          }

          // Para erro de quota, esperar antes de tentar novamente
          if (res.status === 429 || lastErr.includes("quota")) {
            await new Promise(r => setTimeout(r, 2000));
            // Tentar mais uma vez o mesmo modelo após aguardar
            const retry = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            const retryJson = await retry.json();
            if (retry.ok && !retryJson.error) return retryJson;
            lastErr = retryJson.error?.message || "Quota retry failed";
          }
        } catch (e: any) {
          clearTimeout(timeoutId);
          if (e.name === 'AbortError') {
            lastErr = `Timeout (8s) na URL ${url.split('/models/')[1]?.split(':')[0]}`;
            console.warn(`[Gemini] ${lastErr}`);
            continue; // Tenta próximo modelo
          }
          lastErr = e.message;
        }
      }
      throw new Error(`Erro na API Gemini: ${lastErr}`);
    };

    const requestPayload = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: geminiSystemPrompt }]
      },
      tools: toolsDeclaration,
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        maxOutputTokens: 150
      }
    };

    console.log("Enviando requisição ao Gemini (com resiliência)...");
    let resultJson = await fetchGeminiResilient(requestPayload);

    let responseText = "";
    const candidate = resultJson.candidates?.[0];
    const functionCall = candidate?.content?.parts?.[0]?.functionCall;

    if (functionCall) {
      const toolName = functionCall.name;
      const toolArgs = functionCall.args;

      let toolResult: any;
      try {
        toolResult = await executeTool(toolName, toolArgs);
      } catch (e: any) {
        // send_confirmation_buttons lança AbortError quando botões são enviados
        if (e instanceof DOMException && e.message.startsWith("__BUTTONS_SENT__")) {
          const label = e.message.replace("__BUTTONS_SENT__:", "");
          return new Response(JSON.stringify({ success: true, action: "buttons_sent", responseText: `Botões de confirmação enviados para ${label}` }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw e;
      }

      // Alimentar o resultado de volta para o Gemini gerar o diálogo final
      contents.push(candidate.content);
      contents.push({
        role: "user",
        parts: [{
          functionResponse: {
            name: toolName,
            response: { output: toolResult }
          }
        }]
      });

      console.log("Enviando resultado da Tool de volta para o Gemini...");
      resultJson = await fetchGeminiResilient({
        contents: contents,
        systemInstruction: {
          parts: [{ text: geminiSystemPrompt }]
        },
        tools: toolsDeclaration,
        generationConfig: {
          temperature: 0.3,
          topP: 0.95,
          maxOutputTokens: 120
        }
      });

      responseText = resultJson.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      responseText = candidate?.content?.parts?.[0]?.text || "";
    }

    if (!responseText) {
      responseText = "Desculpe, tive um probleminha aqui. Pode repetir? 🦷";
    }

    // Salvar a mensagem gerada pela IA na tabela chat_messages
    if (patient) {
      const { error: botMsgErr } = await supabase
        .from("chat_messages")
        .insert({
          clinic_id: clinic.id,
          patient_id: patient.id,
          sender: "BOT",
          message_text: responseText
        });
      if (botMsgErr) console.error("Erro ao salvar mensagem do bot no chat:", botMsgErr);
    }

    // 6. Enviar a resposta final de volta via Evolution API
    const evolutionApiBase = Deno.env.get("EVOLUTION_API_BASE_URL") || "http://179.197.225.90:8080";
    const evolutionApiKey = waConfig.api_key;
    const sendUrl = `${evolutionApiBase.replace(/\/$/, "")}/message/sendText/${instanceName}`;

    console.log("Enviando resposta via Evolution API:", sendUrl, "| Texto:", responseText.substring(0, 80));

    const messagePayload = {
      number: senderPhone,
      text: responseText,
      options: {
        delay: 800,
        presence: "composing"
      }
    };

    const sendRes = await fetch(sendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": evolutionApiKey
      },
      body: JSON.stringify(messagePayload)
    });

    const sendResText = await sendRes.text();
    console.log("Resposta da Evolution API:", sendResText);

    return new Response(JSON.stringify({ success: true, responseText }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Erro geral na Edge Function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

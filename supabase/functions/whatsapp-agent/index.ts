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

    // Extrair o conteúdo em texto da mensagem
    let messageText = "";
    const msg = messageData.message;
    if (msg) {
      if (msg.conversation) {
        messageText = msg.conversation;
      } else if (msg.extendedTextMessage?.text) {
        messageText = msg.extendedTextMessage.text;
      }
    }

    if (!messageText.trim()) {
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

    // Validação de Segurança Estrita: Exigir token de validação (apikey ou WHATSAPP_WEBHOOK_SECRET)
    const requestApiKey = req.headers.get("apikey") || req.headers.get("x-api-key") || req.headers.get("authorization");
    const expectedSecret = waConfig.api_key || Deno.env.get("WHATSAPP_WEBHOOK_SECRET");
    
    if (!expectedSecret || requestApiKey !== expectedSecret) {
      console.warn(`[Segurança] Tentativa de chamada não autorizada ao webhook para a instância: ${instanceName}`);
      return new Response(JSON.stringify({ error: "Não autorizado. Token de validação ausente ou inválido." }), {
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

      // Verificar se a IA está pausada para este paciente
      const { data: chatSession } = await supabase
        .from("chat_sessions")
        .select("is_bot_paused")
        .eq("patient_id", patient.id)
        .maybeSingle();

      if (chatSession?.is_bot_paused) {
        console.log(`IA pausada para o paciente: ${patient.name}. Ignorando resposta do bot.`);
        return new Response(JSON.stringify({ message: "IA pausada para este paciente. Encaminhado para atendimento humano." }), {
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
    const systemPrompt = `
Você é a Sofia, assistente virtual da clínica "${clinic.name}".
Seu objetivo é interagir com o paciente de forma extremamente profissional, acolhedora, humana e prestativa via WhatsApp.
Seu foco principal é auxiliar com agendamentos, confirmações ou cancelamentos de consultas odontológicas.

Instruções Operacionais e de Tom de Voz:
- O nome do paciente é "${patient?.name || senderName}". Trate-o com respeito e de forma personalizada.
- A data e hora atual do servidor é: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} (Fuso São Paulo). Use isso como referência para responder sobre "amanhã", "depois de amanhã", dias da semana, etc.
- Horário de funcionamento da clínica: Segunda a Sexta, das 08:00h às 18:00h.
- A clínica trabalha com intervalos de 1 hora por consulta (slots cheios, ex: 08:00, 09:00, 10:00, 14:00, 15:00, 16:00, 17:00).
- Tom de Voz: Seja extremamente profissional, polida, prestativa e calorosa. Evite expressões excessivamente formais ou robóticas, mas mantenha um tom de atendimento sênior e acolhedor.
- Emojis: Use emojis com extrema moderação. No máximo 1 emoji discreto por mensagem (ex: 🦷 ou 😊) para dar um toque amigável sem poluir visualmente o texto. Nunca use vários emojis na mesma mensagem.
- Clareza: Seja concisa nas respostas, respondendo diretamente ao que foi solicitado e mantendo as mensagens curtas para facilitar a leitura no celular.

Fluxo de Coleta de Dados e Agendamento:
1. Confirmação de Cadastro: Se o cadastro inicial estiver com um nome incompleto, apelido ou for a primeira vez que fala com o número, confirme gentilmente o nome completo do paciente para cadastro no CRM.
2. Consulta de Horários: Se o paciente solicitar horários livres, chame "get_available_slots" para a data correspondente e informe de forma organizada quais estão disponíveis.
3. Confirmação do Slot: Assim que o paciente escolher um horário e uma data livres, confirme os dados com ele antes de realizar a reserva.
4. Agendamento: Quando ele der o aceite explícito (ex: "pode marcar", "confirmado"), chame a função "book_appointment" para registrar a consulta na agenda do CRM e confirme informando que o agendamento foi concluído com sucesso.

Instruções base personalizadas da clínica:
"${waConfig.agent_prompt}"
`;

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

      if (name === "book_appointment") {
        const { date, hour } = args; // YYYY-MM-DD e HH:MM
        if (!date || !hour) return { error: "Parâmetros 'date' e 'hour' são obrigatórios." };

        const startTime = new Date(`${date}T${hour}:00`);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hora

        // Buscar o primeiro profissional/dentista cadastrado na clínica
        const { data: profiles, error: profError } = await supabase
          .from("profiles")
          .select("id")
          .eq("clinic_id", clinic.id)
          .limit(1);

        if (profError || !profiles || profiles.length === 0) {
          console.error("Nenhum profissional cadastrado na clínica:", profError);
          return { error: "Nenhum dentista/profissional cadastrado na clínica para realizar o agendamento." };
        }

        const doctorId = profiles[0].id;

        // Criar registro na tabela appointments
        const { data: newApp, error } = await supabase
          .from("appointments")
          .insert({
            clinic_id: clinic.id,
            patient_id: patient.id,
            doctor_id: doctorId,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: "CONFIRMED" // Confirmado automaticamente pela IA
          })
          .select()
          .single();

        if (error) {
          console.error("Erro ao inserir consulta:", error);
          return { error: "Não foi possível realizar o agendamento no momento." };
        }

        return {
          success: true,
          appointment_id: newApp.id,
          message: `Agendamento efetuado com sucesso no CRM para o paciente ${patient.name} no dia ${date} às ${hour}.`
        };
      }

      if (name === "pause_bot") {
        // Atualizar is_bot_paused para true na tabela chat_sessions
        const { error } = await supabase
          .from("chat_sessions")
          .upsert({
            clinic_id: clinic.id,
            patient_id: patient.id,
            is_bot_paused: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: "patient_id"
          });

        if (error) {
          console.error("Erro ao pausar o bot no banco:", error);
          return { error: "Não foi possível pausar o atendimento automatizado." };
        }

        return {
          success: true,
          message: "O bot de atendimento foi pausado com sucesso. Um atendente humano assumirá o contato em instantes."
        };
      }

      return { error: "Função não encontrada." };
    };

    // Definição das declarações das ferramentas enviadas ao Gemini
    const toolsDeclaration = [
      {
        functionDeclarations: [
          {
            name: "get_available_slots",
            description: "Retorna a lista de horários (HH:MM) que estão livres para agendamento em uma data específica (no formato YYYY-MM-DD).",
            parameters: {
              type: "OBJECT",
              properties: {
                date: {
                  type: "STRING",
                  description: "A data a ser pesquisada (ex: 2026-07-09)."
                }
              },
              required: ["date"]
            }
          },
          {
            name: "book_appointment",
            description: "Registra uma nova consulta confirmada na agenda para este paciente. Chame apenas quando o paciente aceitar explicitamente o horário e data.",
            parameters: {
              type: "OBJECT",
              properties: {
                date: {
                  type: "STRING",
                  description: "A data escolhida pelo paciente no formato YYYY-MM-DD."
                },
                hour: {
                  type: "STRING",
                  description: "O horário escolhido pelo paciente no formato HH:MM (ex: 14:00)."
                }
              },
              required: ["date", "hour"]
            }
          },
          {
            name: "pause_bot",
            description: "Pausa o bot de atendimento inteligente para este paciente, encaminhando a conversa para atendimento humano. Chame quando o paciente demonstrar dor forte, urgência odontológica, irritação/descontentamento grave ou solicitar falar com um humano.",
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

    // Adicionar instrução de segurança contra Code Execution no prompt
    const geminiSystemPrompt = `${systemPrompt}\n\nIMPORTANTE: Você NÃO possui suporte a ferramentas de execução de código Python (code execution). Não tente escrever código, programar ou chamar funções como print(). Suas únicas ferramentas são as declaradas na estrutura 'tools' (get_available_slots, book_appointment, pause_bot).`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

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

    console.log("Enviando requisição ao Gemini (1.5-flash)...");
    let response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload)
    });

    let resultJson = await response.json();
    console.log("Resposta Gemini:", JSON.stringify(resultJson));

    if (!response.ok) {
      throw new Error(`Erro na API Gemini: ${resultJson.error?.message || response.statusText}`);
    }

    let responseText = "";
    const candidate = resultJson.candidates?.[0];
    const functionCall = candidate?.content?.parts?.[0]?.functionCall;

    if (functionCall) {
      const toolName = functionCall.name;
      const toolArgs = functionCall.args;

      // Executar a ação de banco de dados
      const toolResult = await executeTool(toolName, toolArgs);

      // Alimentar o resultado de volta para o Gemini gerar o diálogo final
      contents.push(candidate.content);
      contents.push({
        role: "function",
        parts: [{
          functionResponse: {
            name: toolName,
            response: { output: toolResult }
          }
        }]
      });

      console.log("Enviando resultado da Tool de volta para o Gemini...");
      response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        })
      });

      resultJson = await response.json();
      console.log("Resposta diálogo final Gemini:", JSON.stringify(resultJson));
      responseText = resultJson.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      responseText = candidate?.content?.parts?.[0]?.text || "";
    }

    if (!responseText) {
      responseText = "Desculpe, tive um probleminha para processar sua mensagem agora. Pode tentar novamente em alguns instantes? 🦷";
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
    const evolutionApiBase = Deno.env.get("EVOLUTION_API_BASE_URL") || "http://localhost:8080";
    const evolutionApiKey = waConfig.api_key;
    const sendUrl = `${evolutionApiBase}/message/sendText/${instanceName}`;

    console.log("Enviando resposta via Evolution API para:", sendUrl);

    const messagePayload = {
      number: remoteJid,
      text: responseText,
      options: {
        delay: 1000,
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

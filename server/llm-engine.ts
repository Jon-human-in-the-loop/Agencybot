/**
 * Motor LLM Multi-Proveedor
 * Adaptador unificado para OpenAI, Anthropic Claude, Google Gemini, Groq y Ollama
 * Permite cambiar de proveedor sin modificar la lógica de negocio
 */

import { invokeLLM } from "./_core/llm";
import { getLlmConfigById, getDefaultLlmConfig, getBotProfileById, addMessage, getMessagesBySession, updateSession } from "./db";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMResponse {
  content: string;
  tokensUsed?: number;
  responseTimeMs: number;
  provider: string;
  model: string;
}

export interface ChatRequest {
  sessionId: string;
  botProfileId: number;
  userMessage: string;
  llmConfigId?: number;
}

// ─── Adaptador Unificado LLM ──────────────────────────────────────────────────
async function callLLMProvider(
  messages: ChatMessage[],
  config: { provider: string; model: string; apiKey?: string | null; baseUrl?: string | null; maxTokens?: number | null; temperature?: number | null }
): Promise<{ content: string; tokensUsed?: number }> {

  const provider = config.provider;

  // Para el proveedor built-in de Manus (usa invokeLLM interno)
  if (provider === "openai" && !config.apiKey) {
    const response = await invokeLLM({ messages });
    const rawContent = response.choices?.[0]?.message?.content ?? "";
    const content = typeof rawContent === "string" ? rawContent : "";
    const tokensUsed = response.usage?.total_tokens;
    return { content, tokensUsed };
  }

  // Para OpenAI con API key propia
  if (provider === "openai" && config.apiKey) {
    const baseUrl = config.baseUrl || "https://api.openai.com/v1";
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens ?? 2048,
        temperature: config.temperature ?? 0.7,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
    const data = await res.json() as any;
    return { content: data.choices[0].message.content, tokensUsed: data.usage?.total_tokens };
  }

  // Para Anthropic Claude
  if (provider === "anthropic" && config.apiKey) {
    const systemMsg = messages.find(m => m.role === "system");
    const chatMessages = messages.filter(m => m.role !== "system");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens ?? 2048,
        system: systemMsg?.content,
        messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`);
    const data = await res.json() as any;
    return { content: data.content[0].text, tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens };
  }

  // Para Google Gemini
  if (provider === "gemini" && config.apiKey) {
    const systemMsg = messages.find(m => m.role === "system");
    const chatMessages = messages.filter(m => m.role !== "system");
    const geminiMessages = chatMessages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: config.maxTokens ?? 2048, temperature: config.temperature ?? 0.7 },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
    const data = await res.json() as any;
    return { content: data.candidates[0].content.parts[0].text, tokensUsed: data.usageMetadata?.totalTokenCount };
  }

  // Para Groq (compatible con OpenAI API)
  if (provider === "groq" && config.apiKey) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens ?? 2048,
        temperature: config.temperature ?? 0.7,
      }),
    });
    if (!res.ok) throw new Error(`Groq API error: ${res.status} ${await res.text()}`);
    const data = await res.json() as any;
    return { content: data.choices[0].message.content, tokensUsed: data.usage?.total_tokens };
  }

  // Para Ollama (local)
  if (provider === "ollama") {
    const baseUrl = config.baseUrl || "http://localhost:11434";
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        messages,
        stream: false,
        options: { num_predict: config.maxTokens ?? 2048, temperature: config.temperature ?? 0.7 },
      }),
    });
    if (!res.ok) throw new Error(`Ollama API error: ${res.status} ${await res.text()}`);
    const data = await res.json() as any;
    return { content: data.message.content };
  }

  // Para OpenRouter (compatible con OpenAI API)
  if (provider === "openrouter" && config.apiKey) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens ?? 2048,
        temperature: config.temperature ?? 0.7,
      }),
    });
    if (!res.ok) throw new Error(`OpenRouter API error: ${res.status} ${await res.text()}`);
    const data = await res.json() as any;
    return { content: data.choices[0].message.content, tokensUsed: data.usage?.total_tokens };
  }

  // Fallback: usar el LLM built-in de Manus
  const response = await invokeLLM({ messages });
  const rawContent2 = response.choices?.[0]?.message?.content ?? "Lo siento, no pude procesar tu mensaje.";
  const content = typeof rawContent2 === "string" ? rawContent2 : "Lo siento, no pude procesar tu mensaje.";
  return { content, tokensUsed: response.usage?.total_tokens };
}

// ─── Motor Principal de Chat ──────────────────────────────────────────────────
export async function processChat(req: ChatRequest): Promise<LLMResponse> {
  const startTime = Date.now();

  // 1. Obtener perfil del bot
  const bot = await getBotProfileById(req.botProfileId);
  if (!bot) throw new Error(`Bot profile ${req.botProfileId} not found`);

  // 2. Obtener configuración LLM
  let llmConfig = req.llmConfigId
    ? await getLlmConfigById(req.llmConfigId)
    : bot.llmConfigId
    ? await getLlmConfigById(bot.llmConfigId)
    : await getDefaultLlmConfig();

  // 3. Obtener historial de conversación
  const history = await getMessagesBySession(req.sessionId);

  // 4. Construir el array de mensajes
  const chatMessages: ChatMessage[] = [
    { role: "system", content: bot.systemPrompt },
    ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: req.userMessage },
  ];

  // 5. Guardar mensaje del usuario
  await addMessage({
    sessionId: req.sessionId,
    role: "user",
    content: req.userMessage,
  });

  // 6. Llamar al LLM
  let responseContent = "";
  let tokensUsed: number | undefined;

  try {
    const result = await callLLMProvider(chatMessages, {
      provider: llmConfig?.provider ?? "openai",
      model: llmConfig?.model ?? "gpt-4o-mini",
      apiKey: llmConfig?.apiKey,
      baseUrl: llmConfig?.baseUrl,
      maxTokens: llmConfig?.maxTokens,
      temperature: llmConfig?.temperature,
    });
    responseContent = result.content;
    tokensUsed = result.tokensUsed;
  } catch (error) {
    console.error("[LLM Engine] Error calling provider:", error);
    // Fallback al built-in
    const fallback = await invokeLLM({ messages: chatMessages });
    const rawFallback = fallback.choices?.[0]?.message?.content ?? "Lo siento, ocurrió un error. Por favor intenta de nuevo.";
    responseContent = typeof rawFallback === "string" ? rawFallback : "Lo siento, ocurrió un error. Por favor intenta de nuevo.";
    tokensUsed = fallback.usage?.total_tokens;
  }

  const responseTimeMs = Date.now() - startTime;

  // 7. Guardar respuesta del bot
  await addMessage({
    sessionId: req.sessionId,
    role: "assistant",
    content: responseContent,
    tokensUsed,
    responseTimeMs,
    llmProvider: llmConfig?.provider ?? "openai",
    llmModel: llmConfig?.model ?? "gpt-4o-mini",
  });

  // 8. Actualizar sesión
  await updateSession(req.sessionId, { lastActivityAt: new Date() });

  return {
    content: responseContent,
    tokensUsed,
    responseTimeMs,
    provider: llmConfig?.provider ?? "openai",
    model: llmConfig?.model ?? "gpt-4o-mini",
  };
}

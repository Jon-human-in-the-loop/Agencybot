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

interface LLMConfig {
  provider: string;
  model: string;
  apiKey?: string | null;
  baseUrl?: string | null;
  maxTokens?: number | null;
  temperature?: number | null;
}

const DEFAULT_MAX_TOKENS = 2048;
const DEFAULT_TEMPERATURE = 0.7;

// ─── LLM Provider Handlers ─────────────────────────────────────────────────────

async function callOpenAICompatible(
  messages: ChatMessage[],
  config: LLMConfig,
  endpoint: string
): Promise<{ content: string; tokensUsed?: number }> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: config.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: config.temperature ?? DEFAULT_TEMPERATURE,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`${config.provider} API error: ${res.status} ${error}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens
  };
}

async function callAnthropic(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ content: string; tokensUsed?: number }> {
  const systemMsg = messages.find(m => m.role === "system");
  const chatMessages = messages.filter(m => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey as string,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens ?? DEFAULT_MAX_TOKENS,
      system: systemMsg?.content,
      messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${error}`);
  }

  const data = await res.json();
  return {
    content: data.content[0].text,
    tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0)
  };
}

async function callGemini(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ content: string; tokensUsed?: number }> {
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
        generationConfig: {
          maxOutputTokens: config.maxTokens ?? DEFAULT_MAX_TOKENS,
          temperature: config.temperature ?? DEFAULT_TEMPERATURE
        },
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${error}`);
  }

  const data = await res.json();
  return {
    content: data.candidates[0].content.parts[0].text,
    tokensUsed: data.usageMetadata?.totalTokenCount
  };
}

async function callOllama(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ content: string; tokensUsed?: number }> {
  const baseUrl = config.baseUrl || "http://localhost:11434";

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: false,
      options: {
        num_predict: config.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: config.temperature ?? DEFAULT_TEMPERATURE
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Ollama API error: ${res.status} ${error}`);
  }

  const data = await res.json();
  return { content: data.message.content };
}

// ─── Adaptador Unificado LLM ──────────────────────────────────────────────────

async function callLLMProvider(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ content: string; tokensUsed?: number }> {
  if (!config.apiKey && config.provider !== "ollama") {
    throw new Error(`API key is required for ${config.provider} provider`);
  }

  switch (config.provider) {
    case "openai": {
      const baseUrl = config.baseUrl || "https://api.openai.com/v1";
      return callOpenAICompatible(messages, config, `${baseUrl}/chat/completions`);
    }

    case "groq": {
      return callOpenAICompatible(messages, config, "https://api.groq.com/openai/v1/chat/completions");
    }

    case "openrouter": {
      return callOpenAICompatible(messages, config, "https://openrouter.ai/api/v1/chat/completions");
    }

    case "anthropic": {
      return callAnthropic(messages, config);
    }

    case "gemini": {
      return callGemini(messages, config);
    }

    case "ollama": {
      return callOllama(messages, config);
    }

    default: {
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }
}

// ─── Main Chat Processing ─────────────────────────────────────────────────────

export async function processChat(req: ChatRequest): Promise<LLMResponse> {
  const startTime = Date.now();

  // 1. Get bot profile
  const bot = await getBotProfileById(req.botProfileId);
  if (!bot) {
    throw new Error(`Bot profile not found: ${req.botProfileId}`);
  }

  // 2. Resolve LLM configuration
  const llmConfig = req.llmConfigId
    ? await getLlmConfigById(req.llmConfigId)
    : bot.llmConfigId
    ? await getLlmConfigById(bot.llmConfigId)
    : await getDefaultLlmConfig();

  if (!llmConfig) {
    throw new Error("No LLM configuration available");
  }

  // 3. Get conversation history
  const history = await getMessagesBySession(req.sessionId);

  // 4. Build message array
  const chatMessages: ChatMessage[] = [
    { role: "system", content: bot.systemPrompt },
    ...history.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content
    })),
    { role: "user", content: req.userMessage },
  ];

  // 5. Store user message
  await addMessage({
    sessionId: req.sessionId,
    role: "user",
    content: req.userMessage,
  });

  // 6. Call LLM provider
  let responseContent: string;
  let tokensUsed: number | undefined;

  try {
    const result = await callLLMProvider(chatMessages, {
      provider: llmConfig.provider,
      model: llmConfig.model,
      apiKey: llmConfig.apiKey,
      baseUrl: llmConfig.baseUrl,
      maxTokens: llmConfig.maxTokens,
      temperature: llmConfig.temperature,
    });
    responseContent = result.content;
    tokensUsed = result.tokensUsed;
  } catch (error) {
    console.error("[LLM Engine] Provider error:", error);
    throw new Error(`LLM processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const responseTimeMs = Date.now() - startTime;

  // 7. Store assistant response
  await addMessage({
    sessionId: req.sessionId,
    role: "assistant",
    content: responseContent,
    tokensUsed,
    responseTimeMs,
    llmProvider: llmConfig.provider,
    llmModel: llmConfig.model,
  });

  // 8. Update session
  await updateSession(req.sessionId, { lastActivityAt: new Date() });

  return {
    content: responseContent,
    tokensUsed,
    responseTimeMs,
    provider: llmConfig.provider,
    model: llmConfig.model,
  };
}

import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import {
  getAllBotProfiles, getBotProfileById, createBotProfile, updateBotProfile, deleteBotProfile,
  getAllLlmConfigs, getLlmConfigById, createLlmConfig, updateLlmConfig, deleteLlmConfig,
  createSession, getSessionById, getSessionsByBot, updateSession, getRecentSessions,
  getMessagesBySession, clearSessionMessages,
  getTemplatesByBot, createTemplate, updateTemplate, deleteTemplate,
  getFlowsByBot, createFlow, updateFlow, deleteFlow,
  getWhatsappConnection, upsertWhatsappConnection,
  getDashboardStats, getBotStats,
} from "./db";
import { processChat } from "./llm-engine";
import { seedDatabase } from "./seed";
import { processVoiceInput, generateTwiML, generateResponseTwiML } from "./voice-engine";
import { INTEGRATION_CATALOG } from "./integrations-engine";
import { setupRouter } from "./routers-setup";
import {
  getAllVoiceAgents, getVoiceAgentById, createVoiceAgent, updateVoiceAgent,
  createVoiceCall, updateVoiceCall, getVoiceCallsByAgent,
  getAllIntegrations, getIntegrationById, upsertIntegration, deleteIntegration,
  getBotIntegrationLinks, addBotIntegrationLink, removeBotIntegrationLink,
  seedVoiceAgents, seedIntegrations,
} from "./db";

// ─── Schemas de validación ────────────────────────────────────────────────────
const botProfileSchema = z.object({
  slug: z.string().min(3).max(64),
  name: z.string().min(1).max(128),
  role: z.string().min(1).max(128),
  department: z.enum(["creative", "strategy", "content", "social", "analytics", "seo", "community", "accounts", "design", "management"]),
  avatar: z.string().max(8).default("🤖"),
  avatarColor: z.string().max(32).default("#00D084"),
  description: z.string().optional(),
  systemPrompt: z.string().min(10),
  welcomeMessage: z.string().optional(),
  personality: z.any().optional(),
  capabilities: z.any().optional(),
  llmConfigId: z.number().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const llmConfigSchema = z.object({
  name: z.string().min(1).max(128),
  provider: z.enum(["openai", "anthropic", "gemini", "groq", "ollama", "openrouter", "custom"]),
  model: z.string().min(1).max(128),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  maxTokens: z.number().min(1).max(128000).default(2048),
  temperature: z.number().min(0).max(2).default(0.7),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  extraParams: z.any().optional(),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Seed ──────────────────────────────────────────────────────────────────
  seed: router({
    initialize: publicProcedure.mutation(async () => {
      await seedDatabase();
      return { success: true, message: "Base de datos inicializada con 10 trabajadores virtuales" };
    }),
  }),

  // ─── Bot Profiles ──────────────────────────────────────────────────────────
  bots: router({
    list: publicProcedure.query(async () => {
      return getAllBotProfiles();
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const bot = await getBotProfileById(input.id);
      if (!bot) throw new TRPCError({ code: "NOT_FOUND", message: "Bot no encontrado" });
      return bot;
    }),

    create: protectedProcedure.input(botProfileSchema).mutation(async ({ input }) => {
      return createBotProfile(input);
    }),

    update: protectedProcedure.input(z.object({ id: z.number(), data: botProfileSchema.partial() })).mutation(async ({ input }) => {
      const bot = await updateBotProfile(input.id, input.data);
      if (!bot) throw new TRPCError({ code: "NOT_FOUND" });
      return bot;
    }),

    updatePrompt: protectedProcedure.input(z.object({ id: z.number(), systemPrompt: z.string().min(10) })).mutation(async ({ input }) => {
      return updateBotProfile(input.id, { systemPrompt: input.systemPrompt });
    }),

    toggleActive: protectedProcedure.input(z.object({ id: z.number(), isActive: z.boolean() })).mutation(async ({ input }) => {
      return updateBotProfile(input.id, { isActive: input.isActive });
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteBotProfile(input.id);
      return { success: true };
    }),

    getStats: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getBotStats(input.id);
    }),
  }),

  // ─── LLM Configs ──────────────────────────────────────────────────────────
  llm: router({
    list: publicProcedure.query(async () => {
      const configs = await getAllLlmConfigs();
      // Ocultar API keys en la respuesta
      return configs.map(c => ({ ...c, apiKey: c.apiKey ? "••••••••" : null }));
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const config = await getLlmConfigById(input.id);
      if (!config) throw new TRPCError({ code: "NOT_FOUND" });
      return { ...config, apiKey: config.apiKey ? "••••••••" : null };
    }),

    create: protectedProcedure.input(llmConfigSchema).mutation(async ({ input }) => {
      const config = await createLlmConfig(input);
      return config;
    }),

    update: protectedProcedure.input(z.object({ id: z.number(), data: llmConfigSchema.partial() })).mutation(async ({ input }) => {
      const config = await updateLlmConfig(input.id, input.data);
      if (!config) throw new TRPCError({ code: "NOT_FOUND" });
      return config;
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteLlmConfig(input.id);
      return { success: true };
    }),

    testConnection: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const config = await getLlmConfigById(input.id);
      if (!config) throw new TRPCError({ code: "NOT_FOUND" });
      // Test simple: crear una sesión temporal y enviar un mensaje de prueba
      const testSessionId = `test-${nanoid(8)}`;
      try {
        await processChat({
          sessionId: testSessionId,
          botProfileId: 1,
          userMessage: "Hola, esto es una prueba de conexión.",
          llmConfigId: input.id,
        });
        return { success: true, message: "Conexión exitosa con el proveedor LLM" };
      } catch (err: any) {
        return { success: false, message: err.message ?? "Error de conexión" };
      }
    }),
  }),

  // ─── Conversations / Simulator ─────────────────────────────────────────────
  conversations: router({
    createSession: publicProcedure.input(z.object({
      botProfileId: z.number(),
      clientName: z.string().optional(),
      channel: z.enum(["whatsapp", "simulator", "web", "api"]).default("simulator"),
    })).mutation(async ({ input, ctx }) => {
      const sessionId = nanoid(24);
      const session = await createSession({
        sessionId,
        botProfileId: input.botProfileId,
        userId: ctx.user?.id,
        clientName: input.clientName ?? "Usuario",
        channel: input.channel,
        status: "active",
        startedAt: new Date(),
        lastActivityAt: new Date(),
      });

      // Enviar mensaje de bienvenida del bot
      const bot = await getBotProfileById(input.botProfileId);
      if (bot?.welcomeMessage) {
        const { addMessage } = await import("./db");
        await addMessage({
          sessionId,
          role: "assistant",
          content: bot.welcomeMessage,
        });
      }

      return session;
    }),

    sendMessage: publicProcedure.input(z.object({
      sessionId: z.string(),
      message: z.string().min(1).max(4000),
      llmConfigId: z.number().optional(),
    })).mutation(async ({ input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Sesión no encontrada" });
      if (session.status === "closed") throw new TRPCError({ code: "BAD_REQUEST", message: "La sesión está cerrada" });

      const response = await processChat({
        sessionId: input.sessionId,
        botProfileId: session.botProfileId,
        userMessage: input.message,
        llmConfigId: input.llmConfigId,
      });

      return response;
    }),

    getMessages: publicProcedure.input(z.object({ sessionId: z.string() })).query(async ({ input }) => {
      return getMessagesBySession(input.sessionId);
    }),

    getSession: publicProcedure.input(z.object({ sessionId: z.string() })).query(async ({ input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });
      return session;
    }),

    listByBot: publicProcedure.input(z.object({ botProfileId: z.number(), limit: z.number().default(50) })).query(async ({ input }) => {
      return getSessionsByBot(input.botProfileId, input.limit);
    }),

    recent: publicProcedure.input(z.object({ limit: z.number().default(20) })).query(async ({ input }) => {
      return getRecentSessions(input.limit);
    }),

    closeSession: publicProcedure.input(z.object({
      sessionId: z.string(),
      satisfactionScore: z.number().min(1).max(5).optional(),
    })).mutation(async ({ input }) => {
      await updateSession(input.sessionId, {
        status: "closed",
        closedAt: new Date(),
        satisfactionScore: input.satisfactionScore,
      });
      return { success: true };
    }),

    clearHistory: protectedProcedure.input(z.object({ sessionId: z.string() })).mutation(async ({ input }) => {
      await clearSessionMessages(input.sessionId);
      return { success: true };
    }),
  }),

  // ─── Response Templates ────────────────────────────────────────────────────
  templates: router({
    listByBot: publicProcedure.input(z.object({ botProfileId: z.number() })).query(async ({ input }) => {
      return getTemplatesByBot(input.botProfileId);
    }),

    create: protectedProcedure.input(z.object({
      botProfileId: z.number(),
      title: z.string().min(1).max(256),
      trigger: z.string().optional(),
      content: z.string().min(1),
      category: z.string().optional(),
      variables: z.any().optional(),
      isActive: z.boolean().default(true),
    })).mutation(async ({ input }) => {
      return createTemplate(input);
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      data: z.object({
        title: z.string().optional(),
        trigger: z.string().optional(),
        content: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    })).mutation(async ({ input }) => {
      return updateTemplate(input.id, input.data);
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteTemplate(input.id);
      return { success: true };
    }),
  }),

  // ─── Conversation Flows ────────────────────────────────────────────────────
  flows: router({
    listByBot: publicProcedure.input(z.object({ botProfileId: z.number() })).query(async ({ input }) => {
      return getFlowsByBot(input.botProfileId);
    }),

    create: protectedProcedure.input(z.object({
      botProfileId: z.number(),
      name: z.string().min(1).max(256),
      description: z.string().optional(),
      trigger: z.string().optional(),
      steps: z.any(),
      isActive: z.boolean().default(true),
      priority: z.number().default(0),
    })).mutation(async ({ input }) => {
      return createFlow(input);
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        trigger: z.string().optional(),
        steps: z.any().optional(),
        isActive: z.boolean().optional(),
        priority: z.number().optional(),
      }),
    })).mutation(async ({ input }) => {
      return updateFlow(input.id, input.data);
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteFlow(input.id);
      return { success: true };
    }),
  }),

  // ─── WhatsApp Connections ──────────────────────────────────────────────────
  whatsapp: router({
    getConnection: publicProcedure.input(z.object({ botProfileId: z.number() })).query(async ({ input }) => {
      return getWhatsappConnection(input.botProfileId);
    }),

    saveConnection: protectedProcedure.input(z.object({
      botProfileId: z.number(),
      instanceName: z.string().min(1),
      evolutionApiUrl: z.string().optional(),
      evolutionApiKey: z.string().optional(),
      phoneNumber: z.string().optional(),
    })).mutation(async ({ input }) => {
      return upsertWhatsappConnection(input);
    }),
  }),

  // ─── Voice Agents ──────────────────────────────────────────────────────────
  voice: router({
    list: publicProcedure.query(async () => {
      return getAllVoiceAgents();
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const agent = await getVoiceAgentById(input.id);
      if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: "Agente de voz no encontrado" });
      return agent;
    }),

    create: protectedProcedure.input(z.object({
      slug: z.string().min(3).max(64),
      name: z.string().min(1).max(128),
      role: z.string().min(1).max(128),
      department: z.string().default("general"),
      avatar: z.string().max(8).default("📞"),
      description: z.string().optional(),
      systemPrompt: z.string().min(10),
      welcomeMessage: z.string().optional(),
      voiceId: z.string().optional(),
      voiceProvider: z.enum(["elevenlabs", "openai_tts", "google_tts", "browser"]).default("browser"),
      sttProvider: z.enum(["deepgram", "openai_whisper", "google_stt", "browser"]).default("browser"),
      language: z.string().default("es"),
      isActive: z.boolean().default(true),
      sortOrder: z.number().default(0),
    })).mutation(async ({ input }) => {
      return createVoiceAgent(input);
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        systemPrompt: z.string().optional(),
        welcomeMessage: z.string().optional(),
        voiceId: z.string().optional(),
        voiceProvider: z.enum(["elevenlabs", "openai_tts", "google_tts", "browser"]).optional(),
        sttProvider: z.enum(["deepgram", "openai_whisper", "google_stt", "browser"]).optional(),
        isActive: z.boolean().optional(),
        twilioPhoneNumber: z.string().optional(),
        twilioAccountSid: z.string().optional(),
        twilioAuthToken: z.string().optional(),
      }),
    })).mutation(async ({ input }) => {
      return updateVoiceAgent(input.id, input.data);
    }),

    // Simulador de llamada: procesa audio y devuelve respuesta con TTS
    processCall: publicProcedure.input(z.object({
      agentId: z.number(),
      audioBase64: z.string().optional(),
      textInput: z.string().optional(), // fallback si no hay audio
      callId: z.string(),
      conversationHistory: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).default([]),
      deepgramApiKey: z.string().optional(),
      elevenLabsApiKey: z.string().optional(),
    })).mutation(async ({ input }) => {
      const agent = await getVoiceAgentById(input.agentId);
      if (!agent) throw new TRPCError({ code: "NOT_FOUND" });

      let transcript = input.textInput ?? "";
      let audioBase64: string | undefined;
      let sttProvider = "text_input";
      let ttsProvider = "browser";

      // Si hay audio, procesarlo con STT
      if (input.audioBase64 && input.audioBase64.length > 0) {
        try {
          const { processVoiceInput: pvi } = await import("./voice-engine");
          const result = await pvi({
            audioBase64: input.audioBase64,
            systemPrompt: agent.systemPrompt,
            conversationHistory: input.conversationHistory,
            deepgramApiKey: input.deepgramApiKey,
            elevenLabsApiKey: input.elevenLabsApiKey,
            language: agent.language ?? "es",
            voiceId: agent.voiceId ?? undefined,
            sttProvider: agent.sttProvider ?? "browser",
            ttsProvider: agent.voiceProvider ?? "browser",
            llmInvoker: async (messages): Promise<string> => {
              const { invokeLLM } = await import("./_core/llm");
              const res = await invokeLLM({ messages });
              const c = res.choices?.[0]?.message?.content;
              return typeof c === "string" ? c : "Lo siento, no pude procesar tu solicitud.";
            },
          });
          transcript = result.transcript;
          audioBase64 = result.audioBase64;
          sttProvider = result.provider.stt;
          ttsProvider = result.provider.tts;
        } catch (e: any) {
          console.warn("[VoiceRouter] processVoiceInput failed:", e.message);
        }
      }

      // Si no hay transcript aún (solo texto), usar LLM directamente
      if (!transcript && input.textInput) {
        transcript = input.textInput;
      }

      // Generar respuesta LLM si no se procesó vía voice pipeline
      let responseText = "";
      if (transcript && !audioBase64) {
        const { invokeLLM } = await import("./_core/llm");
        const messages = [
          { role: "system" as const, content: agent.systemPrompt },
          ...input.conversationHistory,
          { role: "user" as const, content: transcript },
        ];
        const res = await invokeLLM({ messages });
        const rawContent = res.choices?.[0]?.message?.content;
        responseText = typeof rawContent === "string" ? rawContent : "Lo siento, no pude procesar tu solicitud.";
      }

      // Registrar en DB
      await createVoiceCall({
        callId: input.callId,
        voiceAgentId: input.agentId,
        channel: "simulator",
        status: "active",
      });

      return {
        transcript,
        response: responseText || (audioBase64 ? "[Audio generado]" : ""),
        audioBase64,
        providers: { stt: sttProvider, tts: ttsProvider },
      };
    }),

    // Webhook de Twilio para llamadas entrantes
    twilioWebhook: publicProcedure.input(z.object({
      agentSlug: z.string(),
      CallSid: z.string().optional(),
      From: z.string().optional(),
    })).mutation(async ({ input }) => {
      const agents = await getAllVoiceAgents();
      const agent = agents.find(a => a.slug === input.agentSlug);
      if (!agent) return { twiml: generateTwiML({ welcomeMessage: "Lo siento, este agente no está disponible.", gatherAction: "/api/twilio/gather" }) };

      const twiml = generateTwiML({
        welcomeMessage: agent.welcomeMessage ?? `Hola, soy ${agent.name}. ¿En qué puedo ayudarte?`,
        gatherAction: `/api/trpc/voice.twilioGather?agentSlug=${input.agentSlug}`,
        language: agent.language ?? "es",
      });

      if (input.CallSid) {
        await createVoiceCall({
          callId: input.CallSid,
          voiceAgentId: agent.id,
          callerPhone: input.From,
          channel: "twilio",
          status: "active",
        });
      }

      return { twiml };
    }),

    callHistory: publicProcedure.input(z.object({ agentId: z.number(), limit: z.number().default(20) })).query(async ({ input }) => {
      return getVoiceCallsByAgent(input.agentId, input.limit);
    }),

    seedAgents: publicProcedure.mutation(async () => {
      await seedVoiceAgents();
      return { success: true, message: "6 agentes telefónicos inicializados" };
    }),
  }),

  // ─── App Integrations ──────────────────────────────────────────────────────
  integrations: router({
    catalog: publicProcedure.query(() => {
      return INTEGRATION_CATALOG;
    }),

    list: publicProcedure.query(async () => {
      return getAllIntegrations();
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const integration = await getIntegrationById(input.id);
      if (!integration) throw new TRPCError({ code: "NOT_FOUND" });
      return { ...integration, credentials: integration.credentials ? "[HIDDEN]" : null };
    }),

    connect: protectedProcedure.input(z.object({
      slug: z.string(),
      name: z.string(),
      category: z.string(),
      provider: z.string(),
      credentials: z.record(z.string(), z.string()).optional(),
      settings: z.record(z.string(), z.any()).optional(),
    })).mutation(async ({ input }) => {
      return upsertIntegration({
        slug: input.slug,
        name: input.name,
        category: input.category as any,
        provider: input.provider,
        credentials: input.credentials ?? {},
        settings: input.settings ?? {},
        isConnected: true,
        isActive: true,
      });
    }),

    disconnect: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await upsertIntegration({ id: input.id, isConnected: false, isActive: false } as any);
      return { success: true };
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteIntegration(input.id);
      return { success: true };
    }),

    // Vincular integración a un bot
    linkToBot: protectedProcedure.input(z.object({
      botProfileId: z.number().optional(),
      voiceAgentId: z.number().optional(),
      integrationId: z.number(),
      config: z.record(z.string(), z.any()).optional(),
    })).mutation(async ({ input }) => {
      return addBotIntegrationLink(input);
    }),

    unlinkFromBot: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await removeBotIntegrationLink(input.id);
      return { success: true };
    }),

    getBotLinks: publicProcedure.input(z.object({
      botProfileId: z.number().optional(),
      voiceAgentId: z.number().optional(),
    })).query(async ({ input }) => {
      return getBotIntegrationLinks(input);
    }),

    // Test de integración: enviar un webhook de prueba
    test: protectedProcedure.input(z.object({
      id: z.number(),
      testPayload: z.record(z.string(), z.any()).optional(),
    })).mutation(async ({ input }) => {
      const integration = await getIntegrationById(input.id);
      if (!integration) throw new TRPCError({ code: "NOT_FOUND" });

      if (integration.webhookUrl) {
        const { triggerWebhook } = await import("./integrations-engine");
        await triggerWebhook(integration.webhookUrl, {
          test: true,
          source: "agencybot",
          integrationSlug: integration.slug,
          timestamp: new Date().toISOString(),
          ...(input.testPayload ?? {}),
        });
        return { success: true, message: "Webhook de prueba enviado correctamente" };
      }

      return { success: true, message: "Integración verificada (sin webhook configurado)" };
    }),

    seedIntegrations: publicProcedure.mutation(async () => {
      await seedIntegrations();
      return { success: true, message: "Integraciones de ejemplo inicializadas" };
    }),
  }),

  // ─── Analytics / Dashboard ─────────────────────────────────────────────────
  analytics: router({
    dashboard: publicProcedure.query(async () => {
      return getDashboardStats();
    }),

    botStats: publicProcedure.input(z.object({ botProfileId: z.number() })).query(async ({ input }) => {
      return getBotStats(input.botProfileId);
    }),
  }),

  // ─── Setup / Deployment ────────────────────────────────────────────────────
  setup: setupRouter,
});

export type AppRouter = typeof appRouter;

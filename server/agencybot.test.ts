import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getAllBotProfiles: vi.fn().mockResolvedValue([
    {
      id: 1, slug: "director-creativo", name: "Valentina Cruz", role: "Directora Creativa",
      department: "creative", avatar: "🎨", avatarColor: "#FF6B6B",
      systemPrompt: "Eres Valentina, directora creativa de la agencia.",
      welcomeMessage: "¡Hola! Soy Valentina, ¿en qué proyecto creativo te puedo ayudar?",
      isActive: true, sortOrder: 1, createdAt: new Date(), updatedAt: new Date(),
    },
  ]),
  getBotProfileById: vi.fn().mockResolvedValue({
    id: 1, slug: "director-creativo", name: "Valentina Cruz",
    systemPrompt: "Eres Valentina, directora creativa de la agencia.",
    welcomeMessage: "¡Hola! Soy Valentina.",
    isActive: true,
  }),
  createBotProfile: vi.fn().mockResolvedValue({ id: 2, slug: "test-bot", name: "Test Bot" }),
  updateBotProfile: vi.fn().mockResolvedValue({ id: 1, slug: "director-creativo", name: "Valentina Cruz" }),
  deleteBotProfile: vi.fn().mockResolvedValue(undefined),
  getAllLlmConfigs: vi.fn().mockResolvedValue([
    { id: 1, name: "Manus Built-in", provider: "openai", model: "gpt-4o-mini", isDefault: true, isActive: true, apiKey: "sk-test" },
  ]),
  getLlmConfigById: vi.fn().mockResolvedValue({ id: 1, name: "Manus Built-in", provider: "openai", model: "gpt-4o-mini", apiKey: "sk-test" }),
  createLlmConfig: vi.fn().mockResolvedValue({ id: 3, name: "New Config" }),
  updateLlmConfig: vi.fn().mockResolvedValue({ id: 1, name: "Updated Config" }),
  deleteLlmConfig: vi.fn().mockResolvedValue(undefined),
  createSession: vi.fn().mockResolvedValue({ id: 1, sessionId: "test-session-123", botProfileId: 1, status: "active" }),
  getSessionById: vi.fn().mockResolvedValue({ id: 1, sessionId: "test-session-123", botProfileId: 1, status: "active" }),
  getSessionsByBot: vi.fn().mockResolvedValue([]),
  updateSession: vi.fn().mockResolvedValue(undefined),
  getRecentSessions: vi.fn().mockResolvedValue([]),
  getMessagesBySession: vi.fn().mockResolvedValue([]),
  clearSessionMessages: vi.fn().mockResolvedValue(undefined),
  addMessage: vi.fn().mockResolvedValue(undefined),
  getTemplatesByBot: vi.fn().mockResolvedValue([]),
  createTemplate: vi.fn().mockResolvedValue({ id: 1, title: "Test Template" }),
  updateTemplate: vi.fn().mockResolvedValue({ id: 1, title: "Updated Template" }),
  deleteTemplate: vi.fn().mockResolvedValue(undefined),
  getFlowsByBot: vi.fn().mockResolvedValue([]),
  createFlow: vi.fn().mockResolvedValue({ id: 1, name: "Test Flow" }),
  updateFlow: vi.fn().mockResolvedValue({ id: 1, name: "Updated Flow" }),
  deleteFlow: vi.fn().mockResolvedValue(undefined),
  getWhatsappConnection: vi.fn().mockResolvedValue(null),
  upsertWhatsappConnection: vi.fn().mockResolvedValue({ id: 1, botProfileId: 1, instanceName: "test-instance" }),
  getDashboardStats: vi.fn().mockResolvedValue({
    totalBots: 10, activeBots: 8, totalSessions: 150, activeSessions: 5,
    totalMessages: 1200, avgSatisfaction: 4.2, sessionsToday: 12,
  }),
  getBotStats: vi.fn().mockResolvedValue({ totalSessions: 25, totalMessages: 200, avgSatisfaction: 4.5 }),
  getAllVoiceAgents: vi.fn().mockResolvedValue([
    { id: 1, slug: "recepcionista-virtual", name: "Sofía - Recepcionista", role: "Recepcionista Virtual", isActive: true },
  ]),
  getVoiceAgentById: vi.fn().mockResolvedValue({
    id: 1, slug: "recepcionista-virtual", name: "Sofía - Recepcionista",
    systemPrompt: "Eres Sofía, recepcionista virtual.",
    welcomeMessage: "¡Buenos días! Soy Sofía.",
    voiceProvider: "browser", sttProvider: "browser", language: "es",
  }),
  createVoiceAgent: vi.fn().mockResolvedValue({ id: 7, slug: "nuevo-agente", name: "Nuevo Agente" }),
  updateVoiceAgent: vi.fn().mockResolvedValue({ id: 1, name: "Sofía Actualizada" }),
  createVoiceCall: vi.fn().mockResolvedValue({ callId: "test-call-123" }),
  updateVoiceCall: vi.fn().mockResolvedValue(undefined),
  getVoiceCallsByAgent: vi.fn().mockResolvedValue([]),
  getAllIntegrations: vi.fn().mockResolvedValue([
    { id: 1, slug: "hubspot", name: "HubSpot CRM", category: "crm", isConnected: false, isActive: false },
  ]),
  getIntegrationById: vi.fn().mockResolvedValue({ id: 1, slug: "hubspot", name: "HubSpot CRM", webhookUrl: null }),
  getIntegrationBySlug: vi.fn().mockResolvedValue({ id: 1, slug: "hubspot", name: "HubSpot CRM" }),
  upsertIntegration: vi.fn().mockResolvedValue({ id: 1, slug: "hubspot", name: "HubSpot CRM", isConnected: true }),
  deleteIntegration: vi.fn().mockResolvedValue(undefined),
  getBotIntegrationLinks: vi.fn().mockResolvedValue([]),
  addBotIntegrationLink: vi.fn().mockResolvedValue({ id: 1 }),
  removeBotIntegrationLink: vi.fn().mockResolvedValue(undefined),
  seedVoiceAgents: vi.fn().mockResolvedValue(undefined),
  seedIntegrations: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./seed", () => ({
  seedDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./llm-engine", () => ({
  processChat: vi.fn().mockResolvedValue({
    response: "Hola, soy tu asistente de marketing. ¿En qué puedo ayudarte?",
    sessionId: "test-session-123",
    tokensUsed: 45,
  }),
}));

vi.mock("./voice-engine", () => ({
  processVoiceInput: vi.fn().mockResolvedValue({
    transcript: "Hola, necesito información",
    response: "¡Hola! Claro, ¿en qué puedo ayudarte?",
    audioBase64: undefined,
    provider: { stt: "browser", tts: "browser" },
  }),
  generateTwiML: vi.fn().mockReturnValue("<Response><Say>Hola</Say></Response>"),
  generateResponseTwiML: vi.fn().mockReturnValue("<Response><Say>Respuesta</Say></Response>"),
}));

vi.mock("./integrations-engine", () => ({
  INTEGRATION_CATALOG: [
    { slug: "hubspot", name: "HubSpot CRM", category: "crm", provider: "hubspot", description: "CRM", icon: "🟠", color: "#FF7A59" },
    { slug: "mailchimp", name: "Mailchimp", category: "marketing", provider: "mailchimp", description: "Email marketing", icon: "🐵", color: "#FFE01B" },
  ],
  triggerWebhook: vi.fn().mockResolvedValue(undefined),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────
function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1, openId: "admin-user", name: "Admin", email: "admin@agencybot.com",
      loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Auth Router", () => {
  it("me → devuelve null para usuario no autenticado", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me → devuelve el usuario autenticado", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.auth.me();
    expect(result?.name).toBe("Admin");
    expect(result?.role).toBe("admin");
  });

  it("logout → limpia la cookie de sesión", async () => {
    const ctx = createAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

describe("Bots Router", () => {
  it("list → devuelve todos los perfiles de bot", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const bots = await caller.bots.list();
    expect(Array.isArray(bots)).toBe(true);
    expect(bots.length).toBeGreaterThan(0);
    expect(bots[0].name).toBe("Valentina Cruz");
  });

  it("getById → devuelve el bot correcto", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const bot = await caller.bots.getById({ id: 1 });
    expect(bot.slug).toBe("director-creativo");
    expect(bot.systemPrompt).toContain("Valentina");
  });

  it("create → crea un nuevo bot (requiere auth)", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const bot = await caller.bots.create({
      slug: "test-bot-nuevo",
      name: "Bot de Prueba",
      role: "Asistente de Prueba",
      department: "creative",
      avatar: "🤖",
      avatarColor: "#00D084",
      systemPrompt: "Eres un bot de prueba para la plataforma AgencyBot.",
      isActive: true,
      sortOrder: 99,
    });
    expect(bot).toBeDefined();
  });

  it("updatePrompt → actualiza el prompt del bot", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.bots.updatePrompt({
      id: 1,
      systemPrompt: "Eres Valentina, directora creativa actualizada con nuevas instrucciones para la agencia.",
    });
    expect(result).toBeDefined();
  });

  it("toggleActive → cambia el estado activo del bot", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.bots.toggleActive({ id: 1, isActive: false });
    expect(result).toBeDefined();
  });
});

describe("LLM Router", () => {
  it("list → devuelve configs con API keys ocultas", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const configs = await caller.llm.list();
    expect(Array.isArray(configs)).toBe(true);
    // API keys deben estar ocultas
    configs.forEach((c: any) => {
      if (c.apiKey) expect(c.apiKey).toBe("••••••••");
    });
  });

  it("create → crea una nueva configuración LLM", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const config = await caller.llm.create({
      name: "OpenAI GPT-4",
      provider: "openai",
      model: "gpt-4o",
      apiKey: "sk-test-key",
      maxTokens: 4096,
      temperature: 0.7,
      isDefault: false,
      isActive: true,
    });
    expect(config).toBeDefined();
  });
});

describe("Conversations Router", () => {
  it("createSession → crea una nueva sesión de conversación", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const session = await caller.conversations.createSession({
      botProfileId: 1,
      clientName: "Cliente Test",
      channel: "simulator",
    });
    expect(session).toBeDefined();
    expect(session.status).toBe("active");
  });

  it("sendMessage → envía un mensaje y recibe respuesta del LLM", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const response = await caller.conversations.sendMessage({
      sessionId: "test-session-123",
      message: "Hola, necesito ayuda con una campaña de marketing",
    });
    expect(response).toBeDefined();
    expect(response.response).toContain("marketing");
  });

  it("getMessages → obtiene el historial de mensajes", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const messages = await caller.conversations.getMessages({ sessionId: "test-session-123" });
    expect(Array.isArray(messages)).toBe(true);
  });

  it("closeSession → cierra la sesión con puntuación de satisfacción", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.conversations.closeSession({
      sessionId: "test-session-123",
      satisfactionScore: 5,
    });
    expect(result.success).toBe(true);
  });
});

describe("Voice Agents Router", () => {
  it("list → devuelve todos los agentes de voz", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const agents = await caller.voice.list();
    expect(Array.isArray(agents)).toBe(true);
    expect(agents.length).toBeGreaterThan(0);
    expect(agents[0].name).toContain("Sofía");
  });

  it("getById → devuelve el agente de voz correcto", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const agent = await caller.voice.getById({ id: 1 });
    expect(agent.slug).toBe("recepcionista-virtual");
    expect(agent.voiceProvider).toBe("browser");
  });

  it("processCall → procesa una llamada con texto (modo simulador)", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.voice.processCall({
      agentId: 1,
      textInput: "Hola, ¿con quién hablo?",
      callId: "test-call-001",
      conversationHistory: [],
    });
    expect(result).toBeDefined();
    expect(result.transcript).toBe("Hola, ¿con quién hablo?");
  });

  it("seedAgents → inicializa los 6 agentes telefónicos", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.voice.seedAgents();
    expect(result.success).toBe(true);
    expect(result.message).toContain("6");
  });
});

describe("Integrations Router", () => {
  it("catalog → devuelve el catálogo de integraciones disponibles", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const catalog = await caller.integrations.catalog();
    expect(Array.isArray(catalog)).toBe(true);
    expect(catalog.length).toBeGreaterThan(0);
    const hubspot = catalog.find((c: any) => c.slug === "hubspot");
    expect(hubspot).toBeDefined();
    expect(hubspot.category).toBe("crm");
  });

  it("list → devuelve las integraciones configuradas", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const integrations = await caller.integrations.list();
    expect(Array.isArray(integrations)).toBe(true);
  });

  it("connect → conecta una nueva integración (requiere auth)", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.integrations.connect({
      slug: "hubspot",
      name: "HubSpot CRM",
      category: "crm",
      provider: "hubspot",
      credentials: { apiKey: "pat-na1-test-key" },
    });
    expect(result).toBeDefined();
  });

  it("seedIntegrations → inicializa las integraciones de ejemplo", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.integrations.seedIntegrations();
    expect(result.success).toBe(true);
  });
});

describe("Analytics Router", () => {
  it("dashboard → devuelve estadísticas del dashboard", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const stats = await caller.analytics.dashboard();
    expect(stats).toBeDefined();
    expect(typeof stats.totalBots).toBe("number");
    expect(typeof stats.totalSessions).toBe("number");
  });

  it("botStats → devuelve estadísticas de un bot específico", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const stats = await caller.analytics.botStats({ botProfileId: 1 });
    expect(stats).toBeDefined();
  });
});

describe("WhatsApp Router", () => {
  it("getConnection → obtiene la conexión de WhatsApp de un bot", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const connection = await caller.whatsapp.getConnection({ botProfileId: 1 });
    expect(connection).toBeNull(); // No hay conexión en el mock
  });

  it("saveConnection → guarda la configuración de Evolution API", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.whatsapp.saveConnection({
      botProfileId: 1,
      instanceName: "agencybot-valentina",
      evolutionApiUrl: "https://evolution.tudominio.com",
      evolutionApiKey: "test-api-key",
      phoneNumber: "+1234567890",
    });
    expect(result).toBeDefined();
  });
});

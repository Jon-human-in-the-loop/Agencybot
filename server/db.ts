import { eq, desc, and, gte, sql, like, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  botProfiles, InsertBotProfile,
  llmConfigs, InsertLlmConfig,
  conversationSessions, InsertConversationSession,
  messages, InsertMessage,
  responseTemplates, InsertResponseTemplate,
  conversationFlows, InsertConversationFlow,
  metrics,
  whatsappConnections, InsertWhatsappConnection,
  appIntegrations, InsertAppIntegration,
  botIntegrationLinks, InsertBotIntegrationLink,
  voiceAgents, InsertVoiceAgent,
  voiceCalls, InsertVoiceCall,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Bot Profiles ─────────────────────────────────────────────────────────────
export async function getAllBotProfiles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(botProfiles).orderBy(botProfiles.sortOrder);
}

export async function getBotProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(botProfiles).where(eq(botProfiles.id, id)).limit(1);
  return result[0];
}

export async function getBotProfileBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(botProfiles).where(eq(botProfiles.slug, slug)).limit(1);
  return result[0];
}

export async function createBotProfile(data: InsertBotProfile) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(botProfiles).values(data);
  const result = await db.select().from(botProfiles).where(eq(botProfiles.slug, data.slug)).limit(1);
  return result[0];
}

export async function updateBotProfile(id: number, data: Partial<InsertBotProfile>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(botProfiles).set(data).where(eq(botProfiles.id, id));
  return getBotProfileById(id);
}

export async function deleteBotProfile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(botProfiles).where(eq(botProfiles.id, id));
}

// ─── LLM Configs ─────────────────────────────────────────────────────────────
export async function getAllLlmConfigs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(llmConfigs).orderBy(desc(llmConfigs.isDefault));
}

export async function getLlmConfigById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(llmConfigs).where(eq(llmConfigs.id, id)).limit(1);
  return result[0];
}

export async function getDefaultLlmConfig() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(llmConfigs).where(and(eq(llmConfigs.isDefault, true), eq(llmConfigs.isActive, true))).limit(1);
  return result[0];
}

export async function createLlmConfig(data: InsertLlmConfig) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(llmConfigs).values(data);
  return getLlmConfigById((result as any).insertId);
}

export async function updateLlmConfig(id: number, data: Partial<InsertLlmConfig>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(llmConfigs).set(data).where(eq(llmConfigs.id, id));
  return getLlmConfigById(id);
}

export async function deleteLlmConfig(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(llmConfigs).where(eq(llmConfigs.id, id));
}

// ─── Conversation Sessions ────────────────────────────────────────────────────
export async function createSession(data: InsertConversationSession) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(conversationSessions).values(data);
  const result = await db.select().from(conversationSessions).where(eq(conversationSessions.sessionId, data.sessionId)).limit(1);
  return result[0];
}

export async function getSessionById(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(conversationSessions).where(eq(conversationSessions.sessionId, sessionId)).limit(1);
  return result[0];
}

export async function getSessionsByBot(botProfileId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversationSessions)
    .where(eq(conversationSessions.botProfileId, botProfileId))
    .orderBy(desc(conversationSessions.lastActivityAt))
    .limit(limit);
}

export async function updateSession(sessionId: string, data: Partial<InsertConversationSession>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(conversationSessions).set({ ...data, lastActivityAt: new Date() }).where(eq(conversationSessions.sessionId, sessionId));
}

export async function getRecentSessions(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversationSessions).orderBy(desc(conversationSessions.lastActivityAt)).limit(limit);
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export async function addMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(messages).values(data);
}

export async function getMessagesBySession(sessionId: string, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(messages.createdAt)
    .limit(limit);
}

export async function clearSessionMessages(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(messages).where(eq(messages.sessionId, sessionId));
}

// ─── Response Templates ───────────────────────────────────────────────────────
export async function getTemplatesByBot(botProfileId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(responseTemplates)
    .where(eq(responseTemplates.botProfileId, botProfileId))
    .orderBy(responseTemplates.category);
}

export async function createTemplate(data: InsertResponseTemplate) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(responseTemplates).values(data);
  const id = (result as any).insertId;
  const res = await db.select().from(responseTemplates).where(eq(responseTemplates.id, id)).limit(1);
  return res[0];
}

export async function updateTemplate(id: number, data: Partial<InsertResponseTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(responseTemplates).set(data).where(eq(responseTemplates.id, id));
  const res = await db.select().from(responseTemplates).where(eq(responseTemplates.id, id)).limit(1);
  return res[0];
}

export async function deleteTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(responseTemplates).where(eq(responseTemplates.id, id));
}

// ─── Conversation Flows ───────────────────────────────────────────────────────
export async function getFlowsByBot(botProfileId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversationFlows)
    .where(eq(conversationFlows.botProfileId, botProfileId))
    .orderBy(desc(conversationFlows.priority));
}

export async function createFlow(data: InsertConversationFlow) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(conversationFlows).values(data);
  const id = (result as any).insertId;
  const res = await db.select().from(conversationFlows).where(eq(conversationFlows.id, id)).limit(1);
  return res[0];
}

export async function updateFlow(id: number, data: Partial<InsertConversationFlow>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(conversationFlows).set(data).where(eq(conversationFlows.id, id));
  const res = await db.select().from(conversationFlows).where(eq(conversationFlows.id, id)).limit(1);
  return res[0];
}

export async function deleteFlow(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(conversationFlows).where(eq(conversationFlows.id, id));
}

// ─── WhatsApp Connections ─────────────────────────────────────────────────────
export async function getWhatsappConnection(botProfileId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(whatsappConnections).where(eq(whatsappConnections.botProfileId, botProfileId)).limit(1);
  return result[0];
}

export async function upsertWhatsappConnection(data: InsertWhatsappConnection) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(whatsappConnections).values(data).onDuplicateKeyUpdate({ set: { ...data } });
  return getWhatsappConnection(data.botProfileId);
}

// ─── Analytics / Metrics ─────────────────────────────────────────────────────
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const [totalBots] = await db.select({ count: count() }).from(botProfiles);
  const [activeBots] = await db.select({ count: count() }).from(botProfiles).where(eq(botProfiles.isActive, true));
  const [totalSessions] = await db.select({ count: count() }).from(conversationSessions);
  const [activeSessions] = await db.select({ count: count() }).from(conversationSessions).where(eq(conversationSessions.status, "active"));
  const [totalMessages] = await db.select({ count: count() }).from(messages);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [recentSessions] = await db.select({ count: count() }).from(conversationSessions)
    .where(gte(conversationSessions.createdAt, thirtyDaysAgo));

  const avgResponseResult = await db.select({ avg: sql<number>`AVG(responseTimeMs)` }).from(messages)
    .where(and(eq(messages.role, "assistant"), gte(messages.createdAt, thirtyDaysAgo)));

  return {
    totalBots: totalBots.count,
    activeBots: activeBots.count,
    totalSessions: totalSessions.count,
    activeSessions: activeSessions.count,
    totalMessages: totalMessages.count,
    recentSessions: recentSessions.count,
    avgResponseTimeMs: Math.round(avgResponseResult[0]?.avg ?? 0),
  };
}

export async function getBotStats(botProfileId: number) {
  const db = await getDb();
  if (!db) return null;

  const [sessions] = await db.select({ count: count() }).from(conversationSessions).where(eq(conversationSessions.botProfileId, botProfileId));
  const [msgs] = await db.select({ count: count() }).from(messages)
    .where(sql`sessionId IN (SELECT sessionId FROM conversation_sessions WHERE botProfileId = ${botProfileId})`);

  const avgSatisfaction = await db.select({ avg: sql<number>`AVG(satisfactionScore)` })
    .from(conversationSessions)
    .where(and(eq(conversationSessions.botProfileId, botProfileId), sql`satisfactionScore IS NOT NULL`));

  return {
    totalSessions: sessions.count,
    totalMessages: msgs.count,
    avgSatisfaction: avgSatisfaction[0]?.avg ?? 0,
  };
}

// ─── Voice Agents ─────────────────────────────────────────────────────────────

export async function getAllVoiceAgents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(voiceAgents).orderBy(voiceAgents.sortOrder);
}

export async function getVoiceAgentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(voiceAgents).where(eq(voiceAgents.id, id)).limit(1);
  return result[0];
}

export async function createVoiceAgent(data: InsertVoiceAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(voiceAgents).values(data);
  return getVoiceAgentById((result as any).insertId);
}

export async function updateVoiceAgent(id: number, data: Partial<InsertVoiceAgent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(voiceAgents).set({ ...data, updatedAt: new Date() }).where(eq(voiceAgents.id, id));
  return getVoiceAgentById(id);
}

// ─── Voice Calls ──────────────────────────────────────────────────────────────

export async function createVoiceCall(data: InsertVoiceCall) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(voiceCalls).values(data).onDuplicateKeyUpdate({ set: { status: data.status ?? "active" } });
  return data;
}

export async function updateVoiceCall(callId: string, data: Partial<InsertVoiceCall>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(voiceCalls).set(data).where(eq(voiceCalls.callId, callId));
}

export async function getVoiceCallsByAgent(voiceAgentId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(voiceCalls).where(eq(voiceCalls.voiceAgentId, voiceAgentId)).limit(limit);
}

// ─── App Integrations ─────────────────────────────────────────────────────────

export async function getAllIntegrations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appIntegrations).orderBy(appIntegrations.name);
}

export async function getIntegrationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appIntegrations).where(eq(appIntegrations.id, id)).limit(1);
  return result[0];
}

export async function getIntegrationBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appIntegrations).where(eq(appIntegrations.slug, slug)).limit(1);
  return result[0];
}

export async function upsertIntegration(data: InsertAppIntegration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(appIntegrations).values(data).onDuplicateKeyUpdate({
    set: {
      isConnected: data.isConnected,
      isActive: data.isActive,
      credentials: data.credentials,
      settings: data.settings,
      updatedAt: new Date(),
    },
  });
  return getIntegrationBySlug(data.slug!);
}

export async function deleteIntegration(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(appIntegrations).where(eq(appIntegrations.id, id));
}

// ─── Bot-Integration Links ────────────────────────────────────────────────────

export async function getBotIntegrationLinks(filter: { botProfileId?: number; voiceAgentId?: number }) {
  const db = await getDb();
  if (!db) return [];
  if (filter.botProfileId) {
    return db.select().from(botIntegrationLinks).where(eq(botIntegrationLinks.botProfileId, filter.botProfileId));
  }
  if (filter.voiceAgentId) {
    return db.select().from(botIntegrationLinks).where(eq(botIntegrationLinks.voiceAgentId, filter.voiceAgentId));
  }
  return db.select().from(botIntegrationLinks);
}

export async function addBotIntegrationLink(data: InsertBotIntegrationLink) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(botIntegrationLinks).values(data);
  return result;
}

export async function removeBotIntegrationLink(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(botIntegrationLinks).where(eq(botIntegrationLinks.id, id));
}

// ─── Seed Voice Agents ────────────────────────────────────────────────────────

export async function seedVoiceAgents() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const agents: InsertVoiceAgent[] = [
    {
      slug: "recepcionista-virtual",
      name: "Sofía - Recepcionista",
      role: "Recepcionista Virtual",
      department: "general",
      avatar: "👩‍💼",
      description: "Primera línea de atención telefónica. Saluda, filtra y redirige llamadas.",
      systemPrompt: `Eres Sofía, la recepcionista virtual de AgencyBot. Eres amable, profesional y eficiente.
Tu función es:
1. Saludar cordialmente a quien llama
2. Identificar el motivo de la llamada
3. Redirigir al departamento correcto (ventas, soporte, marketing, etc.)
4. Tomar mensajes cuando el departamento no está disponible
5. Proporcionar información básica de la empresa

Habla siempre en español, con tono cálido y profesional. Sé concisa en tus respuestas para llamadas telefónicas.`,
      welcomeMessage: "¡Buenos días! Gracias por llamar a AgencyBot. Soy Sofía, ¿en qué puedo ayudarle hoy?",
      voiceProvider: "browser",
      sttProvider: "browser",
      language: "es",
      isActive: true,
      sortOrder: 1,
    },
    {
      slug: "agente-ventas-voz",
      name: "Carlos - Ventas",
      role: "Ejecutivo de Ventas Telefónico",
      department: "sales",
      avatar: "👨‍💼",
      description: "Cierra ventas por teléfono. Califica leads y presenta propuestas.",
      systemPrompt: `Eres Carlos, ejecutivo de ventas telefónico de AgencyBot. Eres persuasivo, empático y orientado a resultados.
Tu función es:
1. Calificar al prospecto (necesidades, presupuesto, urgencia)
2. Presentar los servicios de manera convincente
3. Manejar objeciones con argumentos sólidos
4. Cerrar la venta o agendar una reunión de seguimiento
5. Registrar los datos del cliente potencial

Usa técnicas de venta consultiva. Escucha activamente antes de proponer soluciones. 
Habla con confianza pero sin presionar. Sé conciso en llamadas telefónicas.`,
      welcomeMessage: "¡Hola! Soy Carlos del equipo de ventas. ¿Está interesado en conocer nuestros servicios de marketing digital?",
      voiceProvider: "browser",
      sttProvider: "browser",
      language: "es",
      isActive: true,
      sortOrder: 2,
    },
    {
      slug: "soporte-tecnico-voz",
      name: "Ana - Soporte Técnico",
      role: "Especialista de Soporte Técnico",
      department: "support",
      avatar: "👩‍💻",
      description: "Resuelve problemas técnicos por teléfono con paciencia y precisión.",
      systemPrompt: `Eres Ana, especialista de soporte técnico de AgencyBot. Eres paciente, metódica y técnicamente competente.
Tu función es:
1. Escuchar y diagnosticar el problema del cliente
2. Guiar paso a paso en la solución
3. Escalar casos complejos al equipo técnico
4. Registrar el ticket de soporte
5. Confirmar que el problema fue resuelto

Usa lenguaje simple para explicar conceptos técnicos. Sé paciente con usuarios no técnicos.
Siempre confirma que el cliente entendió cada paso antes de continuar.`,
      welcomeMessage: "¡Hola! Soy Ana del equipo de soporte técnico. ¿Cuál es el problema que está experimentando?",
      voiceProvider: "browser",
      sttProvider: "browser",
      language: "es",
      isActive: true,
      sortOrder: 3,
    },
    {
      slug: "agente-cobranza",
      name: "Roberto - Cobranza",
      role: "Agente de Cobranza",
      department: "finance",
      avatar: "💰",
      description: "Gestiona cobros con diplomacia y firmeza. Negocia planes de pago.",
      systemPrompt: `Eres Roberto, agente de cobranza de AgencyBot. Eres diplomático, firme y orientado a soluciones.
Tu función es:
1. Recordar pagos pendientes de manera amable
2. Negociar planes de pago cuando sea necesario
3. Explicar las consecuencias del incumplimiento
4. Registrar acuerdos de pago
5. Escalar casos difíciles al supervisor

Mantén siempre un tono profesional y respetuoso. Busca soluciones win-win.
Nunca amenaces ni uses lenguaje agresivo. Documenta todos los acuerdos.`,
      welcomeMessage: "Buenos días, soy Roberto del departamento de cuentas por cobrar. ¿Podría hablar con el responsable de pagos?",
      voiceProvider: "browser",
      sttProvider: "browser",
      language: "es",
      isActive: true,
      sortOrder: 4,
    },
    {
      slug: "encuestador-satisfaccion",
      name: "Laura - Encuestas",
      role: "Agente de Satisfacción al Cliente",
      department: "quality",
      avatar: "📊",
      description: "Realiza encuestas de satisfacción post-servicio y recopila feedback.",
      systemPrompt: `Eres Laura, agente de calidad y satisfacción de AgencyBot. Eres empática, curiosa y orientada a la mejora continua.
Tu función es:
1. Realizar encuestas de satisfacción post-servicio
2. Recopilar feedback específico sobre la experiencia
3. Identificar áreas de mejora
4. Agradecer al cliente por su tiempo
5. Registrar puntuaciones y comentarios

Haz preguntas abiertas para obtener respuestas detalladas. 
Sé breve y respeta el tiempo del cliente. Máximo 5 preguntas por llamada.`,
      welcomeMessage: "¡Hola! Soy Laura del equipo de calidad. ¿Tendría 2 minutos para responder una breve encuesta sobre su experiencia con nosotros?",
      voiceProvider: "browser",
      sttProvider: "browser",
      language: "es",
      isActive: true,
      sortOrder: 5,
    },
    {
      slug: "agente-reservas",
      name: "Miguel - Reservas",
      role: "Agente de Reservas y Citas",
      department: "scheduling",
      avatar: "📅",
      description: "Gestiona citas, reservas y agenda de manera eficiente.",
      systemPrompt: `Eres Miguel, agente de reservas de AgencyBot. Eres organizado, preciso y amable.
Tu función es:
1. Tomar reservas y citas
2. Confirmar disponibilidad en el calendario
3. Enviar confirmaciones
4. Gestionar cancelaciones y reprogramaciones
5. Recordar citas próximas

Siempre confirma fecha, hora y datos de contacto. 
Ofrece alternativas cuando no hay disponibilidad. Sé eficiente y preciso.`,
      welcomeMessage: "¡Hola! Soy Miguel del equipo de reservas. ¿Le gustaría agendar una cita o tiene alguna reserva que gestionar?",
      voiceProvider: "browser",
      sttProvider: "browser",
      language: "es",
      isActive: true,
      sortOrder: 6,
    },
  ];

  for (const agent of agents) {
    await db.insert(voiceAgents).values(agent).onDuplicateKeyUpdate({
      set: { name: agent.name, systemPrompt: agent.systemPrompt, updatedAt: new Date() },
    });
  }
}

// ─── Seed Integrations ────────────────────────────────────────────────────────

export async function seedIntegrations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const integrations: InsertAppIntegration[] = [
    { slug: "hubspot", name: "HubSpot CRM", category: "crm", provider: "hubspot", description: "CRM para gestión de contactos y deals", icon: "🟠", color: "#FF7A59", isConnected: false, isActive: false },
    { slug: "mailchimp", name: "Mailchimp", category: "marketing", provider: "mailchimp", description: "Email marketing y automatización", icon: "🐵", color: "#FFE01B", isConnected: false, isActive: false },
    { slug: "google-calendar", name: "Google Calendar", category: "calendar", provider: "google", description: "Agenda y gestión de citas", icon: "📅", color: "#4285F4", isConnected: false, isActive: false },
    { slug: "stripe", name: "Stripe", category: "payments", provider: "stripe", description: "Procesamiento de pagos", icon: "💳", color: "#635BFF", isConnected: false, isActive: false },
    { slug: "instagram", name: "Instagram Business", category: "social", provider: "meta", description: "Gestión de redes sociales", icon: "📸", color: "#E1306C", isConnected: false, isActive: false },
    { slug: "slack", name: "Slack", category: "notifications", provider: "slack", description: "Notificaciones al equipo", icon: "💬", color: "#4A154B", isConnected: false, isActive: false },
    { slug: "notion", name: "Notion", category: "productivity", provider: "notion", description: "Base de conocimiento y tareas", icon: "📓", color: "#000000", isConnected: false, isActive: false },
    { slug: "google-sheets", name: "Google Sheets", category: "productivity", provider: "google", description: "Hojas de cálculo y reportes", icon: "📊", color: "#34A853", isConnected: false, isActive: false },
    { slug: "brevo", name: "Brevo", category: "marketing", provider: "brevo", description: "Email y SMS marketing gratuito", icon: "📧", color: "#0B996E", isConnected: false, isActive: false },
    { slug: "n8n", name: "n8n (Self-hosted)", category: "other", provider: "n8n", description: "Automatización open-source", icon: "🔄", color: "#EA4B71", isConnected: false, isActive: false },
    { slug: "make", name: "Make (Integromat)", category: "other", provider: "make", description: "Automatización visual", icon: "⚙️", color: "#6D00CC", isConnected: false, isActive: false },
    { slug: "pipedrive", name: "Pipedrive", category: "crm", provider: "pipedrive", description: "CRM de ventas visual", icon: "🟢", color: "#00B050", isConnected: false, isActive: false },
  ];

  for (const integration of integrations) {
    await db.insert(appIntegrations).values(integration).onDuplicateKeyUpdate({
      set: { name: integration.name, updatedAt: new Date() },
    });
  }
}

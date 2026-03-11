import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
  bigint,
  float,
} from "drizzle-orm/mysql-core";

// ─── Users (auth base) ────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── LLM Configurations ───────────────────────────────────────────────────────
export const llmConfigs = mysqlTable("llm_configs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  provider: mysqlEnum("provider", ["openai", "anthropic", "gemini", "groq", "ollama", "openrouter", "custom"]).notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  apiKey: text("apiKey"),
  baseUrl: text("baseUrl"),
  maxTokens: int("maxTokens").default(2048),
  temperature: float("temperature").default(0.7),
  isDefault: boolean("isDefault").default(false),
  isActive: boolean("isActive").default(true),
  extraParams: json("extraParams"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LlmConfig = typeof llmConfigs.$inferSelect;
export type InsertLlmConfig = typeof llmConfigs.$inferInsert;

// ─── Bot Profiles (Trabajadores Virtuales) ────────────────────────────────────
export const botProfiles = mysqlTable("bot_profiles", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  role: varchar("role", { length: 128 }).notNull(),
  department: mysqlEnum("department", [
    "creative",
    "strategy",
    "content",
    "social",
    "analytics",
    "seo",
    "community",
    "accounts",
    "design",
    "management",
  ]).notNull(),
  avatar: varchar("avatar", { length: 8 }).notNull().default("🤖"),
  avatarColor: varchar("avatarColor", { length: 32 }).default("#00D084"),
  description: text("description"),
  systemPrompt: text("systemPrompt").notNull(),
  welcomeMessage: text("welcomeMessage"),
  personality: json("personality"),
  capabilities: json("capabilities"),
  llmConfigId: int("llmConfigId"),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BotProfile = typeof botProfiles.$inferSelect;
export type InsertBotProfile = typeof botProfiles.$inferInsert;

// ─── Response Templates ───────────────────────────────────────────────────────
export const responseTemplates = mysqlTable("response_templates", {
  id: int("id").autoincrement().primaryKey(),
  botProfileId: int("botProfileId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  trigger: varchar("trigger", { length: 256 }),
  content: text("content").notNull(),
  category: varchar("category", { length: 64 }),
  variables: json("variables"),
  isActive: boolean("isActive").default(true),
  usageCount: int("usageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResponseTemplate = typeof responseTemplates.$inferSelect;
export type InsertResponseTemplate = typeof responseTemplates.$inferInsert;

// ─── Conversation Flows ───────────────────────────────────────────────────────
export const conversationFlows = mysqlTable("conversation_flows", {
  id: int("id").autoincrement().primaryKey(),
  botProfileId: int("botProfileId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  trigger: varchar("trigger", { length: 512 }),
  steps: json("steps").notNull(),
  isActive: boolean("isActive").default(true),
  priority: int("priority").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConversationFlow = typeof conversationFlows.$inferSelect;
export type InsertConversationFlow = typeof conversationFlows.$inferInsert;

// ─── Conversation Sessions ────────────────────────────────────────────────────
export const conversationSessions = mysqlTable("conversation_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull().unique(),
  botProfileId: int("botProfileId").notNull(),
  userId: int("userId"),
  clientName: varchar("clientName", { length: 256 }),
  clientPhone: varchar("clientPhone", { length: 32 }),
  channel: mysqlEnum("channel", ["whatsapp", "simulator", "web", "api"]).default("simulator"),
  status: mysqlEnum("status", ["active", "closed", "paused", "escalated"]).default("active"),
  context: json("context"),
  metadata: json("metadata"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  closedAt: timestamp("closedAt"),
  satisfactionScore: int("satisfactionScore"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConversationSession = typeof conversationSessions.$inferSelect;
export type InsertConversationSession = typeof conversationSessions.$inferInsert;

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  tokensUsed: int("tokensUsed"),
  responseTimeMs: int("responseTimeMs"),
  llmProvider: varchar("llmProvider", { length: 64 }),
  llmModel: varchar("llmModel", { length: 128 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── Metrics / Analytics ──────────────────────────────────────────────────────
export const metrics = mysqlTable("metrics", {
  id: int("id").autoincrement().primaryKey(),
  botProfileId: int("botProfileId").notNull(),
  date: timestamp("date").notNull(),
  totalConversations: int("totalConversations").default(0),
  activeConversations: int("activeConversations").default(0),
  closedConversations: int("closedConversations").default(0),
  totalMessages: int("totalMessages").default(0),
  avgResponseTimeMs: int("avgResponseTimeMs").default(0),
  avgSatisfactionScore: float("avgSatisfactionScore").default(0),
  totalTokensUsed: bigint("totalTokensUsed", { mode: "number" }).default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;

// ─── WhatsApp Connections ─────────────────────────────────────────────────────
export const whatsappConnections = mysqlTable("whatsapp_connections", {
  id: int("id").autoincrement().primaryKey(),
  botProfileId: int("botProfileId").notNull().unique(),
  instanceName: varchar("instanceName", { length: 128 }).notNull(),
  evolutionApiUrl: text("evolutionApiUrl"),
  evolutionApiKey: text("evolutionApiKey"),
  phoneNumber: varchar("phoneNumber", { length: 32 }),
  status: mysqlEnum("status", ["disconnected", "connecting", "connected", "error"]).default("disconnected"),
  qrCode: text("qrCode"),
  lastConnectedAt: timestamp("lastConnectedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappConnection = typeof whatsappConnections.$inferSelect;
export type InsertWhatsappConnection = typeof whatsappConnections.$inferInsert;

// ─── Voice Agents ─────────────────────────────────────────────────────────────
export const voiceAgents = mysqlTable("voice_agents", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  role: varchar("role", { length: 128 }).notNull(),
  department: varchar("department", { length: 64 }).notNull().default("general"),
  avatar: varchar("avatar", { length: 8 }).notNull().default("📞"),
  description: text("description"),
  systemPrompt: text("systemPrompt").notNull(),
  welcomeMessage: text("welcomeMessage"),
  voiceId: varchar("voiceId", { length: 128 }).default("default"),
  voiceProvider: mysqlEnum("voiceProvider", ["elevenlabs", "openai_tts", "google_tts", "browser"]).default("browser"),
  sttProvider: mysqlEnum("sttProvider", ["deepgram", "openai_whisper", "google_stt", "browser"]).default("browser"),
  language: varchar("language", { length: 16 }).default("es"),
  llmConfigId: int("llmConfigId"),
  isActive: boolean("isActive").default(true),
  twilioPhoneNumber: varchar("twilioPhoneNumber", { length: 32 }),
  twilioAccountSid: text("twilioAccountSid"),
  twilioAuthToken: text("twilioAuthToken"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VoiceAgent = typeof voiceAgents.$inferSelect;
export type InsertVoiceAgent = typeof voiceAgents.$inferInsert;

// ─── Voice Calls ──────────────────────────────────────────────────────────────
export const voiceCalls = mysqlTable("voice_calls", {
  id: int("id").autoincrement().primaryKey(),
  callId: varchar("callId", { length: 128 }).notNull().unique(),
  voiceAgentId: int("voiceAgentId").notNull(),
  callerPhone: varchar("callerPhone", { length: 32 }),
  callerName: varchar("callerName", { length: 256 }),
  channel: mysqlEnum("channel", ["twilio", "simulator", "web"]).default("simulator"),
  status: mysqlEnum("status", ["ringing", "active", "completed", "failed", "missed"]).default("ringing"),
  durationSeconds: int("durationSeconds"),
  transcript: text("transcript"),
  summary: text("summary"),
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]).default("neutral"),
  recordingUrl: text("recordingUrl"),
  metadata: json("metadata"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VoiceCall = typeof voiceCalls.$inferSelect;
export type InsertVoiceCall = typeof voiceCalls.$inferInsert;

// ─── App Integrations ─────────────────────────────────────────────────────────
export const appIntegrations = mysqlTable("app_integrations", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  category: mysqlEnum("category", [
    "crm", "marketing", "calendar", "payments", "social", "analytics",
    "notifications", "ecommerce", "productivity", "ai", "storage", "other"
  ]).notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 8 }).default("🔌"),
  iconUrl: text("iconUrl"),
  color: varchar("color", { length: 32 }).default("#6366F1"),
  isConnected: boolean("isConnected").default(false),
  isActive: boolean("isActive").default(false),
  credentials: json("credentials"),
  settings: json("settings"),
  webhookUrl: text("webhookUrl"),
  lastSyncAt: timestamp("lastSyncAt"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppIntegration = typeof appIntegrations.$inferSelect;
export type InsertAppIntegration = typeof appIntegrations.$inferInsert;

// ─── Bot-Integration Links ────────────────────────────────────────────────────
export const botIntegrationLinks = mysqlTable("bot_integration_links", {
  id: int("id").autoincrement().primaryKey(),
  botProfileId: int("botProfileId"),
  voiceAgentId: int("voiceAgentId"),
  integrationId: int("integrationId").notNull(),
  isEnabled: boolean("isEnabled").default(true),
  config: json("config"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BotIntegrationLink = typeof botIntegrationLinks.$inferSelect;
export type InsertBotIntegrationLink = typeof botIntegrationLinks.$inferInsert;

// ─── Integration Events Log ───────────────────────────────────────────────────
export const integrationEvents = mysqlTable("integration_events", {
  id: int("id").autoincrement().primaryKey(),
  integrationId: int("integrationId").notNull(),
  eventType: varchar("eventType", { length: 128 }).notNull(),
  payload: json("payload"),
  status: mysqlEnum("status", ["pending", "success", "failed", "retrying"]).default("pending"),
  errorMessage: text("errorMessage"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IntegrationEvent = typeof integrationEvents.$inferSelect;
export type InsertIntegrationEvent = typeof integrationEvents.$inferInsert;

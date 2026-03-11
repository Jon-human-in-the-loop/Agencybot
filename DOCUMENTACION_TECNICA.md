# 🔧 AgencyBot - Documentación Técnica

## Tabla de Contenidos

1. [Arquitectura](#arquitectura)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Instalación y Setup](#instalación-y-setup)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Base de Datos](#base-de-datos)
6. [APIs y Endpoints](#apis-y-endpoints)
7. [Autenticación](#autenticación)
8. [Escalado](#escalado)
9. [Troubleshooting](#troubleshooting)
10. [Roadmap](#roadmap)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Cliente (React 19)                      │
│  - Landing Page                                             │
│  - Dashboard de Especialistas                               │
│  - Editor de Prompts                                        │
│  - Simulador de Chat                                        │
│  - Panel de Configuración                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────────┐
│                 Backend (Node.js + Express)                 │
│  - tRPC Routers (Tipado end-to-end)                         │
│  - Motor LLM Multi-Proveedor                                │
│  - Motor de Voz (Twilio + ElevenLabs)                       │
│  - Motor de Integraciones                                   │
│  - Gestor de Sesiones                                       │
│  - Autenticación OAuth                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    ┌────────┐  ┌──────────┐  ┌────────────┐
    │ MySQL  │  │ Stripe   │  │ Railway    │
    │   DB   │  │  Pagos   │  │ Hosting    │
    └────────┘  └──────────┘  └────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┼──────────────────────────┐
        │              │              │           │
        ▼              ▼              ▼           ▼
    ┌────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐
    │ OpenAI │  │Anthropic │  │ Gemini   │  │ Groq   │
    │  API   │  │   API    │  │   API    │  │  API   │
    └────────┘  └──────────┘  └──────────┘  └────────┘
```

---

## 📦 Stack Tecnológico

### Frontend
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animaciones
- **tRPC Client** - Type-safe API calls
- **Wouter** - Routing

### Backend
- **Node.js 22** - Runtime
- **Express 4** - Web framework
- **tRPC 11** - RPC framework
- **Drizzle ORM** - Database ORM
- **MySQL 2** - Database driver

### Bases de Datos
- **MySQL/TiDB** - Datos principales
- **Redis** (opcional) - Cache y sesiones

### Integraciones
- **OpenAI API** - GPT-4, GPT-3.5
- **Anthropic API** - Claude
- **Google Gemini API** - Gemini
- **Groq API** - LLaMA rápido
- **Twilio** - Telefonía
- **ElevenLabs** - TTS
- **Deepgram** - STT
- **Stripe** - Pagos
- **Railway** - Hosting

---

## 🚀 Instalación y Setup

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Jon-human-in-the-loop/Agencybot.git
cd Agencybot
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales
```

### 4. Configurar Base de Datos

```bash
# Generar migraciones
pnpm drizzle-kit generate

# Aplicar migraciones
pnpm drizzle-kit migrate

# Seed de datos iniciales
node server/seed.ts
```

### 5. Iniciar en Desarrollo

```bash
pnpm dev
```

Abre http://localhost:3000

### 6. Build para Producción

```bash
pnpm build
pnpm start
```

---

## 📁 Estructura de Carpetas

```
agencybot/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                  # Páginas principales
│   │   │   ├── Home.tsx            # Landing page
│   │   │   ├── Team.tsx            # Especialistas virtuales
│   │   │   ├── BotEditor.tsx       # Editor de prompts
│   │   │   ├── Simulator.tsx       # Simulador de chat
│   │   │   ├── VoiceAgents.tsx     # Agentes de voz
│   │   │   ├── Integrations.tsx    # Hub de integraciones
│   │   │   ├── Analytics.tsx       # Dashboard de métricas
│   │   │   ├── LLMConfig.tsx       # Configuración de LLM
│   │   │   ├── Templates.tsx       # Plantillas de respuesta
│   │   │   ├── Flows.tsx           # Flujos conversacionales
│   │   │   └── Setup.tsx           # Panel de setup
│   │   ├── components/             # Componentes reutilizables
│   │   ├── contexts/               # React contexts
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/                    # Utilidades
│   │   ├── App.tsx                 # Router principal
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Estilos globales
│   ├── public/                     # Archivos estáticos
│   └── index.html                  # HTML base
│
├── server/                          # Backend Node.js
│   ├── _core/                      # Framework plumbing
│   │   ├── index.ts                # Servidor Express
│   │   ├── context.ts              # Contexto tRPC
│   │   ├── trpc.ts                 # Configuración tRPC
│   │   ├── auth.ts                 # Autenticación OAuth
│   │   ├── cookies.ts              # Gestión de cookies
│   │   ├── env.ts                  # Variables de entorno
│   │   ├── llm.ts                  # Helper LLM
│   │   ├── voiceTranscription.ts   # Transcripción de voz
│   │   ├── imageGeneration.ts      # Generación de imágenes
│   │   ├── map.ts                  # Integración Google Maps
│   │   ├── notification.ts         # Notificaciones
│   │   └── systemRouter.ts         # Routers del sistema
│   ├── db.ts                       # Helpers de base de datos
│   ├── routers.ts                  # Routers tRPC principales
│   ├── routers-setup.ts            # Router de setup
│   ├── llm-engine.ts               # Motor multi-LLM
│   ├── voice-engine.ts             # Motor de voz
│   ├── integrations-engine.ts      # Motor de integraciones
│   ├── encryption.ts               # Encriptación de credenciales
│   ├── seed.ts                     # Seed de datos
│   ├── auth.logout.test.ts         # Tests de autenticación
│   └── agencybot.test.ts           # Tests principales
│
├── drizzle/                         # Migraciones de BD
│   ├── schema.ts                   # Esquema de BD
│   ├── 0000_*.sql                  # Migraciones SQL
│   └── drizzle.config.ts           # Configuración Drizzle
│
├── shared/                          # Código compartido
│   ├── const.ts                    # Constantes
│   └── types.ts                    # Tipos TypeScript
│
├── storage/                         # Helpers de S3
│   └── index.ts                    # Funciones de almacenamiento
│
├── .env.example                     # Variables de entorno ejemplo
├── .gitignore                       # Git ignore
├── package.json                     # Dependencias
├── tsconfig.json                    # Configuración TypeScript
├── vite.config.ts                  # Configuración Vite
├── drizzle.config.ts               # Configuración Drizzle
├── vitest.config.ts                # Configuración Vitest
├── README.md                        # Documentación principal
├── GUIA_CLIENTE.md                 # Guía para clientes
└── DOCUMENTACION_TECNICA.md        # Este archivo
```

---

## 🗄️ Base de Datos

### Tablas Principales

#### `users`
```sql
- id (PK)
- openId (UNIQUE)
- name
- email
- loginMethod
- role (admin | user)
- createdAt
- updatedAt
- lastSignedIn
```

#### `bot_profiles`
```sql
- id (PK)
- userId (FK)
- slug (UNIQUE)
- name
- role
- department
- avatar
- avatarColor
- description
- systemPrompt
- welcomeMessage
- personality (JSON)
- capabilities (JSON)
- llmConfigId (FK)
- isActive
- sortOrder
- createdAt
- updatedAt
```

#### `llm_configs`
```sql
- id (PK)
- userId (FK)
- name
- provider (openai | anthropic | gemini | groq | ollama | openrouter | custom)
- model
- apiKey (encriptada)
- baseUrl
- temperature
- maxTokens
- topP
- frequencyPenalty
- presencePenalty
- isDefault
- isActive
- createdAt
- updatedAt
```

#### `conversation_sessions`
```sql
- id (PK)
- userId (FK)
- botProfileId (FK)
- clientId
- clientName
- clientEmail
- clientPhone
- context (JSON)
- metadata (JSON)
- startedAt
- lastMessageAt
- endedAt
- duration
- messageCount
- satisfaction
- isActive
- createdAt
- updatedAt
```

#### `messages`
```sql
- id (PK)
- sessionId (FK)
- role (user | assistant | system)
- content
- tokens
- provider
- model
- latency
- cost
- createdAt
```

#### `voice_agents`
```sql
- id (PK)
- userId (FK)
- name
- role
- department
- avatar
- avatarColor
- description
- systemPrompt
- welcomeMessage
- personality (JSON)
- capabilities (JSON)
- ttsProvider (elevenlabs | google | aws | native)
- ttsVoiceId
- sttProvider (deepgram | google | aws | native)
- twilioPhoneNumber
- llmConfigId (FK)
- isActive
- createdAt
- updatedAt
```

#### `voice_calls`
```sql
- id (PK)
- voiceAgentId (FK)
- callSid (Twilio)
- clientPhone
- clientName
- direction (inbound | outbound)
- status (initiated | ringing | in-progress | completed | failed)
- duration
- recordingUrl
- transcript
- satisfaction
- metadata (JSON)
- startedAt
- endedAt
- createdAt
```

#### `encrypted_credentials`
```sql
- id (PK)
- userId (FK)
- service (enum)
- credentialName
- encryptedValue
- credentialHash
- isActive
- lastTestedAt
- testStatus (untested | valid | invalid | expired)
- metadata (JSON)
- createdAt
- updatedAt
```

---

## 🔌 APIs y Endpoints

### Bots

```typescript
// Listar todos los bots
GET /api/trpc/bots.list

// Obtener un bot
GET /api/trpc/bots.getById?input={"id":1}

// Crear bot
POST /api/trpc/bots.create
{
  "slug": "valentina-creativa",
  "name": "Valentina Cruz",
  "role": "Directora Creativa",
  "department": "creative",
  "systemPrompt": "Eres Valentina...",
  "llmConfigId": 1
}

// Actualizar bot
POST /api/trpc/bots.update
{
  "id": 1,
  "systemPrompt": "Nuevo prompt..."
}

// Eliminar bot
POST /api/trpc/bots.delete?input={"id":1}
```

### Conversaciones

```typescript
// Crear sesión
POST /api/trpc/conversations.createSession
{
  "botProfileId": 1,
  "clientName": "Juan Pérez",
  "clientEmail": "juan@example.com"
}

// Enviar mensaje
POST /api/trpc/conversations.chat
{
  "sessionId": 1,
  "message": "Hola, necesito ayuda con marketing"
}

// Obtener historial
GET /api/trpc/conversations.getMessages?input={"sessionId":1}
```

### LLM

```typescript
// Listar configuraciones
GET /api/trpc/llm.list

// Crear configuración
POST /api/trpc/llm.create
{
  "name": "OpenAI GPT-4",
  "provider": "openai",
  "model": "gpt-4",
  "apiKey": "sk-..."
}

// Probar configuración
POST /api/trpc/llm.test
{
  "id": 1
}
```

### Voz

```typescript
// Listar agentes de voz
GET /api/trpc/voice.list

// Procesar llamada
POST /api/trpc/voice.processCall
{
  "voiceAgentId": 1,
  "audioUrl": "https://..."
}

// Webhook de Twilio
POST /api/trpc/voice.twilioWebhook
{
  "CallSid": "CA...",
  "From": "+1234567890",
  "To": "+0987654321"
}
```

### Integraciones

```typescript
// Listar integraciones
GET /api/trpc/integrations.list

// Conectar integración
POST /api/trpc/integrations.connect
{
  "integrationSlug": "hubspot",
  "credentials": {
    "apiKey": "pat-na1-..."
  }
}

// Desconectar
POST /api/trpc/integrations.disconnect
{
  "id": 1
}
```

### Setup

```typescript
// Validar credencial
POST /api/trpc/setup.validateCredential
{
  "service": "openaiKey",
  "credential": "sk-..."
}

// Desplegar a Railway
POST /api/trpc/setup.deployToRailway
{
  "config": {
    "openaiKey": "sk-...",
    "twilioSid": "AC...",
    "twilioToken": "...",
    "railwayToken": "..."
  }
}
```

---

## 🔐 Autenticación

### OAuth Flow

```
1. Usuario hace click en "Login"
2. Redirige a https://portal.manus.im/oauth/authorize
3. Usuario se loguea con Manus
4. Redirige a /api/oauth/callback?code=...&state=...
5. Backend intercambia code por token
6. Backend crea sesión con cookie
7. Usuario autenticado en el panel
```

### Protección de Endpoints

```typescript
// Endpoint público
publicProcedure.query(async () => {
  return { data: "visible para todos" };
});

// Endpoint protegido
protectedProcedure.query(async ({ ctx }) => {
  // ctx.user contiene el usuario autenticado
  return { userId: ctx.user.id };
});

// Endpoint solo admin
adminProcedure.mutation(async ({ ctx }) => {
  // Solo usuarios con role='admin'
});
```

---

## 📈 Escalado

### Horizontal Scaling

1. **Múltiples instancias en Railway**
   ```bash
   # Railway automáticamente balancea carga
   # Configura en railway.json
   ```

2. **Cache con Redis**
   ```typescript
   // Cachear bots por 5 minutos
   const bots = await cache.get('bots') || 
                await db.getAllBots();
   ```

3. **Database Replication**
   ```sql
   -- Usar TiDB Cloud para replicación automática
   -- MySQL replication manual si es necesario
   ```

### Vertical Scaling

1. **Aumentar recursos en Railway**
   - CPU: 0.5 → 2 vCPU
   - RAM: 512MB → 4GB

2. **Optimizar queries**
   ```typescript
   // Usar índices en BD
   CREATE INDEX idx_userId_botId ON messages(userId, botProfileId);
   ```

3. **Lazy loading**
   ```typescript
   // Cargar datos bajo demanda
   const messages = await db.getMessages(sessionId, { limit: 50 });
   ```

---

## 🐛 Troubleshooting

### Error: "API Key inválida"

**Causa**: La API key está mal o expirada

**Solución**:
1. Verifica que copiaste la clave completa
2. Verifica que no tiene espacios al inicio/final
3. Genera una nueva clave en la plataforma del proveedor

### Error: "Database connection failed"

**Causa**: No hay conexión a la BD

**Solución**:
```bash
# Verifica DATABASE_URL
echo $DATABASE_URL

# Prueba conexión
mysql -u usuario -p -h host -D agencybot -e "SELECT 1;"
```

### Error: "Stripe webhook failed"

**Causa**: El webhook secret es incorrecto

**Solución**:
1. Ve a https://dashboard.stripe.com/webhooks
2. Copia el "Signing Secret"
3. Pégalo en STRIPE_WEBHOOK_SECRET

### Error: "Twilio TwiML invalid"

**Causa**: El XML de Twilio está malformado

**Solución**:
```typescript
// Valida TwiML con Twilio Validator
const validator = require('twilio').twiml.VoiceResponse;
const twiml = new validator();
// Verifica que sea válido
```

### Performance lento

**Causa**: Queries lentas o demasiadas llamadas a API

**Solución**:
```bash
# Ver logs
tail -f .manus-logs/devserver.log

# Analizar queries lentas
SHOW SLOW QUERY LOG;

# Optimizar
CREATE INDEX idx_botId ON messages(botProfileId);
```

---

## 🗺️ Roadmap

### Q2 2026
- [ ] Integración con WhatsApp Business API
- [ ] Análisis de sentimiento en tiempo real
- [ ] Exportación de reportes en PDF
- [ ] API pública para desarrolladores

### Q3 2026
- [ ] Soporte para múltiples idiomas
- [ ] Machine learning para mejora de prompts
- [ ] Integraciones con más CRMs
- [ ] Dashboard de costos de API

### Q4 2026
- [ ] Marketplace de plugins
- [ ] Webhooks personalizados
- [ ] Backup automático
- [ ] SLA garantizado 99.99%

---

## 📞 Soporte Técnico

- **Slack**: #agencybot-technical
- **Email**: tech-support@agencybot.com
- **Docs**: https://docs.agencybot.com
- **GitHub Issues**: https://github.com/Jon-human-in-the-loop/Agencybot/issues

---

**Última actualización**: Marzo 2026

# 🚀 AgencyBot - Plataforma Completa de Agencia Virtual de Marketing

![AgencyBot](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)

## 📋 Descripción

**AgencyBot** es una plataforma SaaS lista para vender que proporciona una agencia virtual de marketing completa. Incluye 10 especialistas virtuales impulsados por IA, 6 agentes telefónicos de voz, 12+ integraciones empresariales y un panel de administración ultra-simple.

Los clientes solo necesitan:
1. Pegar sus API keys (OpenAI, Twilio, etc)
2. Hacer click en "Desplegar"
3. ¡Listo! Su agencia está en vivo

---

## ✨ Características Principales

### 👥 10 Especialistas Virtuales
- **Valentina Cruz** - Directora Creativa
- **Sebastián Ruiz** - Estratega de Marketing
- **Camila Torres** - Copywriter Senior
- **Mateo García** - Gestor de Redes Sociales
- **Lucía Mendoza** - Analista de Datos
- **Andrés Vargas** - Especialista SEO/SEM
- **Daniela Reyes** - Community Manager
- **Felipe Castro** - Ejecutivo de Cuentas
- **Isabela Moreno** - Diseñadora Creativa
- **Ricardo Navarro** - Coordinador de Proyectos

### 📞 6 Agentes de Voz
- Sofía - Recepcionista
- Carlos - Ejecutivo de Ventas
- Ana - Soporte Técnico
- Roberto - Gestor de Cobranza
- Laura - Encuestadora
- Miguel - Gestor de Reservas

### 🔗 12+ Integraciones
HubSpot, Mailchimp, Google Calendar, Stripe, Instagram, Slack, Notion, Google Sheets, Brevo, n8n, Make, Pipedrive

### 🧠 Motor Multi-LLM
Soporta OpenAI, Anthropic Claude, Google Gemini, Groq, Ollama, OpenRouter y custom

### 💰 Sistema de Pagos
Integración completa con Stripe para suscripciones

### 📊 Dashboard de Métricas
Análisis de conversaciones, tiempos de respuesta, satisfacción del cliente

### 🎨 Diseño Premium
Estética Tendril Studio con animaciones suaves y tipografía serif

---

## 🏗️ Stack Tecnológico

### Frontend
- React 19
- Tailwind CSS 4
- Framer Motion
- tRPC Client
- Wouter

### Backend
- Node.js 22
- Express 4
- tRPC 11
- Drizzle ORM
- MySQL/TiDB

### Hosting
- Railway (recomendado)
- Vercel (alternativa)

### Integraciones
- OpenAI, Anthropic, Google Gemini, Groq
- Twilio, ElevenLabs, Deepgram
- Stripe
- 12+ integraciones empresariales

---

## 🚀 Inicio Rápido

### 1. Clonar Repositorio

```bash
git clone https://github.com/Jon-human-in-the-loop/Agencybot.git
cd Agencybot
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Configurar Base de Datos

```bash
# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales de BD
nano .env

# Aplicar migraciones
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Seed de datos iniciales
node server/seed.ts
```

### 4. Iniciar en Desarrollo

```bash
pnpm dev
```

Abre http://localhost:3000

### 5. Build para Producción

```bash
pnpm build
pnpm start
```

---

## 📦 Planes y Precios

| Plan | Precio | Especialistas | Agentes de Voz | Integraciones |
|------|--------|---------------|----------------|---------------|
| **Starter** | $99/mes | 5 | 2 | 3 |
| **Professional** | $299/mes | 10 | 6 | 12 |
| **Enterprise** | Custom | ∞ | ∞ | ∞ |

---

## 📖 Documentación

- **[GUIA_CLIENTE.md](./GUIA_CLIENTE.md)** - Guía paso a paso para clientes
- **[DOCUMENTACION_TECNICA.md](./DOCUMENTACION_TECNICA.md)** - Documentación técnica para desarrolladores
- **[TERMINOS_DE_SERVICIO.md](./TERMINOS_DE_SERVICIO.md)** - Términos legales
- **[POLITICA_PRIVACIDAD.md](./POLITICA_PRIVACIDAD.md)** - Política de privacidad

---

## 🔐 Seguridad

- ✅ Encriptación AES-256 de API keys
- ✅ TLS 1.3 en tránsito
- ✅ Autenticación OAuth
- ✅ Auditorías de seguridad regulares
- ✅ Cumplimiento GDPR, CCPA, LGPD

---

## 📊 Estructura de Base de Datos

```
users
├── bot_profiles
├── llm_configs
├── conversation_sessions
│   └── messages
├── voice_agents
│   └── voice_calls
├── app_integrations
│   └── bot_integration_links
├── response_templates
├── conversation_flows
├── encrypted_credentials
├── metrics
├── admin_settings
└── whatsapp_connections
```

---

## 🔌 APIs Principales

### Bots
```typescript
GET /api/trpc/bots.list
GET /api/trpc/bots.getById
POST /api/trpc/bots.create
POST /api/trpc/bots.update
POST /api/trpc/bots.delete
```

### Conversaciones
```typescript
POST /api/trpc/conversations.createSession
POST /api/trpc/conversations.chat
GET /api/trpc/conversations.getMessages
```

### Voz
```typescript
GET /api/trpc/voice.list
POST /api/trpc/voice.processCall
POST /api/trpc/voice.twilioWebhook
```

### Setup
```typescript
POST /api/trpc/setup.validateCredential
POST /api/trpc/setup.deployToRailway
```

---

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Con coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

**Cobertura**: 27 tests pasando, 0 errores TypeScript

---

## 📈 Escalado

### Horizontal
- Múltiples instancias en Railway
- Load balancing automático
- Cache con Redis (opcional)

### Vertical
- Aumentar CPU/RAM en Railway
- Optimizar queries con índices
- Lazy loading de datos

---

## 🐛 Troubleshooting

### Error: "API Key inválida"
```bash
# Verifica que copiaste la clave completa sin espacios
# Genera una nueva clave en la plataforma del proveedor
```

### Error: "Database connection failed"
```bash
# Verifica DATABASE_URL
echo $DATABASE_URL

# Prueba conexión
mysql -u usuario -p -h host -D agencybot -e "SELECT 1;"
```

### Error: "Stripe webhook failed"
```bash
# Obtén el webhook secret correcto
# https://dashboard.stripe.com/webhooks
```

---

## 🤝 Contribuir

Aceptamos contribuciones. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

---

## 💬 Soporte

- **Chat en Vivo**: Disponible en el panel
- **Email**: soporte@agencybot.com
- **Documentación**: https://docs.agencybot.com
- **Comunidad**: Slack privado para usuarios

---

## 🗺️ Roadmap

### Q2 2026
- Integración WhatsApp Business API
- Análisis de sentimiento en tiempo real
- Exportación de reportes en PDF
- API pública para desarrolladores

### Q3 2026
- Soporte para múltiples idiomas
- Machine learning para mejora de prompts
- Más integraciones CRM
- Dashboard de costos de API

### Q4 2026
- Marketplace de plugins
- Webhooks personalizados
- Backup automático
- SLA 99.99% garantizado

---

## 👨‍💻 Autores

Desarrollado por **Jon Human-in-the-Loop** y equipo

---

## 🎯 Estado del Proyecto

✅ **Listo para Producción**

- ✅ Todas las funcionalidades implementadas
- ✅ 27 tests pasando
- ✅ 0 errores TypeScript
- ✅ Documentación completa
- ✅ Seguridad auditada
- ✅ SLA 99.9% garantizado

---

## 📞 Contacto

- **Website**: https://agencybot.com
- **Email**: info@agencybot.com
- **Twitter**: @AgencyBotAI
- **LinkedIn**: /company/agencybot

---

**¡Bienvenido a tu agencia virtual! 🚀**

*Última actualización: Marzo 2026*

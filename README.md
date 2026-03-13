# 🤖 AgencyBot - Plataforma Completa de Agentes de IA

> Una plataforma SaaS modular y escalable para desplegar agentes de IA con chat, voz e integraciones.

[![Node.js](https://img.shields.io/badge/node-22.x-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-19.x-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## 🎯 Características principales

- **10 Especialistas virtuales** precargados y personalizables
- **6 Agentes de voz** con Twilio + ElevenLabs/Deepgram
- **Multi-LLM**: OpenAI, Anthropic, Gemini, Groq, Ollama, OpenRouter
- **12+ Integraciones**: CRM, Marketing, Calendario, Pagos, etc.
- **Dashboard avanzado** con métricas y analytics
- **Autenticación OAuth** configurable
- **Cifrado seguro** para credenciales
- **Listo para producción** - Vercel/Railway/Tu servidor

## 🚀 Inicio rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jon-human-in-the-loop/Agencybot.git
cd Agencybot
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus valores
nano .env
```

### 4. Base de datos

```bash
# Generar migraciones
pnpm db:push

# Inicializar datos de ejemplo (opcional)
node server/seed.ts
```

### 5. Iniciar en desarrollo

```bash
pnpm dev
```

Abre http://localhost:3000 en tu navegador.

## 📦 Estructura del proyecto

```
.
├── client/              # Frontend React
│   └── src/
│       ├── pages/       # Páginas principales
│       ├── components/  # Componentes reutilizables
│       └── hooks/       # Custom hooks
├── server/              # Backend Node.js
│   ├── _core/           # Framework y utilidades
│   ├── llm-engine.ts    # Motor multi-LLM
│   ├── voice-engine.ts  # Motor de voz
│   ├── integrations-engine.ts
│   ├── db.ts            # Queries de BD
│   └── routers.ts       # APIs tRPC
├── drizzle/             # ORM y migraciones
├── shared/              # Código compartido
└── .env.example         # Variables de ejemplo
```

## 🔧 Configuración

### Variables obligatorias

```env
# Base de datos (MySQL/TiDB)
DATABASE_URL=mysql://user:pass@host:3306/agencybot

# JWT para sesiones
JWT_SECRET=<generated-with-openssl-rand-base64-32>

# OAuth (tu servidor)
OAUTH_SERVER_URL=https://tu-auth-server.com

# LLM - requiere al menos uno
BUILT_IN_FORGE_API_URL=https://api.openai.com/v1
BUILT_IN_FORGE_API_KEY=sk_...

# Cifrado de credenciales
ENCRYPTION_MASTER_KEY=<generated-with-crypto>
```

Ver [.env.example](./.env.example) para todas las variables disponibles.

## 📚 Documentación

- **[Guía técnica completa](./DOCUMENTACION_TECNICA.md)** - Arquitectura, APIs, BD
- **[Guía de despliegue](./DEPLOYMENT_GUIDE.md)** - Vercel, Railway, servidor propio
- **[Guía para clientes](./GUIA_CLIENTE.md)** - Cómo usar la plataforma
- **[Política de privacidad](./POLITICA_PRIVACIDAD.md)**
- **[Términos de servicio](./TERMINOS_DE_SERVICIO.md)**

## 🛠️ Desarrollo

### Build para producción

```bash
pnpm build
pnpm start
```

### Ejecutar tests

```bash
pnpm test
```

### Format de código

```bash
pnpm format
```

### Verificar tipos

```bash
pnpm check
```

## 🚀 Despliegue

### Vercel (más simple)

```bash
vercel --prod
```

Ver [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para más detalles.

### Railway (recomendado)

1. Push a GitHub
2. Conecta repositorio en https://railway.app
3. Railway detecta automáticamente `package.json` y despliega

### Servidor propio

```bash
# Docker
docker build -t agencybot .
docker run -p 3000:3000 -e DATABASE_URL=... agencybot

# O con PM2
npm i -g pm2
pnpm build
pm2 start "pnpm start" --name agencybot
```

## 📊 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19, Tailwind CSS 4, Framer Motion |
| **Backend** | Node.js 22, Express 4, tRPC 11 |
| **Base de datos** | MySQL 2, Drizzle ORM |
| **Hosting** | Vercel, Railway, o tu servidor |
| **LLM** | OpenAI, Anthropic, Gemini, Groq, Ollama |
| **Voz** | Twilio, ElevenLabs, Deepgram |
| **Pagos** | Stripe |

## 🔐 Seguridad

- ✅ Encriptación AES-256-GCM para API keys
- ✅ JWT con `jose` para sesiones
- ✅ CSRF protection con cookies httpOnly
- ✅ Input validation con Zod
- ✅ Autorización basada en roles
- ✅ Secrets management con variables de entorno

## 📈 Performance

- Server-side rendering (SSR) listo
- Compresión gzip automática
- Caching de bots y configuraciones
- Database indexes optimizados
- Lazy loading de componentes

## 🐛 Troubleshooting

### "DATABASE_URL is not configured"
```bash
# Verifica .env
echo $DATABASE_URL

# O prueba conexión directa
mysql -u user -p -h host -D database -e "SELECT 1;"
```

### "OAUTH_SERVER_URL is not configured"
Configura tu servidor OAuth y actualiza `OAUTH_SERVER_URL` en `.env`

### "BUILT_IN_FORGE_API_URL is required"
Configura explícitamente tu LLM API:
```env
BUILT_IN_FORGE_API_URL=https://api.openai.com/v1
BUILT_IN_FORGE_API_KEY=sk_...
```

Ver [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting) para más soluciones.

## 💡 Casos de uso

- **Agencias digitales** - Agentes para cada especialidad
- **Soporte técnico** - Agentes de voz para atención al cliente
- **Ventas** - Bots para calificación de leads
- **RR.HH.** - Asistentes para entrevistas
- **Educación** - Tutores de IA
- **E-commerce** - Asistentes de compra

## 📝 Licencia

MIT © 2025 - Jon-human-in-the-loop

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/Jon-human-in-the-loop/Agencybot/issues)
- **Documentación**: [Docs completa](./DOCUMENTACION_TECNICA.md)
- **Email**: contact@agencybot.local

---

**¿Listo para empezar?** → [Inicio rápido](#-inicio-rápido) | **¿Desplegar?** → [Guía de despliegue](./DEPLOYMENT_GUIDE.md)

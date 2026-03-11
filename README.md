# AgencyBot - Plataforma de Agencia Virtual de Marketing con IA

Una plataforma web completa para crear y gestionar una agencia de marketing virtual con 10 especialistas de IA, 6 agentes telefónicos de voz y 12+ integraciones con herramientas empresariales.

## 🎯 Características Principales

### 👥 10 Especialistas Virtuales
- Valentina Cruz - Directora Creativa
- Sebastián Ruiz - Estratega de Marketing
- Camila Torres - Copywriter Senior
- Mateo García - Gestor de Redes Sociales
- Lucía Mendoza - Analista de Datos
- Andrés Vargas - Especialista SEO/SEM
- Daniela Reyes - Community Manager
- Felipe Castro - Ejecutivo de Cuentas
- Isabela Moreno - Diseñadora Creativa
- Ricardo Navarro - Coordinador de Proyectos

### 📞 6 Agentes Telefónicos de Voz
- Sofía - Recepcionista
- Carlos - Ejecutivo de Ventas
- Ana - Soporte Técnico
- Roberto - Cobranza
- Laura - Encuestas
- Miguel - Reservas

### 🔌 12+ Integraciones
HubSpot CRM, Mailchimp, Google Calendar, Stripe, Instagram, Slack, Notion, Google Sheets, Brevo, n8n, Make, Pipedrive

## 🚀 Stack Tecnológico

- **Frontend**: React 19 + Tailwind CSS 4 + Framer Motion
- **Backend**: Node.js + Express + tRPC + Drizzle ORM
- **Database**: MySQL/TiDB
- **LLM**: OpenAI, Anthropic Claude, Google Gemini, Groq, Ollama
- **Voice**: Web Speech API (gratis), Twilio, ElevenLabs, Deepgram
- **Auth**: Manus OAuth

## 📋 Requisitos

- Node.js 22+
- pnpm 10+
- MySQL 8+ o TiDB

## 🔧 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Jon-human-in-the-loop/Agencybot.git
cd Agencybot

# Instalar dependencias
pnpm install

# Ejecutar migraciones
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Iniciar servidor de desarrollo
pnpm dev
```

## 📖 Documentación

- `architecture.md` - Arquitectura técnica del sistema
- `todo.md` - Checklist de funcionalidades implementadas

## 🧪 Tests

```bash
pnpm test
```

27 tests pasando cubriendo:
- Autenticación
- Gestión de bots
- Configuración de LLM
- Conversaciones
- Agentes de voz
- Integraciones
- Analytics

## 🎨 Diseño Visual

Estética premium estilo Tendril Studio:
- Fondo negro puro
- Tipografía Playfair Display (display) + Inter (body)
- Animaciones Framer Motion suaves
- Glass-card effects con bordes translúcidos
- Navegación minimalista top-bar

## 📝 Licencia

Privado - Todos los derechos reservados

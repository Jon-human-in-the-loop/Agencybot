# AgencyBot - Agencia de Marketing Virtual - TODO

## Fase 1: Base de Datos y Seed
- [x] Esquema DB: bot_profiles, llm_configs, conversation_sessions, messages, metrics, response_templates, conversation_flows
- [x] Migraciones SQL aplicadas
- [x] Seed: 10 perfiles de trabajadores virtuales precargados
  - [x] 1. Valentina Cruz - Directora Creativa
  - [x] 2. Sebastián Ruiz - Estratega de Marketing
  - [x] 3. Camila Torres - Copywriter Senior
  - [x] 4. Mateo García - Gestor de Redes Sociales
  - [x] 5. Lucía Mendoza - Analista de Datos
  - [x] 6. Andrés Vargas - Especialista SEO/SEM
  - [x] 7. Daniela Reyes - Community Manager
  - [x] 8. Felipe Castro - Ejecutivo de Cuentas
  - [x] 9. Isabela Moreno - Diseñadora Creativa
  - [x] 10. Ricardo Navarro - Coordinador de Proyectos

## Fase 2: Backend tRPC
- [x] Router: bot_profiles CRUD completo
- [x] Router: llm_configs (OpenAI, Anthropic, Gemini, Groq, Ollama, OpenRouter, Custom)
- [x] Router: conversation_sessions y messages
- [x] Router: métricas y estadísticas del dashboard
- [x] Router: response_templates CRUD
- [x] Router: conversation_flows CRUD
- [x] Motor de chat con adaptador multi-LLM (llm-engine.ts)
- [x] Endpoint simulador de conversaciones

## Fase 3: Frontend
- [x] Tema visual: oscuro profesional, verde agencia (#00D084), tipografía moderna
- [x] AgencyLayout con sidebar de navegación completo
- [x] Landing page de la agencia (Home con dashboard)
- [x] Página: Equipo Virtual (Team - listado de 10 trabajadores virtuales)
- [x] Página: Editor de Bot (BotEditor - prompts, personalidad, LLM)
- [x] Página: Simulador de Chat (Simulator - probar bot en tiempo real)
- [x] Página: Dashboard de Métricas (Analytics)
- [x] Página: Plantillas de Respuesta (Templates)
- [x] Página: Flujos Conversacionales (Flows)
- [x] Página: Configuración de LLM (LLMConfig)

## Fase 4: Funcionalidades Clave
- [x] Editor de prompts con preview en vivo y guardado automático
- [x] Selector de proveedor LLM por trabajador virtual
- [x] Simulador de chat en tiempo real con historial persistente
- [x] Dashboard métricas: conversaciones, tiempos, satisfacción, actividad por bot
- [x] Toggle activo/inactivo por trabajador
- [x] Tarjetas de trabajador con avatar, rol, estado y estadísticas
- [x] Sistema de plantillas por tipo de tarea de marketing
- [x] Configurador de flujos con reglas de negocio

## Fase 5: Pruebas y Entrega
- [x] Tests vitest: 27 tests pasando (auth, bots, llm, conversations, voice, integrations, analytics, whatsapp)
- [x] Checkpoint final

## Fase 6: Agentes Telefónicos de Voz
- [x] Esquema DB: tablas voice_agents, voice_calls
- [x] Seed: 6 agentes de voz especializados (Sofía-Recepción, Carlos-Ventas, Ana-Soporte, Roberto-Cobranza, Laura-Encuestas, Miguel-Reservas)
- [x] Motor de voz: voice-engine.ts con Twilio TwiML, ElevenLabs TTS, Deepgram STT
- [x] Fallback Web Speech API nativa del navegador (gratis, sin API key)
- [x] Simulador de llamada en navegador con Web Speech API
- [x] Página Voice Agents con tarjetas y simulador de llamada integrado
- [x] Configurador de voz: TTS provider, STT provider, Twilio credentials
- [x] Router tRPC: voice.list, voice.getById, voice.create, voice.update, voice.processCall, voice.twilioWebhook, voice.callHistory, voice.seedAgents

## Fase 7: Hub de Integraciones
- [x] Esquema DB: app_integrations, bot_integration_links
- [x] Motor de integraciones: integrations-engine.ts con 12+ conectores
- [x] Catálogo de integraciones: HubSpot, Mailchimp, Google Calendar, Stripe, Instagram, Slack, Notion, Google Sheets, Brevo, n8n, Make, Pipedrive
- [x] Router tRPC: integrations.catalog, integrations.list, integrations.connect, integrations.disconnect, integrations.delete, integrations.test, integrations.linkToBot, integrations.getBotLinks
- [x] Página Integrations con catálogo visual, filtros por categoría y modal de conexión
- [x] Formularios de credenciales específicos por proveedor
- [x] Seed de 12 integraciones de ejemplo

## Fase 8: Rediseño Visual Estilo Tendril Studio
- [x] CSS global: fondo negro puro, tipografía serif display (Playfair Display), sans-serif limpia (Inter)
- [x] Paleta: negro puro #000, blanco #FFF, gris sutil, acento esmeralda mínimo
- [x] Home: hero cinematográfico full-viewport con animaciones framer-motion
- [x] AgencyLayout: navegación top-bar minimalista (no sidebar en landing)
- [x] Team: grid asimétrico masonry con tarjetas premium
- [x] BotEditor: editor limpio con mucho whitespace
- [x] Simulator: interfaz de chat cinematográfica
- [x] VoiceAgents: diseño premium con cards grandes
- [x] Integrations: catálogo visual limpio
- [x] Analytics, LLMConfig, Templates, Flows: estética consistente
- [x] Animaciones suaves en todas las transiciones de página
- [x] Hover effects elegantes en todos los elementos interactivos


## Fase 9: Panel de Setup Ultra-Simple para Clientes
- [x] Página Setup.tsx: formulario minimalista para pegar APIs
- [x] Validación en tiempo real: OpenAI, Anthropic, Twilio, Railway
- [x] Checkmarks verdes cuando valida ✓
- [x] Botón "Desplegar Ahora" que genera URL automáticamente
- [x] Pantalla de éxito con URL para copiar
- [x] Enlaces a dónde obtener cada API key
- [x] Router tRPC: setup.validateCredential, setup.deployToRailway
- [x] Tablas DB: encrypted_credentials, admin_settings
- [x] Encriptación de credenciales con AES-256-GCM
- [x] Ruta /setup agregada al App.tsx


## Fase 10: Documentación, Pricing y Términos Legales
- [x] Guía de Cliente (GUIA_CLIENTE.md) - paso a paso completo
- [x] Documentación Técnica (DOCUMENTACION_TECNICA.md) - para desarrolladores
- [x] Página de Pricing (Pricing.tsx) - 3 planes con toggle anual/mensual
- [x] Términos de Servicio (TERMINOS_DE_SERVICIO.md)
- [x] Política de Privacidad (POLITICA_PRIVACIDAD.md)
- [x] README.md completo (README_COMPLETO.md)
- [x] Ruta /pricing agregada al App.tsx

# Arquitectura de la Plataforma de Bots de WhatsApp

## 1. Resumen

Esta plataforma está diseñada para ser un sistema robusto, escalable y modular que permita a las empresas implementar y gestionar bots de WhatsApp para diversas funciones. La arquitectura se centra en la flexibilidad, permitiendo la integración con diferentes proveedores de LLM y la fácil personalización de los perfiles de los bots.

## 2. Componentes Principales

La plataforma se compone de los siguientes módulos principales:

| Módulo | Descripción |
| :--- | :--- |
| **Puente de WhatsApp (WhatsApp Bridge)** | Se encarga de la comunicación bidireccional con la API de WhatsApp (o un proveedor de servicios de WhatsApp como Twilio). Recibe los mensajes de los usuarios y envía las respuestas generadas por el bot. |
| **Motor del Bot (Bot Engine)** | Es el cerebro del sistema. Orquesta el flujo de la conversación, gestiona las sesiones de los usuarios y se comunica con el Adaptador de LLM. |
| **Adaptador de LLM (LLM Adapter)** | Proporciona una interfaz unificada para interactuar con diferentes modelos de lenguaje grandes (LLM). Esto permite cambiar de proveedor de LLM sin tener que modificar el resto del código. |
| **Gestor de Perfiles (Profile Manager)** | Almacena y gestiona los diferentes perfiles de los bots (ventas, soporte, etc.), incluyendo sus prompts, personalidades y configuraciones específicas. |
| **Panel de Administración (Admin Panel)** | Una interfaz web que permite a los administradores de la empresa gestionar los perfiles de los bots, editar los prompts, ver las conversaciones y configurar los ajustes del sistema. |
| **Base de Datos (Database)** | Almacena la información de las conversaciones, los perfiles de los bots, los usuarios y otros datos relevantes. |

## 3. Flujo de Datos

1. Un usuario envía un mensaje a través de WhatsApp.
2. El **Puente de WhatsApp** recibe el mensaje y lo reenvía al **Motor del Bot**.
3. El **Motor del Bot** identifica al usuario, recupera el historial de la conversación y selecciona el perfil de bot adecuado.
4. El **Motor del Bot** construye el prompt final utilizando la información del **Gestor de Perfiles** y el historial de la conversación.
5. El **Motor del Bot** envía el prompt al **Adaptador de LLM**.
6. El **Adaptador de LLM** se comunica con el LLM configurado (por ejemplo, GPT-4, Gemini) y recibe la respuesta.
7. El **Adaptador de LLM** devuelve la respuesta al **Motor del Bot**.
8. El **Motor del Bot** procesa la respuesta y la envía al **Puente de WhatsApp**.
9. El **Puente de WhatsApp** envía la respuesta final al usuario a través de WhatsApp.

## 4. Estructura del Proyecto

El proyecto se organizará en la siguiente estructura de directorios:

```
whatsapp_bot_platform/
├── backend/
│   ├── src/
│   │   ├── bridge/
│   │   ├── engine/
│   │   ├── adapter/
│   │   ├── profiles/
│   │   └── api/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── tsconfig.json
├── database/
│   └── schema.sql
└── docs/
    └── architecture.md
```

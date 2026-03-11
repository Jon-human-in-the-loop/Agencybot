/**
 * Integrations Engine - Hub de Integraciones con Apps Externas
 * Conectores para: CRM, Marketing, Calendario, Pagos, RRSS, Analytics, Notificaciones
 */

// ─── Catálogo de Integraciones Disponibles ────────────────────────────────────

export interface IntegrationDefinition {
  slug: string;
  name: string;
  category: string;
  provider: string;
  description: string;
  icon: string;
  color: string;
  docsUrl: string;
  freetier: string;
  requiredFields: Array<{ key: string; label: string; type: "text" | "password" | "url"; placeholder: string }>;
  capabilities: string[];
  webhookSupport: boolean;
}

export const INTEGRATION_CATALOG: IntegrationDefinition[] = [
  // ── CRM ──────────────────────────────────────────────────────────────────
  {
    slug: "hubspot",
    name: "HubSpot CRM",
    category: "crm",
    provider: "hubspot",
    description: "Sincroniza contactos, deals y actividades. Los agentes crean leads automáticamente.",
    icon: "🟠",
    color: "#FF7A59",
    docsUrl: "https://developers.hubspot.com/docs/api/overview",
    freetier: "Gratis hasta 1M contactos (CRM básico)",
    requiredFields: [
      { key: "accessToken", label: "Access Token", type: "password", placeholder: "pat-na1-..." },
      { key: "portalId", label: "Portal ID", type: "text", placeholder: "12345678" },
    ],
    capabilities: ["create_contact", "update_contact", "create_deal", "add_note", "get_contact"],
    webhookSupport: true,
  },
  {
    slug: "salesforce",
    name: "Salesforce",
    category: "crm",
    provider: "salesforce",
    description: "CRM empresarial. Los agentes crean oportunidades y actualizan el pipeline de ventas.",
    icon: "☁️",
    color: "#00A1E0",
    docsUrl: "https://developer.salesforce.com/docs/apis",
    freetier: "Trial 30 días gratis",
    requiredFields: [
      { key: "instanceUrl", label: "Instance URL", type: "url", placeholder: "https://yourorg.salesforce.com" },
      { key: "accessToken", label: "Access Token", type: "password", placeholder: "00D..." },
    ],
    capabilities: ["create_lead", "create_opportunity", "update_contact", "add_activity"],
    webhookSupport: true,
  },
  {
    slug: "pipedrive",
    name: "Pipedrive",
    category: "crm",
    provider: "pipedrive",
    description: "CRM de ventas visual. Gestión de pipeline y seguimiento de deals desde el bot.",
    icon: "🟢",
    color: "#00B050",
    docsUrl: "https://developers.pipedrive.com/docs/api/v1",
    freetier: "Trial 14 días gratis",
    requiredFields: [
      { key: "apiToken", label: "API Token", type: "password", placeholder: "abc123..." },
    ],
    capabilities: ["create_person", "create_deal", "add_note", "update_deal"],
    webhookSupport: true,
  },
  // ── Marketing ─────────────────────────────────────────────────────────────
  {
    slug: "mailchimp",
    name: "Mailchimp",
    category: "marketing",
    provider: "mailchimp",
    description: "Email marketing. Suscribe contactos a listas y dispara campañas automáticas.",
    icon: "🐵",
    color: "#FFE01B",
    docsUrl: "https://mailchimp.com/developer/marketing/api/",
    freetier: "Gratis hasta 500 contactos y 1,000 emails/mes",
    requiredFields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "abc123-us1" },
      { key: "serverPrefix", label: "Server Prefix", type: "text", placeholder: "us1" },
    ],
    capabilities: ["subscribe_contact", "add_tag", "send_campaign", "get_lists"],
    webhookSupport: true,
  },
  {
    slug: "activecampaign",
    name: "ActiveCampaign",
    category: "marketing",
    provider: "activecampaign",
    description: "Automatización de marketing y CRM. Crea contactos y activa automations.",
    icon: "⚡",
    color: "#356AE6",
    docsUrl: "https://developers.activecampaign.com/reference",
    freetier: "Trial 14 días gratis",
    requiredFields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "..." },
      { key: "apiUrl", label: "API URL", type: "url", placeholder: "https://youracccount.api-us1.com" },
    ],
    capabilities: ["create_contact", "add_tag", "trigger_automation", "send_email"],
    webhookSupport: true,
  },
  {
    slug: "brevo",
    name: "Brevo (Sendinblue)",
    category: "marketing",
    provider: "brevo",
    description: "Email y SMS marketing. Tier gratuito generoso. Envía emails transaccionales.",
    icon: "📧",
    color: "#0B996E",
    docsUrl: "https://developers.brevo.com/reference",
    freetier: "Gratis: 300 emails/día, contactos ilimitados",
    requiredFields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "xkeysib-..." },
    ],
    capabilities: ["send_email", "create_contact", "add_to_list", "send_sms"],
    webhookSupport: true,
  },
  // ── Calendario ────────────────────────────────────────────────────────────
  {
    slug: "google-calendar",
    name: "Google Calendar",
    category: "calendar",
    provider: "google",
    description: "Agenda citas y reuniones directamente desde la conversación del bot.",
    icon: "📅",
    color: "#4285F4",
    docsUrl: "https://developers.google.com/calendar/api",
    freetier: "Gratis con cuenta Google",
    requiredFields: [
      { key: "accessToken", label: "Access Token OAuth2", type: "password", placeholder: "ya29...." },
      { key: "calendarId", label: "Calendar ID", type: "text", placeholder: "primary" },
    ],
    capabilities: ["create_event", "list_events", "check_availability", "delete_event"],
    webhookSupport: true,
  },
  {
    slug: "calendly",
    name: "Calendly",
    category: "calendar",
    provider: "calendly",
    description: "Reserva reuniones automáticamente. El bot comparte el link y registra la cita.",
    icon: "🗓️",
    color: "#006BFF",
    docsUrl: "https://developer.calendly.com/api-docs",
    freetier: "Gratis (1 tipo de evento)",
    requiredFields: [
      { key: "accessToken", label: "Personal Access Token", type: "password", placeholder: "eyJhbGci..." },
    ],
    capabilities: ["get_availability", "create_booking", "list_events", "cancel_event"],
    webhookSupport: true,
  },
  // ── Pagos ─────────────────────────────────────────────────────────────────
  {
    slug: "stripe",
    name: "Stripe",
    category: "payments",
    provider: "stripe",
    description: "Procesa pagos y genera links de pago desde la conversación. Consulta facturas.",
    icon: "💳",
    color: "#635BFF",
    docsUrl: "https://stripe.com/docs/api",
    freetier: "Gratis (solo pagas por transacción: 2.9% + 30¢)",
    requiredFields: [
      { key: "secretKey", label: "Secret Key", type: "password", placeholder: "sk_test_..." },
    ],
    capabilities: ["create_payment_link", "get_invoice", "create_customer", "check_subscription"],
    webhookSupport: true,
  },
  // ── Redes Sociales ────────────────────────────────────────────────────────
  {
    slug: "instagram",
    name: "Instagram Business",
    category: "social",
    provider: "meta",
    description: "Publica contenido, responde DMs y analiza métricas de Instagram desde el bot.",
    icon: "📸",
    color: "#E1306C",
    docsUrl: "https://developers.facebook.com/docs/instagram-api",
    freetier: "Gratis con cuenta Business",
    requiredFields: [
      { key: "accessToken", label: "Access Token", type: "password", placeholder: "EAABwzLixnjYBO..." },
      { key: "accountId", label: "Instagram Account ID", type: "text", placeholder: "17841400..." },
    ],
    capabilities: ["post_image", "post_story", "get_insights", "reply_comment", "send_dm"],
    webhookSupport: true,
  },
  // ── Notificaciones ────────────────────────────────────────────────────────
  {
    slug: "slack",
    name: "Slack",
    category: "notifications",
    provider: "slack",
    description: "Notificaciones internas al equipo. Los bots alertan sobre leads, citas y eventos.",
    icon: "💬",
    color: "#4A154B",
    docsUrl: "https://api.slack.com/",
    freetier: "Gratis (90 días de historial)",
    requiredFields: [
      { key: "webhookUrl", label: "Webhook URL", type: "url", placeholder: "https://hooks.slack.com/services/..." },
    ],
    capabilities: ["send_message", "send_alert", "create_channel_post"],
    webhookSupport: false,
  },
  // ── Productividad ─────────────────────────────────────────────────────────
  {
    slug: "notion",
    name: "Notion",
    category: "productivity",
    provider: "notion",
    description: "Guarda notas, crea tareas y actualiza bases de datos de Notion desde las conversaciones.",
    icon: "📓",
    color: "#000000",
    docsUrl: "https://developers.notion.com/",
    freetier: "Gratis (plan personal)",
    requiredFields: [
      { key: "apiKey", label: "Integration Token", type: "password", placeholder: "secret_..." },
      { key: "databaseId", label: "Database ID", type: "text", placeholder: "abc123..." },
    ],
    capabilities: ["create_page", "update_page", "query_database", "add_comment"],
    webhookSupport: false,
  },
  {
    slug: "google-sheets",
    name: "Google Sheets",
    category: "productivity",
    provider: "google",
    description: "Registra leads, datos de clientes y métricas directamente en hojas de cálculo.",
    icon: "📊",
    color: "#34A853",
    docsUrl: "https://developers.google.com/sheets/api",
    freetier: "Gratis con cuenta Google",
    requiredFields: [
      { key: "accessToken", label: "Access Token OAuth2", type: "password", placeholder: "ya29...." },
      { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" },
    ],
    capabilities: ["append_row", "read_range", "update_cell", "create_sheet"],
    webhookSupport: false,
  },
  // ── Automatización ────────────────────────────────────────────────────────
  {
    slug: "make",
    name: "Make (Integromat)",
    category: "other",
    provider: "make",
    description: "Automatización visual. Conecta el bot con miles de apps mediante webhooks de Make.",
    icon: "⚙️",
    color: "#6D00CC",
    docsUrl: "https://www.make.com/en/api-documentation",
    freetier: "Gratis: 1,000 operaciones/mes",
    requiredFields: [
      { key: "webhookUrl", label: "Webhook URL de Make", type: "url", placeholder: "https://hook.eu1.make.com/..." },
    ],
    capabilities: ["trigger_scenario", "send_data"],
    webhookSupport: false,
  },
  {
    slug: "n8n",
    name: "n8n (Self-hosted)",
    category: "other",
    provider: "n8n",
    description: "Automatización open-source auto-hospedada. Control total de tus flujos de trabajo.",
    icon: "🔄",
    color: "#EA4B71",
    docsUrl: "https://docs.n8n.io/api/",
    freetier: "100% gratis (self-hosted)",
    requiredFields: [
      { key: "webhookUrl", label: "Webhook URL de n8n", type: "url", placeholder: "https://your-n8n.com/webhook/..." },
      { key: "apiKey", label: "API Key (opcional)", type: "password", placeholder: "n8n_api_..." },
    ],
    capabilities: ["trigger_workflow", "send_data", "receive_data"],
    webhookSupport: true,
  },
];

// ─── Integration Connectors ───────────────────────────────────────────────────

export async function hubspotCreateContact(
  credentials: { accessToken: string },
  contact: { email?: string; firstName?: string; lastName?: string; phone?: string; company?: string }
): Promise<{ id: string; properties: Record<string, string> }> {
  const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${credentials.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        email: contact.email ?? "",
        firstname: contact.firstName ?? "",
        lastname: contact.lastName ?? "",
        phone: contact.phone ?? "",
        company: contact.company ?? "",
      },
    }),
  });
  if (!response.ok) throw new Error(`HubSpot error: ${response.status} - ${await response.text()}`);
  return response.json();
}

export async function mailchimpSubscribe(
  credentials: { apiKey: string; serverPrefix: string },
  listId: string,
  contact: { email: string; firstName?: string; lastName?: string; tags?: string[] }
): Promise<{ id: string; status: string }> {
  const response = await fetch(
    `https://${credentials.serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`anystring:${credentials.apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: contact.email,
        status: "subscribed",
        merge_fields: { FNAME: contact.firstName ?? "", LNAME: contact.lastName ?? "" },
        tags: contact.tags ?? [],
      }),
    }
  );
  if (!response.ok) throw new Error(`Mailchimp error: ${response.status} - ${await response.text()}`);
  return response.json();
}

export async function googleCalendarCreateEvent(
  credentials: { accessToken: string; calendarId: string },
  event: { summary: string; description?: string; startDateTime: string; endDateTime: string; attendeeEmail?: string }
): Promise<{ id: string; htmlLink: string }> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(credentials.calendarId)}/events`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${credentials.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description ?? "",
        start: { dateTime: event.startDateTime, timeZone: "America/Bogota" },
        end: { dateTime: event.endDateTime, timeZone: "America/Bogota" },
        attendees: event.attendeeEmail ? [{ email: event.attendeeEmail }] : [],
      }),
    }
  );
  if (!response.ok) throw new Error(`Google Calendar error: ${response.status} - ${await response.text()}`);
  return response.json();
}

export async function stripeCreatePaymentLink(
  credentials: { secretKey: string },
  options: { amount: number; currency: string; productName: string; quantity?: number }
): Promise<{ url: string; id: string }> {
  const priceResponse = await fetch("https://api.stripe.com/v1/prices", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${credentials.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      unit_amount: String(Math.round(options.amount * 100)),
      currency: options.currency,
      "product_data[name]": options.productName,
    }),
  });
  if (!priceResponse.ok) throw new Error(`Stripe price error: ${priceResponse.status} - ${await priceResponse.text()}`);
  const price = await priceResponse.json() as any;

  const linkResponse = await fetch("https://api.stripe.com/v1/payment_links", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${credentials.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "line_items[0][price]": price.id,
      "line_items[0][quantity]": String(options.quantity ?? 1),
    }),
  });
  if (!linkResponse.ok) throw new Error(`Stripe payment link error: ${linkResponse.status} - ${await linkResponse.text()}`);
  return linkResponse.json();
}

export async function slackSendMessage(
  webhookUrl: string,
  message: { text: string; username?: string; icon_emoji?: string }
): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: message.text,
      username: message.username ?? "AgencyBot",
      icon_emoji: message.icon_emoji ?? ":robot_face:",
    }),
  });
  if (!response.ok) throw new Error(`Slack webhook error: ${response.status}`);
}

export async function googleSheetsAppendRow(
  credentials: { accessToken: string; spreadsheetId: string },
  sheetName: string,
  values: string[]
): Promise<void> {
  const range = `${sheetName}!A:Z`;
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${credentials.spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${credentials.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [values] }),
    }
  );
  if (!response.ok) throw new Error(`Google Sheets error: ${response.status} - ${await response.text()}`);
}

export async function triggerWebhook(webhookUrl: string, payload: Record<string, unknown>): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Webhook error: ${response.status}`);
}

export async function notionCreatePage(
  credentials: { apiKey: string; databaseId: string },
  properties: Record<string, unknown>
): Promise<{ id: string; url: string }> {
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${credentials.apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { database_id: credentials.databaseId },
      properties,
    }),
  });
  if (!response.ok) throw new Error(`Notion error: ${response.status} - ${await response.text()}`);
  return response.json();
}

export async function brevoSendEmail(
  credentials: { apiKey: string },
  email: { to: string; toName?: string; subject: string; htmlContent: string; fromEmail?: string; fromName?: string }
): Promise<{ messageId: string }> {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": credentials.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: email.fromEmail ?? "noreply@agencybot.ai", name: email.fromName ?? "AgencyBot" },
      to: [{ email: email.to, name: email.toName ?? email.to }],
      subject: email.subject,
      htmlContent: email.htmlContent,
    }),
  });
  if (!response.ok) throw new Error(`Brevo error: ${response.status} - ${await response.text()}`);
  return response.json();
}

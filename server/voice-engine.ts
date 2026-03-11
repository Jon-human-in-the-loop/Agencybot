/**
 * Voice Engine - Motor de Agentes Telefónicos
 * Soporta: Twilio (llamadas reales), ElevenLabs TTS, Deepgram STT, Browser APIs (gratis)
 */

import { ENV } from "./_core/env";

// ─── TTS: Text-to-Speech ──────────────────────────────────────────────────────

export interface TTSOptions {
  text: string;
  voiceId?: string;
  provider?: "elevenlabs" | "openai_tts" | "browser";
  language?: string;
  speed?: number;
}

export interface TTSResult {
  audioBase64?: string;
  audioUrl?: string;
  provider: string;
  durationMs?: number;
}

/**
 * ElevenLabs TTS - Free tier: 10,000 chars/month
 * Docs: https://elevenlabs.io/docs/api-reference/text-to-speech
 */
export async function synthesizeWithElevenLabs(opts: TTSOptions, apiKey: string): Promise<TTSResult> {
  const voiceId = opts.voiceId ?? "pNInz6obpgDQGcFmaJgB"; // Adam - voz masculina en español
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text: opts.text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs TTS error: ${response.status} - ${err}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const audioBase64 = Buffer.from(audioBuffer).toString("base64");

  return {
    audioBase64,
    provider: "elevenlabs",
  };
}

/**
 * OpenAI TTS - Incluido en API de OpenAI
 * Docs: https://platform.openai.com/docs/api-reference/audio/createSpeech
 */
export async function synthesizeWithOpenAI(opts: TTSOptions, apiKey: string): Promise<TTSResult> {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: opts.text,
      voice: opts.voiceId ?? "nova", // alloy, echo, fable, onyx, nova, shimmer
      speed: opts.speed ?? 1.0,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI TTS error: ${response.status} - ${err}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const audioBase64 = Buffer.from(audioBuffer).toString("base64");

  return {
    audioBase64,
    provider: "openai_tts",
  };
}

// ─── STT: Speech-to-Text ──────────────────────────────────────────────────────

export interface STTOptions {
  audioBase64: string;
  mimeType?: string;
  language?: string;
  provider?: "deepgram" | "openai_whisper" | "browser";
}

export interface STTResult {
  transcript: string;
  confidence?: number;
  provider: string;
  words?: Array<{ word: string; start: number; end: number; confidence: number }>;
}

/**
 * Deepgram STT - Free tier: $200 créditos al registrarse (~45 horas de audio)
 * Docs: https://developers.deepgram.com/reference/listen-file
 */
export async function transcribeWithDeepgram(opts: STTOptions, apiKey: string): Promise<STTResult> {
  const audioBuffer = Buffer.from(opts.audioBase64, "base64");
  const mimeType = opts.mimeType ?? "audio/webm";

  const params = new URLSearchParams({
    model: "nova-2",
    language: opts.language ?? "es",
    smart_format: "true",
    punctuate: "true",
    diarize: "false",
  });

  const response = await fetch(`https://api.deepgram.com/v1/listen?${params}`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiKey}`,
      "Content-Type": mimeType,
    },
    body: audioBuffer,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Deepgram STT error: ${response.status} - ${err}`);
  }

  const data = await response.json() as any;
  const result = data?.results?.channels?.[0]?.alternatives?.[0];

  return {
    transcript: result?.transcript ?? "",
    confidence: result?.confidence,
    provider: "deepgram",
    words: result?.words,
  };
}

/**
 * OpenAI Whisper STT
 * Docs: https://platform.openai.com/docs/api-reference/audio/createTranscription
 */
export async function transcribeWithWhisper(opts: STTOptions, apiKey: string): Promise<STTResult> {
  const audioBuffer = Buffer.from(opts.audioBase64, "base64");
  const blob = new Blob([audioBuffer], { type: opts.mimeType ?? "audio/webm" });

  const formData = new FormData();
  formData.append("file", blob, "audio.webm");
  formData.append("model", "whisper-1");
  formData.append("language", opts.language ?? "es");
  formData.append("response_format", "verbose_json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Whisper STT error: ${response.status} - ${err}`);
  }

  const data = await response.json() as any;

  return {
    transcript: data.text ?? "",
    provider: "openai_whisper",
  };
}

// ─── Twilio Integration ───────────────────────────────────────────────────────

export interface TwilioCallConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  toNumber: string;
  webhookUrl: string;
}

/**
 * Inicia una llamada saliente con Twilio
 * Requiere cuenta Twilio (trial gratuito disponible en twilio.com)
 */
export async function initiateOutboundCall(config: TwilioCallConfig): Promise<{ callSid: string; status: string }> {
  const credentials = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Calls.json`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: config.toNumber,
        From: config.fromNumber,
        Url: config.webhookUrl,
        Method: "POST",
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Twilio call error: ${response.status} - ${err}`);
  }

  const data = await response.json() as any;
  return { callSid: data.sid, status: data.status };
}

/**
 * Genera TwiML para manejar llamadas entrantes de Twilio
 * El agente saluda y escucha al usuario
 */
export function generateTwiML(options: {
  welcomeMessage: string;
  gatherAction: string;
  language?: string;
  voice?: string;
}): string {
  const lang = options.language ?? "es-MX";
  const voice = options.voice ?? "Polly.Mia-Neural"; // Voz en español de Amazon Polly

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${lang}">${escapeXml(options.welcomeMessage)}</Say>
  <Gather
    input="speech"
    action="${options.gatherAction}"
    method="POST"
    language="${lang}"
    speechTimeout="auto"
    speechModel="phone_call"
    enhanced="true"
  >
    <Say voice="${voice}" language="${lang}">Por favor, dime en qué puedo ayudarte.</Say>
  </Gather>
  <Say voice="${voice}" language="${lang}">No escuché nada. Por favor, llama de nuevo.</Say>
</Response>`;
}

/**
 * Genera TwiML de respuesta después de procesar el input del usuario
 */
export function generateResponseTwiML(options: {
  responseText: string;
  continueAction: string;
  language?: string;
  voice?: string;
  endCall?: boolean;
}): string {
  const lang = options.language ?? "es-MX";
  const voice = options.voice ?? "Polly.Mia-Neural";

  if (options.endCall) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${lang}">${escapeXml(options.responseText)}</Say>
  <Hangup/>
</Response>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${lang}">${escapeXml(options.responseText)}</Say>
  <Gather
    input="speech"
    action="${options.continueAction}"
    method="POST"
    language="${lang}"
    speechTimeout="auto"
    speechModel="phone_call"
    enhanced="true"
  >
    <Say voice="${voice}" language="${lang}">¿Hay algo más en lo que pueda ayudarte?</Say>
  </Gather>
  <Say voice="${voice}" language="${lang}">Gracias por llamar. ¡Hasta pronto!</Say>
  <Hangup/>
</Response>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ─── Unified Voice Processor ──────────────────────────────────────────────────

export interface VoiceProcessResult {
  transcript: string;
  response: string;
  audioBase64?: string;
  provider: { stt: string; tts: string; llm: string };
}

/**
 * Procesa audio de voz: STT → LLM → TTS
 * Usa APIs gratuitas como fallback si no hay credenciales configuradas
 */
export async function processVoiceInput(options: {
  audioBase64: string;
  mimeType?: string;
  systemPrompt: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  sttProvider?: string;
  ttsProvider?: string;
  voiceId?: string;
  language?: string;
  deepgramApiKey?: string;
  elevenLabsApiKey?: string;
  openaiApiKey?: string;
  llmInvoker: (messages: any[]) => Promise<string>;
}): Promise<VoiceProcessResult> {
  const lang = options.language ?? "es";

  // 1. STT: Transcribir audio a texto
  let transcript = "";
  let sttProvider = "browser";

  if (options.deepgramApiKey && options.sttProvider !== "openai_whisper") {
    try {
      const sttResult = await transcribeWithDeepgram(
        { audioBase64: options.audioBase64, mimeType: options.mimeType, language: lang },
        options.deepgramApiKey
      );
      transcript = sttResult.transcript;
      sttProvider = "deepgram";
    } catch (e) {
      console.warn("[VoiceEngine] Deepgram failed, transcript empty:", e);
    }
  } else if (options.openaiApiKey && options.sttProvider === "openai_whisper") {
    try {
      const sttResult = await transcribeWithWhisper(
        { audioBase64: options.audioBase64, mimeType: options.mimeType, language: lang },
        options.openaiApiKey
      );
      transcript = sttResult.transcript;
      sttProvider = "openai_whisper";
    } catch (e) {
      console.warn("[VoiceEngine] Whisper failed:", e);
    }
  }

  if (!transcript) {
    transcript = "[Audio recibido - transcripción no disponible sin API key de STT]";
  }

  // 2. LLM: Generar respuesta
  const messages = [
    { role: "system" as const, content: options.systemPrompt },
    ...options.conversationHistory,
    { role: "user" as const, content: transcript },
  ];

  const responseText = await options.llmInvoker(messages);

  // 3. TTS: Convertir respuesta a audio
  let audioBase64: string | undefined;
  let ttsProvider = "browser";

  if (options.elevenLabsApiKey && options.ttsProvider !== "openai_tts") {
    try {
      const ttsResult = await synthesizeWithElevenLabs(
        { text: responseText, voiceId: options.voiceId, language: lang },
        options.elevenLabsApiKey
      );
      audioBase64 = ttsResult.audioBase64;
      ttsProvider = "elevenlabs";
    } catch (e) {
      console.warn("[VoiceEngine] ElevenLabs failed, using browser TTS:", e);
    }
  } else if (options.openaiApiKey && options.ttsProvider === "openai_tts") {
    try {
      const ttsResult = await synthesizeWithOpenAI(
        { text: responseText, voiceId: options.voiceId },
        options.openaiApiKey
      );
      audioBase64 = ttsResult.audioBase64;
      ttsProvider = "openai_tts";
    } catch (e) {
      console.warn("[VoiceEngine] OpenAI TTS failed:", e);
    }
  }

  return {
    transcript,
    response: responseText,
    audioBase64,
    provider: { stt: sttProvider, tts: ttsProvider, llm: "llm" },
  };
}

/**
 * Módulo de Encriptación Segura para Credenciales
 * Usa AES-256-GCM para encriptar/desencriptar API keys y credenciales
 * Las credenciales nunca se exponen en logs ni en respuestas de API
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Obtiene la clave maestra de encriptación desde variables de entorno
 * En producción, debe ser una clave fuerte de 32 bytes
 */
function getMasterKey(): Buffer {
  const keyEnv = process.env.ENCRYPTION_MASTER_KEY;
  if (!keyEnv) {
    // En desarrollo, generar una clave temporal
    console.warn("[Encryption] ENCRYPTION_MASTER_KEY no configurada. Usando clave temporal (INSEGURO EN PRODUCCIÓN)");
    return crypto.scryptSync("default-development-key", "salt", 32);
  }
  // La clave debe ser base64 encoded de 32 bytes
  return Buffer.from(keyEnv, "base64");
}

/**
 * Encripta una credencial (API key, token, etc.)
 * Retorna un string base64 que contiene: IV + TAG + CIPHERTEXT
 */
export function encryptCredential(plaintext: string): string {
  try {
    const masterKey = getMasterKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    // Combinar: IV (12 bytes) + TAG (16 bytes) + CIPHERTEXT
    const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, "hex")]);
    return combined.toString("base64");
  } catch (error) {
    console.error("[Encryption] Error encriptando credencial:", error);
    throw new Error("Failed to encrypt credential");
  }
}

/**
 * Desencripta una credencial
 * Espera un string base64 con formato: IV + TAG + CIPHERTEXT
 */
export function decryptCredential(encrypted: string): string {
  try {
    const masterKey = getMasterKey();
    const combined = Buffer.from(encrypted, "base64");

    // Extraer componentes
    const iv = combined.slice(0, IV_LENGTH);
    const tag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  } catch (error) {
    console.error("[Encryption] Error desencriptando credencial:", error);
    throw new Error("Failed to decrypt credential");
  }
}

/**
 * Enmascarar una credencial para mostrar en UI
 * Muestra solo los últimos 4 caracteres
 */
export function maskCredential(credential: string): string {
  if (credential.length <= 4) return "••••";
  return "••••" + credential.slice(-4);
}

/**
 * Generar una clave maestra segura para el usuario
 * Debe guardarse en variable de entorno
 */
export function generateMasterKey(): string {
  const key = crypto.randomBytes(32);
  return key.toString("base64");
}

/**
 * Hash seguro para verificar integridad de credenciales sin desencriptar
 */
export function hashCredential(credential: string): string {
  return crypto.createHash("sha256").update(credential).digest("hex");
}

/**
 * Verificar que una credencial coincide con su hash
 */
export function verifyCredentialHash(credential: string, hash: string): boolean {
  return hashCredential(credential) === hash;
}

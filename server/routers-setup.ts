import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { nanoid } from "nanoid";

export const setupRouter = router({
  validateCredential: publicProcedure
    .input(
      z.object({
        service: z.string(),
        credential: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Validar OpenAI
        if (input.service === "openaiKey") {
          const res = await fetch("https://api.openai.com/v1/models", {
            headers: { Authorization: `Bearer ${input.credential}` },
          });
          if (res.ok) return { valid: true };
          return { valid: false, error: "API Key inválida" };
        }

        // Validar Anthropic
        if (input.service === "anthropicKey") {
          const res = await fetch("https://api.anthropic.com/v1/models", {
            headers: { "x-api-key": input.credential },
          });
          if (res.ok) return { valid: true };
          return { valid: false, error: "API Key inválida" };
        }

        // Validar Twilio SID
        if (input.service === "twilioSid") {
          if (input.credential.startsWith("AC") && input.credential.length === 34) {
            return { valid: true };
          }
          return { valid: false, error: "SID inválido" };
        }

        // Validar Twilio Token
        if (input.service === "twilioToken") {
          if (input.credential.length >= 32) {
            return { valid: true };
          }
          return { valid: false, error: "Token inválido" };
        }

        // Validar Railway Token
        if (input.service === "railwayToken") {
          const res = await fetch("https://api.railway.app/graphql", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${input.credential}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: "{ me { id } }" }),
          });
          if (res.ok) return { valid: true };
          return { valid: false, error: "Token inválido" };
        }

        return { valid: true };
      } catch (error) {
        return { valid: false, error: "Error validando credencial" };
      }
    }),

  deployToRailway: publicProcedure
    .input(
      z.object({
        config: z.object({
          openaiKey: z.string(),
          anthropicKey: z.string().optional(),
          twilioSid: z.string(),
          twilioToken: z.string(),
          whatsappAccountId: z.string().optional(),
          railwayToken: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // TODO: Implementar despliegue real a Railway usando su API
        // Por ahora, retornar URL de ejemplo
        const projectName = `agencybot-${nanoid(6).toLowerCase()}`;
        const url = `https://${projectName}.up.railway.app`;
        return { success: true, url };
      } catch (error) {
        return { success: false, error: "Error desplegando a Railway" };
      }
    }),
});

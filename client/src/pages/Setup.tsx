import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Check, AlertCircle, Copy } from "lucide-react";

interface ApiConfig {
  openaiKey: string;
  anthropicKey: string;
  twilioSid: string;
  twilioToken: string;
  whatsappAccountId: string;
  railwayToken: string;
}

export default function Setup() {
  const [config, setConfig] = useState<ApiConfig>({
    openaiKey: "",
    anthropicKey: "",
    twilioSid: "",
    twilioToken: "",
    whatsappAccountId: "",
    railwayToken: "",
  });

  const [validating, setValidating] = useState<Record<string, boolean>>({});
  const [validated, setValidated] = useState<Record<string, boolean>>({});
  const [deploying, setDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null | undefined>(null);

  const validateMutation = trpc.setup.validateCredential.useMutation();
  const deployMutation = trpc.setup.deployToRailway.useMutation();

  const handleValidate = async (field: string, value: string) => {
    if (!value.trim()) {
      toast.error("Por favor completa el campo");
      return;
    }

    setValidating(prev => ({ ...prev, [field]: true }));

    try {
      const result = await validateMutation.mutateAsync({
        service: field as any,
        credential: value,
      });

      if (result.valid) {
        setValidated(prev => ({ ...prev, [field]: true }));
        toast.success(`${field} válido ✓`);
      } else {
        setValidated(prev => ({ ...prev, [field]: false }));
        toast.error(`${field} inválido: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Error validando ${field}`);
      setValidated(prev => ({ ...prev, [field]: false }));
    } finally {
      setValidating(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleDeploy = async () => {
    // Validar que al menos OpenAI y Twilio estén configurados
    if (!validated.openaiKey) {
      toast.error("Configura OpenAI primero");
      return;
    }
    if (!validated.twilioSid) {
      toast.error("Configura Twilio primero");
      return;
    }

    setDeploying(true);

    try {
      const result = await deployMutation.mutateAsync({
        config: {
          openaiKey: config.openaiKey,
          anthropicKey: config.anthropicKey,
          twilioSid: config.twilioSid,
          twilioToken: config.twilioToken,
          whatsappAccountId: config.whatsappAccountId,
          railwayToken: config.railwayToken,
        },
      });

      if (result.success && result.url) {
        setDeployedUrl(result.url);
        toast.success("¡Despliegue exitoso! 🎉");
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error: any) {
      toast.error("Error en el despliegue");
      console.error(error);
    } finally {
      setDeploying(false);
    }
  };

  if (deployedUrl && typeof deployedUrl === "string") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-lg md:text-xl lg:text-2xl md:text-xl md:text-lg md:text-xl lg:text-2xl lg:text-3xl lg:text-4xl font-serif text-white mb-2">¡Listo!</h1>
            <p className="text-white/40 font-light">Tu AgencyBot está en vivo</p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 mb-6">
            <p className="text-white/30 text-sm font-light mb-3">Tu URL pública:</p>
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <code className="text-white font-mono text-sm flex-1 break-all">{deployedUrl}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(deployedUrl);
                  toast.success("Copiado");
                }}
                className="flex-shrink-0 p-2 hover:bg-white/[0.05] rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-white/40 hover:text-white/60" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-white/30 text-sm font-light">Próximos pasos:</p>
            <ul className="space-y-2 text-white/40 text-sm font-light">
              <li>✓ Comparte este link con tus clientes</li>
              <li>✓ Prueba los bots en el dashboard</li>
              <li>✓ Personaliza los prompts según necesites</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.href = "/"}
            className="w-full mt-8 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-lg md:text-xl lg:text-2xl md:text-xl md:text-lg md:text-xl lg:text-2xl lg:text-3xl lg:text-4xl md:text-5xl font-serif text-white mb-3">
            Configurar AgencyBot
          </h1>
          <p className="text-white/40 font-light">
            Pega tus API keys y despliega en segundos
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6 mb-8">
          {/* OpenAI */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-medium mb-1">OpenAI API Key</h3>
                <p className="text-white/30 text-sm font-light">
                  Para que los bots piensen con IA
                </p>
              </div>
              {validated.openaiKey && <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
              {validating.openaiKey && <Loader2 className="w-5 h-5 text-white/40 animate-spin flex-shrink-0" />}
            </div>
            <input
              type="password"
              placeholder="sk-proj-xxxxxxxxxxxxxx"
              value={config.openaiKey}
              onChange={e => setConfig(prev => ({ ...prev, openaiKey: e.target.value }))}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors mb-3"
            />
            <button
              onClick={() => handleValidate("openaiKey", config.openaiKey)}
              disabled={validating.openaiKey}
              className="text-xs px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all disabled:opacity-50"
            >
              {validating.openaiKey ? "Validando..." : "Validar"}
            </button>
          </div>

          {/* Anthropic */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-medium mb-1">Anthropic Claude (Opcional)</h3>
                <p className="text-white/30 text-sm font-light">
                  Alternativa a OpenAI
                </p>
              </div>
              {validated.anthropicKey && <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
              {validating.anthropicKey && <Loader2 className="w-5 h-5 text-white/40 animate-spin flex-shrink-0" />}
            </div>
            <input
              type="password"
              placeholder="sk-ant-xxxxxxxxxxxxxx"
              value={config.anthropicKey}
              onChange={e => setConfig(prev => ({ ...prev, anthropicKey: e.target.value }))}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors mb-3"
            />
            {config.anthropicKey && (
              <button
                onClick={() => handleValidate("anthropicKey", config.anthropicKey)}
                disabled={validating.anthropicKey}
                className="text-xs px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all disabled:opacity-50"
              >
                {validating.anthropicKey ? "Validando..." : "Validar"}
              </button>
            )}
          </div>

          {/* Twilio SID */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-medium mb-1">Twilio Account SID</h3>
                <p className="text-white/30 text-sm font-light">
                  Para llamadas telefónicas
                </p>
              </div>
              {validated.twilioSid && <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
              {validating.twilioSid && <Loader2 className="w-5 h-5 text-white/40 animate-spin flex-shrink-0" />}
            </div>
            <input
              type="password"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
              value={config.twilioSid}
              onChange={e => setConfig(prev => ({ ...prev, twilioSid: e.target.value }))}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors mb-3"
            />
            <button
              onClick={() => handleValidate("twilioSid", config.twilioSid)}
              disabled={validating.twilioSid}
              className="text-xs px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all disabled:opacity-50"
            >
              {validating.twilioSid ? "Validando..." : "Validar"}
            </button>
          </div>

          {/* Twilio Token */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-medium mb-1">Twilio Auth Token</h3>
                <p className="text-white/30 text-sm font-light">
                  Token de autenticación
                </p>
              </div>
              {validated.twilioToken && <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
              {validating.twilioToken && <Loader2 className="w-5 h-5 text-white/40 animate-spin flex-shrink-0" />}
            </div>
            <input
              type="password"
              placeholder="••••••••••••••••••••••••"
              value={config.twilioToken}
              onChange={e => setConfig(prev => ({ ...prev, twilioToken: e.target.value }))}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors mb-3"
            />
            <button
              onClick={() => handleValidate("twilioToken", config.twilioToken)}
              disabled={validating.twilioToken}
              className="text-xs px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all disabled:opacity-50"
            >
              {validating.twilioToken ? "Validando..." : "Validar"}
            </button>
          </div>

          {/* WhatsApp */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-medium mb-1">WhatsApp Business Account ID (Opcional)</h3>
                <p className="text-white/30 text-sm font-light">
                  Para integración con WhatsApp
                </p>
              </div>
              {validated.whatsappAccountId && <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
            </div>
            <input
              type="text"
              placeholder="1234567890"
              value={config.whatsappAccountId}
              onChange={e => setConfig(prev => ({ ...prev, whatsappAccountId: e.target.value }))}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* Railway Token */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-medium mb-1">Railway API Token</h3>
                <p className="text-white/30 text-sm font-light">
                  Para desplegar automáticamente
                </p>
              </div>
              {validated.railwayToken && <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
              {validating.railwayToken && <Loader2 className="w-5 h-5 text-white/40 animate-spin flex-shrink-0" />}
            </div>
            <input
              type="password"
              placeholder="••••••••••••••••••••••••"
              value={config.railwayToken}
              onChange={e => setConfig(prev => ({ ...prev, railwayToken: e.target.value }))}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors mb-3"
            />
            <button
              onClick={() => handleValidate("railwayToken", config.railwayToken)}
              disabled={validating.railwayToken}
              className="text-xs px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all disabled:opacity-50"
            >
              {validating.railwayToken ? "Validando..." : "Validar"}
            </button>
          </div>
        </div>

        {/* Deploy Button */}
        <button
          onClick={handleDeploy}
          disabled={deploying || !validated.openaiKey || !validated.twilioSid}
          className="w-full py-4 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {deploying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Desplegando...
            </>
          ) : (
            "Desplegar Ahora"
          )}
        </button>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200 font-light">
              <p className="font-medium mb-1">¿Dónde obtengo estas claves?</p>
              <ul className="space-y-1 text-blue-200/80">
                <li>• OpenAI: https://platform.openai.com/keys</li>
                <li>• Anthropic: https://console.anthropic.com</li>
                <li>• Twilio: https://www.twilio.com/console</li>
                <li>• Railway: https://railway.app/account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

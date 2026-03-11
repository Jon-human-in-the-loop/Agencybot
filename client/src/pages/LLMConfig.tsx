import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AgencyLayout from "@/components/AgencyLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Plus, Trash2, TestTube, CheckCircle, XCircle, Cpu, Key } from "lucide-react";
import { toast } from "sonner";

const providers = [
  { value: "openai", label: "OpenAI", icon: "🤖", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"], desc: "platform.openai.com" },
  { value: "anthropic", label: "Anthropic Claude", icon: "🧠", models: ["claude-opus-4-5", "claude-sonnet-4-5", "claude-haiku-3-5"], desc: "console.anthropic.com" },
  { value: "gemini", label: "Google Gemini", icon: "✨", models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"], desc: "aistudio.google.com" },
  { value: "groq", label: "Groq", icon: "⚡", models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"], desc: "console.groq.com (gratis)" },
  { value: "ollama", label: "Ollama (Local)", icon: "🏠", models: ["llama3.2", "mistral", "codellama", "phi3"], desc: "Sin API key" },
  { value: "openrouter", label: "OpenRouter", icon: "🔀", models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet"], desc: "openrouter.ai" },
  { value: "custom", label: "API Custom", icon: "⚙️", models: [], desc: "Compatible OpenAI" },
];

export default function LLMConfig() {
  const utils = trpc.useUtils();
  const { data: configs, isLoading } = trpc.llm.list.useQuery();
  const [open, setOpen] = useState(false);
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; message: string } | null>>({});

  const [form, setForm] = useState({
    name: "", provider: "openai", model: "gpt-4o-mini",
    apiKey: "", baseUrl: "", maxTokens: 2048, temperature: 0.7,
    isDefault: false, isActive: true,
  });

  const createMutation = trpc.llm.create.useMutation({
    onSuccess: () => {
      toast.success("Proveedor creado"); utils.llm.list.invalidate(); setOpen(false);
      setForm({ name: "", provider: "openai", model: "gpt-4o-mini", apiKey: "", baseUrl: "", maxTokens: 2048, temperature: 0.7, isDefault: false, isActive: true });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = trpc.llm.delete.useMutation({
    onSuccess: () => { toast.success("Eliminado"); utils.llm.list.invalidate(); },
  });

  const testMutation = trpc.llm.testConnection.useMutation({
    onSuccess: (result: any, variables: any) => {
      setTestResults(prev => ({ ...prev, [variables.id]: result }));
      if (result.success) toast.success("Conexión exitosa"); else toast.error(result.message);
    },
    onError: (e: any, variables: any) => {
      setTestResults(prev => ({ ...prev, [variables.id]: { success: false, message: e.message } }));
    },
  });

  const selectedProvider = providers.find(p => p.value === form.provider);

  return (
    <AgencyLayout title="Proveedores LLM" subtitle="Configura los modelos de IA para tus trabajadores virtuales.">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <span className="text-xs text-white/25 font-light">
          {configs?.length ?? 0} proveedor{(configs?.length ?? 0) !== 1 ? "es" : ""} configurado{(configs?.length ?? 0) !== 1 ? "s" : ""}
        </span>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90 transition-all">
          <Plus className="w-3.5 h-3.5" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-white/[0.02] animate-pulse" />)}
        </div>
      ) : configs && configs.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {configs.map((cfg, i) => {
            const prov = providers.find(p => p.value === cfg.provider);
            const testResult = testResults[cfg.id];
            return (
              <motion.div key={cfg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
              >
                <div className="glass-card rounded-2xl p-6 h-full">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="text-lg md:text-xl lg:text-2xl">{prov?.icon ?? "🤖"}</div>
                      <div>
                        <div className="text-sm text-white font-medium">{cfg.name}</div>
                        <div className="text-xs text-white/25 font-light">{prov?.label ?? cfg.provider}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {cfg.isDefault && (
                        <span className="text-[10px] text-white/40 px-2 py-0.5 rounded-full bg-white/5">Default</span>
                      )}
                      <div className={`w-1.5 h-1.5 rounded-full ${cfg.isActive ? "bg-emerald-500" : "bg-white/20"}`} />
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-5">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/25 flex items-center gap-1.5"><Cpu className="w-3 h-3" />Modelo</span>
                      <span className="text-white/50 font-mono text-[11px]">{cfg.model}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/25 flex items-center gap-1.5"><Key className="w-3 h-3" />API Key</span>
                      <span className="text-white/40">{cfg.apiKey ? "••••••••" : "No requerida"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/25">Temp</span>
                      <span className="text-white/40 font-mono">{cfg.temperature}</span>
                    </div>
                  </div>

                  {testResult && (
                    <div className={`flex items-center gap-2 text-xs mb-4 px-3 py-2 rounded-xl ${
                      testResult.success ? "bg-emerald-500/5 text-emerald-400" : "bg-red-500/5 text-red-400"}`}>
                      {testResult.success ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span className="font-light truncate">{testResult.message}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => testMutation.mutate({ id: cfg.id })} disabled={testMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full border border-white/[0.08] text-xs text-white/40 hover:text-white/60 hover:border-white/15 transition-all">
                      <TestTube className="w-3 h-3" />
                      Test
                    </button>
                    <button onClick={() => deleteMutation.mutate({ id: cfg.id })}
                      className="w-9 h-9 rounded-full flex items-center justify-center border border-white/[0.06] text-white/20 hover:text-red-400 hover:border-red-500/30 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32">
          <Cpu className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl lg:text-2xl font-serif text-white mb-3">Sin proveedores</h3>
          <p className="text-white/30 text-sm font-light mb-2">Agrega tu primer proveedor de IA para potenciar los bots.</p>
          <p className="text-white/15 text-xs font-light">OpenAI, Claude, Gemini, Groq, Ollama o cualquier API compatible.</p>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/[0.08] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-serif">Nuevo Proveedor LLM</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-white/30 font-light mb-1.5 block">Nombre</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: OpenAI GPT-4o"
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-white/30 font-light mb-1.5 block">Proveedor</label>
              <Select value={form.provider} onValueChange={v => setForm(f => ({ ...f, provider: v, model: providers.find(p => p.value === v)?.models[0] ?? "" }))}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-white/[0.08]">
                  {providers.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="flex items-center gap-2">{p.icon} {p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-white/20 mt-1.5 font-light">{selectedProvider?.desc}</p>
            </div>
            <div>
              <label className="text-xs text-white/30 font-light mb-1.5 block">Modelo</label>
              {selectedProvider && selectedProvider.models.length > 0 ? (
                <Select value={form.model} onValueChange={v => setForm(f => ({ ...f, model: v }))}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/[0.08]">
                    {selectedProvider.models.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  placeholder="nombre-del-modelo"
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
              )}
            </div>
            {form.provider !== "ollama" && (
              <div>
                <label className="text-xs text-white/30 font-light mb-1.5 block">API Key</label>
                <input type="password" value={form.apiKey} onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
              </div>
            )}
            {(form.provider === "ollama" || form.provider === "custom") && (
              <div>
                <label className="text-xs text-white/30 font-light mb-1.5 block">URL Base</label>
                <input value={form.baseUrl} onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))}
                  placeholder="http://localhost:11434"
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/30 font-light mb-1.5 block">Max Tokens</label>
                <input type="number" value={form.maxTokens} onChange={e => setForm(f => ({ ...f, maxTokens: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-white/20 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-white/30 font-light mb-1.5 block">Temperature</label>
                <input type="number" step="0.1" min="0" max="2" value={form.temperature}
                  onChange={e => setForm(f => ({ ...f, temperature: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-white/20 transition-colors" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/30 font-light">Usar como predeterminado</span>
              <Switch checked={form.isDefault} onCheckedChange={v => setForm(f => ({ ...f, isDefault: v }))} />
            </div>
            <button onClick={() => createMutation.mutate(form as any)}
              disabled={!form.name || !form.model || createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50">
              {createMutation.isPending ? "Guardando..." : "Guardar Proveedor"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AgencyLayout>
  );
}

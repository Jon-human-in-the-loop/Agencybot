import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import AgencyLayout from "@/components/AgencyLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Save, Play, Eye, Code, Cpu, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const departmentOptions = [
  { value: "creative", label: "Creatividad" }, { value: "strategy", label: "Estrategia" },
  { value: "content", label: "Contenido" }, { value: "social", label: "Redes Sociales" },
  { value: "analytics", label: "Analítica" }, { value: "seo", label: "SEO/SEM" },
  { value: "community", label: "Comunidad" }, { value: "accounts", label: "Cuentas" },
  { value: "design", label: "Diseño" }, { value: "management", label: "Gestión" },
];

const tabs = [
  { id: "identity", label: "Identidad", icon: Eye },
  { id: "prompt", label: "Prompt", icon: Code },
  { id: "llm", label: "LLM", icon: Cpu },
  { id: "messages", label: "Mensajes", icon: MessageSquare },
];

export default function BotEditor() {
  const params = useParams<{ id: string }>();
  const botId = parseInt(params.id ?? "0");
  const utils = trpc.useUtils();

  const { data: bot, isLoading } = trpc.bots.getById.useQuery({ id: botId }, { enabled: !!botId });
  const { data: llmConfigs } = trpc.llm.list.useQuery();

  const [activeTab, setActiveTab] = useState("identity");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState<string>("creative");
  const [avatar, setAvatar] = useState("🤖");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [llmConfigId, setLlmConfigId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [promptChanged, setPromptChanged] = useState(false);

  useEffect(() => {
    if (bot) {
      setName(bot.name); setRole(bot.role); setDepartment(bot.department);
      setAvatar(bot.avatar); setDescription(bot.description ?? "");
      setSystemPrompt(bot.systemPrompt); setWelcomeMessage(bot.welcomeMessage ?? "");
      setLlmConfigId(bot.llmConfigId?.toString() ?? ""); setIsActive(bot.isActive ?? true);
    }
  }, [bot]);

  const updateMutation = trpc.bots.update.useMutation({
    onSuccess: () => {
      toast.success("Guardado"); setPromptChanged(false);
      utils.bots.list.invalidate(); utils.bots.getById.invalidate({ id: botId });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: botId,
      data: {
        name, role, department: department as any, avatar, description,
        systemPrompt, welcomeMessage,
        llmConfigId: llmConfigId ? parseInt(llmConfigId) : undefined,
        isActive,
      },
    });
  };

  if (isLoading) {
    return (
      <AgencyLayout title="Cargando...">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/[0.02] animate-pulse" />)}
        </div>
      </AgencyLayout>
    );
  }

  if (!bot) {
    return (
      <AgencyLayout title="No encontrado">
        <div className="text-center py-32">
          <p className="text-white/30 font-light mb-6">El bot solicitado no existe</p>
          <Link href="/team">
            <button className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-medium">Volver al Equipo</button>
          </Link>
        </div>
      </AgencyLayout>
    );
  }

  return (
    <AgencyLayout title={bot.name} subtitle={bot.role}>
      {/* Top actions */}
      <div className="flex items-center gap-3 mb-10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-white/20"}`} />
          <span className="text-xs text-white/30 font-light">{isActive ? "Activo" : "Inactivo"}</span>
        </div>
        <div className="flex-1" />
        <Link href={`/simulator/${botId}`}>
          <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 text-white/50 text-xs font-light hover:border-white/20 hover:text-white/70 transition-all">
            <Play className="w-3.5 h-3.5" />
            Probar
          </button>
        </Link>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-2 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90 transition-all disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {updateMutation.isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-white/[0.06] pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-light transition-all border-b-2 -mb-px
              ${activeTab === tab.id
                ? "border-white text-white"
                : "border-transparent text-white/30 hover:text-white/50"}`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
        {promptChanged && (
          <span className="ml-auto text-[10px] text-amber-400/60 uppercase tracking-widest">Sin guardar</span>
        )}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "identity" && (
          <div className="grid lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
            <div className="glass-card rounded-2xl p-8">
              <span className="text-xs text-white/25 uppercase tracking-[0.15em] font-light block mb-6">Información</span>
              <div className="space-y-5">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xl md:text-lg md:text-xl lg:text-2xl lg:text-3xl">
                    {avatar}
                  </div>
                  <div>
                    <label className="text-xs text-white/30 font-light mb-1.5 block">Avatar</label>
                    <input value={avatar} onChange={e => setAvatar(e.target.value)}
                      className="w-20 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-center text-lg focus:outline-none focus:border-white/20 transition-colors" maxLength={4} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/30 font-light mb-1.5 block">Nombre</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-white/30 font-light mb-1.5 block">Cargo</label>
                  <input value={role} onChange={e => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-white/30 font-light mb-1.5 block">Departamento</label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/[0.08]">
                      {departmentOptions.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-white/30 font-light">Estado activo</span>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <span className="text-xs text-white/25 uppercase tracking-[0.15em] font-light block mb-6">Descripción</span>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe las responsabilidades y especialidades..."
                className="w-full min-h-[280px] px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/15 resize-none focus:outline-none focus:border-white/20 transition-colors leading-relaxed font-light"
              />
            </div>
          </div>
        )}

        {activeTab === "prompt" && (
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs text-white/25 uppercase tracking-[0.15em] font-light block mb-1">Prompt del Sistema</span>
                <p className="text-xs text-white/20 font-light">Define la personalidad, conocimientos y comportamiento del bot.</p>
              </div>
              <span className="text-xs text-white/15 font-mono">{systemPrompt.length} chars</span>
            </div>
            <div className="relative">
              <textarea
                value={systemPrompt}
                onChange={e => { setSystemPrompt(e.target.value); setPromptChanged(true); }}
                placeholder="Escribe el prompt del sistema..."
                className="w-full min-h-[500px] px-5 py-4 bg-black/40 border border-white/[0.06] rounded-xl text-sm text-white/70 placeholder:text-white/15 resize-y focus:outline-none focus:border-white/15 transition-colors leading-relaxed font-mono"
              />
            </div>
            <div className="mt-6 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-xs text-white/30 font-light block mb-3">Consejos para un buen prompt</span>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-white/20 font-light">
                <span>· Define nombre, rol y personalidad</span>
                <span>· Especifica áreas de expertise</span>
                <span>· Indica el tono de comunicación</span>
                <span>· Describe estructura de respuestas</span>
                <span>· Incluye ejemplos de situaciones</span>
                <span>· Define limitaciones claras</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "llm" && (
          <div className="glass-card rounded-2xl p-8 max-w-2xl">
            <span className="text-xs text-white/25 uppercase tracking-[0.15em] font-light block mb-6">Proveedor de IA</span>
            <p className="text-sm text-white/30 font-light mb-6">
              Selecciona qué modelo usará este especialista. Si no seleccionas uno, usará el modelo por defecto del sistema.
            </p>
            <Select value={llmConfigId} onValueChange={setLlmConfigId}>
              <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white rounded-xl">
                <SelectValue placeholder="Modelo por defecto" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-white/[0.08]">
                <SelectItem value="default">Modelo por defecto (built-in)</SelectItem>
                {llmConfigs?.map(cfg => (
                  <SelectItem key={cfg.id} value={cfg.id.toString()}>
                    <span className="flex items-center gap-2">
                      {cfg.name}
                      <span className="text-white/30 text-xs font-mono">{cfg.provider}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs text-white/25 font-light">
                Para agregar nuevos proveedores (OpenAI, Claude, Gemini, Groq, Ollama), ve a{" "}
                <Link href="/llm"><span className="text-white/50 hover:text-white/70 transition-colors underline underline-offset-2">Proveedores LLM</span></Link>.
              </p>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="glass-card rounded-2xl p-8 max-w-2xl">
            <span className="text-xs text-white/25 uppercase tracking-[0.15em] font-light block mb-6">Mensaje de Bienvenida</span>
            <p className="text-sm text-white/30 font-light mb-4">
              Este mensaje se envía automáticamente al inicio de cada conversación.
            </p>
            <textarea
              value={welcomeMessage}
              onChange={e => setWelcomeMessage(e.target.value)}
              placeholder="Mensaje de bienvenida..."
              className="w-full min-h-[160px] px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/70 placeholder:text-white/15 resize-none focus:outline-none focus:border-white/20 transition-colors leading-relaxed font-light"
              rows={5}
            />
          </div>
        )}
      </motion.div>
    </AgencyLayout>
  );
}

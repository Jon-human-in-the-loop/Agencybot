import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import AgencyLayout from "@/components/AgencyLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Plus, Trash2, GitBranch, ArrowRight, Zap } from "lucide-react";
import { toast } from "sonner";

const flowExamples = [
  {
    name: "Calificación de Lead",
    trigger: "quiero información",
    description: "Califica al prospecto antes de pasarlo a ventas",
    steps: [
      { id: 1, type: "message", content: "¿Cuál es tu nombre y empresa?" },
      { id: 2, type: "collect", field: "nombre_empresa" },
      { id: 3, type: "message", content: "¿Cuál es tu presupuesto aproximado?" },
      { id: 4, type: "branch", condition: "presupuesto > 1000", yes: "Pasar a ventas", no: "Enviar catálogo" },
    ],
  },
  {
    name: "Soporte Técnico",
    trigger: "problema, error, no funciona",
    description: "Diagnostica el problema antes de escalar",
    steps: [
      { id: 1, type: "message", content: "¿Puedes describir el problema que tienes?" },
      { id: 2, type: "collect", field: "descripcion_problema" },
      { id: 3, type: "message", content: "¿Cuándo comenzó el problema?" },
      { id: 4, type: "escalate", to: "Soporte Nivel 2" },
    ],
  },
  {
    name: "Cotización Rápida",
    trigger: "precio, cuánto cuesta, cotización",
    description: "Genera una cotización básica automática",
    steps: [
      { id: 1, type: "message", content: "¿Qué servicio te interesa?" },
      { id: 2, type: "collect", field: "servicio" },
      { id: 3, type: "message", content: "¿Para cuántas personas o unidades?" },
      { id: 4, type: "calculate", formula: "precio_base * cantidad" },
    ],
  },
];

export default function Flows() {
  const params = useParams<{ botId: string }>();
  const [selectedBotId, setSelectedBotId] = useState<number | undefined>(
    params.botId ? parseInt(params.botId) : undefined
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", trigger: "",
    steps: JSON.stringify([{ id: 1, type: "message", content: "Hola, ¿en qué puedo ayudarte?" }], null, 2),
    isActive: true, priority: 0,
  });

  const utils = trpc.useUtils();
  const { data: bots } = trpc.bots.list.useQuery();
  const { data: flows, isLoading } = trpc.flows.listByBot.useQuery(
    { botProfileId: selectedBotId! },
    { enabled: !!selectedBotId }
  );

  const createMutation = trpc.flows.create.useMutation({
    onSuccess: () => {
      toast.success("Flujo creado");
      utils.flows.listByBot.invalidate({ botProfileId: selectedBotId! });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = trpc.flows.delete.useMutation({
    onSuccess: () => {
      toast.success("Eliminado");
      utils.flows.listByBot.invalidate({ botProfileId: selectedBotId! });
    },
  });

  const updateMutation = trpc.flows.update.useMutation({
    onSuccess: () => {
      utils.flows.listByBot.invalidate({ botProfileId: selectedBotId! });
    },
  });

  const loadExample = (example: typeof flowExamples[0]) => {
    setForm(f => ({
      ...f,
      name: example.name,
      trigger: example.trigger,
      description: example.description,
      steps: JSON.stringify(example.steps, null, 2),
    }));
  };

  return (
    <AgencyLayout title="Flujos" subtitle="Define reglas de negocio y flujos automáticos para cada bot.">
      {/* Bot selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
        <Select value={selectedBotId?.toString() ?? ""} onValueChange={v => setSelectedBotId(parseInt(v))}>
          <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white rounded-xl w-64">
            <SelectValue placeholder="Seleccionar especialista..." />
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a0a] border-white/[0.08]">
            {bots?.map(bot => (
              <SelectItem key={bot.id} value={bot.id.toString()}>
                <span className="flex items-center gap-2">
                  <span>{bot.avatar}</span>
                  <span>{bot.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedBotId && (
          <button onClick={() => setOpen(true)}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90 transition-all">
            <Plus className="w-3.5 h-3.5" />
            Nuevo Flujo
          </button>
        )}
      </div>

      {!selectedBotId ? (
        <div className="text-center py-32">
          <GitBranch className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <h3 className="text-2xl font-serif text-white mb-3">Selecciona un especialista</h3>
          <p className="text-white/30 text-sm font-light">Elige un bot para gestionar sus flujos conversacionales</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/[0.02] animate-pulse" />)}
        </div>
      ) : flows && flows.length > 0 ? (
        <div className="space-y-3">
          {flows.map((flow, i) => (
            <motion.div key={flow.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <div className="glass-card rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <GitBranch className="w-4 h-4 text-white/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm text-white font-medium">{flow.name}</h3>
                    <div className={`w-1.5 h-1.5 rounded-full ${flow.isActive ? "bg-emerald-500" : "bg-white/20"}`} />
                    <span className="text-[10px] text-white/15 font-mono">P:{flow.priority}</span>
                  </div>
                  {flow.description && (
                    <p className="text-xs text-white/25 font-light mb-2">{flow.description}</p>
                  )}
                  {flow.trigger && (
                    <div className="flex items-center gap-1.5 text-xs text-white/20 mb-2">
                      <Zap className="w-3 h-3 text-white/30" />
                      <span className="font-mono text-white/30">{flow.trigger}</span>
                    </div>
                  )}
                  {Array.isArray(flow.steps) ? (
                    <div className="flex items-center gap-1 flex-wrap">
                      {(flow.steps as Record<string, unknown>[]).map((step, si) => (
                        <div key={si} className="flex items-center gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/30 font-light">
                            {String(step["type"] ?? "")}
                          </span>
                          {si < (flow.steps as unknown[]).length - 1 && <ArrowRight className="w-2.5 h-2.5 text-white/10" />}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch checked={flow.isActive ?? true}
                    onCheckedChange={v => updateMutation.mutate({ id: flow.id, data: { isActive: v } })} />
                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    onClick={() => deleteMutation.mutate({ id: flow.id })}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <GitBranch className="w-8 h-8 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg font-serif text-white mb-2">Sin flujos</h3>
          <p className="text-white/30 text-sm font-light mb-6">Crea flujos para automatizar conversaciones</p>
          <button onClick={() => setOpen(true)}
            className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90 transition-all">
            Primer Flujo
          </button>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/[0.08] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-serif">Nuevo Flujo Conversacional</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Examples */}
            <div>
              <span className="text-xs text-white/25 font-light block mb-2">Cargar ejemplo:</span>
              <div className="flex flex-wrap gap-2">
                {flowExamples.map(ex => (
                  <button key={ex.name} onClick={() => loadExample(ex)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all">
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-white/[0.06] pt-4 space-y-3">
              <div>
                <label className="text-xs text-white/30 font-light mb-1.5 block">Nombre</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Calificación de Lead"
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-white/30 font-light mb-1.5 block">Descripción</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="¿Qué hace este flujo?"
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-white/30 font-light mb-1.5 block">Trigger</label>
                <input value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
                  placeholder="Ej: precio, cotización, información"
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-white/30 font-light mb-1.5 block">Pasos del Flujo (JSON)</label>
                <textarea value={form.steps}
                  onChange={e => setForm(f => ({ ...f, steps: e.target.value }))}
                  className="w-full min-h-[180px] px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white/70 font-mono resize-none focus:outline-none focus:border-white/20 transition-colors leading-relaxed" />
                <p className="text-[10px] text-white/15 mt-1.5 font-light">
                  Tipos: message, collect, branch, escalate, calculate.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30 font-light">Prioridad</span>
                <input type="number" value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) }))}
                  className="w-20 px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white text-center font-mono focus:outline-none focus:border-white/20 transition-colors" />
              </div>
            </div>
            <button onClick={() => {
              let steps;
              try { steps = JSON.parse(form.steps); } catch { toast.error("JSON inválido"); return; }
              createMutation.mutate({ botProfileId: selectedBotId!, name: form.name, description: form.description, trigger: form.trigger, steps, isActive: form.isActive, priority: form.priority });
            }} disabled={!form.name || createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50">
              {createMutation.isPending ? "Guardando..." : "Crear Flujo"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AgencyLayout>
  );
}

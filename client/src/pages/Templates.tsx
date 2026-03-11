import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import AgencyLayout from "@/components/AgencyLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Plus, Trash2, FileText, Copy } from "lucide-react";
import { toast } from "sonner";

const categories = ["general", "saludo", "despedida", "precios", "soporte", "ventas", "faq", "escalacion"];

export default function Templates() {
  const params = useParams<{ botId: string }>();
  const [selectedBotId, setSelectedBotId] = useState<number | undefined>(
    params.botId ? parseInt(params.botId) : undefined
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", trigger: "", content: "", category: "general", isActive: true });

  const utils = trpc.useUtils();
  const { data: bots } = trpc.bots.list.useQuery();
  const { data: templates, isLoading } = trpc.templates.listByBot.useQuery(
    { botProfileId: selectedBotId! },
    { enabled: !!selectedBotId }
  );

  const createMutation = trpc.templates.create.useMutation({
    onSuccess: () => {
      toast.success("Plantilla creada");
      utils.templates.listByBot.invalidate({ botProfileId: selectedBotId! });
      setOpen(false);
      setForm({ title: "", trigger: "", content: "", category: "general", isActive: true });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = trpc.templates.delete.useMutation({
    onSuccess: () => {
      toast.success("Eliminada");
      utils.templates.listByBot.invalidate({ botProfileId: selectedBotId! });
    },
  });

  return (
    <AgencyLayout title="Plantillas" subtitle="Respuestas predefinidas para situaciones frecuentes.">
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
            Nueva Plantilla
          </button>
        )}
      </div>

      {!selectedBotId ? (
        <div className="text-center py-32">
          <FileText className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <h3 className="text-2xl font-serif text-white mb-3">Selecciona un especialista</h3>
          <p className="text-white/30 text-sm font-light">Elige un bot para ver y gestionar sus plantillas</p>
        </div>
      ) : isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-white/[0.02] animate-pulse" />)}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tmpl, i) => (
            <motion.div key={tmpl.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <div className="glass-card rounded-2xl p-6 h-full group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm text-white font-medium truncate">{tmpl.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-white/20 uppercase tracking-[0.15em] font-light">{tmpl.category ?? "general"}</span>
                      {tmpl.trigger && (
                        <span className="text-[10px] text-white/15 font-mono">#{tmpl.trigger}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-full hover:bg-white/5 text-white/20 hover:text-white/50 transition-all"
                      onClick={() => { navigator.clipboard.writeText(tmpl.content); toast.success("Copiado"); }}>
                      <Copy className="w-3 h-3" />
                    </button>
                    <button className="p-1.5 rounded-full hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"
                      onClick={() => deleteMutation.mutate({ id: tmpl.id })}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-white/25 font-light line-clamp-4 leading-relaxed">{tmpl.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <FileText className="w-8 h-8 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg font-serif text-white mb-2">Sin plantillas</h3>
          <p className="text-white/30 text-sm font-light mb-6">Crea plantillas para respuestas frecuentes</p>
          <button onClick={() => setOpen(true)}
            className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90 transition-all">
            Primera Plantilla
          </button>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/[0.08] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-serif">Nueva Plantilla</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-white/30 font-light mb-1.5 block">Título</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ej: Saludo inicial"
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-white/30 font-light mb-1.5 block">Categoría</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-white/[0.08]">
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-white/30 font-light mb-1.5 block">Trigger</label>
              <input value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
                placeholder="Ej: precio, hola, ayuda"
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-white/30 font-light mb-1.5 block">Contenido</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Escribe la respuesta..."
                className="w-full min-h-[120px] px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/15 resize-none focus:outline-none focus:border-white/20 transition-colors leading-relaxed font-light" />
              <p className="text-[10px] text-white/15 mt-1.5 font-light">
                Usa {"{{nombre}}"}, {"{{empresa}}"} para variables dinámicas.
              </p>
            </div>
            <button onClick={() => createMutation.mutate({ botProfileId: selectedBotId!, ...form })}
              disabled={!form.title || !form.content || createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50">
              {createMutation.isPending ? "Guardando..." : "Crear Plantilla"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AgencyLayout>
  );
}

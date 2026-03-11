import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AgencyLayout from "@/components/AgencyLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Plug, Search, Zap, ExternalLink, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CAT_LABELS: Record<string, string> = {
  crm: "CRM", marketing: "Marketing", calendar: "Calendario", payments: "Pagos",
  social: "Redes Sociales", notifications: "Notificaciones", productivity: "Productividad",
  analytics: "Analytics", ecommerce: "E-Commerce", other: "Automatización",
};

export default function Integrations() {
  const { data: catalog = [] } = trpc.integrations.catalog.useQuery();
  const { data: connected = [], refetch } = trpc.integrations.list.useQuery();
  const seedMutation = trpc.integrations.seedIntegrations.useMutation({
    onSuccess: () => { toast.success("Catálogo cargado"); refetch(); },
  });
  const connectMutation = trpc.integrations.connect.useMutation({
    onSuccess: () => { toast.success("Integración conectada"); refetch(); setModal(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMutation = trpc.integrations.delete.useMutation({
    onSuccess: () => { toast.success("Eliminada"); refetch(); },
  });
  const testMutation = trpc.integrations.test.useMutation({
    onSuccess: (r: any) => toast.success(r.message),
    onError: (e: any) => toast.error(e.message),
  });

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [tab, setTab] = useState<"catalog" | "connected">("catalog");
  const [modal, setModal] = useState<any>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const connectedSlugs = new Set(connected.map((c: any) => c.slug));
  const categories = ["all", ...Array.from(new Set(catalog.map((c: any) => c.category)))];

  const filtered = catalog.filter((item: any) => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === "all" || item.category === activeCat;
    return matchSearch && matchCat;
  });

  const handleConnect = () => {
    if (!modal) return;
    connectMutation.mutate({ slug: modal.slug, name: modal.name, category: modal.category, provider: modal.provider, credentials });
  };

  const isEmpty = catalog.length === 0 && connected.length === 0;

  return (
    <AgencyLayout title="Integraciones" subtitle="Conecta tus herramientas favoritas para potenciar los agentes.">
      {isEmpty ? (
        <div className="text-center py-32">
          <Plug className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl lg:text-2xl font-serif text-white mb-3">Sin integraciones</h3>
          <p className="text-white/30 text-sm font-light mb-8">Carga el catálogo de integraciones disponibles</p>
          <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}
            className="bg-white text-black hover:bg-white/90 rounded-full px-4 md:px-6 lg:px-8 py-3">
            <Zap className="w-4 h-4 mr-2" />
            {seedMutation.isPending ? "Cargando..." : "Cargar Catálogo"}
          </Button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-3 md:gap-4 lg:gap-6 mb-8 border-b border-white/[0.06] pb-px">
            {[
              { id: "catalog" as const, label: `Catálogo (${catalog.length})` },
              { id: "connected" as const, label: `Conectadas (${connected.length})` },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`pb-3 text-xs font-light transition-all border-b-2 -mb-px ${
                  tab === t.id ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/50"}`}>
                {t.label}
              </button>
            ))}
            {catalog.length === 0 && (
              <button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}
                className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-white/40 text-xs hover:bg-white/10 transition-all">
                <Zap className="w-3 h-3" /> Cargar Catálogo
              </button>
            )}
          </div>

          {tab === "catalog" && (
            <>
              {/* Search + Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-full text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors" />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {categories.map(cat => (
                    <button key={cat as string} onClick={() => setActiveCat(cat as string)}
                      className={`px-3 py-1.5 rounded-full text-xs font-light transition-all ${
                        activeCat === cat ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"}`}>
                      {cat === "all" ? "Todas" : CAT_LABELS[cat as string] ?? cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((item: any, i: number) => {
                  const isConn = connectedSlugs.has(item.slug);
                  return (
                    <motion.div key={item.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}>
                      <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <div className="text-lg md:text-xl lg:text-2xl">{item.icon}</div>
                          {isConn && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-[10px] text-emerald-400">Conectado</span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-serif text-white mb-1">{item.name}</h3>
                        <span className="text-[10px] text-white/20 uppercase tracking-[0.15em] font-light mb-2">
                          {CAT_LABELS[item.category] ?? item.category}
                        </span>
                        <p className="text-xs text-white/25 font-light line-clamp-2 leading-relaxed mb-4">{item.description}</p>
                        {item.isFree && (
                          <span className="text-[10px] text-emerald-400/60 mb-3">Plan gratuito disponible</span>
                        )}
                        <div className="flex-1" />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => { setModal(item); setCredentials({}); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-light transition-all ${
                              isConn
                                ? "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08]"
                                : "bg-white/[0.06] text-white/60 border border-white/[0.08] hover:bg-white/[0.10] hover:text-white"}`}>
                            <Plug className="w-3 h-3" />
                            {isConn ? "Reconfigurar" : "Conectar"}
                          </button>
                          {item.docsUrl && (
                            <a href={item.docsUrl} target="_blank" rel="noopener noreferrer"
                              className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/50 transition-all">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {tab === "connected" && (
            <div className="space-y-3">
              {connected.length === 0 ? (
                <div className="text-center py-20">
                  <Plug className="w-8 h-8 text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/25 font-light">No hay integraciones conectadas aún</p>
                </div>
              ) : (
                connected.map((integration: any) => (
                  <div key={integration.id} className="glass-card rounded-2xl p-5 flex items-center gap-4">
                    <div className="text-xl">{integration.icon ?? "🔌"}</div>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{integration.name}</div>
                      <div className="text-xs text-white/25 font-light">{integration.provider} · {CAT_LABELS[integration.category] ?? integration.category}</div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-emerald-400">Activa</span>
                    </div>
                    <button onClick={() => testMutation.mutate({ id: integration.id })} disabled={testMutation.isPending}
                      className="px-4 py-1.5 rounded-full border border-white/[0.08] text-xs text-white/40 hover:text-white/60 transition-all">
                      Test
                    </button>
                    <button onClick={() => deleteMutation.mutate({ id: integration.id })}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Connect Dialog */}
          <Dialog open={!!modal} onOpenChange={(open) => { if (!open) setModal(null); }}>
            <DialogContent className="bg-[#0a0a0a] border-white/[0.08] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white font-serif flex items-center gap-3">
                  <span className="text-lg md:text-xl lg:text-2xl">{modal?.icon}</span>
                  {modal?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-xs text-white/30 font-light">{modal?.description}</p>
                {modal?.requiredCredentials && (
                  <div className="space-y-3">
                    <span className="text-xs text-white/25 uppercase tracking-[0.15em] font-light">Credenciales</span>
                    {(Array.isArray(modal.requiredCredentials)
                      ? modal.requiredCredentials as string[]
                      : Object.keys(modal.requiredCredentials as Record<string, unknown>)
                    ).map((key: string) => (
                      <div key={key}>
                        <label className="text-xs text-white/30 font-light mb-1.5 block font-mono">{key}</label>
                        <input type="password" value={credentials[key] ?? ""}
                          onChange={e => setCredentials(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-white/20 transition-colors"
                          placeholder={`Ingresa ${key}`} />
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={handleConnect} disabled={connectMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50">
                  <ExternalLink className="w-4 h-4" />
                  {connectMutation.isPending ? "Conectando..." : "Conectar"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </AgencyLayout>
  );
}

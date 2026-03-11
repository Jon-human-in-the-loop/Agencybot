import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import AgencyLayout from "@/components/AgencyLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Settings, MessageSquare, Search, Zap, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

const departmentLabels: Record<string, string> = {
  creative: "Creatividad", strategy: "Estrategia", content: "Contenido",
  social: "Redes Sociales", analytics: "Analítica", seo: "SEO/SEM",
  community: "Comunidad", accounts: "Cuentas", design: "Diseño", management: "Gestión",
};

export default function Team() {
  const [search, setSearch] = useState("");
  const utils = trpc.useUtils();
  const { data: bots, isLoading } = trpc.bots.list.useQuery();

  const toggleMutation = trpc.bots.toggleActive.useMutation({
    onSuccess: () => utils.bots.list.invalidate(),
    onError: (e: any) => toast.error(e.message),
  });
  const seedMutation = trpc.seed.initialize.useMutation({
    onSuccess: () => { toast.success("Equipo inicializado"); utils.bots.list.invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = bots?.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.role.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <AgencyLayout title="Equipo Virtual" subtitle="10 especialistas de IA con personalidad propia, listos para atender a tus clientes.">
      {/* Search + Seed */}
      <div className="flex items-center gap-4 mb-12">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            placeholder="Buscar especialista..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-full text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors duration-300"
          />
        </div>
        {(!bots || bots.length === 0) && (
          <Button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="bg-white text-black hover:bg-white/90 rounded-full px-6 py-3 text-sm font-medium"
          >
            <Zap className="w-4 h-4 mr-2" />
            {seedMutation.isPending ? "Inicializando..." : "Inicializar Equipo"}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          className="text-center py-32"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <h3 className="text-lg md:text-xl lg:text-2xl font-serif text-white mb-3">Sin especialistas</h3>
          <p className="text-white/30 text-sm font-light mb-8">Inicializa el equipo para comenzar</p>
          <Button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="bg-white text-black hover:bg-white/90 rounded-full px-4 md:px-6 lg:px-8 py-3"
          >
            <Zap className="w-4 h-4 mr-2" />
            Inicializar Equipo
          </Button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((bot, i) => {
            const deptLabel = departmentLabels[bot.department] ?? bot.department;

            return (
              <motion.div
                key={bot.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
                className="group"
              >
                <div className="glass-card rounded-2xl p-8 h-full flex flex-col relative overflow-hidden">
                  {/* Top row: avatar + toggle */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-lg md:text-xl lg:text-2xl md:text-xl md:text-lg md:text-xl lg:text-2xl lg:text-3xl lg:text-4xl">{bot.avatar}</div>
                    <Switch
                      checked={bot.isActive ?? false}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: bot.id, isActive: v })}
                      className="data-[state=checked]:bg-white/80"
                    />
                  </div>

                  {/* Info */}
                  <h3 className="text-xl font-serif text-white mb-1">{bot.name}</h3>
                  <p className="text-sm text-white/40 font-light mb-2">{bot.role}</p>

                  <span className="inline-block text-xs text-white/25 uppercase tracking-[0.15em] font-light mb-4">
                    {deptLabel}
                  </span>

                  {bot.description && (
                    <p className="text-xs text-white/30 font-light line-clamp-2 mb-6 leading-relaxed">{bot.description}</p>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <Link href={`/bot/${bot.id}`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white/[0.04] text-white/50 text-xs font-light hover:bg-white/[0.08] hover:text-white transition-all duration-300">
                        <Settings className="w-3.5 h-3.5" />
                        Configurar
                      </button>
                    </Link>
                    <Link href={`/simulator/${bot.id}`}>
                      <button className="flex items-center gap-2 py-2.5 px-5 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90 transition-all duration-300">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Probar
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AgencyLayout>
  );
}

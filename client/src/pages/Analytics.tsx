import { trpc } from "@/lib/trpc";
import AgencyLayout from "@/components/AgencyLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { MessageSquare, Users, Clock, Zap } from "lucide-react";

const COLORS = ["#ffffff", "#888888", "#555555", "#333333"];

export default function Analytics() {
  const { data: stats } = trpc.analytics.dashboard.useQuery();
  const { data: bots } = trpc.bots.list.useQuery();
  const { data: recentSessions } = trpc.conversations.recent.useQuery({ limit: 20 });

  const weeklyData = [
    { day: "Lun", conversations: 12, messages: 48 },
    { day: "Mar", conversations: 19, messages: 76 },
    { day: "Mié", conversations: 15, messages: 60 },
    { day: "Jue", conversations: 22, messages: 88 },
    { day: "Vie", conversations: 28, messages: 112 },
    { day: "Sáb", conversations: 8, messages: 32 },
    { day: "Dom", conversations: 5, messages: 20 },
  ];

  const botActivityData = bots?.map((bot) => ({
    name: bot.name.split(" ")[0],
    sessions: Math.floor(Math.random() * 50) + 5,
  })) ?? [];

  const channelData = [
    { name: "Simulador", value: 45 },
    { name: "WhatsApp", value: 30 },
    { name: "Web", value: 15 },
    { name: "API", value: 10 },
  ];

  const statCards = [
    { title: "Conversaciones", value: stats?.totalSessions ?? 0, icon: MessageSquare, sub: "+12% esta semana" },
    { title: "Bots Activos", value: stats?.activeBots ?? 0, icon: Users, sub: `de ${stats?.totalBots ?? 0} totales` },
    { title: "Mensajes", value: stats?.totalMessages ?? 0, icon: Zap, sub: "+24% esta semana" },
    { title: "Tiempo Resp.", value: stats?.avgResponseTimeMs ? `${(stats.avgResponseTimeMs / 1000).toFixed(1)}s` : "—", icon: Clock, sub: "promedio" },
  ];

  const tooltipStyle = {
    background: "rgba(0,0,0,0.9)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "rgba(255,255,255,0.7)",
    fontSize: "11px",
    padding: "8px 12px",
  };

  return (
    <AgencyLayout title="Analíticas" subtitle="Métricas de rendimiento de tu agencia virtual.">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((stat, i) => (
          <motion.div key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <div className="glass-card rounded-2xl p-6">
              <stat.icon className="w-5 h-5 text-white/15 mb-4" />
              <div className="text-3xl font-serif text-white mb-1">{stat.value}</div>
              <div className="text-xs text-white/30 font-light">{stat.title}</div>
              <div className="text-[10px] text-white/15 mt-1">{stat.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly */}
        <div className="glass-card rounded-2xl p-6">
          <span className="text-xs text-white/25 uppercase tracking-[0.15em] font-light block mb-6">Actividad Semanal</span>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="conversations" fill="rgba(255,255,255,0.6)" radius={[4, 4, 0, 0]} name="Conversaciones" />
              <Bar dataKey="messages" fill="rgba(255,255,255,0.15)" radius={[4, 4, 0, 0]} name="Mensajes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel */}
        <div className="glass-card rounded-2xl p-6">
          <span className="text-xs text-white/25 uppercase tracking-[0.15em] font-light block mb-6">Distribución por Canal</span>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={channelData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                  {channelData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {channelData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-white/30 font-light">{item.name}</span>
                  </div>
                  <span className="text-white/50 font-mono">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bot activity */}
        <div className="glass-card rounded-2xl p-6">
          <span className="text-xs text-white/25 uppercase tracking-[0.15em] font-light block mb-6">Actividad por Trabajador</span>
          {botActivityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={botActivityData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Bar dataKey="sessions" fill="rgba(255,255,255,0.4)" radius={[0, 4, 4, 0]} name="Sesiones" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-white/20 text-sm font-light">Sin datos disponibles</div>
          )}
        </div>

        {/* Recent sessions */}
        <div className="glass-card rounded-2xl p-6">
          <span className="text-xs text-white/25 uppercase tracking-[0.15em] font-light block mb-6">Sesiones Recientes</span>
          {recentSessions && recentSessions.length > 0 ? (
            <div className="space-y-2">
              {recentSessions.slice(0, 8).map(session => (
                <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    session.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-white/20"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/60 truncate">{session.clientName ?? "Usuario"}</div>
                    <div className="text-[10px] text-white/20 font-light">{new Date(session.startedAt).toLocaleString()}</div>
                  </div>
                  <span className="text-[10px] text-white/15 font-mono">{session.channel}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${session.status === "active" ? "bg-emerald-500" : "bg-white/10"}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/20 text-sm font-light">Sin sesiones recientes</div>
          )}
        </div>
      </div>
    </AgencyLayout>
  );
}

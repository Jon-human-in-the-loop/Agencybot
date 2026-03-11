import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Zap, MessageSquare, Phone, Plug, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: stats } = trpc.analytics.dashboard.useQuery(undefined, { retry: false });
  const seedMutation = trpc.seed.initialize.useMutation();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* ─── Top Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-8 py-6">
          <Link href="/">
            <span className="text-white text-lg font-serif font-semibold tracking-tight">
              AgencyBot
            </span>
          </Link>
          <div className="flex items-center gap-8">
            {[
              { href: "/team", label: "Equipo" },
              { href: "/simulator", label: "Simulador" },
              { href: "/voice", label: "Voz" },
              { href: "/integrations", label: "Integraciones" },
              { href: "/analytics", label: "Datos" },
            ].map(link => (
              <Link key={link.href} href={link.href}>
                <span className="text-white/70 text-sm font-light tracking-wide hover:text-white transition-colors duration-500">
                  {link.label}
                </span>
              </Link>
            ))}
            {isAuthenticated ? (
              <Link href="/team">
                <span className="text-white text-sm font-medium border-b border-white/30 pb-0.5 hover:border-white transition-colors duration-500">
                  Panel
                </span>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <span className="text-white text-sm font-medium border-b border-white/30 pb-0.5 hover:border-white transition-colors duration-500">
                  Acceder
                </span>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero Section: Full Viewport ─── */}
      <section className="relative h-screen flex flex-col justify-end overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{
              background: "radial-gradient(circle, oklch(0.75 0.15 155) 0%, transparent 70%)",
              transform: `translate(${scrollY * 0.05}px, ${scrollY * -0.03}px)`,
            }} />
          <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] rounded-full opacity-[0.03]"
            style={{
              background: "radial-gradient(circle, oklch(0.70 0.12 200) 0%, transparent 70%)",
              transform: `translate(${scrollY * -0.04}px, ${scrollY * 0.02}px)`,
            }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.06]"
            style={{
              background: "radial-gradient(circle, oklch(0.65 0.12 280) 0%, transparent 70%)",
              transform: `translate(${scrollY * 0.02}px, ${scrollY * -0.05}px) translate(-50%, -50%)`,
            }} />
        </div>

        <motion.div
          className="relative z-10 px-8 pb-24 max-w-[1200px]"
          initial="hidden" animate="visible" variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0} className="mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-white/40">
              <span className="w-8 h-px bg-white/30" />
              Agencia de Marketing Virtual
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1}
            className="text-[clamp(3rem,8vw,7rem)] leading-[0.9] font-serif font-medium text-white tracking-tight mb-8">
            Cada conversación,<br />
            <span className="italic text-white/60">una oportunidad.</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-white/40 max-w-[600px] leading-relaxed font-light mb-12">
            10 especialistas de IA listos para transformar la atención al cliente de tu empresa.
            Cada bot tiene personalidad, expertise y prompts optimizados para su rol.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex items-center gap-6">
            <Link href="/team">
              <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-sm font-medium tracking-wide transition-all duration-500 hover:scale-105">
                Explorar Equipo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/simulator">
              <Button variant="outline" className="border-white/20 text-white/70 hover:text-white hover:border-white/40 rounded-full px-8 py-6 text-sm font-light tracking-wide bg-transparent transition-all duration-500">
                Probar un Bot
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-white/20" />
        </motion.div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="relative py-32 px-8">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {[
              { value: stats?.totalBots ?? 10, label: "Especialistas IA", suffix: "" },
              { value: stats?.totalSessions ?? 0, label: "Conversaciones", suffix: "+" },
              { value: stats?.totalMessages ?? 0, label: "Mensajes", suffix: "+" },
              { value: "4.8", label: "Satisfacción", suffix: "/5" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="bg-white/[0.02] p-8 md:p-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="text-3xl md:text-5xl font-serif font-medium text-white mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/30 font-light">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Services Grid (Asymmetric like Tendril) ─── */}
      <section className="relative py-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-6 block">
              Servicios
            </span>
            <h2 className="text-4xl md:text-6xl font-serif text-white leading-[1.1]">
              Todo lo que necesita<br />
              <span className="text-white/40 italic">tu empresa.</span>
            </h2>
          </motion.div>

          {/* Asymmetric grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Large card */}
            <motion.div
              className="md:col-span-7 group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Link href="/team">
                <div className="glass-card rounded-2xl p-10 md:p-14 h-full min-h-[400px] flex flex-col justify-between relative overflow-hidden glow-hover">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-8">
                      <MessageSquare className="w-5 h-5 text-white/60" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-serif text-white mb-4">
                      Bots de WhatsApp
                    </h3>
                    <p className="text-white/40 text-base leading-relaxed max-w-md font-light">
                      10 especialistas virtuales con personalidad propia. Director Creativo, Estratega,
                      Copywriter, SEO, Community Manager y más. Cada uno con prompts profesionales
                      editables en tiempo real.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors duration-500 mt-8">
                    <span className="text-sm font-light">Explorar</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Small card */}
            <motion.div
              className="md:col-span-5 group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <Link href="/voice">
                <div className="glass-card rounded-2xl p-10 md:p-14 h-full min-h-[400px] flex flex-col justify-between relative overflow-hidden glow-hover">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-8">
                      <Phone className="w-5 h-5 text-white/60" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif text-white mb-4">
                      Agentes de Voz
                    </h3>
                    <p className="text-white/40 text-base leading-relaxed font-light">
                      6 agentes telefónicos con síntesis de voz y transcripción en tiempo real.
                      Recepción, ventas, soporte, cobranza, encuestas y reservas.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors duration-500 mt-8">
                    <span className="text-sm font-light">Explorar</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Bottom row - reversed asymmetry */}
            <motion.div
              className="md:col-span-5 group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Link href="/integrations">
                <div className="glass-card rounded-2xl p-10 md:p-14 h-full min-h-[350px] flex flex-col justify-between relative overflow-hidden glow-hover">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-8">
                      <Plug className="w-5 h-5 text-white/60" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif text-white mb-4">
                      12+ Integraciones
                    </h3>
                    <p className="text-white/40 text-base leading-relaxed font-light">
                      HubSpot, Mailchimp, Stripe, Slack, Notion, Google Calendar,
                      Instagram, n8n, Make y más.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors duration-500 mt-8">
                    <span className="text-sm font-light">Conectar</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              className="md:col-span-7 group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Link href="/llm">
                <div className="glass-card rounded-2xl p-10 md:p-14 h-full min-h-[350px] flex flex-col justify-between relative overflow-hidden glow-hover">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-8">
                      <Zap className="w-5 h-5 text-white/60" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-serif text-white mb-4">
                      Multi-LLM
                    </h3>
                    <p className="text-white/40 text-base leading-relaxed max-w-md font-light">
                      Conecta OpenAI, Anthropic Claude, Google Gemini, Groq, Ollama o cualquier
                      proveedor compatible. Cambia de modelo sin tocar la lógica de negocio.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors duration-500 mt-8">
                    <span className="text-sm font-light">Configurar</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Manifesto Section ─── */}
      <section className="relative py-40 px-8">
        <div className="max-w-[900px] mx-auto text-center">
          <motion.p
            className="text-3xl md:text-5xl font-serif text-white leading-[1.3] font-medium"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            La mayoría de empresas pierden clientes por no responder a tiempo.{" "}
            <span className="text-white/30 italic">
              Nosotros hacemos que eso sea imposible.
            </span>
          </motion.p>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative py-32 px-8">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="glass-card rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ background: "radial-gradient(circle at 50% 50%, oklch(0.75 0.15 155) 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">
                Empieza ahora
              </h2>
              <p className="text-white/40 text-lg mb-10 max-w-md mx-auto font-light">
                Inicializa tu equipo virtual y comienza a probar los bots en minutos.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button
                  onClick={() => seedMutation.mutate()}
                  disabled={seedMutation.isPending}
                  className="bg-white text-black hover:bg-white/90 rounded-full px-10 py-6 text-sm font-medium tracking-wide transition-all duration-500 hover:scale-105"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {seedMutation.isPending ? "Inicializando..." : "Inicializar Equipo"}
                </Button>
                <Link href="/simulator">
                  <Button variant="outline" className="border-white/20 text-white/70 hover:text-white hover:border-white/40 rounded-full px-10 py-6 text-sm font-light bg-transparent transition-all duration-500">
                    Probar Simulador
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 px-8 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <span className="text-white/20 text-xs font-mono tracking-wider">
            AgencyBot © {new Date().getFullYear()}
          </span>
          <div className="flex items-center gap-6">
            {[
              { href: "/team", label: "Equipo" },
              { href: "/llm", label: "LLM" },
              { href: "/integrations", label: "Integraciones" },
            ].map(link => (
              <Link key={link.href} href={link.href}>
                <span className="text-white/20 text-xs hover:text-white/50 transition-colors duration-500">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

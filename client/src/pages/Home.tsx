import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Zap, MessageSquare, Phone, Plug, ChevronDown, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/team", label: "Equipo" },
    { href: "/simulator", label: "Simulador" },
    { href: "/voice", label: "Voz" },
    { href: "/integrations", label: "Integraciones" },
    { href: "/analytics", label: "Datos" },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* ─── Top Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6">
          <Link href="/">
            <span className="text-white text-base md:text-lg font-serif font-semibold tracking-tight">
              AgencyBot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-black/95 backdrop-blur border-t border-white/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col gap-4 px-4 py-4">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  <span
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white/70 text-sm font-light tracking-wide hover:text-white transition-colors duration-500 block py-2"
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
              {isAuthenticated ? (
                <Link href="/team">
                  <span
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white text-sm font-medium border-b border-white/30 pb-0.5 hover:border-white transition-colors duration-500 block py-2"
                  >
                    Panel
                  </span>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <span className="text-white text-sm font-medium border-b border-white/30 pb-0.5 hover:border-white transition-colors duration-500 block py-2">
                    Acceder
                  </span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* ─── Hero Section: Full Viewport ─── */}
      <section className="relative min-h-screen md:h-screen flex flex-col justify-end overflow-hidden pt-20 md:pt-0">
        {/* Animated background orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full opacity-[0.04]"
            style={{
              background: "radial-gradient(circle, oklch(0.75 0.15 155) 0%, transparent 70%)",
              transform: `translate(${scrollY * 0.05}px, ${scrollY * -0.03}px)`,
            }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] md:w-[800px] h-[400px] md:h-[800px] rounded-full opacity-[0.03]"
            style={{
              background: "radial-gradient(circle, oklch(0.70 0.12 200) 0%, transparent 70%)",
              transform: `translate(${scrollY * -0.04}px, ${scrollY * 0.02}px)`,
            }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full opacity-[0.06]"
            style={{
              background: "radial-gradient(circle, oklch(0.65 0.12 280) 0%, transparent 70%)",
              transform: `translate(${scrollY * 0.02}px, ${scrollY * -0.05}px) translate(-50%, -50%)`,
            }} />
        </div>

        <motion.div
          className="relative z-10 px-4 md:px-8 pb-16 md:pb-24 max-w-[1200px] mx-auto w-full"
          initial="hidden" animate="visible" variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0} className="mb-4 md:mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-white/40">
              <span className="w-6 md:w-8 h-px bg-white/30" />
              Agencia de Marketing Virtual
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1}
            className="text-4xl md:text-6xl lg:text-7xl leading-[0.9] font-serif font-medium text-white tracking-tight mb-6 md:mb-8">
            Cada conversación,<br />
            <span className="italic text-white/60">una oportunidad.</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2}
            className="text-base md:text-lg text-white/40 max-w-[600px] leading-relaxed font-light mb-8 md:mb-12">
            10 especialistas de IA listos para transformar la atención al cliente de tu empresa.
            Cada bot tiene personalidad, expertise y prompts optimizados para su rol.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/team">
              <Button className="w-full sm:w-auto bg-white text-black hover:bg-white/90 rounded-full px-6 md:px-8 py-3 md:py-6 text-sm font-medium tracking-wide transition-all duration-500 hover:scale-105">
                Explorar Equipo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/simulator">
              <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white/70 hover:text-white hover:border-white/40 rounded-full px-6 md:px-8 py-3 md:py-6 text-sm font-light tracking-wide bg-transparent transition-all duration-500">
                Probar un Bot
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-white/20" />
        </motion.div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="relative py-16 md:py-32 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-xl md:rounded-2xl overflow-hidden"
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
                className="bg-white/[0.02] p-4 md:p-8 lg:p-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="text-2xl md:text-4xl lg:text-5xl font-serif font-medium text-white mb-1 md:mb-2">
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

      {/* ─── Services Grid (Responsive) ─── */}
      <section className="relative py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="mb-12 md:mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-4 md:mb-6 block">
              Servicios
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white leading-[1.1]">
              Todo lo que necesita<br />
              <span className="text-white/40 italic">tu empresa.</span>
            </h2>
          </motion.div>

          {/* Responsive grid */}
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
                <div className="glass-card rounded-xl md:rounded-2xl p-6 md:p-10 lg:p-14 h-full min-h-[300px] md:min-h-[400px] flex flex-col justify-between relative overflow-hidden glow-hover">
                  <div>
                    <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 md:mb-8">
                      <MessageSquare className="w-4 md:w-5 h-4 md:h-5 text-white/60" />
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mb-3 md:mb-4">
                      Bots de WhatsApp
                    </h3>
                    <p className="text-sm md:text-base text-white/40 leading-relaxed max-w-md font-light">
                      10 especialistas virtuales con personalidad propia. Director Creativo, Estratega,
                      Copywriter, SEO, Community Manager y más. Cada uno con prompts profesionales
                      editables en tiempo real.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors duration-500 mt-6 md:mt-8">
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
                <div className="glass-card rounded-xl md:rounded-2xl p-6 md:p-10 lg:p-14 h-full min-h-[300px] md:min-h-[400px] flex flex-col justify-between relative overflow-hidden glow-hover">
                  <div>
                    <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 md:mb-8">
                      <Phone className="w-4 md:w-5 h-4 md:h-5 text-white/60" />
                    </div>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-serif text-white mb-3 md:mb-4">
                      Agentes de Voz
                    </h3>
                    <p className="text-sm md:text-base text-white/40 leading-relaxed font-light">
                      6 agentes telefónicos con síntesis de voz y transcripción en tiempo real.
                      Recepción, ventas, soporte, cobranza, encuestas y reservas.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors duration-500 mt-6 md:mt-8">
                    <span className="text-sm font-light">Explorar</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Bottom cards */}
            {[
              {
                href: "/integrations",
                icon: Plug,
                title: "12+ Integraciones",
                desc: "HubSpot, Mailchimp, Stripe, Slack, Notion, Google Calendar, Instagram, n8n, Make y más.",
              },
              {
                href: "/llm",
                icon: Zap,
                title: "Multi-LLM",
                desc: "Conecta OpenAI, Anthropic Claude, Google Gemini, Groq, Ollama o cualquier proveedor compatible.",
              },
            ].map((card, idx) => (
              <motion.div
                key={card.title}
                className="md:col-span-6 group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
              >
                <Link href={card.href}>
                  <div className="glass-card rounded-xl md:rounded-2xl p-6 md:p-10 lg:p-14 h-full min-h-[250px] md:min-h-[300px] flex flex-col justify-between relative overflow-hidden glow-hover">
                    <div>
                      <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 md:mb-8">
                        <card.icon className="w-4 md:w-5 h-4 md:h-5 text-white/60" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-serif text-white mb-3 md:mb-4">
                        {card.title}
                      </h3>
                      <p className="text-sm md:text-base text-white/40 leading-relaxed font-light">
                        {card.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors duration-500 mt-6 md:mt-8">
                      <span className="text-sm font-light">Conectar</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-white/40 text-sm md:text-base mb-8 md:mb-12 font-light">
              La mayoría de empresas pierden clientes por no responder a tiempo. Nosotros hacemos que eso sea imposible.
            </p>
            <h2 className="text-2xl md:text-4xl font-serif text-white mb-8 md:mb-12">
              Empieza ahora
            </h2>
            <p className="text-white/40 text-sm md:text-base mb-8 md:mb-12 font-light">
              Inicializa tu equipo virtual y comienza a probar los bots en minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/team">
                <Button className="w-full sm:w-auto bg-white text-black hover:bg-white/90 rounded-full px-6 md:px-8 py-3 md:py-6 text-sm font-medium">
                  Inicializar Equipo
                </Button>
              </Link>
              <Link href="/simulator">
                <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:border-white/40 rounded-full px-6 md:px-8 py-3 md:py-6 text-sm font-light bg-transparent">
                  Probar Simulador
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

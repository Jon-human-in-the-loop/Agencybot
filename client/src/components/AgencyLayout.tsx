import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, MessageSquare, BarChart3,
  Cpu, FileText, GitBranch, Menu, X, LogOut, LogIn,
  Phone, Plug, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/team", icon: Users, label: "Equipo" },
  { href: "/simulator", icon: MessageSquare, label: "Simulador" },
  { href: "/voice", icon: Phone, label: "Voz" },
  { href: "/analytics", icon: BarChart3, label: "Datos" },
  { href: "/llm", icon: Cpu, label: "LLM" },
  { href: "/templates", icon: FileText, label: "Plantillas" },
  { href: "/flows", icon: GitBranch, label: "Flujos" },
  { href: "/integrations", icon: Plug, label: "Integraciones" },
];

interface AgencyLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AgencyLayout({ children, title, subtitle }: AgencyLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (href: string) => {
    return location.startsWith(href) && href !== "/";
  };

  return (
    <div className="min-h-screen bg-black">
      {/* ─── Top Navigation Bar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-6 lg:px-8 h-16">
          {/* Left: Logo + Back */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <span className="text-white text-lg font-serif font-semibold tracking-tight hover:opacity-70 transition-opacity duration-300">
                AgencyBot
              </span>
            </Link>
            <span className="text-white/10 text-lg font-light">/</span>
            {title && (
              <span className="text-white/50 text-sm font-light hidden sm:block">
                {title}
              </span>
            )}
          </div>

          {/* Center: Navigation (desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-light tracking-wide transition-all duration-500",
                  isActive(item.href)
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/70"
                )}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Right: User + Mobile menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-white/40 text-xs font-light">{user.name}</span>
                <button
                  onClick={() => logout()}
                  className="text-white/30 hover:text-white/60 transition-colors duration-300"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <a href={getLoginUrl()} className="text-white/50 text-xs font-light hover:text-white transition-colors duration-300 flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Acceder</span>
              </a>
            )}
            <button
              className="lg:hidden text-white/50 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden border-t border-white/[0.06] overflow-hidden"
            >
              <div className="px-6 py-4 space-y-1">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href}>
                    <span
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all",
                        isActive(item.href)
                          ? "bg-white/5 text-white"
                          : "text-white/40 hover:text-white/70"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Page Content ─── */}
      <main className="pt-16 min-h-screen">
        {/* Page header */}
        {title && (
          <div className="px-6 lg:px-8 pt-10 pb-8 max-w-[1400px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/">
                <span className="inline-flex items-center gap-2 text-white/30 text-xs font-light mb-4 hover:text-white/50 transition-colors duration-300">
                  <ArrowLeft className="w-3 h-3" />
                  Inicio
                </span>
              </Link>
              <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-white/40 text-base font-light mt-3 max-w-lg">
                  {subtitle}
                </p>
              )}
            </motion.div>
          </div>
        )}

        {/* Content area */}
        <motion.div
          className="px-6 lg:px-8 pb-16 max-w-[1400px] mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="py-8 px-6 lg:px-8 border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <span className="text-white/15 text-xs font-mono tracking-wider">
            AgencyBot © {new Date().getFullYear()}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-white/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
            <span className="font-light">Sistema activo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

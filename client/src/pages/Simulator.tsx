import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import AgencyLayout from "@/components/AgencyLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RefreshCw, Clock, Zap, MessageSquare, User, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  responseTimeMs?: number;
  provider?: string;
  model?: string;
  createdAt?: Date;
}

export default function Simulator() {
  const params = useParams<{ id: string }>();
  const initialBotId = params.id ? parseInt(params.id) : undefined;

  const [selectedBotId, setSelectedBotId] = useState<number | undefined>(initialBotId);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [clientName, setClientName] = useState("Cliente Demo");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: bots } = trpc.bots.list.useQuery();
  const { data: llmConfigs } = trpc.llm.list.useQuery();
  const [selectedLlmId, setSelectedLlmId] = useState<string>("");

  const selectedBot = bots?.find(b => b.id === selectedBotId);

  const createSessionMutation = trpc.conversations.createSession.useMutation({
    onSuccess: (session) => {
      if (!session) return;
      setSessionId(session.sessionId);
      setMessages([]);
      if (selectedBot?.welcomeMessage) {
        setMessages([{ role: "assistant", content: selectedBot.welcomeMessage, createdAt: new Date() }]);
      }
      toast.success(`Sesión iniciada con ${selectedBot?.name}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const sendMessageMutation = trpc.conversations.sendMessage.useMutation({
    onSuccess: (response) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.content,
        responseTimeMs: response.responseTimeMs,
        provider: response.provider,
        model: response.model,
        createdAt: new Date(),
      }]);
    },
    onError: (e: any) => { setIsTyping(false); toast.error(e.message); },
  });

  const closeSessionMutation = trpc.conversations.closeSession.useMutation({
    onSuccess: () => { setSessionId(null); setMessages([]); toast.success("Sesión cerrada"); },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const startSession = () => {
    if (!selectedBotId) { toast.error("Selecciona un especialista"); return; }
    createSessionMutation.mutate({ botProfileId: selectedBotId, clientName, channel: "simulator" });
  };

  const sendMessage = () => {
    if (!input.trim() || !sessionId) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg, createdAt: new Date() }]);
    setIsTyping(true);
    sendMessageMutation.mutate({
      sessionId,
      message: userMsg,
      llmConfigId: selectedLlmId ? parseInt(selectedLlmId) : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <AgencyLayout title="Simulador" subtitle="Prueba tus bots en tiempo real antes de desplegarlos.">
      <div className="grid lg:grid-cols-[340px_1fr] gap-3 md:gap-4 lg:gap-6 h-[calc(100vh-12rem)]">
        {/* ─── Config Panel ─── */}
        <div className="space-y-4 overflow-y-auto">
          {/* Bot selector */}
          <div className="glass-card rounded-2xl p-6">
            <span className="text-xs text-white/25 uppercase tracking-[0.15em] font-light block mb-4">Configuración</span>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/30 font-light mb-2 block">Especialista</label>
                <Select
                  value={selectedBotId?.toString() ?? ""}
                  onValueChange={v => { setSelectedBotId(parseInt(v)); setSessionId(null); setMessages([]); }}
                >
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white rounded-xl">
                    <SelectValue placeholder="Seleccionar..." />
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
              </div>

              <div>
                <label className="text-xs text-white/30 font-light mb-2 block">Nombre del cliente</label>
                <input
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-white/30 font-light mb-2 block">Proveedor LLM</label>
                <Select value={selectedLlmId} onValueChange={setSelectedLlmId}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white rounded-xl">
                    <SelectValue placeholder="Por defecto (built-in)" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/[0.08]">
                    <SelectItem value="default">Por defecto (built-in)</SelectItem>
                    {llmConfigs?.map(cfg => (
                      <SelectItem key={cfg.id} value={cfg.id.toString()}>{cfg.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!sessionId ? (
                <Button
                  className="w-full bg-white text-black hover:bg-white/90 rounded-full py-3 text-sm font-medium"
                  onClick={startSession}
                  disabled={!selectedBotId || createSessionMutation.isPending}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {createSessionMutation.isPending ? "Iniciando..." : "Iniciar Conversación"}
                </Button>
              ) : (
                <button
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-white/10 text-white/50 text-sm font-light hover:border-white/20 hover:text-white/70 transition-all"
                  onClick={() => closeSessionMutation.mutate({ sessionId })}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Nueva Sesión
                </button>
              )}
            </div>
          </div>

          {/* Bot info card */}
          {selectedBot && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-xl md:text-lg md:text-xl lg:text-2xl lg:text-3xl">{selectedBot.avatar}</div>
                <div>
                  <div className="text-sm font-serif text-white">{selectedBot.name}</div>
                  <div className="text-xs text-white/30 font-light">{selectedBot.role}</div>
                </div>
              </div>
              {selectedBot.description && (
                <p className="text-xs text-white/25 font-light line-clamp-3 leading-relaxed">{selectedBot.description}</p>
              )}
              <Link href={`/bot/${selectedBot.id}`}>
                <span className="inline-flex items-center gap-1 text-xs text-white/30 hover:text-white/60 mt-3 transition-colors">
                  Editar prompt <ArrowUpRight className="w-3 h-3" />
                </span>
              </Link>
            </motion.div>
          )}

          {/* Session stats */}
          {sessionId && messages.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <span className="text-xs text-white/25 uppercase tracking-[0.15em] font-light block mb-3">Sesión</span>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/30">Mensajes</span>
                  <span className="text-white/60">{messages.length}</span>
                </div>
                {messages.filter(m => m.responseTimeMs).length > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/30">Tiempo promedio</span>
                    <span className="text-white/60">
                      {(messages.filter(m => m.responseTimeMs).reduce((a, m) => a + (m.responseTimeMs ?? 0), 0) /
                        messages.filter(m => m.responseTimeMs).length / 1000).toFixed(1)}s
                    </span>
                  </div>
                )}
                {messages[messages.length - 1]?.provider && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/30">Proveedor</span>
                    <span className="text-white/50 font-mono">{messages[messages.length - 1].provider}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* ─── Chat Panel ─── */}
        <div className="flex flex-col glass-card rounded-2xl overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
            {selectedBot ? (
              <>
                <div className="text-xl">{selectedBot.avatar}</div>
                <div>
                  <div className="text-sm text-white font-medium">{selectedBot.name}</div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${sessionId ? "bg-emerald-500 animate-pulse" : "bg-white/20"}`} />
                    <span className="text-xs text-white/30 font-light">
                      {sessionId ? "En conversación" : "Sin sesión"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <span className="text-sm text-white/30 font-light">Selecciona un especialista para comenzar</span>
            )}
          </div>

          {/* Messages Container - Scrollable */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <MessageSquare className="w-10 h-10 text-white/10 mb-4" />
                    <p className="text-sm text-white/20 font-light">
                      {sessionId ? "Escribe tu primer mensaje." : "Inicia una sesión para chatear."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <AnimatePresence>
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${msg.role === "user" ? "bg-white text-black" : "bg-white/[0.06]"}`}>
                            {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : selectedBot?.avatar ?? "🤖"}
                          </div>
                          <div className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"} ${msg.role === "assistant" ? "w-full" : ""}`}>
                            <div className={`px-5 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-white text-black rounded-2xl rounded-tr-md max-w-[75%]" : "bg-white/[0.04] text-white/80 rounded-2xl rounded-tl-md border border-white/[0.06] w-full md:max-w-[85%]"}`}>
                              {msg.role === "assistant" ? (
                                <div className="prose-invert prose-sm max-w-none">
                                  <Streamdown>{msg.content}</Streamdown>
                                </div>
                              ) : msg.content}
                            </div>
                            {msg.responseTimeMs && (
                              <span className="flex items-center gap-1 text-[10px] text-white/20 px-1">
                                <Clock className="w-2.5 h-2.5" />
                                {(msg.responseTimeMs / 1000).toFixed(1)}s
                                {msg.model && <span>· {msg.model}</span>}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-white/[0.06]">
                          {selectedBot?.avatar ?? "🤖"}
                        </div>
                        <div className="px-5 py-3 rounded-2xl rounded-tl-md bg-white/[0.04] border border-white/[0.06]">
                          <div className="flex gap-1.5 items-center h-4">
                            {[0, 1, 2].map(i => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/[0.06] flex-shrink-0">
            <div className="flex gap-3 items-center">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={sessionId ? "Escribe un mensaje..." : "Inicia una sesión primero..."}
                disabled={!sessionId || isTyping}
                className="flex-1 px-5 py-3 bg-white/[0.03] border border-white/[0.08] rounded-full text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors disabled:opacity-30"
              />
              <button
                onClick={sendMessage}
                disabled={!sessionId || !input.trim() || isTyping}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AgencyLayout>
  );
}

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import AgencyLayout from "@/components/AgencyLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Volume2, Settings, Zap, Send } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";

type ConversationEntry = { role: "user" | "assistant"; content: string; timestamp: Date };

export default function VoiceAgents() {
  const { data: agents = [], refetch } = trpc.voice.list.useQuery();
  const seedMutation = trpc.voice.seedAgents.useMutation({
    onSuccess: () => { toast.success("Agentes de voz inicializados"); refetch(); },
  });
  const processCallMutation = trpc.voice.processCall.useMutation();

  const [activeCall, setActiveCall] = useState<{ agentId: number; callId: string } | null>(null);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [callDuration, setCallDuration] = useState(0);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation]);

  useEffect(() => {
    if (activeCall) {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeCall]);

  const formatDuration = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES"; utterance.rate = 0.95;
    const voices = synthRef.current.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith("es")) ?? voices[0];
    if (spanishVoice) utterance.voice = spanishVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const startCall = (agent: any) => {
    const callId = `sim-${nanoid(12)}`;
    setActiveCall({ agentId: agent.id, callId });
    setConversation([]);
    if (agent.welcomeMessage) {
      setConversation([{ role: "assistant", content: agent.welcomeMessage, timestamp: new Date() }]);
      speakText(agent.welcomeMessage);
    }
    toast.success(`Llamada iniciada con ${agent.name}`);
  };

  const endCall = () => {
    if (recognitionRef.current) recognitionRef.current.abort();
    if (synthRef.current) synthRef.current.cancel();
    setActiveCall(null); setIsListening(false); setIsSpeaking(false);
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Tu navegador no soporta reconocimiento de voz"); return; }
    const recognition = new SR();
    recognition.lang = "es-ES"; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => { handleSendMessage(event.results[0][0].transcript); };
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSendMessage = async (text?: string) => {
    const msg = text ?? textInput;
    if (!msg.trim() || !activeCall) return;
    setTextInput("");
    setConversation(prev => [...prev, { role: "user", content: msg, timestamp: new Date() }]);
    try {
      const history = conversation.map(c => ({ role: c.role as "user" | "assistant", content: c.content }));
      const result = await processCallMutation.mutateAsync({
        agentId: activeCall.agentId, textInput: msg, callId: activeCall.callId, conversationHistory: history,
      });
      const response = result.response || result.transcript;
      if (response) {
        setConversation(prev => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
        speakText(response);
      }
    } catch (e: any) { toast.error(e.message); }
  };

  const activeAgent = activeCall ? agents.find(a => a.id === activeCall.agentId) : null;

  return (
    <AgencyLayout title="Agentes de Voz" subtitle="6 agentes telefónicos con síntesis de voz y transcripción en tiempo real.">
      {agents.length === 0 ? (
        <div className="text-center py-32">
          <Phone className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl lg:text-2xl font-serif text-white mb-3">Sin agentes de voz</h3>
          <p className="text-white/30 text-sm font-light mb-8">Inicializa los agentes telefónicos para comenzar</p>
          <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}
            className="bg-white text-black hover:bg-white/90 rounded-full px-4 md:px-6 lg:px-8 py-3">
            <Zap className="w-4 h-4 mr-2" />
            {seedMutation.isPending ? "Inicializando..." : "Inicializar Agentes"}
          </Button>
        </div>
      ) : (
        <>
          {/* Agent Grid */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {agents.map((agent, i) => (
              <motion.div key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
              >
                <div className="glass-card rounded-2xl p-7 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-5">
                    <div className="text-xl md:text-lg md:text-xl lg:text-2xl lg:text-3xl">{agent.avatar}</div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${agent.isActive ? "bg-emerald-500" : "bg-white/20"}`} />
                      <span className="text-[10px] text-white/25">{agent.isActive ? "Activo" : "Inactivo"}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-serif text-white mb-1">{agent.name}</h3>
                  <p className="text-xs text-white/30 font-light mb-3">{agent.role}</p>
                  {agent.description && (
                    <p className="text-xs text-white/20 font-light line-clamp-2 mb-4 leading-relaxed">{agent.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-white/15 font-mono mb-5">
                    <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> {agent.voiceProvider ?? "browser"}</span>
                    <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> {agent.sttProvider ?? "browser"}</span>
                  </div>

                  <div className="flex-1" />

                  <button
                    onClick={() => startCall(agent)}
                    disabled={!!activeCall}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-light border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-30"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Simular Llamada
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call Dialog */}
          <Dialog open={!!activeCall} onOpenChange={(open) => { if (!open) endCall(); }}>
            <DialogContent className="bg-[#0a0a0a] border-white/[0.08] max-w-lg p-0 overflow-hidden">
              {/* Call header */}
              <div className="p-6 border-b border-white/[0.06] text-center">
                <div className="text-xl md:text-lg md:text-xl lg:text-2xl lg:text-3xl mb-2">{activeAgent?.avatar}</div>
                <div className="text-sm font-serif text-white">{activeAgent?.name}</div>
                <div className="text-xs text-white/30 font-light">{activeAgent?.role}</div>
                <div className="text-lg md:text-xl lg:text-2xl text-white font-mono mt-3">{formatDuration(callDuration)}</div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-400/60">En llamada</span>
                </div>
              </div>

              {/* Transcript */}
              <div className="max-h-64 overflow-y-auto p-6 space-y-3">
                {conversation.map((entry, i) => (
                  <div key={i} className={`flex gap-3 ${entry.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 text-xs leading-relaxed rounded-2xl
                      ${entry.role === "user"
                        ? "bg-white text-black rounded-tr-md"
                        : "bg-white/[0.04] text-white/70 rounded-tl-md border border-white/[0.06]"}`}>
                      {entry.content}
                    </div>
                  </div>
                ))}
                {processCallMutation.isPending && (
                  <div className="flex gap-1.5 items-center px-4 py-2.5 bg-white/[0.04] rounded-2xl rounded-tl-md w-fit border border-white/[0.06]">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input + Controls */}
              <div className="p-4 border-t border-white/[0.06] space-y-3">
                <div className="flex gap-2">
                  <input
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
                    placeholder="Escribe o usa el micrófono..."
                    className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/15"
                  />
                  <button onClick={() => handleSendMessage()} disabled={!textInput.trim()}
                    className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all disabled:opacity-20">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={startListening} disabled={isListening}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                      isListening ? "bg-emerald-500/20 text-emerald-400 animate-pulse" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button onClick={endCall}
                    className="w-13 h-13 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-400 transition-all p-3">
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </AgencyLayout>
  );
}

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const plans = [
  {
    name: "Starter",
    price: 99,
    description: "Perfecto para agencias pequeñas",
    features: [
      "5 Especialistas Virtuales",
      "2 Agentes de Voz",
      "3 Integraciones",
      "Motor LLM: OpenAI",
      "Dashboard básico",
      "Soporte por email",
      "Hasta 1,000 mensajes/mes",
      "Uptime 99%",
    ],
    cta: "Comenzar Ahora",
    highlighted: false,
  },
  {
    name: "Professional",
    price: 299,
    description: "Para agencias en crecimiento",
    features: [
      "10 Especialistas Virtuales",
      "6 Agentes de Voz",
      "12 Integraciones",
      "Motor LLM: OpenAI + Anthropic",
      "Dashboard avanzado con métricas",
      "Soporte prioritario 24/7",
      "Llamadas telefónicas ilimitadas",
      "Uptime 99.9%",
      "Despliegue automático a Railway",
      "Encriptación AES-256",
      "Exportación de datos",
      "API pública",
    ],
    cta: "Comenzar Ahora",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Solución personalizada",
    features: [
      "Especialistas ilimitados",
      "Agentes de voz ilimitados",
      "Integraciones ilimitadas",
      "Todos los modelos LLM",
      "SLA 99.99% garantizado",
      "Soporte dedicado 24/7",
      "Arquitectura personalizada",
      "Integración con sistemas legacy",
      "Training para tu equipo",
      "Consultoría estratégica",
      "Roadmap personalizado",
      "Descuento volumen",
    ],
    cta: "Contactar Ventas",
    highlighted: false,
  },
];

export default function Pricing() {
  const [, navigate] = useLocation();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const getPrice = (price: number | string) => {
    if (typeof price === "string") return price;
    if (billingCycle === "yearly") {
      return Math.floor(price * 12 * 0.85); // 15% descuento anual
    }
    return price;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="pt-32 pb-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-6">
          Planes Simples y Transparentes
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Elige el plan perfecto para tu agencia. Sin sorpresas, sin contratos a largo plazo.
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={billingCycle === "monthly" ? "text-white" : "text-gray-500"}>
            Mensual
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-700 transition-colors hover:bg-gray-600"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                billingCycle === "yearly" ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <span className={billingCycle === "yearly" ? "text-white" : "text-gray-500"}>
            Anual <span className="text-emerald-400 text-sm">(Ahorra 15%)</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-32">
        <div className="grid md:grid-cols-3 gap-4 md:gap-3 md:gap-4 lg:gap-6 lg:gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                plan.highlighted
                  ? "bg-gradient-to-br from-emerald-950 to-black border-2 border-emerald-400 shadow-2xl shadow-emerald-500/20 md:scale-105"
                  : "bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-gray-700"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-emerald-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                    MÁS POPULAR
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-lg md:text-xl lg:text-2xl font-playfair font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">
                      {typeof plan.price === "string" ? plan.price : `$${getPrice(plan.price)}`}
                    </span>
                    {typeof plan.price === "number" && (
                      <span className="text-gray-400">/mes</span>
                    )}
                  </div>
                  {billingCycle === "yearly" && typeof plan.price === "number" && (
                    <p className="text-sm text-emerald-400 mt-2">
                      ${Math.floor((plan.price * 12 * 0.85) / 12)}/mes facturado anualmente
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => navigate("/setup")}
                  className={`w-full mb-8 py-3 md:py-4 lg:py-6 text-lg font-semibold rounded-lg transition-all ${
                    plan.highlighted
                      ? "bg-emerald-400 text-black hover:bg-emerald-300"
                      : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                  }`}
                >
                  {plan.cta}
                </Button>

                {/* Features */}
                <div className="space-y-4">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-b from-black to-gray-950 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg md:text-xl lg:text-2xl md:text-xl md:text-lg md:text-xl lg:text-2xl lg:text-3xl lg:text-4xl font-playfair font-bold text-center mb-12">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "¿Puedo cambiar de plan en cualquier momento?",
                a: "Sí. Puedes cambiar de plan en cualquier momento. Si subes de plan, pagas la diferencia prorrateada. Si bajas, el crédito se aplica al siguiente período.",
              },
              {
                q: "¿Hay contrato a largo plazo?",
                a: "No. Todos nuestros planes son mes a mes. Puedes cancelar en cualquier momento sin penalización.",
              },
              {
                q: "¿Qué incluye el soporte?",
                a: "Starter: Email (respuesta en 24h). Professional: Chat 24/7 + Email. Enterprise: Soporte dedicado + consultoría.",
              },
              {
                q: "¿Puedo probar antes de pagar?",
                a: "Sí. Ofrecemos 14 días de prueba gratuita en el plan Professional. Sin necesidad de tarjeta de crédito.",
              },
              {
                q: "¿Hay descuentos para organizaciones sin fines de lucro?",
                a: "Sí. Ofrecemos 50% de descuento para ONGs y organizaciones educativas. Contacta a ventas.",
              },
              {
                q: "¿Qué pasa si excedo mis límites?",
                a: "No hay sorpresas. Te notificamos cuando estés cerca del límite. Puedes aumentar límites o cambiar de plan.",
              },
            ].map((item, idx) => (
              <div key={idx} className="border-b border-gray-800 pb-6">
                <h3 className="text-lg font-semibold mb-2 text-white">{item.q}</h3>
                <p className="text-gray-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 text-center">
        <h2 className="text-lg md:text-xl lg:text-2xl md:text-xl md:text-lg md:text-xl lg:text-2xl lg:text-3xl lg:text-4xl font-playfair font-bold mb-6">
          ¿Listo para lanzar tu agencia virtual?
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Comienza hoy mismo. Sin tarjeta de crédito requerida para la prueba gratuita.
        </p>
        <Button
          onClick={() => navigate("/setup")}
          className="bg-emerald-400 text-black hover:bg-emerald-300 px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-6 text-lg font-semibold rounded-lg"
        >
          Comenzar Prueba Gratuita
        </Button>
      </div>
    </div>
  );
}

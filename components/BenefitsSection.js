export default function BenefitsSection() {
  const benefits = [
    {
      icon: "🎯",
      title: "Consolidación de Experiencias",
      description: "Integración de servicios turísticos en paquetes regionales para reducir costos y mejorar la oferta.",
      features: ["Paquetes multipaís", "Descuentos por volumen", "Itinerarios optimizados"],
      stats: "Hasta 40% de ahorro"
    },
    {
      icon: "💳",
      title: "Pagos Seguros y Trazables",
      description: "Plataforma con reputación verificada y seguimiento de cada operación para tu tranquilidad.",
      features: ["Mercado Pago", "Transbank", "Múltiples monedas"],
      stats: "100% seguro"
    },
    {
      icon: "🤝",
      title: "Alianzas Estratégicas",
      description: "Colaboración directa con operadores turísticos, comunidades locales y entidades públicas.",
      features: ["Red de confianza", "Proveedores verificados", "Soporte local"],
      stats: "500+ aliados"
    },
    {
      icon: "🌟",
      title: "Destinos Emergentes",
      description: "Visibilidad para zonas con alto potencial turístico pero baja exposición comercial.",
      features: ["Rutas inexploradas", "Comunidades auténticas", "Experiencias únicas"],
      stats: "150+ destinos"
    },
    {
      icon: "🌱",
      title: "Turismo con Propósito",
      description: "Conexión directa con la cultura, la naturaleza y la economía local sostenible.",
      features: ["Impacto social medible", "Comercio justo", "Conservación ambiental"],
      stats: "95% impacto positivo"
    },
    {
      icon: "📱",
      title: "Gestión Simplificada",
      description: "Sistema digital integral para reservas, pagos y coordinación logística en tiempo real.",
      features: ["App móvil", "Notificaciones push", "Chat en vivo"],
      stats: "24/7 disponible"
    }
  ]

  const additionalBenefits = [
    {
      icon: "🌍",
      title: "Cobertura Regional Completa",
      description: "Acceso a experiencias en los 4 países del corredor bioceánico con una sola plataforma.",
      highlight: "4 países, 1 plataforma"
    },
    {
      icon: "🏆",
      title: "Calidad Garantizada",
      description: "Sistema de ratings y reviews que asegura experiencias de alta calidad en cada destino.",
      highlight: "Rating promedio 4.8/5"
    },
    {
      icon: "🎨",
      title: "Experiencias Personalizadas",
      description: "Algoritmo inteligente que sugiere experiencias basadas en tus preferencias e historial.",
      highlight: "IA personalizada"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#1C1C1C]">
              ¿Por qué ConfiaTour?
            </h3>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Descubre los beneficios que hacen de ConfiaTour la plataforma líder 
            en turismo colaborativo del corredor bioceánico.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-4 py-2 bg-[#f6f4f2] rounded-full text-gray-700">🇦🇷 Argentina</span>
            <span className="px-4 py-2 bg-[#f6f4f2] rounded-full text-gray-700">🇨🇱 Chile</span>
            <span className="px-4 py-2 bg-[#f6f4f2] rounded-full text-gray-700">🇵🇾 Paraguay</span>
            <span className="px-4 py-2 bg-[#f6f4f2] rounded-full text-gray-700">🇧🇷 Brasil</span>
          </div>
        </div>

        {/* Beneficios principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-[#f6f4f2] p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-black/5 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-600">
                  {benefit.stats}
                </span>
              </div>
              <h4 className="text-xl font-bold text-[#1C1C1C] mb-4">
                {benefit.title}
              </h4>
              <p className="text-gray-600 leading-relaxed mb-4">
                {benefit.description}
              </p>
              <div className="space-y-2">
                {benefit.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-[#23A69A] rounded-full mr-3"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Beneficios adicionales */}
        <div className="bg-gradient-to-r from-[#f6f4f2] to-white p-10 rounded-2xl mb-12">
          <h4 className="text-2xl font-bold text-center mb-8 text-[#1C1C1C]">
            Ventajas Exclusivas del Corredor Bioceánico
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {additionalBenefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h5 className="font-bold text-lg mb-2 text-[#1C1C1C]">{benefit.title}</h5>
                <p className="text-gray-600 text-sm mb-3">{benefit.description}</p>
                <span className="bg-[#23A69A] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {benefit.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparación con competencia */}
        <div className="bg-white border-2 border-[#f6f4f2] p-8 rounded-2xl">
          <h4 className="text-2xl font-bold text-center mb-8 text-[#1C1C1C]">
            ConfiaTour vs. Plataformas Tradicionales
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700"></th>
                  <th className="text-center py-4 px-4 font-semibold text-[#23A69A]">ConfiaTour</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-500">Otras Plataformas</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Cobertura Regional</td>
                  <td className="py-3 px-4 text-center">✅ 4 países</td>
                  <td className="py-3 px-4 text-center">❌ 1-2 países</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Enfoque Colaborativo</td>
                  <td className="py-3 px-4 text-center">✅ 100% colaborativo</td>
                  <td className="py-3 px-4 text-center">⚠️ Parcial</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Múltiples Monedas</td>
                  <td className="py-3 px-4 text-center">✅ 5 monedas</td>
                  <td className="py-3 px-4 text-center">❌ 1-2 monedas</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Impacto Social</td>
                  <td className="py-3 px-4 text-center">✅ Medible</td>
                  <td className="py-3 px-4 text-center">❌ No medible</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Soporte Local</td>
                  <td className="py-3 px-4 text-center">✅ 24/7 multiidioma</td>
                  <td className="py-3 px-4 text-center">⚠️ Limitado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
export default function BenefitsSection() {
  const benefits = [
    {
      icon: "🎯",
      title: "Consolidación de Experiencias",
      description: "Integración de servicios turísticos en paquetes regionales para reducir costos y mejorar la oferta."
    },
    {
      icon: "💳",
      title: "Pagos Seguros y Trazables",
      description: "Plataforma con reputación verificada y seguimiento de cada operación para tu tranquilidad."
    },
    {
      icon: "🤝",
      title: "Alianzas Estratégicas",
      description: "Colaboración directa con operadores turísticos, comunidades locales y entidades públicas."
    },
    {
      icon: "🌟",
      title: "Destinos Emergentes",
      description: "Visibilidad para zonas con alto potencial turístico pero baja exposición comercial."
    },
    {
      icon: "🌱",
      title: "Turismo con Propósito",
      description: "Conexión directa con la cultura, la naturaleza y la economía local sostenible."
    },
    {
      icon: "📱",
      title: "Gestión Simplificada",
      description: "Sistema digital integral para reservas, pagos y coordinación logística en tiempo real."
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
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Descubre los beneficios que hacen de ConfiaTour la plataforma líder 
            en turismo colaborativo del corredor bioceánico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-[#f6f4f2] p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-black/5"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h4 className="text-xl font-bold text-[#1C1C1C] mb-4">
                {benefit.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
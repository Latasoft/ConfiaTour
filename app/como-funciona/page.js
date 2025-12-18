import Navbar from '../../components/Navbar'

export const dynamic = 'force-dynamic'

export default function ComoFuncionaPage() {
  const pasos = [
    {
      numero: "1",
      titulo: "Explora",
      descripcion: "Navega por las experiencias disponibles en el corredor bioceánico",
      detalle: "Utiliza nuestros filtros avanzados por país, tipo de actividad, duración y presupuesto"
    },
    {
      numero: "2",
      titulo: "Selecciona",
      descripcion: "Elige la experiencia que más te guste y revisa los detalles",
      detalle: "Lee reseñas, ve fotos, conoce a los anfitriones y verifica disponibilidad"
    },
    {
      numero: "3",
      titulo: "Reserva",
      descripcion: "Realiza tu reserva de forma segura con nuestro sistema de pagos",
      detalle: "Paga con Mercado Pago, Transbank o transferencia bancaria en múltiples monedas"
    },
    {
      numero: "4",
      titulo: "Disfruta",
      descripcion: "Vive una experiencia única y auténtica con los locales",
      detalle: "Recibe confirmación, contacta con tu anfitrión y vive la experiencia"
    }
  ]

  const tiposExperiencias = [
    {
      categoria: "Cultura y Tradiciones",
      ejemplos: ["Talleres de artesanías locales", "Festivales tradicionales", "Visitas a comunidades originarias"],
      
    },
    {
      categoria: "Gastronomía Regional",
      ejemplos: ["Cenas en casas de familia", "Tours gastronómicos", "Clases de cocina tradicional"],
      
    },
    {
      categoria: "Naturaleza y Aventura",
      ejemplos: ["Trekking en la Puna", "Observación de fauna", "Turismo rural comunitario"],
      
    },
    {
      categoria: "Historia y Patrimonio",
      ejemplos: ["Sitios arqueológicos", "Museos locales", "Rutas históricas"],
      
    }
  ]

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#23A69A] to-[#1e8a7f] bg-clip-text text-transparent">
              ¿Cómo Funciona ConfiaTour?
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Descubre cómo nuestra plataforma facilita el turismo colaborativo en el corredor bioceánico, 
              conectando viajeros con experiencias auténticas en 4 países.
            </p>
          </div>

          {/* Pasos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {pasos.map((paso, index) => (
              <div key={index} className="text-center bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-gradient-to-r from-[#23A69A] to-[#1e8a7f] text-white w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {paso.numero}
                </div>
                <h3 className="text-xl font-bold mb-4 text-[#23A69A]">{paso.titulo}</h3>
                <p className="text-gray-700 mb-4 font-medium">{paso.descripcion}</p>
                <p className="text-gray-600 text-sm">{paso.detalle}</p>
              </div>
            ))}
          </div>

          {/* Características del sistema */}
          <div className="bg-white p-10 rounded-2xl shadow-xl mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-[#23A69A]">Características de la Plataforma</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-[#23A69A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Verificación de Anfitriones</h3>
                <p className="text-gray-600 text-sm">
                  Todos los proveedores de experiencias son verificados y evaluados por nuestra comunidad.
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-[#23A69A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Múltiples Monedas</h3>
                <p className="text-gray-600 text-sm">
                  Acepta pagos en ARS, CLP, BRL, PYG y USD con conversión automática en tiempo real.
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-[#23A69A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Soporte 24/7</h3>
                <p className="text-gray-600 text-sm">
                  Asistencia multiidioma durante todo tu viaje por el corredor bioceánico.
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-[#23A69A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Analytics para Anfitriones</h3>
                <p className="text-gray-600 text-sm">
                  Herramientas para que los proveedores gestionen y optimicen sus experiencias.
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-[#23A69A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Seguridad Garantizada</h3>
                <p className="text-gray-600 text-sm">
                  Encriptación de datos y protección de pagos con certificaciones internacionales.
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-[#23A69A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Impacto Social Medible</h3>
                <p className="text-gray-600 text-sm">
                  Seguimiento del impacto económico y social en las comunidades locales.
                </p>
              </div>
            </div>
          </div>

          {/* Tipos de experiencias */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-[#23A69A]">
              Tipos de Experiencias Disponibles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tiposExperiencias.map((tipo, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#23A69A]">{tipo.categoria}</h3>
                    
                  </div>
                  <ul className="text-gray-600 space-y-2">
                    {tipo.ejemplos.map((ejemplo, i) => (
                      <li key={i} className="flex items-center">
                        <span className="w-2 h-2 bg-[#23A69A] rounded-full mr-3"></span>
                        {ejemplo}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Sistema de reservas */}
          <div className="bg-gradient-to-r from-[#23A69A] to-[#1e8a7f] p-10 rounded-2xl shadow-xl text-white mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Sistema de Reservas Inteligente</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mb-2 flex justify-center">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Reserva Instantánea</h3>
                <p className="text-sm opacity-90">
                  Confirmación inmediata para experiencias con disponibilidad automática
                </p>
              </div>
              <div className="text-center">
                <div className="mb-2 flex justify-center">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Reserva con Confirmación</h3>
                <p className="text-sm opacity-90">
                  El anfitrión confirma tu reserva en un plazo máximo de 24 horas
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  <svg className="w-12 h-12 mx-auto text-[#23A69A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Planificación Grupal</h3>
                <p className="text-sm opacity-90">
                  Coordina experiencias para grupos grandes con fechas flexibles
                </p>
              </div>
            </div>
          </div>

          {/* Políticas de cancelación */}
          <div className="bg-white p-10 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-8 text-center text-[#23A69A]">
              Políticas de Cancelación Flexibles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 border-2 border-green-200 rounded-xl">
                <div className="text-green-600 text-2xl font-bold mb-2">Flexible</div>
                <div className="text-sm text-gray-600 mb-4">Reembolso completo hasta 24h antes</div>
                <div className="text-xs text-gray-500">Ideal para planes espontáneos</div>
              </div>
              <div className="text-center p-6 border-2 border-yellow-200 rounded-xl">
                <div className="text-yellow-600 text-2xl font-bold mb-2">Moderada</div>
                <div className="text-sm text-gray-600 mb-4">Reembolso completo hasta 5 días antes</div>
                <div className="text-xs text-gray-500">Balance entre flexibilidad y planificación</div>
              </div>
              <div className="text-center p-6 border-2 border-red-200 rounded-xl">
                <div className="text-red-600 text-2xl font-bold mb-2">Estricta</div>
                <div className="text-sm text-gray-600 mb-4">Reembolso 50% hasta 7 días antes</div>
                <div className="text-xs text-gray-500">Para experiencias con alta demanda</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
import Navbar from '../../components/Navbar'
import Link from 'next/link'

export default function ComoFuncionaPage() {
  const pasos = [
    {
      numero: "01",
      titulo: "Explora Experiencias",
      descripcion: "Navega por nuestra plataforma y descubre experiencias únicas en el corredor Bioceánico. Filtra por región, tipo de actividad y presupuesto.",
      icono: "🔍"
    },
    {
      numero: "02", 
      titulo: "Reserva con Confianza",
      descripcion: "Selecciona tu experiencia favorita y realiza tu reserva de forma segura. Todos nuestros proveedores están verificados.",
      icono: "🛡️"
    },
    {
      numero: "03",
      titulo: "Conecta con Locales",
      descripcion: "Te pondremos en contacto directo con guías locales, emprendedores y comunidades para una experiencia auténtica.",
      icono: "🤝"
    },
    {
      numero: "04",
      titulo: "Vive la Experiencia",
      descripcion: "Disfruta de tu aventura mientras contribuyes al desarrollo sostenible de las comunidades locales.",
      icono: "🌟"
    }
  ]

  const beneficios = [
    {
      titulo: "Para Viajeros",
      items: [
        "Experiencias auténticas y únicas",
        "Precios justos y transparentes", 
        "Conexión directa con la cultura local",
        "Plataforma segura y confiable",
        "Soporte durante tu viaje"
      ],
      icono: "✈️"
    },
    {
      titulo: "Para Proveedores",
      items: [
        "Alcance a mercados internacionales",
        "Herramientas de gestión integradas",
        "Pagos seguros y puntuales",
        "Capacitación y apoyo continuo",
        "Red de colaboración regional"
      ],
      icono: "🏪"
    },
    {
      titulo: "Para Comunidades",
      items: [
        "Desarrollo económico local",
        "Preservación cultural",
        "Turismo sostenible",
        "Generación de empleo",
        "Fortalecimiento de identidad"
      ],
      icono: "🏘️"
    }
  ]

  return (
    <div className="min-h-screen bg-[#f6f4f2] ">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#23A69A] to-[#1a8a7e]">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            ¿Cómo funciona ConfiaTour?
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Conectamos viajeros con experiencias auténticas en el corredor Bioceánico, 
            promoviendo el turismo colaborativo y el desarrollo local sostenible.
          </p>
        </div>
      </section>

      {/* Proceso paso a paso */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl font-bold text-center mb-16">Nuestro Proceso</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pasos.map((paso, index) => (
              <div key={index} className="text-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg mb-6 relative">
                  <div className="text-6xl mb-4">{paso.icono}</div>
                  <div className="absolute -top-4 -right-4 bg-[#F2C14E] text-black font-bold text-lg px-4 py-2 rounded-full">
                    {paso.numero}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-amber-800">{paso.titulo}</h3>
                  <p className="text-gray-600">{paso.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 bg-white text-black">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl font-bold text-center mb-16">Beneficios para Todos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {beneficios.map((categoria, index) => (
              <div key={index} className="bg-[#f6f4f2] p-8 rounded-2xl">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">{categoria.icono}</div>
                  <h3 className="text-2xl font-bold">{categoria.titulo}</h3>
                </div>
                <ul className="space-y-3">
                  {categoria.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-[#23A69A] mr-2">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tecnología y Seguridad */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="bg-gradient-to-r from-[#23A69A] to-[#1a8a7e] rounded-3xl p-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Tecnología y Seguridad</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-[#F2C14E] text-2xl mr-4">🔒</span>
                    <div>
                      <h4 className="font-bold mb-2">Pagos Seguros</h4>
                      <p className="text-white/90">Plataforma con encriptación de extremo a extremo y múltiples métodos de pago.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#F2C14E] text-2xl mr-4">🎯</span>
                    <div>
                      <h4 className="font-bold mb-2">Verificación de Proveedores</h4>
                      <p className="text-white/90">Todos nuestros socios pasan por un proceso riguroso de verificación.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#F2C14E] text-2xl mr-4">📱</span>
                    <div>
                      <h4 className="font-bold mb-2">Soporte 24/7</h4>
                      <p className="text-white/90">Asistencia continua durante tu experiencia a través de múltiples canales.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 p-8 rounded-2xl">
                  <h3 className="text-2xl font-bold mb-4">¿Listo para comenzar?</h3>
                  <p className="mb-6">Únete a la revolución del turismo colaborativo</p>
                  <Link href="/experiencias">
                    <button className="bg-[#F2C14E] text-black px-8 py-4 rounded-xl font-bold hover:bg-[#F2C14E]/90 transition-colors">
                      Explorar Experiencias
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
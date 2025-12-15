export const dynamic = 'force-dynamic'

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#23A69A] to-[#1e8a7f] bg-clip-text text-transparent">
              Sobre ConfiaTour
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              La primera plataforma de turismo colaborativo del corredor bioceánico que conecta
              Argentina, Chile, Paraguay y Brasil a través de experiencias auténticas.
            </p>
          </div>

          {/* Misión, Visión, Valores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-[#23A69A] rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-[#23A69A] text-center">Nuestra Misión</h2>
              <p className="text-gray-600">
                Democratizar el turismo regional conectando viajeros con experiencias auténticas
                del corredor bioceánico, fortaleciendo las economías locales y promoviendo el
                intercambio cultural sostenible entre Argentina, Chile, Paraguay y Brasil.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-[#23A69A] rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-[#23A69A] text-center">Nuestra Visión</h2>
              <p className="text-gray-600">
                Ser la plataforma líder en turismo colaborativo del corredor bioceánico para 2030,
                integrando servicios financieros, seguros de viaje y herramientas de promoción digital
                que fortalezcan el ecosistema turístico regional.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-[#23A69A] rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-[#23A69A] text-center">Nuestros Valores</h2>
              <ul className="text-gray-600 space-y-2">
                <li>• <strong>Confianza:</strong> Transacciones seguras y verificadas</li>
                <li>• <strong>Colaboración:</strong> Unimos viajeros y comunidades</li>
                <li>• <strong>Sostenibilidad:</strong> Turismo responsable</li>
                <li>• <strong>Autenticidad:</strong> Experiencias genuinas</li>
              </ul>
            </div>
          </div>

          {/* El Corredor Bioceánico */}
          <div className="bg-white p-10 rounded-2xl shadow-xl mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center text-[#23A69A]">El Corredor Bioceánico</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-700 mb-4">
                  El corredor bioceánico es una red de infraestructura que conecta el Atlántico con el Pacífico,
                  uniendo estratégicamente las regiones de:
                </p>
                <ul className="text-gray-600 space-y-2 mb-6">
                  <li>🇦🇷 <strong>Argentina:</strong> Salta, Jujuy y el NOA</li>
                  <li>🇨🇱 <strong>Chile:</strong> Antofagasta y el norte chileno</li>
                  <li>🇵🇾 <strong>Paraguay:</strong> Chaco paraguayo</li>
                  <li>🇧🇷 <strong>Brasil:</strong> Mato Grosso del Sur</li>
                </ul>
                <p className="text-gray-700">
                  Esta conexión no solo facilita el comercio, sino que abre un mundo de oportunidades
                  para el turismo colaborativo, permitiendo a los viajeros experimentar la diversidad
                  cultural, natural y gastronómica de cuatro países en una sola experiencia.
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#23A69A] to-[#1e8a7f] p-8 rounded-xl text-white">
                <h3 className="text-xl font-bold mb-4">Impacto Regional</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">4</div>
                    <div className="text-sm">Países Conectados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">15+</div>
                    <div className="text-sm">Regiones Turísticas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-sm">Experiencias Potenciales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">50M+</div>
                    <div className="text-sm">Habitantes en la Región</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nuestro Enfoque */}
          <div className="bg-white p-10 rounded-2xl shadow-xl mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-[#23A69A]">Nuestro Enfoque</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#23A69A] to-[#1e8a7f] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Turismo Colaborativo</h3>
                <p className="text-gray-600">
                  Conectamos directamente a viajeros con emprendedores locales,
                  cooperativas y comunidades para experiencias auténticas.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#23A69A] to-[#1e8a7f] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Pagos Seguros</h3>
                <p className="text-gray-600">
                  Sistema de pagos trazables con integración de Mercado Pago y Transbank
                  para transacciones seguras en múltiples monedas.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#23A69A] to-[#1e8a7f] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Desarrollo Territorial</h3>
                <p className="text-gray-600">
                  Fortalecemos la identidad local y promovemos el desarrollo económico
                  de las regiones del corredor bioceánico.
                </p>
              </div>
            </div>
          </div>

          {/* Alianzas Estratégicas */}
          <div className="bg-gradient-to-r from-[#23A69A] to-[#1e8a7f] p-10 rounded-2xl shadow-xl text-white">
            <h2 className="text-3xl font-bold mb-8 text-center">Alianzas Estratégicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Sector Público</h3>
                <ul className="space-y-2">
                  <li>• Municipios y gobiernos regionales</li>
                  <li>• Secretarías de turismo provinciales</li>
                  <li>• Organizaciones de promoción turística</li>
                  <li>• Entes binacionales del corredor</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Sector Privado</h3>
                <ul className="space-y-2">
                  <li>• Emprendedores turísticos locales</li>
                  <li>• Cooperativas y asociaciones</li>
                  <li>• Operadores turísticos regionales</li>
                  <li>• Servicios de transporte y logística</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
import Navbar from '../../components/Navbar'
import Link from 'next/link'

export default function SobreNosotrosPage() {




  const regiones = [
    {
      nombre: "Salta & Jujuy",
      descripcion: "Paisajes andinos, cultura ancestral y gastronomía única",
      pais: "Argentina"
    },
    {
      nombre: "Antofagasta",
      descripcion: "Desierto de Atacama, cielos estrellados y aventura extrema", 
      pais: "Chile"
    },
    {
      nombre: "Chaco",
      descripcion: "Biodiversidad excepcional y comunidades guaraníes",
      pais: "Paraguay"
    },
    {
      nombre: "Sur de Brasil",
      descripcion: "Cultura gaucha, vinícolas y tradiciones rurales",
      pais: "Brasil"
    }
  ]

  return (
    <div className="min-h-screen bg-[#f6f4f2]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#F2C14E] to-[#e6ac2e]">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <h1 className="text-5xl font-bold text-black mb-6">
            Sobre ConfiaTour
          </h1>
          <p className="text-xl text-black/80 max-w-3xl mx-auto">
            Somos pioneros en turismo colaborativo, conectando culturas y comunidades 
            a través del corredor Bioceánico para crear experiencias transformadoras.
          </p>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-amber-800 mb-6">Nuestra Historia</h2>
            <p className="text-lg text-gray-700 mb-6">
              ConfiaTour nació de la visión de aprovechar el corredor Bioceánico no solo como 
              una ruta comercial, sino como un puente cultural que conecta cuatro países y 
              múltiples comunidades con historias extraordinarias que contar.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              En 2024, un grupo de emprendedores, tecnólogos y especialistas en turismo 
              sostenible se unieron con la misión de democratizar el acceso al turismo 
              regional, creando oportunidades económicas para las comunidades locales 
              mientras ofrecen experiencias auténticas a los viajeros.
            </p>
            <p className="text-lg text-gray-700">
              Hoy, ConfiaTour conecta a miles de viajeros con emprendedores locales, 
              cooperativas y comunidades, fortaleciendo el tejido económico y social 
              de toda la región.
            </p>
          </div>
        </div>
      </section>


      {/* Corredor Bioceánico */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl font-bold text-center mb-6 text-amber-800">El Corredor Bioceánico</h2>
          <p className="text-xl text-gray-700 text-center mb-16 max-w-4xl mx-auto">
            Una red de intercambio que conecta el Atlántico con el Pacífico, 
            uniendo culturas, paisajes y oportunidades únicas en Sudamérica.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regiones.map((region, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="bg-[#23A69A] text-white px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
                  {region.pais}
                </div>
                <h3 className="text-xl font-bold mb-3 text-amber-800">{region.nombre}</h3>
                <p className="text-gray-600">{region.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#23A69A] to-[#1a8a7e]">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Únete a Nuestra Misión
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Ya sea como viajero, emprendedor local o comunidad, 
            hay un lugar para ti en ConfiaTour.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/experiencias">
              <button className="bg-[#F2C14E] text-black px-8 py-4 rounded-xl font-bold hover:bg-[#F2C14E]/90 transition-colors">
                Explorar Experiencias
              </button>
            </Link>
            <Link href="/experiencias/crear">
              <button className="bg-white/20 text-white border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-colors">
                Crear Experiencia
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
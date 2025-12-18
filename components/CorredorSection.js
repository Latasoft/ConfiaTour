import { RoadIcon, ClockIcon, ShipIcon, FlagIcon } from './icons'
import Image from 'next/image'

export default function CorredorSection() {
  const countries = [
    {
      name: "Argentina",
      regions: ["Salta", "Jujuy"],
      color: "from-[#C4533D] to-[#F2C14E]",
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
      highlights: ["Quebrada de Humahuaca", "Salinas Grandes", "Ruta del Vino"],
      economy: "Turismo cultural y vitivinícola",
      population: "1.8M habitantes"
    },
    {
      name: "Chile",
      regions: ["Antofagasta", "Atacama"],
      color: "from-[#23A69A] to-[#F2C14E]",
      image: "https://media.istockphoto.com/id/813326726/es/foto/portada-roca-formaci%C3%B3n-costa-chilena-reserva-nacional-de-la-portada-antofagasta-chile.jpg?s=2048x2048&w=is&k=20&c=M2hecykqgVZqUnyRWeZQqU3CsrNTO52PT5J9xfV5n4M=",
      highlights: ["Desierto de Atacama", "Valle de la Luna", "Geysers del Tatio"],
      economy: "Minería y astroturismo",
      population: "950K habitantes"
    },
    {
      name: "Paraguay",
      regions: ["Chaco"],
      color: "from-[#F2C14E] to-[#C4533D]",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
      highlights: ["Parque Nacional Defensores del Chaco", "Comunidades Menonitas", "Reserva Morombí"],
      economy: "Ganadería y ecoturismo",
      population: "180K habitantes"
    },
    {
      name: "Brasil",
      regions: ["Sur de Brasil"],
      color: "from-[#23A69A] to-[#6C3C2D]",
      image: "https://media.istockphoto.com/id/608540602/es/foto/panorama-a%C3%A9reo-de-la-bah%C3%ADa-de-botafogo-r%C3%ADo-de-janeiro.jpg?s=2048x2048&w=is&k=20&c=2o_Y-GgBaVgvDZNgRNHX6tP62PD7hX1R8F-sGQizg4Q=",
      highlights: ["Pantanal", "Bonito", "Campo Grande"],
      economy: "Agronegocios y ecoturismo",
      population: "2.8M habitantes"
    }
  ]

  const corridorStats = [
    { label: "Kilómetros de Extensión", value: "2,400 km", icon: RoadIcon },
    { label: "Tiempo de Travesía", value: "5-7 días", icon: ClockIcon },
    { label: "Puertos Conectados", value: "6 puertos", icon: ShipIcon },
  ]

  const culturalAspects = [
    {
      aspect: "Gastronomía",
      description: "Desde empanadas salteñas hasta asado paraguayo",
      countries: "AR · CL · PY · BR"
    },
    {
      aspect: "Música y Danza",
      description: "Folclore andino, cueca chilena y polka paraguaya",
      countries: "AR · CL · PY"
    },
    {
      aspect: "Artesanías",
      description: "Tejidos andinos, cerámica y trabajos en cuero",
      countries: "AR · CL · PY · BR"
    },
    {
      aspect: "Idiomas",
      description: "Español, portugués, guaraní y lenguas originarias",
      countries: "Multilingüe"
    }
  ]

  return (
    <section id="corredor" className="py-20 bg-gradient-to-br from-[#f6f4f2] to-white">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#1C1C1C]">
              Corredor Bioceánico
            </h3>
          </div>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-8">
            Una red de intercambio cultural y económico que conecta Argentina, Chile, Brasil y Paraguay, 
            abriendo oportunidades únicas para el turismo regional colaborativo.
          </p>
          
          {/* Estadísticas del corredor */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mb-8">
            {corridorStats.map((stat, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-md">
                <div className="text-[#23A69A] mb-2 flex justify-center">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="font-bold text-lg text-[#1C1C1C]">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Países del corredor */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {countries.map((country, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="aspect-[4/5] relative">
                <Image 
                  src={country.image} 
                  alt={country.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${country.color} opacity-80`}></div>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h4 className="text-2xl font-bold mb-2">{country.name}</h4>
                <div className="space-y-1 mb-3">
                  {country.regions.map((region, idx) => (
                    <span key={idx} className="block text-sm opacity-90">
                      • {region}
                    </span>
                  ))}
                </div>
                <div className="text-xs opacity-80 mb-2">
                  <div>{country.population}</div>
                  <div>{country.economy}</div>
                </div>
                <div className="hidden group-hover:block transition-all duration-300">
                  <div className="text-xs space-y-1">
                    {country.highlights.slice(0, 2).map((highlight, idx) => (
                      <div key={idx}>• {highlight}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      

        {/* Mensaje final */}
        <div className="bg-gradient-to-r from-[#C4533D] via-[#F2C14E] to-[#23A69A] p-8 rounded-2xl text-center text-white">
          <h4 className="text-2xl font-bold mb-4">
            Un puente entre culturas, paisajes y experiencias únicas
          </h4>
          <p className="text-lg opacity-95 max-w-3xl mx-auto mb-6">
            Aprovecha la infraestructura del corredor para dinamizar el turismo colaborativo, 
            conectando viajeros con experiencias auténticas que fortalecen las economías locales.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white/20 px-4 py-2 rounded-full">2,400 km de oportunidades</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">4 países unidos</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">Infinitas experiencias</span>
          </div>
        </div>
      </div>
    </section>
  )
}
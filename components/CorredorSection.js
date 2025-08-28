export default function CorredorSection() {
  const countries = [
    {
      name: "Argentina",
      regions: ["Salta", "Jujuy"],
      color: "from-[#C4533D] to-[#F2C14E]",
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop"
    },
    {
      name: "Chile",
      regions: ["Antofagasta", "Atacama"],
      color: "from-[#23A69A] to-[#F2C14E]",
      image: "https://media.istockphoto.com/id/813326726/es/foto/portada-roca-formaci%C3%B3n-costa-chilena-reserva-nacional-de-la-portada-antofagasta-chile.jpg?s=2048x2048&w=is&k=20&c=M2hecykqgVZqUnyRWeZQqU3CsrNTO52PT5J9xfV5n4M="
    },
    {
      name: "Paraguay",
      regions: ["Chaco"],
      color: "from-[#F2C14E] to-[#C4533D]",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop"
    },
    {
      name: "Brasil",
      regions: ["Sur de Brasil"],
      color: "from-[#23A69A] to-[#6C3C2D]",
      image: "https://media.istockphoto.com/id/608540602/es/foto/panorama-a%C3%A9reo-de-la-bah%C3%ADa-de-botafogo-r%C3%ADo-de-janeiro.jpg?s=2048x2048&w=is&k=20&c=2o_Y-GgBaVgvDZNgRNHX6tP62PD7hX1R8F-sGQizg4Q="
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {countries.map((country, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="aspect-[4/5] relative">
                <img 
                  src={country.image} 
                  alt={country.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${country.color} opacity-80`}></div>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h4 className="text-2xl font-bold mb-2">{country.name}</h4>
                <div className="space-y-1">
                  {country.regions.map((region, idx) => (
                    <span key={idx} className="block text-sm opacity-90">
                      • {region}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#C4533D] via-[#F2C14E] to-[#23A69A] p-8 rounded-2xl text-center text-white">
          <h4 className="text-2xl font-bold mb-4">
            Un puente entre culturas, paisajes y experiencias únicas
          </h4>
          <p className="text-lg opacity-95 max-w-3xl mx-auto">
            Aprovecha la infraestructura del corredor para dinamizar el turismo colaborativo, 
            conectando viajeros con experiencias auténticas que fortalecen las economías locales.
          </p>
        </div>
      </div>
    </section>
  )
}
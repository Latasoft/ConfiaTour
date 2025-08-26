'use client'
import { useState } from 'react'

export default function HeroSection() {
  const [searchData, setSearchData] = useState({
    destino: '',
    fecha: '',
    tipo: ''
  })

  const handleSearch = () => {
    console.log('Búsqueda:', searchData)
    // Aquí integrarías con tu lógica de búsqueda
    document.getElementById('explorar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Image Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://wallpapers.com/images/high/paine-river-in-chile-nswveb4wuk79w7gs.webp"
          alt="Paine River in Chile"
          className="w-full h-full object-cover filter contrast-105 saturate-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#f6f4f2]/80"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-5 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            Descubre el <span className="text-[#F2C14E]">Corredor Bioceánico</span>
          </h2>


          {/* Search Form */}
          <div className="bg-white p-4 rounded-2xl shadow-2xl max-w-4xl mx-auto transform translate-y-6">
            <div className="flex flex-col text-black md:flex-row gap-3 items-stretch">
              <input
                type="text"
                placeholder="¿A dónde quieres ir?"
                value={searchData.destino}
                onChange={(e) => setSearchData({...searchData, destino: e.target.value})}
                className="flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
              />
              <input
                type="date"
                value={searchData.fecha}
                onChange={(e) => setSearchData({...searchData, fecha: e.target.value})}
                className="p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
              />
              <select
                value={searchData.tipo}
                onChange={(e) => setSearchData({...searchData, tipo: e.target.value})}
                className="p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
              >
                <option value="">Tipo de experiencia</option>
                <option value="cultural">Cultural</option>
                <option value="naturaleza">Naturaleza</option>
                <option value="gastronomia">Gastronomía</option>
                <option value="comunitaria">Comunitaria</option>
                <option value="aventura">Aventura</option>
              </select>
              <button
                onClick={handleSearch}
                className="bg-[#23A69A] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors whitespace-nowrap"
              >
                Buscar Experiencias
              </button>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
              ✨ Experiencias auténticas
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
              🌍 Turismo colaborativo
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
              🤝 Apoyo a comunidades
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
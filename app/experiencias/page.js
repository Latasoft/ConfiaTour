'use client'
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Link from 'next/link'

export default function ExperienciasPage() {
  const [experiencias] = useState([
    {
      id: 1,
      titulo: "Tour Gastronómico por Salta",
      descripcion: "Descubre los sabores únicos de la cocina salteña en un recorrido por restaurantes locales.",
      precio: 120,
      ubicacion: "Salta, Argentina",
      imagen: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 2,
      titulo: "Aventura en el Desierto de Atacama",
      descripcion: "Explora el desierto más árido del mundo y sus increíbles paisajes.",
      precio: 250,
      ubicacion: "Antofagasta, Chile",
      imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 3,
      titulo: "Cultura Guaraní en Paraguay",
      descripcion: "Vive una experiencia única con comunidades guaraníes del Chaco paraguayo.",
      precio: 180,
      ubicacion: "Chaco, Paraguay",
      imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 4,
      titulo: "Playas del Sur de Brasil",
      descripcion: "Relájate en las hermosas costas del sur brasileño con actividades acuáticas.",
      precio: 200,
      ubicacion: "Sur de Brasil",
      imagen: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1200&auto=format&fit=crop"
    }
  ])

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <h1 className="text-4xl text-black font-bold mb-4 md:mb-0">Experiencias</h1>
            
            <Link href="/experiencias/crear">
              <button className="bg-[#23A69A] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors flex items-center gap-2">
                <span className="text-xl">+</span>
                Crear Experiencia
              </button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiencias.map((exp) => (
              <div key={exp.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={exp.imagen}
                  alt={exp.titulo}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{exp.titulo}</h3>
                  <p className="text-gray-600 mb-4">{exp.descripcion}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-[#23A69A]">
                      ${exp.precio}
                    </span>
                    <span className="text-sm text-gray-500">
                      📍 {exp.ubicacion}
                    </span>
                  </div>
                  <button className="w-full bg-[#23A69A] text-white py-2 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
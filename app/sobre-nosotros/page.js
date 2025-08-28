export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <h1 className="text-4xl font-bold text-center mb-12">Sobre Nosotros</h1>
          
          <div className="bg-white p-8 rounded-2xl shadow-xl mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#23A69A]">Nuestra Misión</h2>
            <p className="text-gray-600 mb-6">
              ConfiaTour nace para conectar viajeros con experiencias auténticas en el corredor bioceánico,
              promoviendo el turismo colaborativo y sostenible que beneficia a las comunidades locales.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 text-[#23A69A]">Nuestra Visión</h2>
            <p className="text-gray-600 mb-6">
              Ser la plataforma líder en turismo colaborativo del corredor bioceánico,
              facilitando intercambios culturales significativos y contribuyendo al desarrollo
              económico local de Argentina, Chile, Paraguay y Brasil.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 text-[#23A69A]">Nuestros Valores</h2>
            <ul className="text-gray-600 space-y-2">
              <li>• <strong>Confianza:</strong> Garantizamos transacciones seguras y experiencias verificadas</li>
              <li>• <strong>Colaboración:</strong> Fomentamos la cooperación entre viajeros y comunidades</li>
              <li>• <strong>Sostenibilidad:</strong> Promovemos un turismo responsable y respetuoso</li>
              <li>• <strong>Autenticidad:</strong> Ofrecemos experiencias genuinas y culturalmente ricas</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
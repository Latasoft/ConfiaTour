import Navbar from '../../components/Navbar'

export default function ComoFuncionaPage() {
  const pasos = [
    {
      numero: "1",
      titulo: "Explora",
      descripcion: "Navega por las experiencias disponibles en el corredor bioceánico"
    },
    {
      numero: "2",
      titulo: "Selecciona",
      descripcion: "Elige la experiencia que más te guste y revisa los detalles"
    },
    {
      numero: "3",
      titulo: "Reserva",
      descripcion: "Realiza tu reserva de forma segura con nuestro sistema de pagos"
    },
    {
      numero: "4",
      titulo: "Disfruta",
      descripcion: "Vive una experiencia única y auténtica con los locales"
    }
  ]

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <h1 className="text-4xl font-bold text-center mb-12">¿Cómo Funciona?</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pasos.map((paso, index) => (
              <div key={index} className="text-center">
                <div className="bg-[#23A69A] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {paso.numero}
                </div>
                <h3 className="text-xl font-bold mb-2">{paso.titulo}</h3>
                <p className="text-gray-600">{paso.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
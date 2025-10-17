import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">ConfiaTour</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Tu compañero de confianza para experiencias únicas en Chile. 
              Descubre alojamientos, transporte y tours locales.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="/experiencias" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">→</span> Experiencias
                </a>
              </li>
              <li>
                <a href="/como-funciona" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">→</span> Cómo Funciona
                </a>
              </li>
              <li>
                <a href="/sobre-nosotros" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">→</span> Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="/mis-reservas" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">→</span> Mis Reservas
                </a>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Síguenos</h4>
            <div className="space-y-3">
              <a 
                href="https://instagram.com/confiatour" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-gray-300 hover:text-pink-400 transition-colors duration-200 group"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span>@confiatour</span>
              </a>
              
              <a 
                href="https://facebook.com/confiatour" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200 group"
              >
                <div className="bg-blue-600 p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span>ConfiaTour Chile</span>
              </a>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Contacto</h4>
            <div className="space-y-3">
              <a 
                href="https://wa.me/56912345678?text=Hola, necesito información sobre los servicios de ConfiaTour"
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-gray-300 hover:text-green-400 transition-colors duration-200 group"
              >
                <div className="bg-green-500 p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">WhatsApp</div>
                  <div className="text-sm text-gray-400">+56 9 1234 5678</div>
                </div>
              </a>

              <div className="flex items-center text-gray-300">
                <div className="bg-gray-600 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-400">info@confiatour.cl</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 ConfiaTour. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/terminos" className="text-gray-400 hover:text-white transition-colors duration-200">
                Términos y Condiciones
              </a>
              <a href="/privacidad" className="text-gray-400 hover:text-white transition-colors duration-200">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
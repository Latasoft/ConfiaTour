'use client'

export default function GlobalError({ error }) {
  if (typeof window !== 'undefined') {
    console.error('Global error:', error)
  }
  
  return (
    <html lang="es">
      <body>
        <div>
          <h1>Error</h1>
          <p>Algo salió mal. Por favor recarga la página.</p>
          <button onClick={() => window.location.href = '/'}>Volver al inicio</button>
        </div>
      </body>
    </html>
  )
}

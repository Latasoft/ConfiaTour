'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])
  return (
    <html lang="es">
      <body style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f6f4f2',
        padding: '20px',
        margin: 0,
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '72px', color: '#dc3545', margin: '0' }}>Error</h1>
          <h2 style={{ fontSize: '32px', color: '#333', marginTop: '10px' }}>Algo salió mal</h2>
          <p style={{ fontSize: '18px', color: '#666', marginTop: '20px' }}>
            Lo sentimos, ocurrió un error crítico. Por favor recarga la página.
          </p>
          <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 30px',
                backgroundColor: '#23A69A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Volver al inicio
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 30px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f6f4f2',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <h1 style={{ fontSize: '72px', color: '#dc3545', margin: '0' }}>500</h1>
        <h2 style={{ fontSize: '32px', color: '#333', marginTop: '10px' }}>Algo salió mal</h2>
        <p style={{ fontSize: '18px', color: '#666', marginTop: '20px' }}>
          Lo sentimos, ocurrió un error inesperado. Por favor intenta nuevamente.
        </p>
        <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 30px',
              backgroundColor: '#23A69A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
          >
            Intentar de nuevo
          </button>
          <Link 
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.3s'
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

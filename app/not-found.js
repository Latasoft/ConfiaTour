import Link from 'next/link'

export default function NotFound() {
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
        <h1 style={{ fontSize: '72px', color: '#23A69A', margin: '0' }}>404</h1>
        <h2 style={{ fontSize: '32px', color: '#333', marginTop: '10px' }}>Página no encontrada</h2>
        <p style={{ fontSize: '18px', color: '#666', marginTop: '20px' }}>
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link 
          href="/"
          style={{
            display: 'inline-block',
            marginTop: '30px',
            padding: '12px 30px',
            backgroundColor: '#23A69A',
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
  )
}

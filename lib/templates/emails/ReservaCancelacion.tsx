import * as React from 'react'
import { Reserva, Experiencia } from '@/types'

interface ReservaCancelacionProps {
  reserva: Reserva
  experiencia: Experiencia
  nombreUsuario: string
}

export const ReservaCancelacion: React.FC<ReservaCancelacionProps> = ({
  reserva,
  experiencia,
  nombreUsuario,
}) => {
  const fechaExperiencia = new Date(reserva.fecha_experiencia).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', backgroundColor: '#f6f4f2', margin: 0, padding: 0 }}>
      <table style={{ width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
          {/* Header */}
          <tr>
            <td style={{ backgroundColor: '#dc3545', padding: '30px 20px', textAlign: 'center' }}>
              <h1 style={{ color: '#ffffff', margin: 0, fontSize: '28px' }}>ConfiaTour</h1>
              <p style={{ color: '#ffffff', margin: '10px 0 0 0', fontSize: '16px' }}>Reserva Cancelada</p>
            </td>
          </tr>

          {/* Saludo */}
          <tr>
            <td style={{ padding: '30px 20px' }}>
              <h2 style={{ color: '#dc3545', marginTop: 0 }}>Hola {nombreUsuario},</h2>
              <p style={{ fontSize: '16px' }}>
                Tu reserva ha sido cancelada exitosamente. A continuación los detalles:
              </p>
            </td>
          </tr>

          {/* Detalles de la Experiencia Cancelada */}
          <tr>
            <td style={{ padding: '0 20px 20px 20px' }}>
              <div style={{ backgroundColor: '#f8d7da', padding: '20px', borderRadius: '8px', border: '1px solid #dc3545' }}>
                <h3 style={{ color: '#dc3545', marginTop: 0, fontSize: '20px' }}>{experiencia.titulo}</h3>
                
                <table style={{ width: '100%', fontSize: '14px' }}>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#721c24', width: '40%' }}>Fecha:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{fechaExperiencia}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#721c24' }}>Ubicación:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{experiencia.ubicacion}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#721c24' }}>Personas:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{reserva.cantidad_personas}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#721c24' }}>Código de Reserva:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{reserva.id}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 0', color: '#721c24', fontSize: '16px' }}>Monto:</td>
                    <td style={{ padding: '12px 0', fontWeight: 'bold', fontSize: '18px' }}>
                      ${reserva.precio_total.toLocaleString()} CLP
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          {/* Información de Reembolso */}
          <tr>
            <td style={{ padding: '0 20px 20px 20px' }}>
              <div style={{ backgroundColor: '#d1ecf1', padding: '20px', borderRadius: '8px', border: '1px solid #0c5460' }}>
                <h3 style={{ color: '#0c5460', marginTop: 0, fontSize: '18px' }}>Información de Reembolso</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#0c5460' }}>
                  El reembolso de <strong>${reserva.precio_total.toLocaleString()} CLP</strong> será procesado en los próximos 5-10 días hábiles.
                  El dinero será devuelto al mismo método de pago utilizado en la compra.
                </p>
              </div>
            </td>
          </tr>

          {/* Explorar más experiencias */}
          <tr>
            <td style={{ padding: '0 20px 30px 20px' }}>
              <p style={{ fontSize: '16px', textAlign: 'center' }}>
                ¿Buscas otra experiencia? Explora nuestro catálogo de actividades únicas.
              </p>
            </td>
          </tr>

          {/* Call to Action */}
          <tr>
            <td style={{ padding: '0 20px 30px 20px', textAlign: 'center' }}>
              <a 
                href="https://confiatour.com/experiencias" 
                style={{ 
                  display: 'inline-block', 
                  backgroundColor: '#23A69A', 
                  color: '#ffffff', 
                  padding: '12px 30px', 
                  textDecoration: 'none', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Explorar Experiencias
              </a>
            </td>
          </tr>

          {/* Footer */}
          <tr>
            <td style={{ backgroundColor: '#f6f4f2', padding: '20px', textAlign: 'center', borderTop: '1px solid #e5e5e5' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                ¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@confiatour.com" style={{ color: '#23A69A' }}>soporte@confiatour.com</a>
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                © 2025 ConfiaTour. Plataforma de Turismo Regional Colaborativo.
              </p>
            </td>
          </tr>
        </table>
    </div>
  )
}

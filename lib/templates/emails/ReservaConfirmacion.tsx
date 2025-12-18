import * as React from 'react'
import { Reserva, Experiencia } from '@/types'

interface ReservaConfirmacionProps {
  reserva: Reserva
  experiencia: Experiencia
  nombreUsuario: string
}

export const ReservaConfirmacion: React.FC<ReservaConfirmacionProps> = ({
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
            <td style={{ backgroundColor: '#23A69A', padding: '30px 20px', textAlign: 'center' }}>
              <h1 style={{ color: '#ffffff', margin: 0, fontSize: '28px' }}>ConfiaTour</h1>
              <p style={{ color: '#ffffff', margin: '10px 0 0 0', fontSize: '16px' }}>¡Tu reserva está confirmada!</p>
            </td>
          </tr>

          {/* Saludo */}
          <tr>
            <td style={{ padding: '30px 20px' }}>
              <h2 style={{ color: '#23A69A', marginTop: 0 }}>¡Hola {nombreUsuario}!</h2>
              <p style={{ fontSize: '16px' }}>
                Tu reserva ha sido confirmada exitosamente. Aquí están los detalles de tu experiencia:
              </p>
            </td>
          </tr>

          {/* Detalles de la Experiencia */}
          <tr>
            <td style={{ padding: '0 20px 20px 20px' }}>
              <div style={{ backgroundColor: '#f6f4f2', padding: '20px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
                <h3 style={{ color: '#23A69A', marginTop: 0, fontSize: '20px' }}>{experiencia.titulo}</h3>
                
                <table style={{ width: '100%', fontSize: '14px' }}>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666', width: '40%' }}>Fecha:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{fechaExperiencia}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Ubicación:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{experiencia.ubicacion}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Personas:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{reserva.cantidad_personas}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Duración:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{experiencia.duracion}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Categoría:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold', textTransform: 'capitalize' }}>{experiencia.categoria}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          {/* Detalles de Pago */}
          <tr>
            <td style={{ padding: '0 20px 20px 20px' }}>
              <div style={{ backgroundColor: '#e8f5f4', padding: '20px', borderRadius: '8px', border: '1px solid #23A69A' }}>
                <h3 style={{ color: '#23A69A', marginTop: 0, fontSize: '18px' }}>Información de Pago</h3>
                
                <table style={{ width: '100%', fontSize: '14px' }}>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Código de Reserva:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{reserva.id}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Método de Pago:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold', textTransform: 'capitalize' }}>{reserva.metodo_pago}</td>
                  </tr>
                  {reserva.codigo_autorizacion && (
                    <tr>
                      <td style={{ padding: '8px 0', color: '#666' }}>Código de Autorización:</td>
                      <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{reserva.codigo_autorizacion}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '12px 0', color: '#666', fontSize: '16px' }}>Total Pagado:</td>
                    <td style={{ padding: '12px 0', fontWeight: 'bold', fontSize: '20px', color: '#23A69A' }}>
                      ${reserva.precio_total.toLocaleString()} CLP
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          {/* Información Importante */}
          <tr>
            <td style={{ padding: '0 20px 20px 20px' }}>
              <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffc107' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                  <strong>Importante:</strong> Recuerda que puedes cancelar tu reserva hasta 24 horas antes de la fecha de la experiencia.
                </p>
              </div>
            </td>
          </tr>

          {/* Call to Action */}
          <tr>
            <td style={{ padding: '0 20px 30px 20px', textAlign: 'center' }}>
              <a 
                href="https://confiatour.com/mis-reservas" 
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
                Ver Mis Reservas
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

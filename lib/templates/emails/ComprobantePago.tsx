import * as React from 'react'
import { Reserva, Experiencia } from '@/types'

interface ComprobantePagoProps {
  reserva: Reserva
  experiencia: Experiencia
  nombreUsuario: string
}

export const ComprobantePago: React.FC<ComprobantePagoProps> = ({
  reserva,
  experiencia,
  nombreUsuario,
}) => {
  const fechaPago = reserva.fecha_pago 
    ? new Date(reserva.fecha_pago).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A'

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', backgroundColor: '#f6f4f2', margin: 0, padding: 0 }}>
      <table style={{ width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
          {/* Header */}
          <tr>
            <td style={{ backgroundColor: '#23A69A', padding: '30px 20px', textAlign: 'center' }}>
              <h1 style={{ color: '#ffffff', margin: 0, fontSize: '28px' }}>ConfiaTour</h1>
              <p style={{ color: '#ffffff', margin: '10px 0 0 0', fontSize: '16px' }}>Comprobante de Pago</p>
            </td>
          </tr>

          {/* Saludo */}
          <tr>
            <td style={{ padding: '30px 20px' }}>
              <h2 style={{ color: '#23A69A', marginTop: 0 }}>Hola {nombreUsuario},</h2>
              <p style={{ fontSize: '16px' }}>
                Este es tu comprobante electrónico de pago. Guárdalo para tu referencia.
              </p>
            </td>
          </tr>

          {/* Comprobante de Pago */}
          <tr>
            <td style={{ padding: '0 20px 20px 20px' }}>
              <div style={{ backgroundColor: '#f6f4f2', padding: '20px', borderRadius: '8px', border: '2px solid #23A69A' }}>
                <h3 style={{ color: '#23A69A', marginTop: 0, fontSize: '20px', textAlign: 'center', borderBottom: '2px solid #23A69A', paddingBottom: '10px' }}>
                  COMPROBANTE ELECTRÓNICO
                </h3>
                
                <table style={{ width: '100%', fontSize: '14px', marginTop: '15px' }}>
                  <tr>
                    <td colSpan={2} style={{ padding: '10px 0', fontSize: '16px', fontWeight: 'bold', color: '#23A69A' }}>
                      DATOS DE LA TRANSACCIÓN
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666', width: '50%' }}>Código de Reserva:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{reserva.id.substring(0, 12)}...</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Fecha de Pago:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{fechaPago}</td>
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
                  {reserva.buy_order && (
                    <tr>
                      <td style={{ padding: '8px 0', color: '#666' }}>Orden de Compra:</td>
                      <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{reserva.buy_order}</td>
                    </tr>
                  )}
                  
                  <tr>
                    <td colSpan={2} style={{ padding: '20px 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#23A69A', borderTop: '1px solid #ddd' }}>
                      DETALLES DEL SERVICIO
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Experiencia:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{experiencia.titulo}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Categoría:</td>
                    <td style={{ padding: '8px 0', textTransform: 'capitalize' }}>{experiencia.categoria}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Ubicación:</td>
                    <td style={{ padding: '8px 0' }}>{experiencia.ubicacion}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Cantidad de Personas:</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{reserva.cantidad_personas}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Precio por Persona:</td>
                    <td style={{ padding: '8px 0' }}>${experiencia.precio.toLocaleString()} {experiencia.moneda}</td>
                  </tr>
                  
                  <tr>
                    <td colSpan={2} style={{ padding: '15px 0 0 0', borderTop: '2px solid #23A69A' }}>
                      <table style={{ width: '100%' }}>
                        <tr>
                          <td style={{ fontSize: '18px', fontWeight: 'bold', color: '#23A69A' }}>TOTAL PAGADO:</td>
                          <td style={{ fontSize: '24px', fontWeight: 'bold', color: '#23A69A', textAlign: 'right' }}>
                            ${reserva.precio_total.toLocaleString()} CLP
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          {/* Información Fiscal */}
          <tr>
            <td style={{ padding: '0 20px 20px 20px' }}>
              <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffc107' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#856404' }}>
                  Este comprobante es válido como constancia de pago electrónico. 
                  Para consultas fiscales, contáctanos en soporte@confiatour.com
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
              <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#999' }}>
                ConfiaTour - RUT: XX.XXX.XXX-X - Turismo Regional Colaborativo
              </p>
            </td>
          </tr>
        </table>
    </div>
  )
}

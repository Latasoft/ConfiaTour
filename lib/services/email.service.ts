import { Reserva, Experiencia, ReservaEmailData } from '@/types'

// Cargar Resend dinámicamente para evitar errores durante el build
let resend: any = null
const getResend = async () => {
  if (!resend) {
    const { Resend } = await import('resend')
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'ConfiaTour <onboarding@resend.dev>'

// Helpers para generar HTML de emails
const generateConfirmacionHTML = (reserva: Reserva, experiencia: Experiencia, nombreUsuario: string) => {
  const fechaExperiencia = new Date(reserva.fecha_experiencia).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f6f4f2; margin: 0; padding: 20px;">
  <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background-color: #23A69A; padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">ConfiaTour</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">¡Tu reserva está confirmada!</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 20px;">
        <h2 style="color: #23A69A; margin-top: 0;">¡Hola ${nombreUsuario}!</h2>
        <p style="font-size: 16px;">Tu reserva ha sido confirmada exitosamente. Aquí están los detalles:</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 20px 20px;">
        <div style="background-color: #f6f4f2; padding: 20px; border-radius: 8px; border: 1px solid #e5e5e5;">
          <h3 style="color: #23A69A; margin-top: 0; font-size: 20px;">${experiencia.titulo}</h3>
          <p><strong>📅 Fecha:</strong> ${fechaExperiencia}</p>
          <p><strong>📍 Ubicación:</strong> ${experiencia.ubicacion}</p>
          <p><strong>👥 Personas:</strong> ${reserva.cantidad_personas}</p>
          <p><strong>⏱️ Duración:</strong> ${experiencia.duracion}</p>
          <p><strong>🏷️ Categoría:</strong> ${experiencia.categoria}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 20px 20px;">
        <div style="background-color: #e8f5f4; padding: 20px; border-radius: 8px; border: 1px solid #23A69A;">
          <h3 style="color: #23A69A; margin-top: 0; font-size: 18px;">💰 Información de Pago</h3>
          <p><strong>Código de Reserva:</strong> ${reserva.id}</p>
          <p><strong>Método de Pago:</strong> ${reserva.metodo_pago}</p>
          ${reserva.codigo_autorizacion ? `<p><strong>Código de Autorización:</strong> ${reserva.codigo_autorizacion}</p>` : ''}
          <p style="font-size: 20px; color: #23A69A;"><strong>Total Pagado: $${reserva.precio_total.toLocaleString()} CLP</strong></p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 30px 20px; text-align: center;">
        <a href="https://confiatour.com/mis-reservas" style="display: inline-block; background-color: #23A69A; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Ver Mis Reservas</a>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f6f4f2; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@confiatour.com" style="color: #23A69A;">soporte@confiatour.com</a></p>
        <p style="margin: 0; font-size: 12px; color: #999;">© 2025 ConfiaTour. Plataforma de Turismo Regional Colaborativo.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

const generateCancelacionHTML = (reserva: Reserva, experiencia: Experiencia, nombreUsuario: string) => {
  const fechaExperiencia = new Date(reserva.fecha_experiencia).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f6f4f2; margin: 0; padding: 20px;">
  <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background-color: #dc3545; padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">ConfiaTour</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Reserva Cancelada</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 20px;">
        <h2 style="color: #dc3545; margin-top: 0;">Hola ${nombreUsuario},</h2>
        <p style="font-size: 16px;">Tu reserva ha sido cancelada exitosamente.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 20px 20px;">
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; border: 1px solid #dc3545;">
          <h3 style="color: #dc3545; margin-top: 0;">${experiencia.titulo}</h3>
          <p><strong>📅 Fecha:</strong> ${fechaExperiencia}</p>
          <p><strong>👥 Personas:</strong> ${reserva.cantidad_personas}</p>
          <p><strong>Monto:</strong> $${reserva.precio_total.toLocaleString()} CLP</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 20px 20px;">
        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; border: 1px solid #0c5460;">
          <h3 style="color: #0c5460; margin-top: 0;">💳 Información de Reembolso</h3>
          <p style="margin: 0; color: #0c5460;">El reembolso de <strong>$${reserva.precio_total.toLocaleString()} CLP</strong> será procesado en los próximos 5-10 días hábiles.</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 30px 20px; text-align: center;">
        <a href="https://confiatour.com/experiencias" style="display: inline-block; background-color: #23A69A; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Explorar Experiencias</a>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f6f4f2; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@confiatour.com" style="color: #23A69A;">soporte@confiatour.com</a></p>
        <p style="margin: 0; font-size: 12px; color: #999;">© 2025 ConfiaTour.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

const generateComprobanteHTML = (reserva: Reserva, experiencia: Experiencia, nombreUsuario: string) => {
  const fechaPago = reserva.fecha_pago 
    ? new Date(reserva.fecha_pago).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f6f4f2; margin: 0; padding: 20px;">
  <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background-color: #23A69A; padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">ConfiaTour</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Comprobante de Pago</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 20px;">
        <h2 style="color: #23A69A; margin-top: 0;">Hola ${nombreUsuario},</h2>
        <p style="font-size: 16px;">Este es tu comprobante electrónico de pago.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 20px 20px;">
        <div style="background-color: #f6f4f2; padding: 20px; border-radius: 8px; border: 2px solid #23A69A;">
          <h3 style="color: #23A69A; text-align: center; border-bottom: 2px solid #23A69A; padding-bottom: 10px;">COMPROBANTE ELECTRÓNICO</h3>
          <p><strong>Código de Reserva:</strong> ${reserva.id.substring(0, 12)}...</p>
          <p><strong>Fecha de Pago:</strong> ${fechaPago}</p>
          <p><strong>Método de Pago:</strong> ${reserva.metodo_pago}</p>
          ${reserva.codigo_autorizacion ? `<p><strong>Código de Autorización:</strong> ${reserva.codigo_autorizacion}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <p><strong>Experiencia:</strong> ${experiencia.titulo}</p>
          <p><strong>Categoría:</strong> ${experiencia.categoria}</p>
          <p><strong>Cantidad:</strong> ${reserva.cantidad_personas} personas</p>
          <hr style="border: none; border-top: 2px solid #23A69A; margin: 15px 0;">
          <p style="font-size: 24px; color: #23A69A; text-align: right;"><strong>TOTAL: $${reserva.precio_total.toLocaleString()} CLP</strong></p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f6f4f2; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="margin: 0; font-size: 12px; color: #999;">© 2025 ConfiaTour - Comprobante Electrónico Válido</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export class EmailService {
  /**
   * Envía email de confirmación de reserva
   */
  async sendReservaConfirmation(data: ReservaEmailData): Promise<void> {
    try {
      const { reserva, experiencia, usuario } = data

      const emailHtml = generateConfirmacionHTML(reserva, experiencia, usuario.nombre)

      const resendClient = await getResend()
      await resendClient.emails.send({
        from: FROM_EMAIL,
        to: usuario.email,
        subject: `✅ Reserva Confirmada - ${experiencia.titulo}`,
        html: emailHtml,
      })

      console.log(`✅ Email de confirmación enviado a ${usuario.email}`)
    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error)
      // No lanzar error para no interrumpir el flujo de reserva
      // En producción, podrías querer reintentar o guardar en una cola
    }
  }

  /**
   * Envía email de cancelación de reserva
   */
  async sendReservaCancellation(data: ReservaEmailData): Promise<void> {
    try {
      const { reserva, experiencia, usuario } = data

      const emailHtml = generateCancelacionHTML(reserva, experiencia, usuario.nombre)

      const resendClient = await getResend()
      await resendClient.emails.send({
        from: FROM_EMAIL,
        to: usuario.email,
        subject: `❌ Reserva Cancelada - ${experiencia.titulo}`,
        html: emailHtml,
      })

      console.log(`✅ Email de cancelación enviado a ${usuario.email}`)
    } catch (error) {
      console.error('❌ Error enviando email de cancelación:', error)
    }
  }

  /**
   * Envía comprobante de pago electrónico
   */
  async sendPaymentReceipt(data: ReservaEmailData): Promise<void> {
    try {
      const { reserva, experiencia, usuario } = data

      const emailHtml = generateComprobanteHTML(reserva, experiencia, usuario.nombre)

      const resendClient = await getResend()
      await resendClient.emails.send({
        from: FROM_EMAIL,
        to: usuario.email,
        subject: `🧾 Comprobante de Pago - ${experiencia.titulo}`,
        html: emailHtml,
      })

      console.log(`✅ Comprobante de pago enviado a ${usuario.email}`)
    } catch (error) {
      console.error('❌ Error enviando comprobante de pago:', error)
    }
  }

  /**
   * Envía email al guía/proveedor notificando nueva reserva
   */
  async sendNewReservaToProvider(
    providerEmail: string,
    providerName: string,
    data: ReservaEmailData
  ): Promise<void> {
    try {
      const { reserva, experiencia, usuario } = data
      
      const fechaExperiencia = new Date(reserva.fecha_experiencia).toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const resendClient = await getResend()
      await resendClient.emails.send({
        from: FROM_EMAIL,
        to: providerEmail,
        subject: `🎉 Nueva Reserva - ${experiencia.titulo}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #23A69A;">¡Hola ${providerName}!</h2>
                <p>Tienes una nueva reserva para tu experiencia:</p>
                
                <div style="background-color: #f6f4f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">${experiencia.titulo}</h3>
                  <p><strong>Cliente:</strong> ${usuario.nombre}</p>
                  <p><strong>Email del cliente:</strong> ${usuario.email}</p>
                  <p><strong>Fecha:</strong> ${fechaExperiencia}</p>
                  <p><strong>Personas:</strong> ${reserva.cantidad_personas}</p>
                  <p><strong>Total:</strong> $${reserva.precio_total.toLocaleString()} CLP</p>
                  <p><strong>Código de reserva:</strong> ${reserva.id}</p>
                </div>
                
                <p>Asegúrate de estar preparado para recibir a tus clientes.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://confiatour.com/mis-experiencias" 
                     style="background-color: #23A69A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                    Ver Mis Experiencias
                  </a>
                </div>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #666; text-align: center;">
                  © 2025 ConfiaTour - Plataforma de Turismo Regional Colaborativo
                </p>
              </div>
            </body>
          </html>
        `,
      })

      console.log(`✅ Notificación de nueva reserva enviada al proveedor ${providerEmail}`)
    } catch (error) {
      console.error('❌ Error enviando notificación al proveedor:', error)
    }
  }
}

// Exportar instancia singleton
export const emailService = new EmailService()

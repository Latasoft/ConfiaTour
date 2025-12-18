import { Reserva, Experiencia, ReservaEmailData } from '@/types'
import nodemailer from 'nodemailer'

// Configuración del transportador de Gmail
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

const FROM_EMAIL = process.env.GMAIL_USER || 'ConfiaTour <noreply@confiatour.cl>'

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
          <p><strong>Fecha:</strong> ${fechaExperiencia}</p>
          <p><strong>Ubicación:</strong> ${experiencia.ubicacion}</p>
          <p><strong>Personas:</strong> ${reserva.cantidad_personas}</p>
          <p><strong>Duración:</strong> ${experiencia.duracion}</p>
          <p><strong>Categoría:</strong> ${experiencia.categoria}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 20px 20px;">
        <div style="background-color: #e8f5f4; padding: 20px; border-radius: 8px; border: 1px solid #23A69A;">
          <h3 style="color: #23A69A; margin-top: 0; font-size: 18px;">Información de Pago</h3>
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
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@confiatour.cl" style="color: #23A69A;">soporte@confiatour.cl</a></p>
        <p style="margin: 0; font-size: 12px; color: #999;">© 2025 ConfiaTour. Plataforma de Turismo Regional Colaborativo.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

const generateCancelacionAdminHTML = (reserva: Reserva, experiencia: Experiencia, nombreUsuario: string, emailUsuario: string) => {
  const fechaExperiencia = new Date(reserva.fecha_experiencia).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const fechaCancelacion = new Date(reserva.fecha_cancelacion || new Date()).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f6f4f2; margin: 0; padding: 20px;">
  <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background-color: #ff6b6b; padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Cancelación de Reserva</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Se requiere procesamiento de reembolso</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 20px;">
        <h2 style="color: #ff6b6b; margin-top: 0;">Nueva Cancelación</h2>
        <p style="font-size: 16px;">Un usuario ha cancelado su reserva. Se requiere procesar el reembolso manualmente.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 20px 20px;">
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border: 1px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">Datos de Reembolso</h3>
          <p><strong>Monto a reembolsar:</strong> $${reserva.precio_total.toLocaleString()} CLP</p>
          <p><strong>Método de pago:</strong> ${reserva.metodo_pago === 'transbank' ? 'Transbank' : 'MercadoPago'}</p>
          ${reserva.codigo_autorizacion ? `<p><strong>Código autorización:</strong> ${reserva.codigo_autorizacion}</p>` : ''}
          <p><strong>Buy Order:</strong> ${reserva.buy_order || 'N/A'}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 20px 20px;">
        <div style="background-color: #f6f4f2; padding: 20px; border-radius: 8px; border: 1px solid #e5e5e5;">
          <h3 style="color: #23A69A; margin-top: 0;">Detalles de la Reserva</h3>
          <p><strong>ID Reserva:</strong> ${reserva.id}</p>
          <p><strong>Experiencia:</strong> ${experiencia.titulo}</p>
          <p><strong>Fecha experiencia:</strong> ${fechaExperiencia}</p>
          <p><strong>Personas:</strong> ${reserva.cantidad_personas}</p>
          <p><strong>Fecha cancelación:</strong> ${fechaCancelacion}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 20px 20px;">
        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; border: 1px solid #007bff;">
          <h3 style="color: #004085; margin-top: 0;">👤 Datos del Usuario</h3>
          <p><strong>Nombre:</strong> ${nombreUsuario}</p>
          <p><strong>Email:</strong> ${emailUsuario}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 30px 20px;">
        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #0c5460;">
          <p style="margin: 0; color: #0c5460;"><strong>📌 Acción Requerida:</strong> Procesa el reembolso en Transbank y marca la transacción como reembolsada en el sistema.</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 30px 20px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/admin/reservas" style="display: inline-block; background-color: #ff6b6b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Ver en Panel Admin</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
        <p style="margin: 0;">© 2024 ConfiaTour - Sistema de Notificaciones Administrativas</p>
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
          <p><strong>Fecha:</strong> ${fechaExperiencia}</p>
          <p><strong>Personas:</strong> ${reserva.cantidad_personas}</p>
          <p><strong>Monto:</strong> $${reserva.precio_total.toLocaleString()} CLP</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 20px 20px 20px;">
        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; border: 1px solid #0c5460;">
          <h3 style="color: #0c5460; margin-top: 0;">Información de Reembolso</h3>
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
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@confiatour.cl" style="color: #23A69A;">soporte@confiatour.cl</a></p>
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

const generateProveedorHTML = (providerName: string, reserva: Reserva, experiencia: Experiencia, nombreUsuario: string, emailUsuario: string) => {
  const fechaExperiencia = new Date(reserva.fecha_experiencia).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Reserva - ConfiaTour</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
  <table style="width: 100%; max-width: 600px; margin: 40px auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Nueva Reserva</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Tienes una nueva reserva confirmada</p>
      </td>
    </tr>
    
    <tr>
      <td style="padding: 30px;">
        <div style="display: inline-block; background-color: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
          CONFIRMADA
        </div>
        
        <h2 style="color: #111827; margin-top: 10px;">Hola ${providerName},</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Has recibido una nueva reserva para tu experiencia. El pago ya fue confirmado.
        </p>

        <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 16px; color: #111827; font-size: 16px;">Detalles de la Reserva</h3>
          
          <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">Número de Reserva</span><br>
            <span style="color: #111827; font-weight: 600; font-size: 14px;">#${reserva.id.substring(0, 12)}</span>
          </div>
          
          <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">Experiencia</span><br>
            <span style="color: #111827; font-weight: 600; font-size: 14px;">${experiencia.titulo}</span>
          </div>
          
          <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">Ubicación</span><br>
            <span style="color: #111827; font-weight: 600; font-size: 14px;">${experiencia.ubicacion}</span>
          </div>
          
          <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">Fecha</span><br>
            <span style="color: #111827; font-weight: 600; font-size: 14px;">${fechaExperiencia}</span>
          </div>
          
          <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">Personas</span><br>
            <span style="color: #111827; font-weight: 600; font-size: 14px;">${reserva.cantidad_personas}</span>
          </div>
          
          <div style="padding: 8px 0;">
            <span style="color: #6b7280; font-size: 14px;">Ingreso Total</span><br>
            <span style="color: #10b981; font-weight: 600; font-size: 18px;">
              $${reserva.precio_total.toLocaleString('es-CL')} CLP
            </span>
          </div>
        </div>

        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 12px; color: #111827; font-size: 16px;">👤 Información del Cliente</h3>
          
          <div style="padding: 8px 0; border-bottom: 1px solid #fde68a;">
            <span style="color: #92400e; font-size: 14px;">Nombre</span><br>
            <span style="color: #111827; font-weight: 600; font-size: 14px;">${nombreUsuario}</span>
          </div>
          
          <div style="padding: 8px 0;">
            <span style="color: #92400e; font-size: 14px;">Email</span><br>
            <span style="color: #111827; font-weight: 600; font-size: 14px;">${emailUsuario}</span>
          </div>
        </div>

        <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>📋 Próximos pasos:</strong><br>
            1. Confirma tu disponibilidad para la fecha<br>
            2. Prepara todo lo necesario para la experiencia<br>
            3. Contacta al cliente si necesitas coordinar detalles
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_URL || 'https://confiatour.cl'}/mis-experiencias" 
             style="display: inline-block; background-color: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Ver Mis Experiencias
          </a>
        </div>
      </td>
    </tr>

    <tr>
      <td style="background-color: #f9fafb; padding: 20px; text-align: center;">
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px;">Este es un email automático de ConfiaTour</p>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">Si tienes dudas, contacta a soporte@confiatour.cl</p>
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

      const transporter = getTransporter()
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: usuario.email,
        subject: `✅ Reserva Confirmada - ${experiencia.titulo}`,
        html: emailHtml,
      })

      console.log(`✅ Email de confirmación enviado a ${usuario.email}`)
    } catch (error) {
      console.error('[ERROR] Error enviando email de confirmación:', error)
      // No lanzar error para no interrumpir el flujo de reserva
    }
  }

  /**
   * Envía email de cancelación de reserva
   */
  async sendReservaCancellation(data: ReservaEmailData): Promise<void> {
    try {
      const { reserva, experiencia, usuario } = data
      const transporter = getTransporter()

      // 1. Email al usuario
      const emailHtml = generateCancelacionHTML(reserva, experiencia, usuario.nombre)
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: usuario.email,
        subject: `Reserva Cancelada - ${experiencia.titulo}`,
        html: emailHtml,
      })

      console.log(`✅ Email de cancelación enviado a ${usuario.email}`)

      // 2. Email al admin para procesar reembolso
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'admin@confiatour.cl'
      const adminHtml = generateCancelacionAdminHTML(reserva, experiencia, usuario.nombre, usuario.email)
      
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: adminEmail,
        subject: `[ADMIN] Reembolso Requerido - Reserva ${reserva.id.substring(0, 8)}`,
        html: adminHtml,
      })

      console.log(`✅ Notificación de reembolso enviada al admin: ${adminEmail}`)
    } catch (error) {
      console.error('[ERROR] Error enviando email de cancelación:', error)
    }
  }

  /**
   * Envía comprobante de pago electrónico
   */
  async sendPaymentReceipt(data: ReservaEmailData): Promise<void> {
    try {
      const { reserva, experiencia, usuario } = data

      const emailHtml = generateComprobanteHTML(reserva, experiencia, usuario.nombre)

      const transporter = getTransporter()
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: usuario.email,
        subject: `🧾 Comprobante de Pago - ${experiencia.titulo}`,
        html: emailHtml,
      })

      console.log(`✅ Comprobante de pago enviado a ${usuario.email}`)
    } catch (error) {
      console.error('[ERROR] Error enviando comprobante de pago:', error)
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
      
      const emailHtml = generateProveedorHTML(providerName, reserva, experiencia, usuario.nombre, usuario.email)

      const transporter = getTransporter()
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: providerEmail,
        subject: `🎉 Nueva Reserva - ${experiencia.titulo}`,
        html: emailHtml,
      })

      console.log(`✅ Notificación de nueva reserva enviada al proveedor ${providerEmail}`)
    } catch (error) {
      console.error('[ERROR] Error enviando notificación al proveedor:', error)
    }
  }
}

// Exportar instancia singleton
export const emailService = new EmailService()

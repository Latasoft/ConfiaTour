'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export const dynamic = 'force-dynamic'

function TransbankReturnContent() {
  const [loading, setLoading] = useState(true)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const procesarRetorno = async () => {
      try {
        console.log('🔄 Procesando retorno de Transbank...')
        
        const token = searchParams.get('token_ws')
        const reservaId = searchParams.get('reserva_id')
        const experienciaId = searchParams.get('experiencia_id')
        
        console.log('📊 Parámetros recibidos:', { token, reservaId, experienciaId })

        if (!token) {
          throw new Error('Token no encontrado en la respuesta')
        }

        console.log('🚀 Llamando API de confirmación...')
        
        const response = await fetch('/api/transbank/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        })

        console.log('📡 Respuesta de API:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })

        // Obtener el texto de la respuesta primero
        const responseText = await response.text()
        console.log('📄 Texto de respuesta:', responseText)

        // Intentar parsear como JSON
        let result
        try {
          result = JSON.parse(responseText)
        } catch (parseError) {
          console.error('💥 Error parseando JSON:', parseError)
          throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}...`)
        }

        if (!response.ok) {
          console.error('❌ Error en API:', result)
          throw new Error(result.error || `Error HTTP ${response.status}`)
        }

        console.log('📋 Resultado parseado:', result)

        if (!result.success) {
          throw new Error(result.error || 'Error desconocido en la confirmación')
        }

        const estadoParsed = result.parsed

        // Actualizar la reserva en base de datos
        if (reservaId) {
          const estadoReserva = estadoParsed.status === 'AUTHORIZED' ? 'confirmada' : 'cancelada'
          const pagado = estadoParsed.status === 'AUTHORIZED'
          
          console.log('💾 Actualizando reserva...', { 
            reservaId, 
            estadoReserva, 
            pagado,
            authCode: estadoParsed.authorizationCode 
          })
          
          const { error: updateError } = await supabase
            .from('reservas')
            .update({
              estado: estadoReserva,
              pagado: pagado,
              codigo_autorizacion: estadoParsed.authorizationCode,
              fecha_pago: pagado ? new Date().toISOString() : null,
              detalles_pago: JSON.stringify(estadoParsed)
            })
            .eq('id', reservaId)

          if (updateError) {
            console.error('❌ Error actualizando reserva:', updateError)
            throw updateError
          }

          console.log('✅ Reserva actualizada correctamente')
        }

        setResultado({
          exitoso: estadoParsed.status === 'AUTHORIZED',
          estado: estadoParsed,
          reservaId,
          experienciaId
        })

      } catch (error) {
        console.error('💥 Error procesando retorno:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    procesarRetorno()
  }, [searchParams])

  const handleContinuar = () => {
    if (resultado?.exitoso) {
      // Redirigir a página de confirmación o mis reservas
      router.push('/mis-reservas')
    } else {
      // Volver a la experiencia
      router.push(`/experiencias/${resultado?.experienciaId}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#23A69A] mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Procesando Pago</h2>
          <p className="text-gray-600">Confirmando tu transacción con el banco...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-600 mb-4">Error en el Pago</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleContinuar}
            className="bg-[#23A69A] text-white px-6 py-3 rounded-lg hover:bg-[#1e8a7e] transition-colors"
          >
            Intentar Nuevamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        {resultado?.exitoso ? (
          <>
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h2>
            <p className="text-gray-600 mb-4">Tu reserva ha sido confirmada exitosamente.</p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold mb-2">Detalles del Pago:</h3>
              <p><strong>Monto:</strong> ${resultado.estado.amount?.toLocaleString()} CLP</p>
              <p><strong>Código de autorización:</strong> {resultado.estado.authorizationCode}</p>
              <p><strong>Fecha:</strong> {new Date(resultado.estado.transactionDate).toLocaleString()}</p>
              <p><strong>Tipo de pago:</strong> {resultado.estado.paymentTypeCode}</p>
              {resultado.estado.installmentsNumber > 1 && (
                <p><strong>Cuotas:</strong> {resultado.estado.installmentsNumber}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-600 mb-4">Pago Rechazado</h2>
            <p className="text-gray-600 mb-4">Tu pago no pudo ser procesado.</p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold mb-2">Detalles:</h3>
              <p><strong>Estado:</strong> {resultado?.estado.statusDescription}</p>
              <p><strong>Código de respuesta:</strong> {resultado?.estado.responseCode}</p>
            </div>
          </>
        )}
        
        <button
          onClick={handleContinuar}
          className="bg-[#23A69A] text-white px-6 py-3 rounded-lg hover:bg-[#1e8a7e] transition-colors w-full"
        >
          {resultado?.exitoso ? 'Ver Mis Reservas' : 'Volver e Intentar Nuevamente'}
        </button>
      </div>
    </div>
  )
}

export default function TransbankReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center"><div className="text-[#23A69A]">Procesando pago...</div></div>}>
      <TransbankReturnContent />
    </Suspense>
  )
}
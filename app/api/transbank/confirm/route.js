import { TransbankWebpayPlus } from '../../../../lib/transbank'

export async function POST(request) {
  console.log('🚀 API: Iniciando confirmación de transacción...')
  
  try {
    // Parsear el body
    const body = await request.json()
    const { token } = body
    
    console.log('📊 API: Datos recibidos:', { token })

    if (!token) {
      console.error('❌ API: Token faltante')
      return new Response(JSON.stringify({ 
        error: 'Token requerido' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('🏦 API: Creando instancia de Transbank...')
    const transbank = new TransbankWebpayPlus()
    
    console.log('📞 API: Confirmando transacción con token:', token)
    
    // Confirmar transacción
    const confirmResult = await transbank.confirmTransaction(token)
    console.log('✅ API: Confirmación exitosa:', confirmResult)
    
    // Obtener estado
    const statusResult = await transbank.getTransactionStatus(token)
    console.log('📊 API: Estado obtenido:', statusResult)

    // Parsear estado
    const estadoParsed = transbank.parseTransactionStatus(statusResult)
    console.log('🔍 API: Estado parseado:', estadoParsed)
    
    const response = {
      success: true,
      confirmation: confirmResult,
      status: statusResult,
      parsed: estadoParsed
    }

    console.log('✅ API: Respuesta final:', response)
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 API Error completo:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Error confirmando transacción', 
      details: error.message,
      type: error.name
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Manejar otros métodos HTTP
export async function GET() {
  return new Response(JSON.stringify({
    error: 'Método no permitido. Usa POST.'
  }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  })
}
import { TransbankWebpayPlus } from '../../../../lib/transbank.js';

export async function POST(request) {
    try {
        console.log('🏦 API: Creando transacción Transbank...');
        
        const body = await request.json();
        const { amount, buyOrder, returnUrl, sessionId } = body;
        
        console.log('📊 API: Datos recibidos:', { amount, buyOrder, returnUrl, sessionId });

        // Validar datos
        if (!amount || !buyOrder || !returnUrl) {
            return Response.json(
                { error: 'Faltan parámetros requeridos' }, 
                { status: 400 }
            );
        }

        // Crear instancia de Transbank
        const transbank = new TransbankWebpayPlus();
        
        // Validar parámetros
        const validationErrors = transbank.validateTransactionParams(
            amount, 
            buyOrder, 
            returnUrl, 
            sessionId
        );

        if (validationErrors.length > 0) {
            return Response.json(
                { error: 'Errores de validación', details: validationErrors }, 
                { status: 400 }
            );
        }

        // Crear transacción
        const result = await transbank.createTransaction(amount, buyOrder, returnUrl, sessionId);
        
        console.log('✅ API: Transacción creada:', result);

        return Response.json(result);

    } catch (error) {
        console.error('💥 API Error:', error);
        return Response.json(
            { error: 'Error interno del servidor', details: error.message }, 
            { status: 500 }
        );
    }
}
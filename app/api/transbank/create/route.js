import { TransbankWebpayPlus } from '../../../../lib/transbank.js';

export async function POST(request) {
    try {
        console.log('Creating transaction...');
        
        const { amount, returnUrl } = await request.json();
        
        console.log('Request data:', { amount, returnUrl });
        
        if (!amount || !returnUrl) {
            return Response.json(
                { error: 'Missing required fields: amount, returnUrl' },
                { status: 400 }
            );
        }

        const webpay = new TransbankWebpayPlus();
        
        const buyOrder = webpay.generateBuyOrder();
        const sessionId = webpay.generateSessionId();
        
        console.log('Generated:', { buyOrder, sessionId });

        // Validar parámetros antes de enviar
        const validationErrors = webpay.validateTransactionParams(
            amount, 
            buyOrder, 
            returnUrl, 
            sessionId
        );

        if (validationErrors.length > 0) {
            return Response.json(
                { error: `Validation errors: ${validationErrors.join(', ')}` },
                { status: 400 }
            );
        }
        
        const transaction = await webpay.createTransaction(
            amount,
            buyOrder,
            returnUrl,
            sessionId
        );

        console.log('Transaction created:', transaction);

        return Response.json(transaction);
        
    } catch (error) {
        console.error('Error creating transaction:', error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
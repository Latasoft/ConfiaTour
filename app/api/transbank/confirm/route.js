import { TransbankWebpayPlus } from '../../../../lib/transbank.js';

export async function POST(request) {
    try {
        const { token } = await request.json();
        
        if (!token) {
            return Response.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        const webpay = new TransbankWebpayPlus();
        const confirmation = await webpay.confirmTransaction(token);
        
        return Response.json(confirmation);
        
    } catch (error) {
        console.error('Error confirming transaction:', error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
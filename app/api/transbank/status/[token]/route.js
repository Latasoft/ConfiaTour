import { TransbankWebpayPlus } from '../../../../../lib/transbank.js';

export async function GET(request, { params }) {
    try {
        const { token } = params;
        
        if (!token) {
            return Response.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        const webpay = new TransbankWebpayPlus();
        const status = await webpay.getTransactionStatus(token);
        
        return Response.json(status);
        
    } catch (error) {
        console.error('Error getting transaction status:', error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
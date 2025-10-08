import { TransbankWebpayPlus } from '../../../../lib/transbank.js';

export async function POST(request) {
    try {
        const { token, amount } = await request.json();
        
        if (!token || !amount) {
            return Response.json(
                { error: 'Token and amount are required' },
                { status: 400 }
            );
        }

        const webpay = new TransbankWebpayPlus();
        const refund = await webpay.refundTransaction(token, amount);
        
        return Response.json(refund);
        
    } catch (error) {
        console.error('Error refunding transaction:', error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
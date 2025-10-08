'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function TransbankReturnPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token_ws');
        
        if (token) {
            handleReturn(token);
        } else {
            setError('No se encontró token de transacción');
            setLoading(false);
        }
    }, [searchParams]);

    const handleReturn = async (token) => {
        try {
            // Confirmar la transacción
            const confirmResponse = await fetch('/api/transbank/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const confirmData = await confirmResponse.json();

            if (!confirmResponse.ok) {
                throw new Error(confirmData.error || 'Error confirming transaction');
            }

            setResult(confirmData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Procesando resultado del pago...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Resultado del Pago
                    </h1>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                            <div className="text-red-800">
                                <strong>Error:</strong> {error}
                            </div>
                        </div>
                    )}

                    {result && (
                        <div>
                            <div className={`p-4 rounded-md mb-6 ${
                                result.status === 'AUTHORIZED' 
                                    ? 'bg-green-50 border border-green-200' 
                                    : 'bg-red-50 border border-red-200'
                            }`}>
                                <h2 className={`text-lg font-semibold ${
                                    result.status === 'AUTHORIZED' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {result.status === 'AUTHORIZED' ? '✅ Pago Exitoso' : '❌ Pago Fallido'}
                                </h2>
                                <p className={
                                    result.status === 'AUTHORIZED' ? 'text-green-700' : 'text-red-700'
                                }>
                                    Estado: {result.status}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <h3 className="font-semibold text-gray-800">Monto</h3>
                                    <p className="text-gray-600">${result.amount?.toLocaleString()} CLP</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Código de Autorización</h3>
                                    <p className="text-gray-600">{result.authorization_code || 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Número de Orden</h3>
                                    <p className="text-gray-600">{result.buy_order}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Fecha de Transacción</h3>
                                    <p className="text-gray-600">{result.transaction_date}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Detalles Completos</h3>
                                <pre className="text-sm text-gray-700 overflow-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => window.location.href = '/transbank'}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Realizar Nueva Transacción
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
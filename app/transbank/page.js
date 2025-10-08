'use client';

import { useState } from 'react';

export default function TransbankTestPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        amount: '10000',
        returnUrl: 'http://localhost:3000/transbank/return'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const createTransaction = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/transbank/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseInt(formData.amount),
                    returnUrl: formData.returnUrl
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error creating transaction');
            }

            setResult(data);
            
            // Redirigir automáticamente a la URL de pago de Transbank
            if (data.url && data.token) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = data.url;
                
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = 'token_ws';
                tokenInput.value = data.token;
                
                form.appendChild(tokenInput);
                document.body.appendChild(form);
                form.submit();
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getTransactionStatus = async (token) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/transbank/status/${token}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error getting transaction status');
            }

            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmTransaction = async (token) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/transbank/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error confirming transaction');
            }

            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const refundTransaction = async (token, amount) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/transbank/refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, amount }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error refunding transaction');
            }

            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-black bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Transbank WebPay Plus - Test
                    </h1>

                    {/* Formulario de creación de transacción */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Crear Nueva Transacción
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Monto (CLP)
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="10000"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL de Retorno
                                </label>
                                <input
                                    type="url"
                                    name="returnUrl"
                                    value={formData.returnUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="http://localhost:3000/transbank/return"
                                />
                            </div>
                        </div>

                        <button
                            onClick={createTransaction}
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creando...' : 'Crear Transacción'}
                        </button>
                    </div>

                    {/* Sección de consulta de estado */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Consultar Estado de Transacción
                        </h2>
                        
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Token de la transacción"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        getTransactionStatus(e.target.value);
                                    }
                                }}
                            />
                            <button
                                onClick={(e) => {
                                    const input = e.target.previousElementSibling;
                                    if (input.value) {
                                        getTransactionStatus(input.value);
                                    }
                                }}
                                disabled={loading}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                Consultar
                            </button>
                        </div>
                    </div>

                    {/* Sección de confirmación de transacción */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Confirmar Transacción
                        </h2>
                        
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Token de la transacción a confirmar"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        confirmTransaction(e.target.value);
                                    }
                                }}
                            />
                            <button
                                onClick={(e) => {
                                    const input = e.target.previousElementSibling;
                                    if (input.value) {
                                        confirmTransaction(input.value);
                                    }
                                }}
                                disabled={loading}
                                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>

                    {/* Sección de reembolso */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Reembolso de Transacción
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input
                                type="text"
                                placeholder="Token de la transacción"
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="refundToken"
                            />
                            <input
                                type="number"
                                placeholder="Monto a reembolsar"
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="refundAmount"
                            />
                            <button
                                onClick={() => {
                                    const token = document.getElementById('refundToken').value;
                                    const amount = document.getElementById('refundAmount').value;
                                    if (token && amount) {
                                        refundTransaction(token, parseInt(amount));
                                    }
                                }}
                                disabled={loading}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                Reembolsar
                            </button>
                        </div>
                    </div>

                    {/* Mostrar errores */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <div className="text-red-800">
                                    <strong>Error:</strong> {error}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mostrar resultados */}
                    {result && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                Resultado de la Operación
                            </h3>
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                                <pre className="text-sm text-gray-700 overflow-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Información de ambiente de integración */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                            Información del Ambiente de Integración
                        </h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li><strong>Host:</strong> https://webpay3gint.transbank.cl</li>
                            <li><strong>Código de Comercio:</strong> 597055555532</li>
                            <li><strong>RUT para autenticación:</strong> 11.111.111-1</li>
                            <li><strong>Clave:</strong> 123</li>
                            <li><strong>Tarjetas de prueba disponibles en:</strong> 
                                <a 
                                    href="https://www.transbankdevelopers.cl/documentacion/como_empezar#tarjetas-de-prueba" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline ml-1"
                                >
                                    Documentación Transbank
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client'
import { useState,useEffect } from 'react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'

export const dynamic = 'force-dynamic'

// Mock data para la experiencia
const mockExperiencia = {
    id: 1,
    titulo: "Tour Gastronómico por el Centro Histórico",
    precio: 75,
    moneda: "USD"
}

export default function TestPage() {
    const [preferenceId, setPreferenceId] = useState(null);
    initMercadoPago('APP_USR-042e0ef9-c8c0-4b1b-bdf7-de8f207b5fbf');

    const [experiencia] = useState(mockExperiencia);
    const [cantidadPersonas, setCantidadPersonas] = useState(1);

    useEffect(() => {
    const createPreference = async () => {
        try {
            const response = await fetch('http://localhost:8080/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: [{
                        title: experiencia.titulo,
                        quantity: 1,
                        unit_price: 100,
                    }],
                }),
            })
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setPreferenceId(data.preference_id);
            }
        } catch (error) {
            console.error(error)
        }
    }
    createPreference();
}, [experiencia]);

    return (
        <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
                <h1 className="text-2xl font-bold mb-4 text-center text-black">{experiencia.titulo}</h1>

                <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-[#23A69A]">
                        ${experiencia.precio}
                    </span>
                    <span className="text-black ml-2">{experiencia.moneda}</span>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-black">
                        Cantidad
                    </label>
                    <select
                        value={cantidadPersonas}
                        onChange={(e) => setCantidadPersonas(parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-black"
                    >
                        {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-black">
                        <span>Total:</span>
                        <span className="font-bold">
                            ${(experiencia.precio * cantidadPersonas).toFixed(2)} {experiencia.moneda}
                        </span>
                    </div>
                </div>

                {/* Botón de MercadoPago */}
                {preferenceId && <div style={{ width: '300px'}}>
                    <Wallet initialization={{ preferenceId: preferenceId }} />
                </div>
                }
            </div>
        </div>
    )
}
'use client'
import { useEffect } from 'react'

/**
 * Componente que ejecuta limpieza de reservas expiradas
 * Se monta en el layout principal y ejecuta al cargar la app
 * 
 * Alternativa GRATIS a cron jobs de pago
 * Solo ejecuta si hay tráfico, pero es suficiente para la mayoría de casos
 */
export function CleanupTrigger() {
  useEffect(() => {
    // Ejecutar limpieza al montar el componente
    const runCleanup = async () => {
      try {
        const response = await fetch('/api/cleanup-on-access', {
          method: 'GET',
          // No requiere autenticación (tiene throttling interno)
        })
        
        const data = await response.json()
        
        if (data.success && data.reservas_expiradas > 0) {
          console.log(`🧹 Limpiadas ${data.reservas_expiradas} reservas expiradas`)
        } else if (data.next_cleanup_in_seconds) {
          console.log(`⏳ Próxima limpieza en ${data.next_cleanup_in_seconds}s`)
        }
      } catch (error) {
        // Silenciosamente fallar - no afecta la UX
        console.debug('[CleanupTrigger] Error:', error)
      }
    }

    // Ejecutar inmediatamente
    runCleanup()

    // Opcional: ejecutar cada 10 minutos si el usuario sigue en la app
    const interval = setInterval(runCleanup, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // No renderiza nada
  return null
}

-- ============================================
-- MIGRATION: Agregar campo expires_at a reservas
-- Propósito: Implementar expiración automática de reservas pendientes
-- Fecha: 2025-12-19
-- ============================================

-- 1. Agregar columna expires_at
ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Crear índice para mejorar performance de queries de expiración
CREATE INDEX IF NOT EXISTS idx_reservas_expires_at 
ON reservas(expires_at) 
WHERE estado = 'pendiente_pago';

-- 3. Actualizar reservas existentes pendientes_pago con tiempo de expiración (5 minutos desde creación)
UPDATE reservas
SET expires_at = creado_en + INTERVAL '5 minutes'
WHERE estado = 'pendiente_pago' 
  AND expires_at IS NULL;

-- 4. Marcar como canceladas las reservas pendientes ya expiradas
UPDATE reservas
SET 
  estado = 'cancelada',
  fecha_cancelacion = NOW()
WHERE estado = 'pendiente_pago'
  AND expires_at < NOW();

-- 5. Crear función para limpiar reservas expiradas automáticamente
CREATE OR REPLACE FUNCTION cleanup_expired_reservas()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE reservas
    SET 
      estado = 'cancelada',
      fecha_cancelacion = NOW()
    WHERE estado = 'pendiente_pago'
      AND expires_at < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO affected_count FROM updated;
  
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Comentarios descriptivos
COMMENT ON COLUMN reservas.expires_at IS 'Timestamp de expiración para reservas pendiente_pago (5 minutos desde creación)';
COMMENT ON FUNCTION cleanup_expired_reservas IS 'Limpia automáticamente las reservas pendientes expiradas, marcándolas como canceladas';

-- ============================================
-- INSTRUCCIONES DE USO:
-- ============================================
-- 
-- 1. Ejecutar esta migración en Supabase:
--    - Ir a Supabase Dashboard > SQL Editor
--    - Pegar y ejecutar este script
--
-- 2. Para limpiar reservas expiradas manualmente:
--    SELECT cleanup_expired_reservas();
--
-- 3. Para configurar limpieza automática (opcional):
--    - Usar Supabase Edge Functions con cron
--    - O ejecutar desde el backend cada X minutos
--
-- ============================================

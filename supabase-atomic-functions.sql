-- ============================================
-- FUNCIÓN SQL ATÓMICA PARA PREVENIR DOUBLE BOOKING
-- ============================================

CREATE OR REPLACE FUNCTION create_reserva_atomic(
  p_experiencia_id UUID,
  p_usuario_id TEXT,
  p_fecha_experiencia DATE,
  p_cantidad_personas INTEGER,
  p_precio_total DECIMAL,
  p_metodo_pago TEXT,
  p_buy_order TEXT,
  p_session_id TEXT
)
RETURNS TABLE (
  reserva_id UUID,
  success BOOLEAN,
  message TEXT,
  disponibles_restantes INTEGER
) AS $$
DECLARE
  v_capacidad_total INTEGER;
  v_reservadas INTEGER;
  v_disponibles INTEGER;
  v_nueva_reserva_id UUID;
BEGIN
  -- 1. Lock de la experiencia para prevenir lecturas concurrentes
  SELECT capacidad INTO v_capacidad_total
  FROM experiencias
  WHERE id = p_experiencia_id
  FOR UPDATE; -- CRITICAL: Lock exclusivo
  
  IF v_capacidad_total IS NULL THEN
    RETURN QUERY SELECT 
      NULL::UUID,
      false,
      'Experiencia no encontrada'::TEXT,
      0::INTEGER;
    RETURN;
  END IF;
  
  -- 2. Calcular cupos ocupados (confirmadas + pendientes no expiradas)
  SELECT COALESCE(SUM(cantidad_personas), 0) INTO v_reservadas
  FROM reservas
  WHERE experiencia_id = p_experiencia_id
    AND fecha_experiencia = p_fecha_experiencia
    AND (
      estado = 'confirmada' 
      OR pagado = true
      OR (estado = 'pendiente_pago' AND expires_at >= NOW())
    )
    AND estado != 'cancelada';
  
  v_disponibles := v_capacidad_total - v_reservadas;
  
  -- 3. Validar disponibilidad
  IF v_disponibles < p_cantidad_personas THEN
    RETURN QUERY SELECT 
      NULL::UUID,
      false,
      format('Solo quedan %s cupos disponibles. Solicitaste %s.', v_disponibles, p_cantidad_personas)::TEXT,
      v_disponibles::INTEGER;
    RETURN;
  END IF;
  
  -- 4. Crear reserva atómicamente
  INSERT INTO reservas (
    experiencia_id,
    usuario_id,
    fecha_experiencia,
    cantidad_personas,
    precio_total,
    metodo_pago,
    buy_order,
    session_id,
    estado,
    pagado,
    expires_at,
    creado_en
  ) VALUES (
    p_experiencia_id,
    p_usuario_id,
    p_fecha_experiencia,
    p_cantidad_personas,
    p_precio_total,
    p_metodo_pago,
    p_buy_order,
    p_session_id,
    'pendiente_pago',
    false,
    NOW() + INTERVAL '5 minutes',
    NOW()
  )
  RETURNING id INTO v_nueva_reserva_id;
  
  -- 5. Retornar resultado exitoso
  RETURN QUERY SELECT 
    v_nueva_reserva_id,
    true,
    'Reserva creada exitosamente'::TEXT,
    (v_disponibles - p_cantidad_personas)::INTEGER;
  
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN PARA CONFIRMAR PAGO CON VALIDACIÓN DE EXPIRACIÓN
-- ============================================

CREATE OR REPLACE FUNCTION confirm_payment_safe(
  p_reserva_id UUID,
  p_codigo_autorizacion TEXT,
  p_detalles_pago JSONB
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  estado_actual TEXT
) AS $$
DECLARE
  v_estado_actual TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_pagado BOOLEAN;
BEGIN
  -- 1. Obtener estado actual
  SELECT estado, expires_at, pagado 
  INTO v_estado_actual, v_expires_at, v_pagado
  FROM reservas
  WHERE id = p_reserva_id
  FOR UPDATE; -- Lock para evitar actualizaciones concurrentes
  
  IF v_estado_actual IS NULL THEN
    RETURN QUERY SELECT 
      false,
      'Reserva no encontrada'::TEXT,
      NULL::TEXT;
    RETURN;
  END IF;
  
  -- 2. Si ya está confirmada y pagada, es idempotente (webhook retry)
  IF v_estado_actual = 'confirmada' AND v_pagado = true THEN
    RETURN QUERY SELECT 
      true,
      'Reserva ya confirmada (idempotente)'::TEXT,
      v_estado_actual;
    RETURN;
  END IF;
  
  -- 3. Validar que no esté cancelada
  IF v_estado_actual = 'cancelada' THEN
    RETURN QUERY SELECT 
      false,
      'La reserva ya fue cancelada'::TEXT,
      v_estado_actual;
    RETURN;
  END IF;
  
  -- 4. Validar que no haya expirado
  IF v_estado_actual = 'pendiente_pago' AND v_expires_at < NOW() THEN
    -- Marcar como cancelada
    UPDATE reservas
    SET estado = 'cancelada', fecha_cancelacion = NOW()
    WHERE id = p_reserva_id;
    
    RETURN QUERY SELECT 
      false,
      'La reserva ha expirado'::TEXT,
      'cancelada'::TEXT;
    RETURN;
  END IF;
  
  -- 5. Confirmar pago
  UPDATE reservas
  SET 
    estado = 'confirmada',
    pagado = true,
    fecha_pago = NOW(),
    codigo_autorizacion = p_codigo_autorizacion,
    detalles_pago = p_detalles_pago
  WHERE id = p_reserva_id;
  
  RETURN QUERY SELECT 
    true,
    'Pago confirmado exitosamente'::TEXT,
    'confirmada'::TEXT;
  
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT ON FUNCTION create_reserva_atomic IS 
'Crea una reserva de forma atómica con validación de capacidad usando row-level locking para prevenir double booking';

COMMENT ON FUNCTION confirm_payment_safe IS 
'Confirma un pago validando expiración y estado, con soporte para idempotencia (webhooks)';

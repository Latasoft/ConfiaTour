-- ============================================
-- RLS POLICIES PARA RESEÑAS
-- Solo usuarios con reservas completadas pueden dejar reseñas
-- ============================================

-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "Los usuarios pueden crear reseñas" ON resenas;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus reseñas" ON resenas;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus reseñas" ON resenas;

-- POLÍTICA DE INSERCIÓN: Solo usuarios con reserva completada de la experiencia
-- IMPORTANTE: El creador de la experiencia NO puede dejar reseñas de su propia experiencia
CREATE POLICY "Los usuarios pueden crear reseñas solo si tienen reserva completada"
  ON resenas FOR INSERT
  WITH CHECK (
    usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND EXISTS (
      SELECT 1 FROM reservas
      WHERE reservas.usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND reservas.experiencia_id = resenas.experiencia_id
        AND reservas.estado = 'completada'
    )
    -- Validación adicional: el usuario NO puede ser el creador de la experiencia
    AND NOT EXISTS (
      SELECT 1 FROM experiencias
      WHERE experiencias.id = resenas.experiencia_id
        AND experiencias.usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- POLÍTICA DE ACTUALIZACIÓN: Solo el autor puede actualizar su reseña
CREATE POLICY "Los usuarios pueden actualizar sus reseñas"
  ON resenas FOR UPDATE
  USING (
    usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- POLÍTICA DE ELIMINACIÓN: Solo el autor puede eliminar su reseña
CREATE POLICY "Los usuarios pueden eliminar sus reseñas"
  ON resenas FOR DELETE
  USING (
    usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Comentarios explicativos
COMMENT ON POLICY "Los usuarios pueden crear reseñas solo si tienen reserva completada" ON resenas IS 
  'Solo permite crear reseñas a usuarios que: 1) Hayan completado al menos una reserva de la experiencia, 2) NO sean el creador de la experiencia. Esto garantiza que solo quienes vivieron la experiencia puedan opinar.';

COMMENT ON POLICY "Los usuarios pueden actualizar sus reseñas" ON resenas IS 
  'Permite a los usuarios actualizar únicamente sus propias reseñas';

COMMENT ON POLICY "Los usuarios pueden eliminar sus reseñas" ON resenas IS 
  'Permite a los usuarios eliminar únicamente sus propias reseñas';

-- ============================================
-- ACTUALIZACIÓN DE POLÍTICAS RLS PARA ADMIN
-- Script para mejorar el sistema de permisos
-- ============================================

-- PASO 1: Eliminar políticas antiguas de experiencias
DROP POLICY IF EXISTS "Todos pueden ver experiencias disponibles" ON experiencias;
DROP POLICY IF EXISTS "Los guías pueden crear experiencias" ON experiencias;
DROP POLICY IF EXISTS "Los guías pueden actualizar sus experiencias" ON experiencias;
DROP POLICY IF EXISTS "Los guías pueden eliminar sus experiencias" ON experiencias;

-- PASO 2: Crear políticas mejoradas para experiencias

-- SELECT: Todos pueden ver experiencias disponibles, admins ven todo
CREATE POLICY "select_experiencias_policy"
  ON experiencias FOR SELECT
  USING (
    disponible = true 
    OR 
    usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND user_type = 'admin'
    )
  );

-- INSERT: Guías y admins pueden crear experiencias
CREATE POLICY "insert_experiencias_policy"
  ON experiencias FOR INSERT
  WITH CHECK (
    -- El usuario puede crear su propia experiencia
    usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR
    -- Admin puede crear experiencias para otros usuarios
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND user_type = 'admin'
    )
  );

-- UPDATE: Solo el dueño o admin puede actualizar
CREATE POLICY "update_experiencias_policy"
  ON experiencias FOR UPDATE
  USING (
    usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND user_type = 'admin'
    )
  );

-- DELETE: Solo el dueño o admin puede eliminar
CREATE POLICY "delete_experiencias_policy"
  ON experiencias FOR DELETE
  USING (
    usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND user_type = 'admin'
    )
  );

-- ============================================
-- ACTUALIZAR POLÍTICAS DE RESERVAS PARA ADMIN
-- ============================================

DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias reservas" ON reservas;
DROP POLICY IF EXISTS "Los usuarios pueden crear reservas" ON reservas;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus reservas" ON reservas;

-- SELECT: Usuario ve sus reservas, guía ve reservas de sus experiencias, admin ve todo
CREATE POLICY "select_reservas_policy"
  ON reservas FOR SELECT
  USING (
    usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR
    experiencia_id IN (
      SELECT id FROM experiencias 
      WHERE usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND user_type = 'admin'
    )
  );

-- INSERT: Usuarios autenticados pueden crear reservas
CREATE POLICY "insert_reservas_policy"
  ON reservas FOR INSERT
  WITH CHECK (
    usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND user_type = 'admin'
    )
  );

-- UPDATE: Usuario o admin pueden actualizar
CREATE POLICY "update_reservas_policy"
  ON reservas FOR UPDATE
  USING (
    usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND user_type = 'admin'
    )
  );

-- ============================================
-- ACTUALIZAR POLÍTICAS DE VERIFICATION_REQUESTS
-- ============================================

DROP POLICY IF EXISTS "Los usuarios pueden ver sus solicitudes" ON verification_requests;
DROP POLICY IF EXISTS "Los usuarios pueden crear solicitudes" ON verification_requests;

-- SELECT: Usuario ve sus solicitudes, admin ve todas
CREATE POLICY "select_verification_policy"
  ON verification_requests FOR SELECT
  USING (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND user_type = 'admin'
    )
  );

-- INSERT: Usuarios pueden crear solicitudes
CREATE POLICY "insert_verification_policy"
  ON verification_requests FOR INSERT
  WITH CHECK (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- UPDATE: Solo admin puede actualizar (aprobar/rechazar)
CREATE POLICY "update_verification_policy"
  ON verification_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND user_type = 'admin'
    )
  );

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON POLICY "select_experiencias_policy" ON experiencias IS 
'Permite ver experiencias disponibles a todos, propias al dueño, y todas al admin';

COMMENT ON POLICY "insert_experiencias_policy" ON experiencias IS 
'Permite crear experiencias propias o admin puede crear para otros';

COMMENT ON POLICY "update_experiencias_policy" ON experiencias IS 
'Solo el dueño o admin puede editar experiencias';

COMMENT ON POLICY "delete_experiencias_policy" ON experiencias IS 
'Solo el dueño o admin puede eliminar experiencias';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Para verificar las políticas ejecutar:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('experiencias', 'reservas', 'verification_requests');

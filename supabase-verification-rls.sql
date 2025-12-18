-- ============================================
-- POLÍTICAS RLS PARA TABLA verification_requests
-- ============================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can insert own verification" ON verification_requests;
DROP POLICY IF EXISTS "Users can view own verification" ON verification_requests;
DROP POLICY IF EXISTS "Admins can view all verifications" ON verification_requests;
DROP POLICY IF EXISTS "Public can insert verification" ON verification_requests;

-- ============================================
-- OPCIÓN 1: POLÍTICAS PÚBLICAS (TEMPORAL - DESARROLLO)
-- ============================================

-- Permitir a cualquiera insertar solicitudes de verificación
CREATE POLICY "Public can insert verification"
ON verification_requests FOR INSERT
TO public
WITH CHECK (true);

-- Permitir leer solo las propias solicitudes
CREATE POLICY "Users can view own verification"
ON verification_requests FOR SELECT
TO public
USING (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver políticas activas
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'verification_requests'
ORDER BY policyname;

-- ============================================
-- NOTA: Política temporal para desarrollo
-- En producción, cambiar a políticas con autenticación:
-- 
-- CREATE POLICY "Users can insert own verification"
-- ON verification_requests FOR INSERT
-- TO authenticated
-- WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');
--
-- CREATE POLICY "Users can view own verification"
-- ON verification_requests FOR SELECT
-- TO authenticated
-- USING (clerk_user_id = auth.jwt() ->> 'sub');
-- ============================================

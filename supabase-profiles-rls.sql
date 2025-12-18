-- ============================================
-- POLÍTICAS RLS PARA TABLA profiles
-- ============================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public can insert profile" ON profiles;
DROP POLICY IF EXISTS "Public can view profile" ON profiles;
DROP POLICY IF EXISTS "Public can update profile" ON profiles;

-- ============================================
-- POLÍTICAS PÚBLICAS (TEMPORAL - DESARROLLO)
-- ============================================

-- Permitir a cualquiera crear su perfil
CREATE POLICY "Public can insert profile"
ON profiles FOR INSERT
TO public
WITH CHECK (true);

-- Permitir a cualquiera ver perfiles (necesario para mostrar info de guías)
CREATE POLICY "Public can view profile"
ON profiles FOR SELECT
TO public
USING (true);

-- Permitir a cualquiera actualizar perfiles
CREATE POLICY "Public can update profile"
ON profiles FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver políticas activas
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================
-- NOTA: Políticas temporales para desarrollo
-- En producción, cambiar a políticas con autenticación:
-- 
-- CREATE POLICY "Users can insert own profile"
-- ON profiles FOR INSERT
-- TO authenticated
-- WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');
--
-- CREATE POLICY "Users can view own profile"
-- ON profiles FOR SELECT
-- TO authenticated
-- USING (clerk_user_id = auth.jwt() ->> 'sub' OR user_type = 'guia');
--
-- CREATE POLICY "Users can update own profile"
-- ON profiles FOR UPDATE
-- TO authenticated
-- USING (clerk_user_id = auth.jwt() ->> 'sub')
-- WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');
-- ============================================

-- ============================================
-- POLÍTICAS TEMPORALES - SIN REQUERIR JWT CLERK
-- ⚠️ Menos seguras, solo para desarrollo/testing
-- ============================================

-- IMPORTANTE: Primero eliminar políticas existentes
DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_delete" ON storage.objects;

-- ============================================
-- POLÍTICAS PÚBLICAS (TEMPORAL)
-- ============================================

-- 1. LECTURA PÚBLICA: Cualquiera puede VER las fotos
CREATE POLICY "storage_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'Fotos');

-- 2. SUBIR: Cualquier usuario (público) puede subir
-- ⚠️ TEMPORAL: En producción debe requerir autenticación
CREATE POLICY "storage_public_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'Fotos' AND
  (
    (storage.foldername(name))[1] = 'experiencias' OR
    (storage.foldername(name))[1] = 'verificacion'
  )
);

-- 3. ACTUALIZAR: Cualquier usuario puede actualizar
-- ⚠️ TEMPORAL: En producción debe requerir autenticación
CREATE POLICY "storage_public_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'Fotos')
WITH CHECK (bucket_id = 'Fotos');

-- 4. ELIMINAR: Cualquier usuario puede eliminar
-- ⚠️ TEMPORAL: En producción debe requerir autenticación
CREATE POLICY "storage_public_delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'Fotos');

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- ⚠️ NOTAS IMPORTANTES
-- ============================================
-- 
-- ESTA CONFIGURACIÓN ES TEMPORAL Y SOLO PARA DESARROLLO
-- 
-- Problemas de seguridad:
-- ❌ Cualquiera puede subir archivos (sin autenticación)
-- ❌ Cualquiera puede eliminar archivos
-- ❌ No hay control de usuarios
-- ❌ Posible spam/abuso
-- 
-- ✅ PARA PRODUCCIÓN:
-- 1. Configura JWT Template en Clerk (ver CLERK_JWT_SETUP.md)
-- 2. Revierte a políticas con "TO authenticated"
-- 3. Ejecuta supabase-storage-setup.sql (políticas seguras)
--
-- USO TEMPORAL:
-- - Permite probar funcionalidad inmediatamente
-- - Desbloquea el upload mientras configuras Clerk
-- - DEBE cambiarse antes de producción

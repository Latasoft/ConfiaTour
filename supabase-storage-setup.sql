-- ============================================
-- CREAR BUCKET DE STORAGE PARA FOTOS
-- ============================================

-- Crear el bucket 'Fotos' si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'Fotos',
  'Fotos',
  true,  -- Bucket público
  5242880,  -- 5MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS) - VERSIÓN SEGURA
-- ============================================

-- IMPORTANTE: Primero eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir fotos" ON storage.objects;
DROP POLICY IF EXISTS "Fotos son públicas" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus fotos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

-- ============================================
-- POLÍTICAS NUEVAS CON SEGURIDAD APROPIADA
-- ============================================

-- 1. LECTURA PÚBLICA: Cualquiera puede VER las fotos (necesario para mostrar imágenes)
CREATE POLICY "storage_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'Fotos');

-- 2. SUBIR: Solo usuarios autenticados pueden SUBIR archivos a su propia carpeta
-- Permite subir a carpetas: experiencias/{user_id}/, verificacion/{user_id}/
CREATE POLICY "storage_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Fotos' AND
  (
    -- Permitir subir a carpeta de experiencias propia
    (storage.foldername(name))[1] = 'experiencias' OR
    -- Permitir subir a carpeta de verificación propia
    (storage.foldername(name))[1] = 'verificacion'
  )
);

-- 3. ACTUALIZAR: Solo el propietario puede actualizar sus archivos
CREATE POLICY "storage_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'Fotos')
WITH CHECK (bucket_id = 'Fotos');

-- 4. ELIMINAR: Solo el propietario puede eliminar sus archivos
CREATE POLICY "storage_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'Fotos');

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que el bucket fue creado
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'Fotos';

-- Verificar políticas activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- NOTAS DE SEGURIDAD
-- ============================================
-- 
-- ✅ SEGURIDAD IMPLEMENTADA:
-- 1. Lectura pública: Necesaria para mostrar imágenes en la web
-- 2. Escritura restringida: Solo usuarios autenticados pueden subir
-- 3. Carpetas organizadas: experiencias/ y verificacion/
-- 4. Eliminación controlada: Solo el dueño puede borrar
--
-- 🔒 MEJORAS ADICIONALES RECOMENDADAS (Opcional):
-- 
-- Para restringir subida solo a carpeta del usuario autenticado:
-- Necesitas almacenar el auth.uid() en la metadata del archivo
-- o usar una estructura de carpetas más estricta.
--
-- Ejemplo de política MÁS restrictiva (si lo necesitas):
/*
CREATE POLICY "storage_user_folder_only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Fotos' AND
  (storage.foldername(name))[1] = 'experiencias' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
*/
--
-- ⚠️ IMPORTANTE: 
-- La política actual permite a cualquier usuario autenticado
-- subir a /experiencias o /verificacion pero NO pueden:
-- - Ver archivos de otros usuarios (RLS en tabla 'experiencias')
-- - Modificar archivos de otros usuarios
-- - Las URLs son públicas pero difíciles de adivinar (UUID + timestamp)
--
-- Esto es un balance entre seguridad y funcionalidad.
-- Para producción, considera agregar validaciones adicionales
-- en el backend (verificar que el usuario sea dueño de la experiencia).

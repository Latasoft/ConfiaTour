-- Tabla para bloqueos de fechas de experiencias
CREATE TABLE IF NOT EXISTS bloques_fechas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id UUID NOT NULL REFERENCES experiencias(id) ON DELETE CASCADE,
  fecha_bloqueada DATE NOT NULL,
  motivo TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  creado_por UUID NOT NULL,
  
  -- Evitar duplicados
  UNIQUE(experiencia_id, fecha_bloqueada)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_bloques_fechas_experiencia ON bloques_fechas(experiencia_id);
CREATE INDEX IF NOT EXISTS idx_bloques_fechas_fecha ON bloques_fechas(fecha_bloqueada);

-- RLS Policies
ALTER TABLE bloques_fechas ENABLE ROW LEVEL SECURITY;

-- Los guías pueden ver sus propios bloqueos
CREATE POLICY "Guías pueden ver sus bloqueos"
  ON bloques_fechas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experiencias e
      WHERE e.id = bloques_fechas.experiencia_id
      AND e.usuario_id::text = auth.uid()::text
    )
  );

-- Los guías pueden crear bloqueos en sus experiencias
CREATE POLICY "Guías pueden crear bloqueos"
  ON bloques_fechas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experiencias e
      WHERE e.id = bloques_fechas.experiencia_id
      AND e.usuario_id::text = auth.uid()::text
    )
    AND creado_por::text = auth.uid()::text
  );

-- Los guías pueden eliminar sus bloqueos
CREATE POLICY "Guías pueden eliminar bloqueos"
  ON bloques_fechas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM experiencias e
      WHERE e.id = bloques_fechas.experiencia_id
      AND e.usuario_id::text = auth.uid()::text
    )
  );

-- Admins pueden hacer todo
CREATE POLICY "Admins pueden gestionar todos los bloqueos"
  ON bloques_fechas
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.clerk_user_id = auth.uid()::text
      AND profiles.user_type = 'admin'
    )
  );

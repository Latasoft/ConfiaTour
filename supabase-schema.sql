-- ============================================
-- CONFIATOUR - SCHEMA DE BASE DE DATOS
-- Plataforma de Turismo Regional Colaborativo
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla: profiles (Perfiles de usuario)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  verified BOOLEAN DEFAULT false,
  user_type TEXT CHECK (user_type IN ('viajero', 'guia', 'admin')) DEFAULT 'viajero',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: experiencias (Servicios turísticos ofrecidos)
CREATE TABLE IF NOT EXISTS experiencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT CHECK (categoria IN ('turismo', 'gastronomia', 'aventura', 'naturaleza', 'cultura', 'deportes', 'alojamiento', 'transporte', 'tours')) NOT NULL,
  ubicacion TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  moneda TEXT CHECK (moneda IN ('USD', 'ARS', 'CLP', 'BRL', 'PYG')) DEFAULT 'CLP',
  capacidad INTEGER NOT NULL CHECK (capacidad > 0),
  duracion TEXT NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  imagenes JSONB DEFAULT '[]'::jsonb,
  disponible BOOLEAN DEFAULT true,
  rating_promedio DECIMAL(3,2) DEFAULT 0.00 CHECK (rating_promedio >= 0 AND rating_promedio <= 5),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: reservas (Reservaciones de experiencias)
CREATE TABLE IF NOT EXISTS reservas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiencia_id UUID NOT NULL REFERENCES experiencias(id) ON DELETE CASCADE,
  usuario_id TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  fecha_reserva TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_experiencia DATE NOT NULL,
  cantidad_personas INTEGER NOT NULL CHECK (cantidad_personas > 0),
  precio_total DECIMAL(10,2) NOT NULL CHECK (precio_total >= 0),
  estado TEXT CHECK (estado IN ('pendiente_pago', 'confirmada', 'cancelada', 'completada')) DEFAULT 'pendiente_pago',
  metodo_pago TEXT CHECK (metodo_pago IN ('transbank', 'mercadopago')) NOT NULL,
  pagado BOOLEAN DEFAULT false,
  buy_order TEXT UNIQUE,
  session_id TEXT,
  codigo_autorizacion TEXT,
  fecha_pago TIMESTAMP WITH TIME ZONE,
  fecha_cancelacion TIMESTAMP WITH TIME ZONE,
  detalles_pago JSONB,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: resenas (Reseñas de experiencias)
CREATE TABLE IF NOT EXISTS resenas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiencia_id UUID NOT NULL REFERENCES experiencias(id) ON DELETE CASCADE,
  usuario_id TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comentario TEXT NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(experiencia_id, usuario_id)
);

-- Tabla: exchange_rates (Tasas de cambio)
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency TEXT CHECK (from_currency IN ('USD', 'ARS', 'CLP', 'BRL', 'PYG')) NOT NULL,
  to_currency TEXT CHECK (to_currency IN ('USD', 'ARS', 'CLP', 'BRL', 'PYG')) NOT NULL,
  rate DECIMAL(12,6) NOT NULL CHECK (rate > 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_currency, to_currency)
);

-- Tabla: verification_requests (Solicitudes de verificación de guías)
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  id_document_url TEXT NOT NULL,
  additional_docs_urls JSONB DEFAULT '[]'::jsonb,
  business_description TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by TEXT REFERENCES profiles(clerk_user_id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_experiencias_usuario ON experiencias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_experiencias_categoria ON experiencias(categoria);
CREATE INDEX IF NOT EXISTS idx_experiencias_disponible ON experiencias(disponible);
CREATE INDEX IF NOT EXISTS idx_experiencias_created ON experiencias(creado_en DESC);

CREATE INDEX IF NOT EXISTS idx_reservas_experiencia ON reservas(experiencia_id);
CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha_experiencia);
CREATE INDEX IF NOT EXISTS idx_reservas_buy_order ON reservas(buy_order);

CREATE INDEX IF NOT EXISTS idx_resenas_experiencia ON resenas(experiencia_id);
CREATE INDEX IF NOT EXISTS idx_resenas_usuario ON resenas(usuario_id);

CREATE INDEX IF NOT EXISTS idx_profiles_clerk ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_type ON profiles(user_type);

CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_user ON verification_requests(clerk_user_id);

-- ============================================
-- TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para experiencias (solo actualiza updated_at si no es una actualización de rating)
CREATE OR REPLACE FUNCTION update_experiencias_updated_at_selective()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar updated_at si se modificaron campos distintos a rating_promedio
  IF (OLD.titulo IS DISTINCT FROM NEW.titulo OR
      OLD.descripcion IS DISTINCT FROM NEW.descripcion OR
      OLD.categoria IS DISTINCT FROM NEW.categoria OR
      OLD.ubicacion IS DISTINCT FROM NEW.ubicacion OR
      OLD.precio IS DISTINCT FROM NEW.precio OR
      OLD.moneda IS DISTINCT FROM NEW.moneda OR
      OLD.capacidad IS DISTINCT FROM NEW.capacidad OR
      OLD.duracion IS DISTINCT FROM NEW.duracion OR
      OLD.fecha_inicio IS DISTINCT FROM NEW.fecha_inicio OR
      OLD.fecha_fin IS DISTINCT FROM NEW.fecha_fin OR
      OLD.imagenes IS DISTINCT FROM NEW.imagenes OR
      OLD.disponible IS DISTINCT FROM NEW.disponible) THEN
    NEW.actualizado_en = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_experiencias_updated_at
  BEFORE UPDATE ON experiencias
  FOR EACH ROW
  EXECUTE FUNCTION update_experiencias_updated_at_selective();

-- Triggers para verification_requests
CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER PARA ACTUALIZAR RATING PROMEDIO
-- ============================================

CREATE OR REPLACE FUNCTION update_experiencia_rating()
RETURNS TRIGGER AS $$
DECLARE
  experiencia_uuid UUID;
BEGIN
  -- Determinar el ID de la experiencia según la operación
  IF TG_OP = 'DELETE' THEN
    experiencia_uuid := OLD.experiencia_id;
  ELSE
    experiencia_uuid := NEW.experiencia_id;
  END IF;

  -- Actualizar solo rating promedio (el trigger selective no actualizará actualizado_en)
  UPDATE experiencias
  SET rating_promedio = (
    SELECT COALESCE(AVG(rating), 0)
    FROM resenas
    WHERE experiencia_id = experiencia_uuid
  )
  WHERE id = experiencia_uuid;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_after_resena
  AFTER INSERT OR UPDATE OR DELETE ON resenas
  FOR EACH ROW
  EXECUTE FUNCTION update_experiencia_rating();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Los usuarios pueden ver todos los perfiles" ON profiles;
CREATE POLICY "Los usuarios pueden ver todos los perfiles"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON profiles;
CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON profiles;
CREATE POLICY "Los usuarios pueden insertar su propio perfil"
  ON profiles FOR INSERT
  WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Políticas para experiencias
DROP POLICY IF EXISTS "Todos pueden ver experiencias disponibles" ON experiencias;
CREATE POLICY "Todos pueden ver experiencias disponibles"
  ON experiencias FOR SELECT
  USING (disponible = true OR usuario_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Los guías pueden crear experiencias" ON experiencias;
CREATE POLICY "Los guías pueden crear experiencias"
  ON experiencias FOR INSERT
  WITH CHECK (usuario_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Los guías pueden actualizar sus experiencias" ON experiencias;
CREATE POLICY "Los guías pueden actualizar sus experiencias"
  ON experiencias FOR UPDATE
  USING (usuario_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Los guías pueden eliminar sus experiencias" ON experiencias;
CREATE POLICY "Los guías pueden eliminar sus experiencias"
  ON experiencias FOR DELETE
  USING (usuario_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Políticas para reservas
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias reservas" ON reservas;
CREATE POLICY "Los usuarios pueden ver sus propias reservas"
  ON reservas FOR SELECT
  USING (usuario_id = current_setting('request.jwt.claims', true)::json->>'sub' 
    OR experiencia_id IN (
      SELECT id FROM experiencias WHERE usuario_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ));

DROP POLICY IF EXISTS "Los usuarios pueden crear reservas" ON reservas;
CREATE POLICY "Los usuarios pueden crear reservas"
  ON reservas FOR INSERT
  WITH CHECK (usuario_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus reservas" ON reservas;
CREATE POLICY "Los usuarios pueden actualizar sus reservas"
  ON reservas FOR UPDATE
  USING (usuario_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Políticas para reseñas
DROP POLICY IF EXISTS "Todos pueden ver reseñas" ON resenas;
CREATE POLICY "Todos pueden ver reseñas"
  ON resenas FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Los usuarios pueden crear reseñas" ON resenas;
CREATE POLICY "Los usuarios pueden crear reseñas"
  ON resenas FOR INSERT
  WITH CHECK (usuario_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus reseñas" ON resenas;
CREATE POLICY "Los usuarios pueden actualizar sus reseñas"
  ON resenas FOR UPDATE
  USING (usuario_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus reseñas" ON resenas;
CREATE POLICY "Los usuarios pueden eliminar sus reseñas"
  ON resenas FOR DELETE
  USING (usuario_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Políticas para exchange_rates
DROP POLICY IF EXISTS "Todos pueden ver tasas de cambio" ON exchange_rates;
CREATE POLICY "Todos pueden ver tasas de cambio"
  ON exchange_rates FOR SELECT
  USING (true);

-- Políticas para verification_requests
DROP POLICY IF EXISTS "Los usuarios pueden ver sus solicitudes" ON verification_requests;
CREATE POLICY "Los usuarios pueden ver sus solicitudes"
  ON verification_requests FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Los usuarios pueden crear solicitudes" ON verification_requests;
CREATE POLICY "Los usuarios pueden crear solicitudes"
  ON verification_requests FOR INSERT
  WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Tasas de cambio iniciales (a CLP)
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
  ('USD', 'CLP', 950.00),
  ('ARS', 'CLP', 1.10),
  ('BRL', 'CLP', 180.00),
  ('PYG', 'CLP', 0.13),
  ('CLP', 'CLP', 1.00),
  ('CLP', 'USD', 0.00105),
  ('CLP', 'ARS', 0.91),
  ('CLP', 'BRL', 0.0056),
  ('CLP', 'PYG', 7.69)
ON CONFLICT (from_currency, to_currency) DO UPDATE
  SET rate = EXCLUDED.rate, updated_at = NOW();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de experiencias con información del guía
CREATE OR REPLACE VIEW experiencias_completas AS
SELECT 
  e.*,
  p.full_name as guia_nombre,
  p.avatar_url as guia_avatar,
  p.verified as guia_verificado,
  COUNT(DISTINCT r.id) as total_reservas,
  COUNT(DISTINCT re.id) as total_resenas
FROM experiencias e
LEFT JOIN profiles p ON e.usuario_id = p.clerk_user_id
LEFT JOIN reservas r ON e.id = r.experiencia_id AND r.estado = 'confirmada'
LEFT JOIN resenas re ON e.id = re.experiencia_id
GROUP BY e.id, p.full_name, p.avatar_url, p.verified;

-- Vista de reservas con detalles
CREATE OR REPLACE VIEW reservas_detalladas AS
SELECT 
  r.*,
  e.titulo as experiencia_titulo,
  e.categoria as experiencia_categoria,
  e.ubicacion as experiencia_ubicacion,
  e.imagenes as experiencia_imagenes,
  p.full_name as usuario_nombre,
  p.email as usuario_email,
  g.full_name as guia_nombre,
  g.email as guia_email
FROM reservas r
JOIN experiencias e ON r.experiencia_id = e.id
JOIN profiles p ON r.usuario_id = p.clerk_user_id
JOIN profiles g ON e.usuario_id = g.clerk_user_id;

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE profiles IS 'Perfiles de usuarios registrados vía Clerk';
COMMENT ON TABLE experiencias IS 'Servicios turísticos ofrecidos por guías';
COMMENT ON TABLE reservas IS 'Reservaciones realizadas por usuarios';
COMMENT ON TABLE resenas IS 'Reseñas y calificaciones de experiencias';
COMMENT ON TABLE exchange_rates IS 'Tasas de cambio entre monedas';
COMMENT ON TABLE verification_requests IS 'Solicitudes de verificación de guías';

-- ============================================
-- COMPLETADO
-- ============================================
-- Schema creado exitosamente
-- Para ejecutar: Copia este script en Supabase SQL Editor
-- ============================================

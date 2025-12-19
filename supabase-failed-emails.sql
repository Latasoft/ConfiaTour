-- ============================================
-- TABLA PARA TRACKEAR EMAILS FALLIDOS
-- Permite retry manual y monitoreo de problemas
-- ============================================

CREATE TABLE IF NOT EXISTS failed_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_type TEXT NOT NULL CHECK (email_type IN ('confirmacion', 'cancelacion', 'comprobante', 'proveedor')),
  reserva_id UUID REFERENCES reservas(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  experiencia_id UUID REFERENCES experiencias(id) ON DELETE SET NULL,
  error_message TEXT NOT NULL,
  retry_count INTEGER DEFAULT 3,
  retried_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  failed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_failed_emails_reserva 
ON failed_emails(reserva_id) WHERE resolved = false;

CREATE INDEX IF NOT EXISTS idx_failed_emails_date 
ON failed_emails(failed_at DESC) WHERE resolved = false;

CREATE INDEX IF NOT EXISTS idx_failed_emails_type 
ON failed_emails(email_type) WHERE resolved = false;

-- ============================================
-- FUNCIÓN PARA OBTENER EMAILS FALLIDOS PENDIENTES
-- ============================================

CREATE OR REPLACE FUNCTION get_pending_failed_emails(
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  email_type TEXT,
  reserva_id UUID,
  recipient_email TEXT,
  recipient_name TEXT,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fe.id,
    fe.email_type,
    fe.reserva_id,
    fe.recipient_email,
    fe.recipient_name,
    fe.failed_at,
    fe.error_message,
    fe.retry_count
  FROM failed_emails fe
  WHERE fe.resolved = false
  ORDER BY fe.failed_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN PARA MARCAR EMAIL COMO RESUELTO
-- ============================================

CREATE OR REPLACE FUNCTION mark_failed_email_resolved(
  p_failed_email_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE failed_emails
  SET 
    resolved = true,
    retried_at = NOW()
  WHERE id = p_failed_email_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISTA PARA MONITOREO
-- ============================================

CREATE OR REPLACE VIEW failed_emails_summary AS
SELECT 
  email_type,
  COUNT(*) as total_failures,
  COUNT(*) FILTER (WHERE resolved = false) as pending_failures,
  COUNT(*) FILTER (WHERE resolved = true) as resolved_failures,
  MAX(failed_at) as last_failure
FROM failed_emails
GROUP BY email_type;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE failed_emails IS 
'Registro de emails que fallaron después de 3 reintentos automáticos. Permite retry manual y monitoreo.';

COMMENT ON FUNCTION get_pending_failed_emails IS 
'Obtiene los emails fallidos que aún no han sido resueltos, para retry manual';

COMMENT ON FUNCTION mark_failed_email_resolved IS 
'Marca un email fallido como resuelto después de retry manual exitoso';

COMMENT ON VIEW failed_emails_summary IS 
'Resumen de emails fallidos agrupados por tipo para monitoreo';

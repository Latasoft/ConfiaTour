-- ============================================
-- CONFIATOUR - DATOS DE PRUEBA (SEED DATA)
-- ============================================

-- NOTA: Ejecutar después de supabase-schema.sql

-- ============================================
-- PERFILES DE PRUEBA
-- ============================================

-- Perfil de administrador
INSERT INTO profiles (clerk_user_id, email, full_name, avatar_url, bio, verified, user_type) VALUES
  ('admin_clerk_id', 'admin@confiatour.com', 'Admin ConfiaTour', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 'Administrador de la plataforma ConfiaTour', true, 'admin')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- Perfil de guía verificado 1
INSERT INTO profiles (clerk_user_id, email, full_name, avatar_url, phone, bio, verified, user_type) VALUES
  ('guia_001', 'guia1@confiatour.com', 'María González', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', '+56912345678', 'Guía turística certificada con 10 años de experiencia en el Valle del Elqui. Apasionada por la astronomía y el vino.', true, 'guia')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- Perfil de guía verificado 2
INSERT INTO profiles (clerk_user_id, email, full_name, avatar_url, phone, bio, verified, user_type) VALUES
  ('guia_002', 'guia2@confiatour.com', 'Carlos Muñoz', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', '+56987654321', 'Chef y guía gastronómico. Especialista en cocina chilena tradicional y fusión moderna.', true, 'guia')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- Perfil de guía verificado 3
INSERT INTO profiles (clerk_user_id, email, full_name, avatar_url, phone, bio, verified, user_type) VALUES
  ('guia_003', 'guia3@confiatour.com', 'Rodrigo Torres', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rodrigo', '+56956781234', 'Guía de aventura y trekking. Conozco cada rincón de la Patagonia chilena.', true, 'guia')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- Perfil de guía 4
INSERT INTO profiles (clerk_user_id, email, full_name, avatar_url, phone, bio, verified, user_type) VALUES
  ('guia_004', 'guia4@confiatour.com', 'Sofía Vargas', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia', '+56923456789', 'Historiadora y guía cultural. Me encanta compartir las historias de Valparaíso.', true, 'guia')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- Perfil de viajero 1
INSERT INTO profiles (clerk_user_id, email, full_name, avatar_url, verified, user_type) VALUES
  ('viajero_001', 'viajero1@example.com', 'Ana Martínez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', false, 'viajero')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- Perfil de viajero 2
INSERT INTO profiles (clerk_user_id, email, full_name, avatar_url, verified, user_type) VALUES
  ('viajero_002', 'viajero2@example.com', 'Pedro López', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro', false, 'viajero')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- ============================================
-- EXPERIENCIAS DE PRUEBA
-- ============================================

-- Experiencia 1: Tour astronómico Valle del Elqui
INSERT INTO experiencias (
  id, usuario_id, titulo, descripcion, categoria, ubicacion, precio, moneda, 
  capacidad, duracion, imagenes, disponible, rating_promedio
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'guia_001',
  'Tour Astronómico Valle del Elqui',
  'Descubre los secretos del universo en uno de los cielos más limpios del mundo. Incluye observación con telescopios profesionales, charla astronómica, piscos sour bajo las estrellas y traslados desde Vicuña. Una experiencia única que combina ciencia, naturaleza y tradición local.',
  'turismo',
  'Valle del Elqui, Coquimbo',
  45000,
  'CLP',
  12,
  '4 horas',
  '["https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800", "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800", "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800"]'::jsonb,
  true,
  4.8
)
ON CONFLICT (id) DO NOTHING;

-- Experiencia 2: Tour gastronómico Mercado Central
INSERT INTO experiencias (
  id, usuario_id, titulo, descripcion, categoria, ubicacion, precio, moneda, 
  capacidad, duracion, imagenes, disponible, rating_promedio
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'guia_002',
  'Tour Gastronómico Mercado Central de Santiago',
  'Explora los sabores auténticos de Chile en un recorrido guiado por el histórico Mercado Central. Degusta pescados y mariscos frescos, empanadas tradicionales, sopaipillas y vinos chilenos. Incluye 5 degustaciones, historia del mercado y recetas secretas de los locatarios.',
  'gastronomia',
  'Santiago Centro, Santiago',
  35000,
  'CLP',
  8,
  '3 horas',
  '["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800"]'::jsonb,
  true,
  4.6
)
ON CONFLICT (id) DO NOTHING;

-- Experiencia 3: Trekking Glaciar Grey
INSERT INTO experiencias (
  id, usuario_id, titulo, descripcion, categoria, ubicacion, precio, moneda, 
  capacidad, duracion, imagenes, disponible, rating_promedio
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'guia_003',
  'Trekking Glaciar Grey - Torres del Paine',
  'Aventura extrema al corazón de la Patagonia. Caminata guiada al imponente Glaciar Grey con vistas espectaculares. Incluye equipo de trekking, almuerzo tipo box lunch, seguro de accidentes y transporte desde Puerto Natales. Nivel de dificultad: medio-alto.',
  'aventura',
  'Torres del Paine, Magallanes',
  95000,
  'CLP',
  6,
  '8 horas',
  '["https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800"]'::jsonb,
  true,
  4.9
)
ON CONFLICT (id) DO NOTHING;

-- Experiencia 4: Walking Tour Valparaíso
INSERT INTO experiencias (
  id, usuario_id, titulo, descripcion, categoria, ubicacion, precio, moneda, 
  capacidad, duracion, imagenes, disponible, rating_promedio
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'guia_004',
  'Walking Tour Histórico por Valparaíso',
  'Recorre los cerros más emblemáticos del puerto principal de Chile. Visitaremos Cerro Alegre, Cerro Concepción, paseo Gervasoni, ascensores históricos y miradores con vistas al Pacífico. Incluye historia, arquitectura, street art y recomendaciones locales.',
  'cultura',
  'Valparaíso',
  20000,
  'CLP',
  15,
  '2.5 horas',
  '["https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800", "https://images.unsplash.com/photo-1611847765884-6f5e3f2fc1cd?w=800", "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800"]'::jsonb,
  true,
  4.7
)
ON CONFLICT (id) DO NOTHING;

-- Experiencia 5: Tour Viñedos Valle de Colchagua
INSERT INTO experiencias (
  id, usuario_id, titulo, descripcion, categoria, ubicacion, precio, moneda, 
  capacidad, duracion, imagenes, disponible, rating_promedio
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'guia_001',
  'Tour Viñedos Valle de Colchagua',
  'Descubre la ruta del vino en el Valle de Colchagua. Visita a dos viñas boutique con degustación de 6 vinos premium, recorrido por viñedos y bodegas, almuerzo maridaje incluido. Transporte desde Santiago en vehículo privado. Una experiencia enológica única.',
  'gastronomia',
  'Santa Cruz, Colchagua',
  85000,
  'CLP',
  10,
  'Día completo',
  '["https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800", "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800", "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800"]'::jsonb,
  true,
  4.5
)
ON CONFLICT (id) DO NOTHING;

-- Experiencia 6: Kayak Lago Llanquihue
INSERT INTO experiencias (
  id, usuario_id, titulo, descripcion, categoria, ubicacion, precio, moneda, 
  capacidad, duracion, imagenes, disponible, rating_promedio
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  'guia_003',
  'Kayak en Lago Llanquihue con Vista a Volcanes',
  'Rema en las aguas cristalinas del Lago Llanquihue con vistas panorámicas a los volcanes Osorno, Calbuco y Puntiagudo. Incluye kayak doble, equipo completo, instructor certificado, snack y bebidas. Apto para principiantes. Salida desde Puerto Varas.',
  'deportes',
  'Puerto Varas, Los Lagos',
  40000,
  'CLP',
  8,
  '3 horas',
  '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800", "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800"]'::jsonb,
  true,
  4.6
)
ON CONFLICT (id) DO NOTHING;

-- Experiencia 7: Tour Desierto Florido
INSERT INTO experiencias (
  id, usuario_id, titulo, descripcion, categoria, ubicacion, precio, moneda, 
  capacidad, duracion, imagenes, disponible, rating_promedio
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  'guia_001',
  'Tour Desierto Florido - Temporada Limitada',
  'Presencia el milagro del desierto más árido del mundo cubierto de flores. Tour guiado por los mejores puntos de floración, fotografía de paisajes únicos, explicación botánica del fenómeno. Incluye transporte 4x4, almuerzo campestre y agua mineral. Solo disponible septiembre-noviembre.',
  'naturaleza',
  'Región de Atacama',
  55000,
  'CLP',
  6,
  '6 horas',
  '["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800", "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800", "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800"]'::jsonb,
  true,
  4.9
)
ON CONFLICT (id) DO NOTHING;

-- Experiencia 8: Clase de Surf Pichilemu
INSERT INTO experiencias (
  id, usuario_id, titulo, descripcion, categoria, ubicacion, precio, moneda, 
  capacidad, duracion, imagenes, disponible, rating_promedio
) VALUES (
  'a0000000-0000-0000-0000-000000000008',
  'guia_003',
  'Clase de Surf para Principiantes en Pichilemu',
  'Aprende a surfear en la capital del surf de Chile. Clase práctica con instructores certificados, tabla y traje de neopreno incluidos. Grupo reducido para atención personalizada. Playa Punta de Lobos o Infiernillo según condiciones del mar.',
  'deportes',
  'Pichilemu, O''Higgins',
  30000,
  'CLP',
  6,
  '2 horas',
  '["https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800", "https://images.unsplash.com/photo-1455264745730-cb4b1b5c3b6a?w=800", "https://images.unsplash.com/photo-1535132011086-7384ba2a8bdd?w=800"]'::jsonb,
  true,
  4.4
)
ON CONFLICT (id) DO NOTHING;

-- Experiencia 9: Tour Isla de Pascua
INSERT INTO experiencias (
  id, usuario_id, titulo, descripcion, categoria, ubicacion, precio, moneda, 
  capacidad, duracion, imagenes, disponible, rating_promedio
) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  'guia_004',
  'Tour Arqueológico Isla de Pascua',
  'Descubre los misterios de Rapa Nui. Visita a Ahu Tongariki (15 moais), Rano Raraku (cantera de moais), Anakena (playa sagrada) y Ahu Akivi. Guía local experto en cultura rapanui, entrada al Parque Nacional incluida. Almuerzo tradicional curanto.',
  'cultura',
  'Isla de Pascua',
  120000,
  'CLP',
  8,
  'Día completo',
  '["https://images.unsplash.com/photo-1580878394656-c60951d87a3d?w=800", "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800", "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800"]'::jsonb,
  true,
  5.0
)
ON CONFLICT (id) DO NOTHING;

-- Experiencia 10: Cabalgata Valle Cochamó
INSERT INTO experiencias (
  id, usuario_id, titulo, descripcion, categoria, ubicacion, precio, moneda, 
  capacidad, duracion, imagenes, disponible, rating_promedio
) VALUES (
  'a0000000-0000-0000-0000-000000000010',
  'guia_003',
  'Cabalgata Valle Cochamó - Patagonia Virgen',
  'Explora el "Yosemite chileno" a caballo. Recorre bosques nativos milenarios, cruza ríos cristalinos y contempla paredes de granito de 1000 metros. Incluye caballo manso, guía huaso tradicional, almuerzo campestre y mate. Experiencia para todos los niveles.',
  'aventura',
  'Cochamó, Los Lagos',
  65000,
  'CLP',
  6,
  '5 horas',
  '["https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800"]'::jsonb,
  true,
  4.7
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RESERVAS DE PRUEBA
-- ============================================

-- Reserva confirmada
INSERT INTO reservas (
  experiencia_id, usuario_id, fecha_experiencia, cantidad_personas, precio_total, 
  estado, metodo_pago, pagado, buy_order, codigo_autorizacion, fecha_pago
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'viajero_001',
  CURRENT_DATE + INTERVAL '10 days',
  2,
  90000,
  'confirmada',
  'transbank',
  true,
  'CT-2024-0001',
  'AUTH123456',
  NOW() - INTERVAL '2 days'
)
ON CONFLICT (buy_order) DO NOTHING;

-- Reserva pendiente de pago
INSERT INTO reservas (
  experiencia_id, usuario_id, fecha_experiencia, cantidad_personas, precio_total, 
  estado, metodo_pago, pagado, buy_order, session_id
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'viajero_002',
  CURRENT_DATE + INTERVAL '5 days',
  4,
  140000,
  'pendiente_pago',
  'transbank',
  false,
  'CT-2024-0002',
  'SESSION789012'
)
ON CONFLICT (buy_order) DO NOTHING;

-- Reserva completada
INSERT INTO reservas (
  experiencia_id, usuario_id, fecha_experiencia, cantidad_personas, precio_total, 
  estado, metodo_pago, pagado, buy_order, codigo_autorizacion, fecha_pago
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'viajero_001',
  CURRENT_DATE - INTERVAL '15 days',
  1,
  20000,
  'completada',
  'transbank',
  true,
  'CT-2024-0003',
  'AUTH789012',
  NOW() - INTERVAL '20 days'
)
ON CONFLICT (buy_order) DO NOTHING;

-- ============================================
-- RESEÑAS DE PRUEBA
-- ============================================

-- Reseña 1
INSERT INTO resenas (experiencia_id, usuario_id, rating, comentario) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'viajero_001',
  5,
  'Excelente tour! Sofía conoce cada rincón de Valparaíso y cuenta historias fascinantes. Las vistas desde los miradores son impresionantes. 100% recomendado.'
)
ON CONFLICT (experiencia_id, usuario_id) DO NOTHING;

-- Reseña 2
INSERT INTO resenas (experiencia_id, usuario_id, rating, comentario) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'viajero_002',
  5,
  'Una experiencia mágica. Ver las estrellas con telescopios profesionales y disfrutar un pisco sour bajo el cielo más limpio del mundo es inolvidable. María es una excelente guía.'
)
ON CONFLICT (experiencia_id, usuario_id) DO NOTHING;

-- Reseña 3
INSERT INTO resenas (experiencia_id, usuario_id, rating, comentario) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'viajero_001',
  4,
  'Muy buen tour gastronómico. Carlos conoce todos los secretos del mercado y las degustaciones son generosas. Solo le restaría una estrella porque el grupo era un poco grande.'
)
ON CONFLICT (experiencia_id, usuario_id) DO NOTHING;

-- Reseña 4
INSERT INTO resenas (experiencia_id, usuario_id, rating, comentario) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'viajero_002',
  5,
  'Espectacular! El trekking es exigente pero Rodrigo va al ritmo del grupo y las vistas del glaciar valen totalmente el esfuerzo. Imprescindible si visitas la Patagonia.'
)
ON CONFLICT (experiencia_id, usuario_id) DO NOTHING;

-- Reseña 5
INSERT INTO resenas (experiencia_id, usuario_id, rating, comentario) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  'viajero_001',
  5,
  'El mejor tour de mi vida. Ver los moais de cerca y aprender sobre la cultura rapanui fue increíble. El almuerzo tradicional también estuvo delicioso. Totalmente recomendado!'
)
ON CONFLICT (experiencia_id, usuario_id) DO NOTHING;

-- ============================================
-- SOLICITUDES DE VERIFICACIÓN DE PRUEBA
-- ============================================

-- Solicitud aprobada
INSERT INTO verification_requests (
  clerk_user_id, full_name, phone, id_document_url, business_description, 
  status, reviewed_by, reviewed_at
) VALUES (
  'guia_001',
  'María González',
  '+56912345678',
  'https://example.com/docs/maria-id.pdf',
  'Guía turística certificada especializada en astronomía y enoturismo en el Valle del Elqui.',
  'approved',
  'admin_clerk_id',
  NOW() - INTERVAL '30 days'
);

-- Solicitud pendiente
INSERT INTO verification_requests (
  clerk_user_id, full_name, phone, id_document_url, additional_docs_urls, business_description, 
  status
) VALUES (
  'guia_004',
  'Sofía Vargas',
  '+56923456789',
  'https://example.com/docs/sofia-id.pdf',
  '["https://example.com/docs/sofia-certificate.pdf"]'::jsonb,
  'Historiadora y guía cultural en Valparaíso con certificación de guía turístico regional.',
  'pending'
);

-- ============================================
-- ESTADÍSTICAS FINALES
-- ============================================

DO $$
DECLARE
  total_experiencias INTEGER;
  total_reservas INTEGER;
  total_usuarios INTEGER;
  total_resenas INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_experiencias FROM experiencias;
  SELECT COUNT(*) INTO total_reservas FROM reservas;
  SELECT COUNT(*) INTO total_usuarios FROM profiles;
  SELECT COUNT(*) INTO total_resenas FROM resenas;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'SEED DATA COMPLETADO EXITOSAMENTE';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total Usuarios: %', total_usuarios;
  RAISE NOTICE 'Total Experiencias: %', total_experiencias;
  RAISE NOTICE 'Total Reservas: %', total_reservas;
  RAISE NOTICE 'Total Reseñas: %', total_resenas;
  RAISE NOTICE '============================================';
END $$;

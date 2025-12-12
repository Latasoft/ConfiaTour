# ConfiaTour - Plataforma de Turismo Regional Colaborativo

ConfiaTour es una plataforma digital diseñada para facilitar el acceso, la promoción y la gestión de experiencias turísticas regionales en el corredor Bioceánico. La plataforma permite consolidar paquetes turísticos, coordinar servicios de transporte, alojamiento y guías locales, y gestionar reservas de forma segura y trazable.

## 🎯 Objetivo Principal

Impulsar el turismo regional entre pequeñas y medianas empresas, emprendedores turísticos y comunidades locales, promoviendo la integración cultural, económica y social de las regiones conectadas por el corredor Bioceánico. ConfiaTour busca dinamizar el turismo mediante una plataforma confiable que facilite la planificación, reserva y ejecución de experiencias auténticas, fortaleciendo la identidad local y el desarrollo territorial.

## 👥 Público Objetivo

- **Viajeros nacionales e internacionales** interesados en experiencias culturales, ecológicas y comunitarias
- **Emprendedores turísticos locales** que ofrecen servicios de alojamiento, gastronomía, transporte y guiado
- **Cooperativas, asociaciones y comunidades** que desean visibilizar su patrimonio y generar ingresos a través del turismo
- **Municipios y gobiernos regionales** que promueven el desarrollo turístico sostenible

## ✨ Beneficios Clave

- **Consolidación de experiencias**: Integración de servicios turísticos en paquetes regionales para reducir costos y mejorar la oferta
- **Gestión simplificada**: Sistema digital para reservas, pagos y coordinación logística
- **Pagos seguros y trazables**: Plataforma con reputación verificada y seguimiento de cada operación
- **Alianzas estratégicas**: Colaboración con operadores turísticos, comunidades locales y entidades públicas
- **Promoción de destinos emergentes**: Visibilidad para zonas con alto potencial turístico pero baja exposición comercial
- **Turismo con propósito**: Conexión directa con la cultura, la naturaleza y la economía local

## 🌎 Corredor Bioceánico

El corredor Bioceánico conecta regiones estratégicas como **Salta, Jujuy, Antofagasta, el Chaco paraguayo y el sur de Brasil**, formando una red de intercambio cultural y económico entre Argentina, Chile, Brasil y Paraguay. Esta infraestructura facilita el turismo regional, permitiendo el tránsito de viajeros por rutas diversas que integran:

- Paisajes naturales únicos
- Comunidades originarias
- Patrimonio histórico
- Gastronomía local auténtica

## 🔧 Características Técnicas

### Funcionalidades Principales

- **Explorar experiencias**: Navega por una amplia variedad de experiencias turísticas regionales
- **Sistema de filtros avanzado**: Encuentra experiencias por categoría, precio, ubicación y tipo de actividad
- **Categorías expandidas**: Turismo, gastronomía, aventura, naturaleza, cultura, deportes, **alojamiento, transporte y tours locales**
- **Crear experiencias**: Los guías y emprendedores pueden publicar sus propias experiencias
- **Gestión integral de reservas**: Sistema completo de reservas y pagos seguros
- **Autenticación segura**: Integración con Clerk para manejo de usuarios verificados
- **Pagos integrados**: Soporte para Transbank y Mercado Pago
- **Perfil de usuario**: Gestiona experiencias creadas, reservas y reputación

### Sistema de Notificaciones por Email

- **Confirmaciones de reserva**: Email automático al usuario con detalles de su reserva
- **Notificaciones al proveedor**: Alertas cuando un usuario realiza una reserva en su experiencia
- **Comprobantes de pago**: Recibos electrónicos con detalles de transacciones
- **Cancelaciones**: Notificación automática de cancelación de reservas
- **Servicio Resend**: Integración para envío confiable de emails transaccionales

### Panel de Administración

- **Dashboard con KPIs**: Vista general con métricas clave de la plataforma
- **Gestión de experiencias**: Listar, filtrar, activar/desactivar y eliminar experiencias
- **Gestión de reservas**: Monitoreo de reservas con cambio de estados
- **Gestión de usuarios**: Listar usuarios, ver estadísticas y controlar verificaciones
- **Verificaciones de identidad**: Revisar documentos, aprobar o rechazar solicitudes
- **Estadísticas detalladas**:
  - Métricas de reservas (confirmadas, pendientes, canceladas, completadas)
  - Distribución de experiencias por categoría
  - Estadísticas de usuarios (viajeros, guías, verificados)
  - Ingresos mensuales por moneda (CLP, USD, ARS, BRL, PYG)
  - Top 5 experiencias más reservadas
- **Control de acceso**: Protección mediante lista de emails autorizados
- **API REST para admin**: Endpoints seguros para operaciones administrativas

## 🏗️ Estructura del Proyecto

```
app/
├── como-funciona/         # Página explicativa del funcionamiento de la plataforma
├── experiencias/          # Listado y detalle de experiencias turísticas
│   ├── [id]/             # Página de detalle de experiencia individual
│   └── crear/            # Formulario para crear nuevas experiencias
├── mis-experiencias/      # Dashboard del usuario para gestionar sus experiencias
├── sobre-nosotros/        # Información de la empresa y el corredor Bioceánico
└── api/                  # Endpoints de la API
    └── transbank/        # Integración de pagos con Transbank

components/
├── BenefitsSection.js     # Sección de beneficios de la plataforma
├── CorredorSection.js     # Información del corredor Bioceánico
├── ExperienciaCard.js     # Tarjeta de experiencia individual
├── FiltrosExperiencias.js # Sistema de filtros avanzado
├── HeroSection.js         # Sección principal de la landing page
└── Navbar.js             # Barra de navegación principal

lib/
├── experiencias.js        # Lógica de manejo de experiencias turísticas
├── mercagoPago.js        # Integración con Mercado Pago
├── supabaseClient.js     # Cliente de Supabase (base de datos)
├── transbank.js          # Integración con Transbank
└── uploadImages.js       # Sistema de subida y gestión de imágenes
```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15.5.2 con App Router, React 19.1.0
- **Lenguajes**: TypeScript + JavaScript (migración gradual)
- **Autenticación**: Clerk v6.31.6 para verificación de usuarios
- **Base de datos**: Supabase v2.56.0 (PostgreSQL)
- **Emails**: Resend v6.1.3 para notificaciones transaccionales
- **Pagos**: Transbank (Chile) y Mercado Pago (LATAM)
- **Validación**: Zod v3.24.1 para schemas
- **Estilos**: Tailwind CSS v4
- **Testing**: Jest 30.2.0 + React Testing Library
- **Hospedaje de imágenes**: Sistema de upload personalizado con Supabase Storage
- **Despliegue**: Optimizado para Vercel con Turbopack

## ⚙️ Configuración del Entorno

1. Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/tu-usuario/ConfiaTour.git
cd ConfiaTour
npm install
```

2. Configura las variables de entorno en `.env.local`:

```bash
# Clerk (Autenticación)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clerk_publishable_key
CLERK_SECRET_KEY=tu_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase (Base de datos)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Resend (Sistema de Emails)
RESEND_API_KEY=tu_resend_api_key
RESEND_FROM_EMAIL=notificaciones@confiatour.com

# Transbank (Pagos Chile)
TRANSBANK_API_KEY=tu_transbank_api_key
TRANSBANK_SECRET_KEY=tu_transbank_secret_key
TRANSBANK_ENVIRONMENT=integration

# Mercado Pago (Pagos LATAM)
MERCADO_PAGO_ACCESS_TOKEN=tu_mercado_pago_token
MERCADO_PAGO_PUBLIC_KEY=tu_mercado_pago_public_key

# Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📄 Funcionalidades por Página

### Página Principal (`/`)

- Hero section con información del corredor Bioceánico
- Sección de beneficios de la plataforma
- Vista previa de experiencias destacadas por región

### Experiencias (`/experiencias`)

- Catálogo completo de experiencias disponibles
- Sistema de filtros por región, categoría, precio y tipo
- Búsqueda geográfica integrada
- Mapa interactivo del corredor Bioceánico
- **Soporte para 9 categorías**: turismo, gastronomía, aventura, naturaleza, cultura, deportes, alojamiento, transporte, tours

### Crear Experiencia (`/experiencias/crear`)

- Formulario para emprendedores y guías turísticos
- Subida múltiple de imágenes
- Configuración de precios, disponibilidad y logística
- Integración con servicios de transporte y alojamiento
- Selección de categoría expandida

### Mis Experiencias (`/mis-experiencias`)

- Dashboard completo del emprendedor
- Gestión de experiencias publicadas
- Análisis de reservas y ganancias
- Sistema de reputación y reseñas
- Notificaciones automáticas por email de nuevas reservas

### Mis Reservas (`/mis-reservas`)

- Historial completo de reservas realizadas
- Estados de reservas (pendiente, confirmada, completada, cancelada)
- Detalles de pago y confirmación
- Recepción automática de emails de confirmación

### Panel de Administración (`/admin/*`)

**Acceso restringido a administradores autorizados**

#### Dashboard (`/admin`)

- Vista general con 4 KPIs principales
- Gráfico de distribución de estados de reservas
- Distribución de experiencias por categoría
- Top 5 experiencias más reservadas
- Gráfico de ingresos mensuales (12 meses)

#### Gestión de Experiencias (`/admin/experiencias`)

- Tabla con todas las experiencias de la plataforma
- Filtros por categoría y estado
- Acciones: activar/desactivar disponibilidad, eliminar
- Estadísticas rápidas (total, activas, inactivas)

#### Gestión de Reservas (`/admin/reservas`)

- Tabla con todas las reservas del sistema
- Filtros por estado de reserva
- Modal de detalles con información completa
- Cambio de estado de reserva
- Visualización de detalles de pago

#### Gestión de Usuarios (`/admin/usuarios`)

- Listado completo de usuarios registrados
- Filtros por tipo (viajero, guía, admin) y estado de verificación
- Estadísticas de actividad: experiencias publicadas y reservas realizadas
- Verificar/desverificar usuarios manualmente
- Modal de detalles con biografía y actividad

#### Verificaciones de Identidad (`/admin/verificaciones`)

- Revisión de solicitudes de verificación pendientes
- Visualización de documentos (carnet frontal, trasero, foto de rostro)
- Aprobación o rechazo de solicitudes
- Notas administrativas en cada decisión
- Actualización automática de estado de usuario

### Cómo Funciona (`/como-funciona`)

- Guía completa para viajeros y emprendedores
- Información sobre el proceso de reserva y pago
- Explicación del modelo colaborativo

### Sobre Nosotros (`/sobre-nosotros`)

- Historia y misión de ConfiaTour
- Información detallada del corredor Bioceánico
- Impacto social y económico del proyecto

## 💳 Arquitectura de Pagos

Sistema de pagos multi-región optimizado para el corredor Bioceánico:

1. **Transbank**: Pagos con tarjetas chilenas y transferencias locales
2. **Mercado Pago**: Pagos en Argentina, Brasil, Paraguay y métodos alternativos
3. **Gestión de divisas**: Conversión automática entre monedas regionales
4. **Webhooks seguros**: Confirmación en tiempo real de transacciones

## 📊 Base de Datos

Esquema optimizado en Supabase:

- **profiles**: Perfiles de usuarios con información completa
  - Campos: clerk_user_id, full_name, email, phone, bio, user_type, verified, created_at, updated_at
  - Tipos de usuario: viajero, guía, admin
  - Estado de verificación booleano
- **experiencias**: Catálogo de actividades turísticas
  - Campos: id, titulo, descripcion, categoria, ubicacion, precio, moneda, capacidad, duracion, imagenes, disponible, estado, usuario_id
  - Categorías: turismo, gastronomía, aventura, naturaleza, cultura, deportes, alojamiento, transporte, tours
  - Estados: activa, pausada, finalizada
- **reservas**: Sistema de booking con estados y trazabilidad
  - Campos: id, experiencia_id, usuario_id, fecha_experiencia, cantidad_personas, precio_total, estado, metodo_pago, transaccion_id
  - Estados: pendiente, confirmada, completada, cancelada
  - Métodos de pago: transbank, mercadopago
  - Emails automáticos en cambios de estado
- **verification_requests**: Solicitudes de verificación de identidad

  - Campos: id, clerk_user_id, carnet_frontal_path, carnet_trasero_path, foto_cara_path, status, submitted_at, reviewed_at, reviewed_by, admin_notes
  - Estados: pending, approved, rejected
  - Integración con admin panel para revisión

- **Reseñas**: Sistema de reputación bilateral (futuro)
- **Regiones**: Información geográfica del corredor
- **Alianzas**: Red de partners y colaboradores

## 🚀 Visión a Futuro

ConfiaTour aspira a convertirse en la plataforma líder de turismo colaborativo en el corredor Bioceánico, expandiendo su alcance a:

- **Nuevas regiones**: Integración de más países y territorios
- **Servicios financieros**: Microcréditos para emprendedores turísticos
- **Seguros de viaje**: Cobertura integral para experiencias
- **Movilidad inteligente**: Optimización de rutas y transporte
- **Herramientas de promoción**: Marketing digital para destinos emergentes
- **Impacto sostenible**: Medición del desarrollo territorial

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/CorredorBioceánico`)
3. Commit tus cambios (`git commit -m 'Add: Nueva funcionalidad del corredor'`)
4. Push a la rama (`git push origin feature/CorredorBioceánico`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

_ConfiaTour - Conectando culturas, impulsando territorios_ 🌎

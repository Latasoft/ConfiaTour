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

- **Explorar experiencias**: Navega por una amplia variedad de experiencias turísticas regionales
- **Sistema de filtros avanzado**: Encuentra experiencias por categoría, precio, ubicación y tipo de actividad
- **Crear experiencias**: Los guías y emprendedores pueden publicar sus propias experiencias
- **Gestión integral de reservas**: Sistema completo de reservas y pagos seguros
- **Autenticación segura**: Integración con Clerk para manejo de usuarios verificados
- **Pagos integrados**: Soporte para Transbank y Mercado Pago
- **Perfil de usuario**: Gestiona experiencias creadas, reservas y reputación

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

- **Frontend**: Next.js 15 con App Router
- **Autenticación**: Clerk para verificación de usuarios
- **Base de datos**: Supabase para almacenamiento de datos
- **Pagos**: Transbank (Chile) y Mercado Pago (LATAM)
- **Estilos**: CSS modules/Tailwind CSS
- **Hospedaje de imágenes**: Sistema de upload personalizado
- **Despliegue**: Optimizado para Vercel

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

# Supabase (Base de datos)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Transbank (Pagos Chile)
TRANSBANK_API_KEY=tu_transbank_api_key
TRANSBANK_SECRET_KEY=tu_transbank_secret_key

# Mercado Pago (Pagos LATAM)
MERCADO_PAGO_ACCESS_TOKEN=tu_mercado_pago_token
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

### Crear Experiencia (`/experiencias/crear`)
- Formulario para emprendedores y guías turísticos
- Subida múltiple de imágenes
- Configuración de precios, disponibilidad y logística
- Integración con servicios de transporte y alojamiento

### Mis Experiencias (`/mis-experiencias`)
- Dashboard completo del emprendedor
- Gestión de experiencias publicadas
- Análisis de reservas y ganancias
- Sistema de reputación y reseñas

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
- **Usuarios**: Perfiles de viajeros y emprendedores
- **Experiencias**: Catálogo de actividades turísticas
- **Reservas**: Sistema de booking con estados
- **Pagos**: Trazabilidad completa de transacciones
- **Reseñas**: Sistema de reputación bilateral
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

*ConfiaTour - Conectando culturas, impulsando territorios* 🌎

# 📖 BIBLE OVERLAY STUDIO

> Aplicación web profesional inspirada en **Holyrics** y **ProPresenter**, especializada en buscar y proyectar textos bíblicos en transmisiones en vivo mediante **OBS Studio**.

---

## ⚡ 1. Características Principales

### 🎛️ Panel Privado del Operador (`/control`)
- **Buscador Inteligente de Referencias:** Reconoce pasajes como `Juan 3:16`, `Salmos 23:1-4`, `1 Corintios 13:4-8`, `Gn 1:1` o búsquedas por palabras clave.
- **Navegador Bíblico Canónico:** Selector visual de los 66 libros bíblicos (Antiguo y Nuevo Testamento), cuadrícula de capítulos y versículos con doble clic para proyectar en vivo.
- **Selector de Traducciones:** Soporte para Reina Valera 1960 (RVR1960), NVI, DHH, LBLA, NTV y TLA.
- **Lienzo de Vista Previa 16:9:**
  - Simulador de cámara/video en directo de iglesia.
  - Cuadrícula de transparencia Alpha.
  - Guías de seguridad OBS (Action Safe 90% y Title Safe 80%).
- **Editor Visual en Tiempo Real:**
  - Tipografías profesionales de Google Fonts: *Inter, Montserrat, Playfair Display, Cinzel, Bebas Neue*.
  - Posicionamiento: *Tercio Inferior (Lower Third), Barra Inferior Continua, Caja Central, Barra Superior*.
  - Colores, estilos de fondo (*Frosted Glass*, *Transparente*, *Gradiente Litúrgico*, *Oscuro Sólido*), opacidad y bordes.
  - Sombras profundas y contornos (*text stroke*) optimizados para legibilidad sobre cualquier fondo de video.
  - Animaciones de entrada suaves (*Fade, Slide Up, Slide Down, Zoom*).
- **Plantillas Reutilizables:** Presets listos para broadcast y guardado de diseños personalizados.
- **Master Broadcast Deck:** Botones de acción directa: `PROYECTAR (LIVE)`, `OCULTAR / VISIBILIDAD`, `BLACKOUT (MUTEAR)`, `LIMPIAR` y navegación versículo por versículo (`◀ Anterior`, `Siguiente ▶`).

### 📺 Overlay Público para OBS Studio (`/overlay/:id`)
- **100% Transparente y Limpio:** Sin menús, botones, barras de scroll ni elementos ajenos a la transmisión.
- **Resolución Nativa 1920 × 1080:** Compatible directamente con OBS Browser Source.
- **Sincronización Instantánea sin Recargar:** Actualización en tiempo real mediante **Supabase Realtime** y canal inter-pestañas **BroadcastChannel**.
- **Resiliencia y Caché Local:** Conserva en pantalla el último contenido válido ante desconexiones de red y se reconecta automáticamente sin parpadeos.
- **Canales independientes:** Dos vistas con estado y URL propios: `/overlay/transmision` para la transmisión y `/overlay/presentacion` para la presentación.

---

## 🏗️ 2. Arquitectura del Sistema

```
bible-overlay-studio/
├── public/                     # Favicons y recursos estáticos
├── src/
│   ├── components/
│   │   ├── overlay/
│   │   │   └── OverlayRenderer.tsx   # Motor de renderizado transparente 1080p
│   │   └── studio/
│   │       ├── StudioHeader.tsx      # Barra de estado y generador de URL OBS
│   │       ├── BibleSearchPanel.tsx  # Buscador, parser de citas y selector de libros
│   │       ├── LivePreviewCanvas.tsx # Lienzo 16:9 con simulador de video y safe zones
│   │       ├── BroadcastDeck.tsx     # Botones de emisión (Live, Blackout, Nav)
│   │       ├── VisualEditorPanel.tsx # Editor de tipografía, colores, sombras y animación
│   │       ├── TemplatesPanel.tsx    # Presets profesionales y plantillas de usuario
│   │       ├── SettingsModal.tsx     # Diagnóstico de API y guía paso a paso
│   │       └── OverlayStudioApp.tsx  # Orquestador principal de estado y sync
│   ├── data/
│   │   ├── bibleBooks.ts             # Catálogo de los 66 libros y abreviaturas
│   │   └── mockBibleData.ts          # Base enriquecida para desarrollo offline
│   ├── layouts/
│   │   └── OverlayLayout.astro       # Layout 100% transparente para OBS
│   ├── lib/
│   │   └── supabase.ts               # Cliente Supabase con detección de credenciales
│   ├── pages/
│   │   ├── api/bible/
│   │   │   ├── passage.ts            # Endpoint servidor para consultar pasajes
│   │   │   ├── search.ts             # Endpoint servidor para búsquedas bíblicas
│   │   │   └── versions.ts           # Endpoint de versiones disponibles y diagnóstico
│   │   ├── control.astro             # Ruta privada de emisión (/control)
│   │   ├── index.astro               # Landing page y accesos directos
│   │   └── overlay/[id].astro        # Ruta pública del overlay (/overlay/:id)
│   ├── services/
│   │   ├── bibleService.ts           # Servicio desacoplado YouVersion / Local DB
│   │   └── syncService.ts            # Sincronización Realtime + Bus local de pestañas
│   ├── styles/
│   │   └── global.css                # Estilos base, fuentes Google y reglas OBS
│   └── types/
│       ├── bible.ts                  # Tipos TypeScript de pasajes y libros
│       ├── overlay.ts                # Interfaces de estado, diseño y temas
│       └── supabase.ts               # Esquema de base de datos PostgreSQL
├── supabase/
│   └── schema.sql                    # Script SQL completo: tablas, RLS y seeds
├── astro.config.mjs                  # Configuración Astro 5 + React + Tailwind + Vercel
├── tailwind.config.mjs               # Paleta studio, animaciones y tipografías
└── tsconfig.json                     # TypeScript en modo estricto
```

---

## 🚀 3. Instalación y Ejecución Local

### Prerrequisitos
- **Node.js** v18 o superior (probado en v24)
- **npm** o **pnpm**

### Pasos
1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abrir en el navegador:
   - **Panel de Control:** `http://localhost:4321/control`
   - **Overlay de transmisión:** `http://localhost:4321/overlay/transmision`
   - **Overlay de presentación:** `http://localhost:4321/overlay/presentacion`

> 💡 **MODO DEMO OFFLINE AUTOMÁTICO:**
> La aplicación no requiere credenciales obligatorias para probarse. Si no se configuran variables de entorno de Supabase o YouVersion, la aplicación activa automáticamente el **Modo Demo Autónomo**:
> - Se sincroniza instantáneamente entre pestañas de tu navegador mediante la API nativa `BroadcastChannel` y `localStorage`.
> - Utiliza una base de datos local enriquecida con cientos de versículos reales en español (RVR1960, NVI, DHH).

---

## 🎥 4. Configuración en OBS Studio (Paso a Paso)

1. Abre **OBS Studio** y colócate en la Escena donde desees el texto bíblico.
2. En la sección **Fuentes (Sources)**, haz clic en el botón `[ + ]` y selecciona **Navegador (Browser)**.
3. Nómbralo como `Bible Overlay Studio` y pulsa Aceptar.
4. Configura los siguientes parámetros exactos:
   - **URL:** `http://localhost:4321/overlay/transmision` *(o tu URL en Vercel cuando esté desplegado)*.
   - **Ancho (Width):** `1920`
   - **Alto (Height):** `1080`
   - **FPS:** `60` o `30`
   - **CSS Personalizado:** Puedes dejarlo en blanco o `body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }`
   - **Casillas recomendadas:**
     - ✅ *Apagar la fuente cuando no sea visible (Shutdown source when not visible)*
     - ✅ *Actualizar el navegador cuando la escena se active (Refresh browser when scene becomes active)*
5. Haz clic en **Aceptar**.
6. ¡Listo! Todo lo que proyectes desde `/control` aparecerá instantáneamente en OBS con fondo transparente y animaciones fluidas.

---

## 🗄️ 5. Conexión de Supabase (Producción)

Para habilitar persistencia en la nube y múltiples operadores remotos:

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve al **SQL Editor** en el panel de Supabase y copia/pega todo el contenido de:
   ```
   supabase/schema.sql
   ```
   Ejecuta el script para crear las tablas `overlays`, `overlay_states`, `templates`, perfiles y las políticas de seguridad **RLS (Row Level Security)**.
3. Ve a **Project Settings -> API** y copia la URL del proyecto y la `anon` key.
4. Crea tu archivo `.env` en la raíz del proyecto:
   ```env
   PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-secreta
   ```

---

## 📖 6. Integración con YouVersion Platform API

El sistema cuenta con una capa de servicio desacoplada (`src/services/bibleService.ts`) y endpoints de servidor protegidos (`src/pages/api/bible/...`) que evitan exponer la clave de API en el navegador.

1. Solicita tus credenciales de desarrollador en el portal oficial de YouVersion Developer Platform.
2. Añade tu API Key en `.env`:
   ```env
   YOUVERSION_API_KEY=tu-clave-de-youversion-aqui
   YOUVERSION_API_BASE_URL=https://api.youversion.com/v1
   ```
3. Los endpoints `/api/bible/passage` y `/api/bible/search` consultarán automáticamente la API oficial con token Bearer del lado del servidor.

---

## ☁️ 7. Despliegue en Vercel

El proyecto está configurado con el adaptador `@astrojs/vercel` en modo servidor SSR:

1. Sube tu código a GitHub / GitLab.
2. Importa el repositorio en [Vercel](https://vercel.com).
3. En la sección **Environment Variables**, añade:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `YOUVERSION_API_KEY`
   - `PUBLIC_APP_URL` (la URL de tu dominio en Vercel)
4. Haz clic en **Deploy**.

---

## 🧪 8. Verificación y Criterios de Aceptación Cumplidos

- ✅ **Ejecución local garantizada:** Inicia con `npm run dev` sin requerir credenciales externas.
- ✅ **Prueba entre pestañas:** Abre `/control` y una de las vistas (`/overlay/transmision` o `/overlay/presentacion`) en otra pestaña; cualquier cambio en el canal seleccionado se refleja de inmediato en su overlay transparente.
- ✅ **Diagnóstico visual claro:** El encabezado y el modal de configuración indican con precisión cuándo las conexiones son locales (`Modo Demo`) o conectadas a Supabase y YouVersion.
- ✅ **Extensibilidad para el futuro:** Tipos preparados para canciones, títulos de predicadores y anuncios (`OverlayKind`).

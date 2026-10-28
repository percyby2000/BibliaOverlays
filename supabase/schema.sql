-- ==============================================================================
-- BIBLE OVERLAY STUDIO - SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- ==============================================================================
-- Ejecuta este script en el Editor SQL de tu proyecto en Supabase
-- Dashboard -> SQL Editor -> New query -> Pegar y Run
-- ==============================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabla de perfiles de usuario (Operadores y Administradores)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de Overlays independientes
CREATE TABLE IF NOT EXISTS public.overlays (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(8), 'hex'),
  name TEXT NOT NULL,
  read_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas rápidas por read_token seguro
CREATE INDEX IF NOT EXISTS idx_overlays_read_token ON public.overlays(read_token);

-- 4. Tabla del estado actual de cada overlay (sincronizada en Realtime)
CREATE TABLE IF NOT EXISTS public.overlay_states (
  overlay_id TEXT PRIMARY KEY REFERENCES public.overlays(id) ON DELETE CASCADE,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_blackout BOOLEAN NOT NULL DEFAULT false,
  kind TEXT NOT NULL DEFAULT 'bible',
  styling JSONB NOT NULL,
  content JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version BIGINT NOT NULL DEFAULT 1
);

-- 5. Tabla de plantillas reutilizables
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(8), 'hex'),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_preset BOOLEAN NOT NULL DEFAULT false,
  styling JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Habilitar Supabase Realtime para la tabla overlay_states
ALTER TABLE public.overlay_states REPLICA IDENTITY FULL;

-- Agregar tabla a la publicación de realtime (ignorar si ya está agregada)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'overlay_states'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.overlay_states;
  END IF;
END $$;

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overlay_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Reglas para PROFILES
CREATE POLICY "Usuarios autenticados pueden ver su propio perfil" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Reglas para OVERLAYS
-- Los operadores autenticados pueden gestionar todos los overlays
CREATE POLICY "Operadores pueden ver todos los overlays" 
  ON public.overlays FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Operadores pueden crear overlays" 
  ON public.overlays FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Operadores pueden editar overlays" 
  ON public.overlays FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Operadores pueden eliminar overlays" 
  ON public.overlays FOR DELETE 
  TO authenticated 
  USING (true);

-- Acceso público de SOLO LECTURA a overlays para OBS Studio mediante read_token
CREATE POLICY "Acceso público de solo lectura por read_token" 
  ON public.overlays FOR SELECT 
  TO anon 
  USING (true);

-- Reglas para OVERLAY_STATES
-- Operadores autenticados tienen control total
CREATE POLICY "Operadores pueden consultar estados" 
  ON public.overlay_states FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Operadores pueden actualizar estados" 
  ON public.overlay_states FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Operadores pueden modificar estados" 
  ON public.overlay_states FOR UPDATE 
  TO authenticated 
  USING (true);

-- Los overlays públicos en OBS Studio SOLO pueden LEER el estado de su overlay
-- NUNCA PUEDEN MODIFICAR O INSERTAR DATOS
CREATE POLICY "OBS Studio overlay puede consultar estado en modo solo lectura" 
  ON public.overlay_states FOR SELECT 
  TO anon 
  USING (true);

-- Reglas para TEMPLATES
CREATE POLICY "Operadores pueden leer todas las plantillas" 
  ON public.templates FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Operadores pueden crear plantillas" 
  ON public.templates FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Operadores pueden actualizar sus plantillas" 
  ON public.templates FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id OR is_preset = false);

-- ==============================================================================
-- DATOS INICIALES (SEMILLAS DE PRODUCCIÓN / DEMO)
-- ==============================================================================

-- 1. Insertar vista de transmisión si no existe
INSERT INTO public.overlays (id, name, read_token)
VALUES ('transmision', 'Transmisión', 'token-transmision-default-1920')
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar vista de presentación si no existe
INSERT INTO public.overlays (id, name, read_token)
VALUES ('presentacion', 'Presentación', 'token-presentacion-default-1080')
ON CONFLICT (id) DO NOTHING;

-- 3. Estado inicial para el overlay principal
INSERT INTO public.overlay_states (
  overlay_id,
  is_visible,
  is_blackout,
  kind,
  styling,
  content,
  updated_at,
  version
) VALUES (
  'transmision',
  true,
  false,
  'bible',
  '{
    "fontFamily": "Inter",
    "verseSize": 38,
    "referenceSize": 24,
    "fontWeight": "600",
    "italic": false,
    "lineHeight": 1.35,
    "letterSpacing": 0.5,
    "textColor": "#FFFFFF",
    "referenceColor": "#60A5FA",
    "badgeBgColor": "rgba(59, 130, 246, 0.25)",
    "backgroundColor": "rgba(10, 13, 20, 0.88)",
    "backgroundStyle": "frosted-glass",
    "backgroundOpacity": 88,
    "alignment": "left",
    "position": "lower-third",
    "paddingX": 48,
    "paddingY": 32,
    "marginBottom": 64,
    "maxWidth": 88,
    "borderRadius": 16,
    "textShadow": true,
    "textShadowBlur": 12,
    "textShadowColor": "rgba(0, 0, 0, 0.9)",
    "textStroke": false,
    "textStrokeWidth": 1,
    "textStrokeColor": "#000000",
    "boxBorder": true,
    "boxBorderColor": "rgba(59, 130, 246, 0.4)",
    "boxBorderWidth": 1,
    "animation": "slide-up",
    "animationDuration": 400,
    "showTranslationBadge": true,
    "showBookIcon": true,
    "uppercaseReference": true
  }',
  '{
    "book": "JHN",
    "bookName": "Juan",
    "chapter": 3,
    "verseStart": 16,
    "reference": "Juan 3:16",
    "text": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
    "translation": "RVR1960",
    "testament": "NT"
  }',
  NOW(),
  1
)
ON CONFLICT (overlay_id) DO NOTHING;

-- 4. Plantillas profesionales preconfiguradas
INSERT INTO public.templates (id, name, description, is_preset, styling)
VALUES 
(
  'preset-lower-third',
  'Broadcast Lower Third',
  'Diseño clásico para tercios inferiores en transmisiones en vivo con borde sutil y vidrio esmerilado',
  true,
  '{
    "fontFamily": "Inter",
    "verseSize": 36,
    "referenceSize": 22,
    "fontWeight": "600",
    "italic": false,
    "lineHeight": 1.35,
    "letterSpacing": 0.5,
    "textColor": "#FFFFFF",
    "referenceColor": "#60A5FA",
    "badgeBgColor": "rgba(59, 130, 246, 0.25)",
    "backgroundColor": "rgba(10, 13, 20, 0.88)",
    "backgroundStyle": "frosted-glass",
    "backgroundOpacity": 88,
    "alignment": "left",
    "position": "lower-third",
    "paddingX": 48,
    "paddingY": 30,
    "marginBottom": 64,
    "maxWidth": 88,
    "borderRadius": 14,
    "textShadow": true,
    "textShadowBlur": 10,
    "textShadowColor": "rgba(0,0,0,0.85)",
    "textStroke": false,
    "textStrokeWidth": 1,
    "textStrokeColor": "#000000",
    "boxBorder": true,
    "boxBorderColor": "rgba(96, 165, 250, 0.35)",
    "boxBorderWidth": 1,
    "animation": "slide-up",
    "animationDuration": 350,
    "showTranslationBadge": true,
    "showBookIcon": true,
    "uppercaseReference": true
  }'
),
(
  'preset-minimalist',
  'Minimalista Moderno',
  'Sin caja de fondo, texto blanco con sombra profunda de alto contraste para video en vivo',
  true,
  '{
    "fontFamily": "Montserrat",
    "verseSize": 42,
    "referenceSize": 24,
    "fontWeight": "600",
    "italic": false,
    "lineHeight": 1.4,
    "letterSpacing": 0.5,
    "textColor": "#FFFFFF",
    "referenceColor": "#38BDF8",
    "badgeBgColor": "rgba(0, 0, 0, 0.5)",
    "backgroundColor": "transparent",
    "backgroundStyle": "transparent",
    "backgroundOpacity": 0,
    "alignment": "center",
    "position": "lower-third",
    "paddingX": 24,
    "paddingY": 16,
    "marginBottom": 50,
    "maxWidth": 85,
    "borderRadius": 0,
    "textShadow": true,
    "textShadowBlur": 16,
    "textShadowColor": "rgba(0, 0, 0, 0.98)",
    "textStroke": true,
    "textStrokeWidth": 1,
    "textStrokeColor": "rgba(0, 0, 0, 0.75)",
    "boxBorder": false,
    "boxBorderColor": "transparent",
    "boxBorderWidth": 0,
    "animation": "fade",
    "animationDuration": 300,
    "showTranslationBadge": true,
    "showBookIcon": false,
    "uppercaseReference": true
  }'
),
(
  'preset-elegant-gold',
  'Elegante Dorado (Litúrgico)',
  'Tipografía con serifa Cinzel/Playfair, detalles dorados y fondo oscuro refinado',
  true,
  '{
    "fontFamily": "Cinzel",
    "verseSize": 38,
    "referenceSize": 22,
    "fontWeight": "600",
    "italic": false,
    "lineHeight": 1.45,
    "letterSpacing": 1.2,
    "textColor": "#FDFBF7",
    "referenceColor": "#F59E0B",
    "badgeBgColor": "rgba(245, 158, 11, 0.15)",
    "backgroundColor": "rgba(12, 10, 9, 0.92)",
    "backgroundStyle": "gradient-gold",
    "backgroundOpacity": 92,
    "alignment": "center",
    "position": "center-box",
    "paddingX": 56,
    "paddingY": 44,
    "marginBottom": 0,
    "maxWidth": 80,
    "borderRadius": 18,
    "textShadow": true,
    "textShadowBlur": 8,
    "textShadowColor": "rgba(0, 0, 0, 0.9)",
    "textStroke": false,
    "textStrokeWidth": 0,
    "textStrokeColor": "#000000",
    "boxBorder": true,
    "boxBorderColor": "rgba(245, 158, 11, 0.5)",
    "boxBorderWidth": 2,
    "animation": "zoom",
    "animationDuration": 450,
    "showTranslationBadge": true,
    "showBookIcon": true,
    "uppercaseReference": true
  }'
)
ON CONFLICT (id) DO NOTHING;

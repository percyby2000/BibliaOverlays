// SQL schema for Supabase copy button
export const SCHEMA_SQL = `-- ==============================================================================
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

-- Agregar tabla a la publicación de realtime
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

CREATE POLICY "Usuarios autenticados pueden ver su propio perfil" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

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

CREATE POLICY "Acceso público de solo lectura por read_token" 
  ON public.overlays FOR SELECT 
  TO anon 
  USING (true);

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

CREATE POLICY "OBS Studio overlay puede consultar estado en modo solo lectura" 
  ON public.overlay_states FOR SELECT 
  TO anon 
  USING (true);

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

-- Semillas iniciales
INSERT INTO public.overlays (id, name, read_token)
VALUES ('transmision', 'Transmisión', 'token-transmision-default-1920')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.overlays (id, name, read_token)
VALUES ('presentacion', 'Presentación', 'token-presentacion-default-1080')
ON CONFLICT (id) DO NOTHING;
`;

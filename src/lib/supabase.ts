import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const getEnvVar = (name: string, fallbackNames: string[] = []): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    if (metaEnv[name] && typeof metaEnv[name] === 'string' && metaEnv[name].trim() !== '') {
      return metaEnv[name];
    }
    for (const f of fallbackNames) {
      if (metaEnv[f] && typeof metaEnv[f] === 'string' && metaEnv[f].trim() !== '') {
        return metaEnv[f];
      }
    }
  }

  if (typeof process !== 'undefined' && process.env) {
    if (process.env[name] && typeof process.env[name] === 'string' && process.env[name]!.trim() !== '') {
      return process.env[name]!;
    }
    for (const f of fallbackNames) {
      if (process.env[f] && typeof process.env[f] === 'string' && process.env[f]!.trim() !== '') {
        return process.env[f]!;
      }
    }
  }

  return '';
};

export const supabaseUrl = getEnvVar('PUBLIC_SUPABASE_URL', ['SUPABASE_URL', 'VITE_SUPABASE_URL']);
export const supabaseAnonKey = getEnvVar('PUBLIC_SUPABASE_ANON_KEY', [
  'SUPABASE_PUBLISHABLE_KEY', 
  'PUBLIC_SUPABASE_PUBLISHABLE_KEY', 
  'SUPABASE_ANON_KEY', 
  'VITE_SUPABASE_ANON_KEY'
]);

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('tu-proyecto') && 
    !supabaseAnonKey.includes('tu-anon-key') &&
    supabaseUrl.startsWith('https://') &&
    (supabaseAnonKey.startsWith('sb_publishable_') || supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.length > 25)
  );
};

let clientInstance: SupabaseClient<Database> | null = null;

export const getSupabase = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (err) {
      console.warn('[Supabase] Error al inicializar cliente:', err);
      return null;
    }
  }

  return clientInstance;
};

/**
 * Diagnostic helper: checks whether the Supabase tables exist in the user's project
 */
export async function checkSupabaseStatus(): Promise<{
  configured: boolean;
  tablesReady: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      tablesReady: false,
      message: 'Credenciales pendientes en .env'
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      configured: true,
      tablesReady: false,
      message: 'Error al inicializar cliente Supabase'
    };
  }

  try {
    const { error } = await client.from('overlay_states').select('overlay_id').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('not found') || error.message?.includes('schema cache')) {
        return {
          configured: true,
          tablesReady: false,
          message: 'Credenciales conectadas, pero falta ejecutar supabase/schema.sql en el SQL Editor de Supabase.'
        };
      }
      return {
        configured: true,
        tablesReady: false,
        message: `Aviso Supabase: ${error.message}`
      };
    }

    return {
      configured: true,
      tablesReady: true,
      message: 'Conectado a PostgreSQL y Realtime con tablas listas.'
    };
  } catch (err: any) {
    return {
      configured: true,
      tablesReady: false,
      message: err.message || 'Error de conexión'
    };
  }
}

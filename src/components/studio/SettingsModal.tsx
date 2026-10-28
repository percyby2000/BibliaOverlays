import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Copy, 
  ExternalLink, 
  Terminal, 
  Database, 
  RefreshCw 
} from 'lucide-react';
import { isSupabaseConfigured, supabaseUrl, checkSupabaseStatus } from '../../lib/supabase';
import { BibleService } from '../../services/bibleService';
import { SCHEMA_SQL } from '../../data/schemaSql';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  overlayUrl: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, overlayUrl }) => {
  const [copiedObs, setCopiedObs] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseDiagnostic, setSupabaseDiagnostic] = useState<{
    configured: boolean;
    tablesReady: boolean;
    message: string;
  } | null>(null);

  const supabaseOk = isSupabaseConfigured();
  const youVersionStatus = BibleService.getConnectionStatus();

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '';
  const supabaseSqlEditorUrl = projectRef 
    ? `https://supabase.com/dashboard/project/${projectRef}/sql/new`
    : 'https://supabase.com/dashboard';

  useEffect(() => {
    if (isOpen) {
      handleTestSupabase();
    }
  }, [isOpen]);

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    try {
      const res = await checkSupabaseStatus();
      setSupabaseDiagnostic(res);
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-foreground">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-studio-panel/70">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
            Configuración y Conexiones OBS
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-studio-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs text-muted-foreground">
          {/* Status Diagnostic Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Supabase status */}
            <div className={`p-3.5 rounded-lg border ${
              supabaseDiagnostic?.tablesReady 
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
                : supabaseOk
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                  : 'bg-muted border-border text-muted-foreground'
            }`}>
              <div className="flex items-center justify-between mb-1.5 font-bold text-foreground">
                <div className="flex items-center gap-1.5">
                  {supabaseDiagnostic?.tablesReady ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Supabase Realtime</span>
                </div>
                <button
                  onClick={handleTestSupabase}
                  disabled={testingSupabase}
                  className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground"
                  title="Comprobar conexión"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin text-primary' : ''}`} />
                </button>
              </div>
              <p className="text-[11px] leading-relaxed">
                {supabaseDiagnostic?.message || (supabaseOk ? 'Credenciales detectadas' : 'Modo Demo Local')}
              </p>
            </div>

            {/* Bible API status */}
            <div className="p-3.5 rounded-lg border bg-primary/10 border-primary/20 text-foreground">
              <div className="flex items-center justify-between mb-1.5 font-bold">
                <div className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-primary" />
                  <span>API Bíblica en Vivo (Cloud)</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  En Vivo
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {youVersionStatus.details}
              </p>
              <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5 text-[10px] text-muted-foreground flex-wrap">
                <span className="font-semibold text-foreground">Versiones activas:</span>
                <span className="font-mono text-primary">RVR1960 · NTV · NVI · LBLA · PDT · RV2004</span>
              </div>
            </div>
          </div>

          {/* Action Step for Supabase if needed */}
          {supabaseOk && !supabaseDiagnostic?.tablesReady && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wide">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Tablas en Supabase requeridas</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Tus credenciales de Supabase (<code className="text-amber-300 font-mono">{supabaseUrl}</code>) fueron detectadas. Para habilitar sincronización en la nube, ejecuta el script SQL:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={supabaseSqlEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>1. Abrir SQL en Supabase</span>
                </a>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? '¡Copiado!' : '2. Copiar Script schema.sql'}</span>
                </button>
              </div>
            </div>
          )}

          {/* OBS Studio Step by Step Guide */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">
              Conectar a OBS Studio (Browser Source)
            </h3>

            <div className="bg-studio-panel border border-border rounded-lg p-3 space-y-2 text-[11px]">
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                <li>En OBS Studio, ve a <strong className="text-foreground">Fuentes</strong> y añade una nueva fuente <strong className="text-foreground">Navegador</strong>.</li>
                <li>Pega la siguiente dirección URL:</li>
              </ol>

              {/* URL snippet */}
              <div className="flex items-center justify-between bg-studio-bg border border-border rounded p-2 text-xs font-mono text-foreground gap-2">
                <span className="truncate">{overlayUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(overlayUrl);
                    setCopiedObs(true);
                    setTimeout(() => setCopiedObs(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                >
                  {copiedObs ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedObs ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="bg-studio-bg p-2 rounded border border-border">
                  <span className="text-muted-foreground block">Ancho:</span>
                  <span className="font-bold text-foreground font-mono">1920</span>
                </div>
                <div className="bg-studio-bg p-2 rounded border border-border">
                  <span className="text-muted-foreground block">Alto:</span>
                  <span className="font-bold text-foreground font-mono">1080</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-studio-panel/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
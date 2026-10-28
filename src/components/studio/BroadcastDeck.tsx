import React from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, ShieldAlert, Sparkles, XCircle } from 'lucide-react';
import type { OverlayState, BibleContentPayload } from '../../types/overlay';

interface BroadcastDeckProps {
  state: OverlayState;
  previewPayload: BibleContentPayload | null;
  onSendLive: () => void;
  onToggleVisibility: () => void;
  onToggleBlackout: () => void;
  onClearContent: () => void;
  onNavigateVerse: (direction: 'prev' | 'next') => void;
}

export const BroadcastDeck: React.FC<BroadcastDeckProps> = ({
  state,
  previewPayload,
  onSendLive,
  onToggleVisibility,
  onToggleBlackout,
  onClearContent,
  onNavigateVerse
}) => {
  const isLive = state.is_visible && !state.is_blackout && state.content !== null;
  const isBlackout = state.is_blackout;
  const isVisible = state.is_visible;
  const hasContent = Boolean(state.content || previewPayload);

  return (
    <div className="border-t border-studio-border bg-studio-surface/95 px-3 py-2.5 sm:px-4 sm:py-3 select-none">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        

        {/* Center: Verse Step Navigation */}
        <div className="flex items-center justify-center gap-1.5 bg-studio-panel border border-studio-border p-1 rounded-lg self-center sm:self-auto">
          <button
            onClick={() => onNavigateVerse('prev')}
            disabled={!hasContent}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-studio-bg hover:bg-studio-hover text-foreground text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Versículo anterior (←)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden md:inline">Anterior</span>
          </button>

          <span className="px-2 text-[11px] font-mono text-muted-foreground">Paso</span>

          <button
            onClick={() => onNavigateVerse('next')}
            disabled={!hasContent}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-studio-bg hover:bg-studio-hover text-foreground text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Versículo siguiente (→)"
          >
            <span className="hidden md:inline">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Master Broadcast Switches */}
        <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
          {/* Visibility Toggle */}
          <button
            onClick={onToggleVisibility}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
              isVisible
                ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
                : 'bg-muted border-studio-border text-muted-foreground hover:bg-studio-hover'
            }`}
            title="Ocultar o mostrar overlay en OBS"
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{isVisible ? 'Visible' : 'Oculto'}</span>
          </button>



          {/* Clear Content */}
          <button
            onClick={onClearContent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted border border-studio-border text-muted-foreground hover:text-foreground hover:bg-studio-hover text-xs font-bold transition-all"
            title="Limpiar texto actual de la pantalla"
          >
            <XCircle className="w-4 h-4" />
            <span>Limpiar</span>
          </button>

          {/* Hero Master CUT Proyectar Button */}
          <button
            onClick={onSendLive}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex-shrink-0"
            title="Emitir versículo a OBS Studio inmediatamente"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>PROYECTAR EN VIVO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
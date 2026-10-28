import React, { useState } from 'react';
import { OverlayRenderer } from '../overlay/OverlayRenderer';
import { Grid } from 'lucide-react';
import type { OverlayState } from '../../types/overlay';

interface LivePreviewCanvasProps {
  state: OverlayState;
  previewState: OverlayState;
  onChangeStyling: (changes: Partial<OverlayState['styling']>) => void;
}

export const LivePreviewCanvas: React.FC<LivePreviewCanvasProps> = ({
  state,
  previewState,
  onChangeStyling
}) => {
  const [backgroundType, setBackgroundType] = useState<'checker' | 'dark' | 'stage_video'>('stage_video');
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'LIVE' | 'PREVIEW'>('LIVE');

  const activeDisplayState = viewMode === 'LIVE' ? state : previewState;
  const isLive = state.is_visible && !state.is_blackout && state.content !== null;

  return (
    <div className="flex flex-col h-full bg-studio-bg border-r border-studio-border overflow-hidden select-none">
      {/* Canvas Top Bar */}
      <div className="h-10 px-3 sm:px-4 border-b border-studio-border bg-studio-surface flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Switcher: Live Program vs Preview Stage */}
          <div className="flex bg-studio-panel rounded-md p-0.5 border border-studio-border">
            <button
              onClick={() => setViewMode('LIVE')}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                viewMode === 'LIVE'
                  ? 'bg-destructive text-destructive-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>EN VIVO</span>
            </button>
            <button
              onClick={() => setViewMode('PREVIEW')}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                viewMode === 'PREVIEW'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>VISTA PREVIA</span>
            </button>
          </div>

          <span className="text-muted-foreground font-mono text-[10px] hidden md:inline">1920 × 1080 (16:9)</span>
        </div>

        {/* Backdrop Simulator Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`p-1 rounded-md border transition-colors ${
              showSafeZones 
                ? 'bg-primary/20 border-primary/40 text-primary' 
                : 'bg-studio-panel border-studio-border text-muted-foreground hover:text-foreground'
            }`}
            title="Alternar Guías de Seguridad OBS (Safe Zones)"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <div className="flex bg-studio-panel rounded-md p-0.5 border border-studio-border">
            <button
              onClick={() => setBackgroundType('stage_video')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                backgroundType === 'stage_video' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Simulador de Cámara de Escenario"
            >
              Video
            </button>
            <button
              onClick={() => setBackgroundType('checker')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                backgroundType === 'checker' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Cuadrícula Alpha transparente"
            >
              Alpha
            </button>
            <button
              onClick={() => setBackgroundType('dark')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                backgroundType === 'dark' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Fondo Negro"
            >
              Negro
            </button>
          </div>
        </div>
      </div>

      {/* 16:9 Canvas Viewport Container */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 overflow-hidden relative">
        {/* Aspect Ratio 16:9 Canvas Box */}
        <div 
          className="relative w-full max-w-4xl aspect-video rounded-lg shadow-2xl overflow-hidden border border-studio-border select-none"
          style={{
            ...(backgroundType === 'checker' && {
              backgroundImage: 'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%)',
              backgroundSize: '24px 24px',
            }),
            ...(backgroundType === 'dark' && {
              backgroundColor: '#05070a',
            }),
            ...(backgroundType === 'stage_video' && {
              background: 'radial-gradient(circle at 50% 35%, #2a3b5c 0%, #111a2e 50%, #080d17 100%)',
            }),
          }}
        >
          {/* Simulated Church Sanctuary Video Elements */}
          {backgroundType === 'stage_video' && (
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute -top-10 left-1/4 w-40 h-96 bg-primary/20 blur-3xl transform -rotate-12" />
              <div className="absolute -top-10 right-1/4 w-40 h-96 bg-accent/20 blur-3xl transform rotate-12" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-56 rounded-t-full bg-slate-900/60 blur-md" />
              <div className="absolute bottom-2 left-3 text-[10px] font-mono text-muted-foreground/60">
                [SIMULACIÓN VIDEO EN VIVO 1080p]
              </div>
            </div>
          )}

          {/* Active Overlay Render */}
          <div className="absolute inset-0 w-full h-full">
            <OverlayRenderer 
              overlayId={activeDisplayState.id}
              stateOverride={activeDisplayState}
              isPreview={showSafeZones} 
              isEditable={viewMode === 'PREVIEW'}
              onChangeStyling={onChangeStyling}
            />
          </div>

        </div>
      </div>
    </div>
  );
};
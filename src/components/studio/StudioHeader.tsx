import React, { useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import type { OverlayState } from '../../types/overlay';

interface StudioHeaderProps {
  state: OverlayState;
  overlaysList: { id: string; name: string }[];
  currentOverlayId: string;
  onSelectOverlay: (id: string) => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  state,
  overlaysList,
  currentOverlayId,
  onSelectOverlay,
}) => {
  const [copied, setCopied] = useState(false);

  const overlayUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/overlay/${state.id}`
    : `/overlay/${state.id}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <header className="relative h-14 sm:h-16 border-b border-studio-border bg-studio-surface/90 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between select-none z-30 gap-2 sm:gap-4">
      {/* Brand & Channel Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <img src="3.svg" alt="Logo" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg flex-shrink-0" />    

          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-xs sm:text-sm text-foreground">
                BIBLIA OVERLAY
              </span>
              <span className="text-[9px] bg-primary/15 text-primary border border-primary/30 px-1 py-0.2 rounded font-mono font-semibold">
                VERSIÓN 1.0.0
              </span>

            </div>
            <p className="text-[10px] text-muted-foreground truncate">Biblia para streaming</p>
          </div>
        </div>

        <div className="h-5 w-px bg-studio-border hidden md:block" />

        <a
          href="https://wa.me/51913882945?text=Hola%2C%20necesito%20informar%20un%20problema%20con%20Biblia%20Overlay."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors text-[11px] font-semibold whitespace-nowrap"
          title="Contactar por WhatsApp para informar un problema"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Informar problema</span>
        </a>
      </div>

      {/* Center: independent channel URLs */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {overlaysList.map((ov) => {
          const isSelected = ov.id === currentOverlayId;
          const channelUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/overlay/${ov.id}`
            : `/overlay/${ov.id}`;

          return (
            <button
              key={ov.id}
              type="button"
              onClick={() => onSelectOverlay(ov.id)}
              title={`Editar ${ov.name}: ${channelUrl}`}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-studio-panel text-muted-foreground border-studio-border hover:bg-studio-hover hover:text-foreground'
              }`}
            >
              {ov.id === 'presentacion' ? 'Media' : 'Transmisión'}
            </button>
          );
        })}
      </div>

      {/* Right: channel URLs, OBS link and preview */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={handleCopyLink}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            copied
              ? 'bg-purple-600 text-white border-purple-500'
              : 'bg-purple-500 text-white hover:bg-purple-600 border-purple-500'
          }`}
          title={`Copiar enlace Browser Source: ${overlayUrl}`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Copiar URL OBS'}</span>
        </button>

        <a
          href={overlayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 sm:p-2 rounded-lg bg-studio-panel hover:bg-studio-hover border border-studio-border text-muted-foreground hover:text-foreground transition-colors"
          title="Abrir overlay en ventana independiente"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { SyncService, getDefaultOverlayState, type ConnectionMode } from '../../services/syncService';
import type { OverlayState } from '../../types/overlay';
import { BookOpen, Quote } from 'lucide-react';

interface OverlayRendererProps {
  overlayId: string;
  isPreview?: boolean; // When rendered inside the control panel preview canvas
  stateOverride?: OverlayState; // When set, bypasses SyncService and uses this state directly (preview mode)
  isEditable?: boolean;
  onChangeStyling?: (changes: Partial<OverlayState['styling']>) => void;
}

export const OverlayRenderer: React.FC<OverlayRendererProps> = ({
  overlayId,
  isPreview = false,
  stateOverride,
  isEditable = false,
  onChangeStyling,
}) => {
  const [syncedState, setSyncedState] = useState<OverlayState>(() => getDefaultOverlayState(overlayId));
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('local_demo');
  const dragStart = useRef<{ clientX: number; clientY: number; offsetX: number; offsetY: number } | null>(null);
  const resizeStart = useRef<{ clientX: number; startWidth: number } | null>(null);

  // 1. Only subscribe to SyncService when NOT in stateOverride (preview) mode
  useEffect(() => {
    if (stateOverride) return; // Skip subscription if state is driven externally

    let isMounted = true;

    // Fetch initial persisted state
    SyncService.getInitialState(overlayId).then((initial) => {
      if (isMounted && initial) {
        setSyncedState(initial);
      }
    });

    // Realtime subscription (Supabase + BroadcastChannel + LocalStorage)
    const unsubscribe = SyncService.subscribe(
      overlayId,
      (updatedState) => {
        if (isMounted && updatedState) {
          setSyncedState(updatedState);
        }
      },
      (mode) => {
        if (isMounted) {
          setConnectionMode(mode);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [overlayId, stateOverride]);

  // Use stateOverride when provided (preview canvas), otherwise use synced state
  const state = stateOverride ?? syncedState;
  const { is_visible, is_blackout, styling, content } = state;
  const offsetX = styling.offsetX ?? 0;
  const offsetY = styling.offsetY ?? 0;

  // Don't render content if blackout is active or invisible or content is null
  const shouldDisplay = is_visible && !is_blackout && content !== null;

  // Calculate dynamic typography and styles
  const fontClass = useMemo(() => {
    switch (styling.fontFamily) {
      case 'Playfair Display':
        return 'font-serif';
      case 'Cinzel':
        return 'font-cinzel';
      case 'Montserrat':
        return 'font-montserrat';
      case 'Bebas Neue':
        return 'font-bebas tracking-wider';
      case 'Outfit':
        return 'font-sans font-medium';
      case 'Inter':
      default:
        return 'font-sans';
    }
  }, [styling.fontFamily]);

  // Position alignment
  const positionClasses = useMemo(() => {
    switch (styling.position) {
      case 'center-box':
        return 'justify-center items-center';
      case 'top-bar':
        return 'justify-start items-center pt-10';
      case 'fullscreen':
        return 'justify-center items-center';
      case 'bottom-bar':
        return 'justify-end items-center pb-0';
      case 'lower-third':
      default:
        return 'justify-end items-center';
    }
  }, [styling.position]);

  const animationDuration = `${styling.animationDuration ?? 350}ms`;

  const animationKey = `${content?.reference ?? 'empty'}-${content?.text ?? 'empty'}-${styling.animation ?? 'none'}-${styling.animationDuration ?? 350}`;

  // Animation class
  const animationClass = useMemo(() => {
    if (!shouldDisplay) {
      return 'opacity-0 scale-95 transition-all duration-300 pointer-events-none';
    }

    switch (styling.animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-slide-up';
      case 'slide-down':
        return 'animate-slide-down';
      case 'zoom':
        return 'animate-zoom-in';
      case 'none':
      default:
        return 'opacity-100';
    }
  }, [shouldDisplay, styling.animation]);

  // Background styling preset
  const backgroundStyleObject = useMemo((): React.CSSProperties => {
    const opacityDec = styling.backgroundOpacity / 100;

    switch (styling.backgroundStyle) {
      case 'transparent':
        return {
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
        };
      case 'frosted-glass':
        return {
          backgroundColor: `rgba(15, 23, 42, ${opacityDec})`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        };
      case 'gradient-slate':
        return {
          background: `linear-gradient(135deg, rgba(15, 23, 42, ${opacityDec}) 0%, rgba(30, 41, 59, ${opacityDec}) 100%)`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        };
      case 'gradient-gold':
        return {
          background: `linear-gradient(135deg, rgba(22, 18, 12, ${opacityDec}) 0%, rgba(48, 35, 18, ${opacityDec}) 100%)`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        };
      case 'gradient-violet':
        return {
          background: `linear-gradient(135deg, rgba(18, 12, 38, ${opacityDec}) 0%, rgba(38, 18, 64, ${opacityDec}) 100%)`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        };
      case 'gradient-emerald':
        return {
          background: `linear-gradient(135deg, rgba(6, 28, 20, ${opacityDec}) 0%, rgba(13, 49, 36, ${opacityDec}) 100%)`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        };
      case 'cinematic-blur':
        return {
          background: `linear-gradient(180deg, rgba(10, 12, 18, ${opacityDec * 0.95}) 0%, rgba(4, 6, 10, ${opacityDec}) 100%)`,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        };
      case 'minimal-dark':
        return {
          backgroundColor: `rgba(0, 0, 0, ${opacityDec})`,
          backdropFilter: 'blur(8px)',
        };
      case 'solid-dark':
      default:
        return {
          backgroundColor: styling.backgroundColor || `rgba(10, 13, 20, ${opacityDec})`,
        };
    }
  }, [styling.backgroundStyle, styling.backgroundOpacity, styling.backgroundColor]);

  // Enhanced Multi-layer Text shadow generator for extreme contrast
  const textShadowStyle = useMemo(() => {
    if (!styling.textShadow) return 'none';
    return `0 2px 4px rgba(0, 0, 0, 0.95), 0 4px ${styling.textShadowBlur}px ${styling.textShadowColor}`;
  }, [styling.textShadow, styling.textShadowBlur, styling.textShadowColor]);

  // Text stroke styling
  const textStrokeStyle = useMemo(() => {
    if (!styling.textStroke) return undefined;
    return `${styling.textStrokeWidth}px ${styling.textStrokeColor}`;
  }, [styling.textStroke, styling.textStrokeWidth, styling.textStrokeColor]);

  // Box Shadow with Ambient Glow
  const boxCombinedShadow = useMemo(() => {
    if (styling.backgroundStyle === 'transparent') return 'none';
    const baseShadow = '0 20px 45px -10px rgba(0,0,0,0.7)';
    if (styling.glowShadow && styling.glowShadowColor) {
      return `${baseShadow}, 0 0 35px ${styling.glowShadowColor}`;
    }
    return baseShadow;
  }, [styling.backgroundStyle, styling.glowShadow, styling.glowShadowColor]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current && onChangeStyling) {
      onChangeStyling({
        offsetX: dragStart.current.offsetX + event.clientX - dragStart.current.clientX,
        offsetY: dragStart.current.offsetY + event.clientY - dragStart.current.clientY,
      });
    }

    if (resizeStart.current && onChangeStyling) {
      const parentWidth = event.currentTarget.parentElement?.getBoundingClientRect().width || 1;
      const nextWidth = resizeStart.current.startWidth + (
        (event.clientX - resizeStart.current.clientX) / parentWidth
      ) * 100;
      onChangeStyling({ maxWidth: Math.min(100, Math.max(25, nextWidth)) });
    }
  };

  const stopPointerAction = () => {
    dragStart.current = null;
    resizeStart.current = null;
  };

  return (
    <div 
      className={`relative w-full h-full flex flex-col ${positionClasses} select-none pointer-events-none transition-opacity duration-300 overflow-hidden`}
      style={{
        paddingBottom: styling.position === 'lower-third' ? `${styling.marginBottom}px` : undefined,
        containerType: 'size',
      }}
    >
      {/* Custom Lower Third Graphic Banner (e.g. watercolor smoke, church lower third PNG) */}
      {shouldDisplay && styling.backgroundImageUrl && (
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden transition-opacity duration-300 z-0"
          style={{
            opacity: (styling.backgroundImageOpacity ?? 100) / 100,
          }}
        >
          <img 
            src={styling.backgroundImageUrl} 
            alt="Fondo de Tercio Inferior"
            className="w-full h-full object-cover select-none"
          />
        </div>
      )}

      {/* Main Overlay Graphic Card */}
      <div
        key={animationKey}
        className={`relative z-10 transition-all duration-300 ${fontClass} ${animationClass} overflow-hidden ${
          isEditable ? 'pointer-events-auto cursor-move ring-1 ring-primary/60' : ''
        }`}
        onPointerDown={(event) => {
          if (!isEditable || !onChangeStyling || (event.target as HTMLElement).closest('button')) return;
          dragStart.current = {
            clientX: event.clientX,
            clientY: event.clientY,
            offsetX,
            offsetY,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={isEditable ? handlePointerMove : undefined}
        onPointerUp={isEditable ? stopPointerAction : undefined}
        onPointerCancel={isEditable ? stopPointerAction : undefined}
        style={{
          maxWidth: `${styling.maxWidth}%`,
          width: styling.position === 'bottom-bar' ? '100%' : 'auto',
          translate: `calc(${offsetX / 19.2}cqw) calc(${offsetY / 10.8}cqh)`,
          borderRadius: styling.position === 'bottom-bar' ? 0 : `${styling.borderRadius}px`,
          padding: `calc(${styling.paddingY / 10.8}cqh) calc(${styling.paddingX / 19.2}cqw)`,
          border: styling.boxBorder ? `${styling.boxBorderWidth}px solid ${styling.boxBorderColor}` : 'none',
          boxShadow: boxCombinedShadow,
          animationDuration,
          willChange: 'opacity, transform, filter',
          transformOrigin: 'center center',
          ...backgroundStyleObject,
        }}
      >
        {/* Optional Left Vertical Accent Bar */}
        {styling.accentBar && styling.position !== 'bottom-bar' && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-2"
            style={{
              background: styling.accentBarColor || `linear-gradient(to bottom, ${styling.referenceColor}, #2563EB)`,
              boxShadow: `0 0 15px ${styling.referenceColor}88`
            }}
          />
        )}

        {/* Top glossy reflection line for ultra-premium glass look */}
        {styling.backgroundStyle !== 'transparent' && (
          <div 
            className="absolute inset-x-0 top-0 h-[1px] opacity-40 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${styling.referenceColor} 50%, transparent 100%)`
            }}
          />
        )}

        {/* Header Bar: Reference, Badges & Icons */}
        <div 
          className="flex items-center gap-3 mb-2.5"
          style={{
            justifyContent: styling.alignment === 'center' ? 'center' : styling.alignment === 'right' ? 'flex-end' : 'flex-start'
          }}
        >
          {styling.showBookIcon && (
            <div 
              className="flex items-center justify-center rounded-lg p-1.5 shadow-sm"
              style={{ 
                backgroundColor: styling.badgeBgColor,
                border: `1px solid ${styling.referenceColor}33`
              }}
            >
              <BookOpen 
                className="w-4 h-4" 
                style={{ color: styling.referenceColor }} 
              />
            </div>
          )}

          <h2
            className="tracking-wide"
            style={{
              fontSize: `${styling.referenceSize / 19.2}cqw`,
              fontWeight: 700,
              color: styling.referenceColor,
              textTransform: styling.uppercaseReference ? 'uppercase' : 'none',
              textShadow: textShadowStyle,
              WebkitTextStroke: textStrokeStyle,
            }}
          >
            {content?.reference || ''}
          </h2>

          {styling.showTranslationBadge && content?.translation && (
            <span
              className="text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm"
              style={{
                backgroundColor: styling.badgeBgColor,
                color: styling.referenceColor,
                border: `1px solid ${styling.referenceColor}44`,
              }}
            >
              {content.translation}
            </span>
          )}
        </div>

        {/* Verse Body Text with Optional Decorative Quotes */}
        <div className="relative">
          {styling.quoteDecoration && (
            <Quote 
              className="w-7 h-7 absolute -left-8 -top-2 opacity-25"
              style={{ color: styling.referenceColor }}
            />
          )}

          <p
            className="leading-relaxed"
            style={{
              fontSize: `${styling.verseSize / 19.2}cqw`,
              fontWeight: styling.fontWeight as any,
              fontStyle: styling.italic ? 'italic' : 'normal',
              lineHeight: styling.lineHeight,
              letterSpacing: `${styling.letterSpacing}px`,
              color: styling.textColor,
              textAlign: styling.alignment,
              textShadow: textShadowStyle,
              WebkitTextStroke: textStrokeStyle,
            }}
          >
            {content?.text || ''}
          </p>
        </div>

        {isEditable && (
          <button
            type="button"
            aria-label="Cambiar ancho del cuadro"
            className="absolute bottom-1 right-1 z-20 h-4 w-4 cursor-se-resize rounded-sm border border-white/80 bg-primary shadow"
            onPointerDown={(event) => {
              if (!onChangeStyling) return;
              event.stopPropagation();
              resizeStart.current = {
                clientX: event.clientX,
                startWidth: styling.maxWidth,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={stopPointerAction}
            onPointerCancel={stopPointerAction}
          />
        )}
      </div>

      {/* OBS Safe Area Guide (Only visible in Preview mode) */}
      {isPreview && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Action Safe (90%) */}
          <div className="absolute inset-[5%] border border-dashed border-red-500/25 flex items-start justify-start p-1.5">
            <span className="text-[10px] text-red-400/60 uppercase font-mono font-bold tracking-wider">Action Safe (90%)</span>
          </div>
          {/* Title Safe (80%) */}
          <div className="absolute inset-[10%] border border-dashed border-blue-500/25 flex items-start justify-start p-1.5">
            <span className="text-[10px] text-blue-400/60 uppercase font-mono font-bold tracking-wider">Title Safe (80%)</span>
          </div>
        </div>
      )}
    </div>
  );
};

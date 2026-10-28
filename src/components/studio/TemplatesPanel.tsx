import React, { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import type { OverlayStyling, OverlayTemplate } from '../../types/overlay';

export const BUILTIN_PRESETS: OverlayTemplate[] = [
  {
    id: 'preset-watercolor-cyan',
    name: 'Acuarela Humo Cian',
    tagline: 'Fondo de Pincelada y Humo Acuarela',
    category: 'broadcast',
    description: 'Fondo artístico con degradado de humo cian y transparencia superior.',
    isPreset: true,
    styling: {
      fontFamily: 'Montserrat',
      verseSize: 36,
      referenceSize: 22,
      fontWeight: '600',
      italic: false,
      lineHeight: 1.35,
      letterSpacing: 0.5,
      textColor: '#FFFFFF',
      referenceColor: '#9e38f8',
      badgeBgColor: 'rgba(15, 23, 42, 0.75)',
      backgroundColor: 'transparent',
      backgroundStyle: 'transparent',
      backgroundOpacity: 0,
      backgroundImageUrl: '/fondos/Lower-3rd-24.png',
      backgroundImageOpacity: 100,
      alignment: 'left',
      position: 'lower-third',
      paddingX: 52,
      paddingY: 28,
      marginBottom: 44,
      maxWidth: 90,
      borderRadius: 0,
      textShadow: true,
      textShadowBlur: 14,
      textShadowColor: 'rgba(0, 0, 0, 0.95)',
      textStroke: true,
      textStrokeWidth: 1,
      textStrokeColor: 'rgba(0, 0, 0, 0.85)',
      boxBorder: false,
      boxBorderColor: 'transparent',
      boxBorderWidth: 0,
      accentBar: false,
      glowShadow: false,
      quoteDecoration: false,
      animation: 'slide-up',
      animationDuration: 350,
      showTranslationBadge: true,
      showBookIcon: true,
      uppercaseReference: true
    }
  },
  {
    id: 'preset-broadcast-pro',
    name: 'Broadcast Lower Third Pro',
    tagline: 'Estilo Televisivo en Directo',
    category: 'broadcast',
    description: 'Vidrio esmerilado Tokyo Night, barra de acento cian vertical y halo de luz exterior.',
    isPreset: true,
    styling: {
      fontFamily: 'Inter',
      verseSize: 36,
      referenceSize: 22,
      fontWeight: '600',
      italic: false,
      lineHeight: 1.35,
      letterSpacing: 0.5,
      textColor: '#FFFFFF',
      referenceColor: '#38BDF8',
      badgeBgColor: 'rgba(14, 165, 233, 0.22)',
      backgroundColor: 'rgba(10, 15, 26, 0.90)',
      backgroundStyle: 'frosted-glass',
      backgroundOpacity: 90,
      alignment: 'left',
      position: 'lower-third',
      paddingX: 48,
      paddingY: 30,
      marginBottom: 64,
      maxWidth: 88,
      borderRadius: 14,
      textShadow: true,
      textShadowBlur: 10,
      textShadowColor: 'rgba(0,0,0,0.85)',
      textStroke: false,
      textStrokeWidth: 1,
      textStrokeColor: '#000000',
      boxBorder: true,
      boxBorderColor: 'rgba(56, 189, 248, 0.45)',
      boxBorderWidth: 1,
      accentBar: true,
      accentBarColor: 'linear-gradient(to bottom, #38BDF8, #2563EB)',
      glowShadow: true,
      glowShadowColor: 'rgba(56, 189, 248, 0.25)',
      quoteDecoration: false,
      animation: 'slide-up',
      animationDuration: 350,
      showTranslationBadge: true,
      showBookIcon: true,
      uppercaseReference: true
    }
  },
  {
    id: 'preset-catedral-oro',
    name: 'Catedral Litúrgica Imperial',
    tagline: 'Solemne con Oro y Ébano',
    category: 'liturgico',
    description: 'Borde de oro pulido, tipografía Cinzel imperial, marfil cálido y comillas decorativas.',
    isPreset: true,
    styling: {
      fontFamily: 'Cinzel',
      verseSize: 38,
      referenceSize: 24,
      fontWeight: '700',
      italic: false,
      lineHeight: 1.45,
      letterSpacing: 1.2,
      textColor: '#FFFDF5',
      referenceColor: '#F59E0B',
      badgeBgColor: 'rgba(245, 158, 11, 0.18)',
      backgroundColor: 'rgba(16, 12, 8, 0.95)',
      backgroundStyle: 'gradient-gold',
      backgroundOpacity: 95,
      alignment: 'center',
      position: 'lower-third',
      paddingX: 56,
      paddingY: 36,
      marginBottom: 60,
      maxWidth: 85,
      borderRadius: 16,
      textShadow: true,
      textShadowBlur: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.95)',
      textStroke: false,
      textStrokeWidth: 0,
      textStrokeColor: '#000000',
      boxBorder: true,
      boxBorderColor: 'rgba(245, 158, 11, 0.65)',
      boxBorderWidth: 2,
      accentBar: false,
      glowShadow: true,
      glowShadowColor: 'rgba(245, 158, 11, 0.3)',
      quoteDecoration: true,
      animation: 'zoom',
      animationDuration: 400,
      showTranslationBadge: true,
      showBookIcon: true,
      uppercaseReference: true
    }
  },
  {
    id: 'preset-cinema-alpha',
    name: 'Cinematic Alpha Clean',
    tagline: 'Cine Puro sin Caja de Fondo',
    category: 'minimal',
    description: '100% transparente. Sombra multicapa de alto contraste para mostrar la cámara.',
    isPreset: true,
    styling: {
      fontFamily: 'Montserrat',
      verseSize: 42,
      referenceSize: 24,
      fontWeight: '600',
      italic: false,
      lineHeight: 1.4,
      letterSpacing: 0.5,
      textColor: '#FFFFFF',
      referenceColor: '#38BDF8',
      badgeBgColor: 'rgba(15, 23, 42, 0.75)',
      backgroundColor: 'transparent',
      backgroundStyle: 'transparent',
      backgroundOpacity: 0,
      alignment: 'center',
      position: 'lower-third',
      paddingX: 24,
      paddingY: 16,
      marginBottom: 50,
      maxWidth: 86,
      borderRadius: 0,
      textShadow: true,
      textShadowBlur: 18,
      textShadowColor: 'rgba(0, 0, 0, 1)',
      textStroke: true,
      textStrokeWidth: 1,
      textStrokeColor: 'rgba(0, 0, 0, 0.9)',
      boxBorder: false,
      boxBorderColor: 'transparent',
      boxBorderWidth: 0,
      accentBar: false,
      glowShadow: false,
      quoteDecoration: false,
      animation: 'fade',
      animationDuration: 300,
      showTranslationBadge: true,
      showBookIcon: false,
      uppercaseReference: true
    }
  },
  {
    id: 'preset-worship-neon',
    name: 'Worship Neon Glow',
    tagline: 'Juventud, Alabanza y Energía',
    category: 'modern',
    description: 'Fondo violeta cósmico, borde neón púrpura brillante y barra degradada.',
    isPreset: true,
    styling: {
      fontFamily: 'Montserrat',
      verseSize: 38,
      referenceSize: 22,
      fontWeight: '700',
      italic: false,
      lineHeight: 1.35,
      letterSpacing: 0.8,
      textColor: '#FFFFFF',
      referenceColor: '#F43F5E',
      badgeBgColor: 'rgba(244, 63, 94, 0.25)',
      backgroundColor: 'rgba(18, 12, 38, 0.92)',
      backgroundStyle: 'gradient-violet',
      backgroundOpacity: 92,
      alignment: 'left',
      position: 'lower-third',
      paddingX: 50,
      paddingY: 32,
      marginBottom: 64,
      maxWidth: 88,
      borderRadius: 16,
      textShadow: true,
      textShadowBlur: 12,
      textShadowColor: 'rgba(0, 0, 0, 0.95)',
      textStroke: false,
      textStrokeWidth: 1,
      textStrokeColor: '#000000',
      boxBorder: true,
      boxBorderColor: 'rgba(192, 132, 252, 0.55)',
      boxBorderWidth: 1.5,
      accentBar: true,
      accentBarColor: 'linear-gradient(to bottom, #F43F5E, #A855F7)',
      glowShadow: true,
      glowShadowColor: 'rgba(244, 63, 94, 0.35)',
      quoteDecoration: false,
      animation: 'slide-up',
      animationDuration: 350,
      showTranslationBadge: true,
      showBookIcon: true,
      uppercaseReference: true
    }
  },
  {
    id: 'preset-tv-ticker',
    name: 'Cintillo Televisivo Continuo',
    tagline: 'Barra Inferior Noticias TV',
    category: 'broadcast',
    description: 'Ocupa el 100% del ancho inferior con línea de acento cian.',
    isPreset: true,
    styling: {
      fontFamily: 'Inter',
      verseSize: 32,
      referenceSize: 20,
      fontWeight: '600',
      italic: false,
      lineHeight: 1.3,
      letterSpacing: 0.5,
      textColor: '#FFFFFF',
      referenceColor: '#38BDF8',
      badgeBgColor: 'rgba(14, 165, 233, 0.25)',
      backgroundColor: 'rgba(10, 15, 26, 0.96)',
      backgroundStyle: 'gradient-slate',
      backgroundOpacity: 96,
      alignment: 'left',
      position: 'bottom-bar',
      paddingX: 56,
      paddingY: 22,
      marginBottom: 0,
      maxWidth: 100,
      borderRadius: 0,
      textShadow: true,
      textShadowBlur: 8,
      textShadowColor: 'rgba(0,0,0,0.85)',
      textStroke: false,
      textStrokeWidth: 0,
      textStrokeColor: '#000000',
      boxBorder: true,
      boxBorderColor: 'rgba(56, 189, 248, 0.5)',
      boxBorderWidth: 1.5,
      accentBar: false,
      glowShadow: false,
      quoteDecoration: false,
      animation: 'slide-up',
      animationDuration: 300,
      showTranslationBadge: true,
      showBookIcon: true,
      uppercaseReference: true
    }
  },
  {
    id: 'preset-sermon-center',
    name: 'Sermon Slide Centrado',
    tagline: 'Predicación y Diapositiva Principal',
    category: 'modern',
    description: 'Tarjeta flotante centrada con desenfoque cinematográfico y tipografía Playfair.',
    isPreset: true,
    styling: {
      fontFamily: 'Playfair Display',
      verseSize: 42,
      referenceSize: 26,
      fontWeight: '600',
      italic: true,
      lineHeight: 1.45,
      letterSpacing: 0.8,
      textColor: '#F8FAFC',
      referenceColor: '#F59E0B',
      badgeBgColor: 'rgba(245, 158, 11, 0.2)',
      backgroundColor: 'rgba(10, 12, 18, 0.94)',
      backgroundStyle: 'cinematic-blur',
      backgroundOpacity: 94,
      alignment: 'center',
      position: 'center-box',
      paddingX: 64,
      paddingY: 48,
      marginBottom: 0,
      maxWidth: 82,
      borderRadius: 22,
      textShadow: true,
      textShadowBlur: 10,
      textShadowColor: 'rgba(0, 0, 0, 0.95)',
      textStroke: false,
      textStrokeWidth: 0,
      textStrokeColor: '#000000',
      boxBorder: true,
      boxBorderColor: 'rgba(245, 158, 11, 0.45)',
      boxBorderWidth: 1.5,
      accentBar: false,
      glowShadow: true,
      glowShadowColor: 'rgba(245, 158, 11, 0.2)',
      quoteDecoration: true,
      animation: 'zoom',
      animationDuration: 400,
      showTranslationBadge: true,
      showBookIcon: true,
      uppercaseReference: true
    }
  },
  {
    id: 'preset-capsule-modern',
    name: 'Cápsula Flotante Moderna',
    tagline: 'Estilo Minimal Streamer',
    category: 'minimal',
    description: 'Diseño en píldora redondeada, ultra limpio y compacto.',
    isPreset: true,
    styling: {
      fontFamily: 'Montserrat',
      verseSize: 32,
      referenceSize: 20,
      fontWeight: '600',
      italic: false,
      lineHeight: 1.35,
      letterSpacing: 0.5,
      textColor: '#FFFFFF',
      referenceColor: '#60A5FA',
      badgeBgColor: 'rgba(59, 130, 246, 0.25)',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      backgroundStyle: 'frosted-glass',
      backgroundOpacity: 92,
      alignment: 'center',
      position: 'lower-third',
      paddingX: 40,
      paddingY: 20,
      marginBottom: 48,
      maxWidth: 75,
      borderRadius: 9999,
      textShadow: true,
      textShadowBlur: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.9)',
      textStroke: false,
      textStrokeWidth: 0,
      textStrokeColor: '#000000',
      boxBorder: true,
      boxBorderColor: 'rgba(59, 130, 246, 0.4)',
      boxBorderWidth: 1,
      accentBar: false,
      glowShadow: true,
      glowShadowColor: 'rgba(59, 130, 246, 0.2)',
      quoteDecoration: false,
      animation: 'slide-up',
      animationDuration: 300,
      showTranslationBadge: true,
      showBookIcon: true,
      uppercaseReference: true
    }
  }
];

interface TemplatesPanelProps {
  onApplyTemplate: (template: OverlayTemplate) => void;
  customTemplates: OverlayTemplate[];
  onDeleteCustomTemplate: (id: string) => void;
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  onApplyTemplate,
  customTemplates,
  onDeleteCustomTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'broadcast' | 'liturgico' | 'modern' | 'minimal'>('all');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const filteredPresets = BUILTIN_PRESETS.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const handleSelect = (template: OverlayTemplate) => {
    onApplyTemplate(template);
    setAppliedId(template.id);
    setTimeout(() => setAppliedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-studio-surface text-slate-200 overflow-y-auto p-3 space-y-3.5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-studio-border">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Galería de Plantillas
        </h3>
        <span className="text-[10px] bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-mono font-bold">
          {BUILTIN_PRESETS.length} Diseños
        </span>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-1">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'broadcast', label: 'Broadcast TV' },
          { id: 'liturgico', label: 'Litúrgico Oro' },
          { id: 'modern', label: 'Worship / Modern' },
          { id: 'minimal', label: 'Minimal / Alpha' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-studio-panel text-muted-foreground hover:bg-studio-hover hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Presets Grid */}
      <div className="space-y-2.5">
        {filteredPresets.map((preset) => {
          const isJustApplied = appliedId === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => handleSelect(preset)}
              className={`p-3 rounded-xl border cursor-pointer transition-all relative overflow-hidden group ${
                isJustApplied 
                  ? 'bg-primary/15 border-primary ring-2 ring-primary/40' 
                  : 'bg-studio-panel/70 hover:bg-studio-panel border-studio-border hover:border-primary/50 hover:shadow-md'
              }`}
            >
              {/* Mini visual preview bar simulating the template style */}
              <div 
                className="w-full h-7 rounded-md mb-2 flex items-center justify-between px-2.5 overflow-hidden border border-studio-border"
                style={{
                  background: preset.styling.backgroundStyle === 'transparent'
                    ? 'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 50% / 12px 12px'
                    : preset.styling.backgroundColor || 'rgba(15,23,42,0.9)',
                }}
              >
                <span 
                  className="text-[9px] font-bold tracking-wider uppercase truncate"
                  style={{ color: preset.styling.referenceColor }}
                >
                  JUAN 3:16
                </span>
                <span 
                  className="text-[8px] px-1 py-0.2 rounded font-mono font-bold"
                  style={{
                    backgroundColor: preset.styling.badgeBgColor,
                    color: preset.styling.referenceColor
                  }}
                >
                  {preset.styling.fontFamily}
                </span>
              </div>

              {/* Title & Status */}
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {preset.name}
                  </h4>
                  <span className="text-[10px] text-primary/80 font-medium block">
                    {preset.tagline}
                  </span>
                </div>

                {isJustApplied && (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold animate-fade-in flex-shrink-0">
                    <Check className="w-3 h-3" />
                    <span>Aplicado</span>
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] text-muted-foreground leading-snug mt-1">
                {preset.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Custom User Templates */}
      {customTemplates.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-studio-border/60">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Mis Diseños Guardados ({customTemplates.length})
          </span>
          {customTemplates.map((custom) => (
            <div
              key={custom.id}
              onClick={() => handleSelect(custom)}
              className="p-2.5 rounded-lg bg-studio-panel hover:bg-studio-hover border border-studio-border hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                  {custom.name}
                </h4>
                <p className="text-[10px] text-muted-foreground">{custom.description || 'Diseño personalizado'}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCustomTemplate(custom.id);
                }}
                className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                title="Eliminar plantilla"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
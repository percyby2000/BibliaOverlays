import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import type { OverlayStyling, OverlayPosition, AnimationType } from '../../types/overlay';

interface VisualEditorPanelProps {
  overlayId: string;
  styling: OverlayStyling;
  onChangeStyling: (updated: Partial<OverlayStyling>) => void;
  onSaveTemplate: (name: string) => void;
}

const PRESET_BACKGROUND_IMAGES = [
  { id: 'lower-24', name: 'Lower 24', url: '/fondos/Lower-3rd-24.png', previewBg: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)', textColor: '#FFFFFF', referenceColor: '#38BDF8' },
  { id: 'lower-25', name: 'Lower 25', url: '/fondos/Lower-3rd-25.png', previewBg: 'linear-gradient(135deg, #312e81 0%, #8b5cf6 100%)', textColor: '#FFFFFF', referenceColor: '#A78BFA' },
  { id: 'lower-26', name: 'Lower 26', url: '/fondos/Lower-3rd-26.png', previewBg: 'linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)', textColor: '#FFFFFF', referenceColor: '#7DD3FC' },
  { id: 'lower-32', name: 'Lower 32', url: '/fondos/Lower-3rd-32.png', previewBg: 'linear-gradient(135deg, #111827 0%, #f59e0b 100%)', textColor: '#FFF7ED', referenceColor: '#FBBF24' },
  { id: 'lower-34', name: 'Lower 34', url: '/fondos/Lower-3rd-34.png', previewBg: 'linear-gradient(135deg, #0f172a 0%, #22c55e 100%)', textColor: '#ECFDF5', referenceColor: '#4ADE80' },
  { id: 'lower-37', name: 'Lower 37', url: '/fondos/Lower-3rd-37.png', previewBg: 'linear-gradient(135deg, #111827 0%, #ec4899 100%)', textColor: '#FDF2F8', referenceColor: '#F9A8D4' },
  { id: 'lower-40', name: 'Lower 40', url: '/fondos/Lower-3rd-40.png', previewBg: 'linear-gradient(135deg, #1f2937 0%, #f97316 100%)', textColor: '#FFF7ED', referenceColor: '#FDBA74' },
  { id: 'lower-41', name: 'Lower 41', url: '/fondos/Lower-3rd-41.png', previewBg: 'linear-gradient(135deg, #0f172a 0%, #f43f5e 100%)', textColor: '#FFF1F2', referenceColor: '#FDA4AF' },
  { id: 'scrappy-social', name: 'Scrappy Social', url: '/fondos/Scrappy%20-%20Social%20-%20Moveable.png', previewBg: 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)', textColor: '#FFFFFF', referenceColor: '#C4B5FD' },
  { id: 'scrappy-1', name: 'Scrappy 1', url: '/fondos/Scrappy-Headline-1-Blank.png', previewBg: 'linear-gradient(135deg, #0b1120 0%, #38bdf8 100%)', textColor: '#F8FAFC', referenceColor: '#7DD3FC' },
  { id: 'scrappy-2', name: 'Scrappy 2', url: '/fondos/Scrappy-Headline-2-Blank.png', previewBg: 'linear-gradient(135deg, #0f172a 0%, #f59e0b 100%)', textColor: '#FFFBEB', referenceColor: '#FCD34D' },
];

const PRESENTATION_BACKGROUND_IMAGES = [
  { id: 'presentation-1', name: 'Presentación 1', url: '/fondos/prensentacion1.jpg', previewBg: 'linear-gradient(135deg, #111827 0%, #475569 100%)', textColor: '#FFFFFF', referenceColor: '#FBBF24' },
  { id: 'presentation-2', name: 'Presentación 2', url: '/fondos/prensentacion2.jpg', previewBg: 'linear-gradient(135deg, #172554 0%, #2563EB 100%)', textColor: '#FFFFFF', referenceColor: '#93C5FD' },
  { id: 'presentation-3', name: 'Presentación 3', url: '/fondos/prensentacion3.jpg', previewBg: 'linear-gradient(135deg, #1C1917 0%, #B45309 100%)', textColor: '#FFFBEB', referenceColor: '#FCD34D' },
  { id: 'presentation-4', name: 'Presentación 4', url: '/fondos/prensentacion4.jpg', previewBg: 'linear-gradient(135deg, #312E81 0%, #9333EA 100%)', textColor: '#FAF5FF', referenceColor: '#D8B4FE' },
  { id: 'presentation-6', name: 'Presentación 6', url: '/fondos/prensentacion6.jpg', previewBg: 'linear-gradient(135deg, #134E4A 0%, #0EA5E9 100%)', textColor: '#F0FDFA', referenceColor: '#67E8F9' },
];

export const VisualEditorPanel: React.FC<VisualEditorPanelProps> = ({
  overlayId,
  styling,
  onChangeStyling,
  onSaveTemplate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [templateNameError, setTemplateNameError] = useState<string | null>(null);

  // Handle local image file upload with strict validations
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validation: File Type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setFileError('El archivo debe ser una imagen válida (PNG, JPG, WebP o SVG).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validation: File Size (max 5 MB)
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`La imagen es demasiado pesada (${(file.size / (1024 * 1024)).toFixed(1)} MB). Límite máximo: ${MAX_SIZE_MB} MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChangeStyling({
          backgroundImageUrl: dataUrl,
          backgroundImageOpacity: 100,
          backgroundStyle: 'transparent',
          backgroundColor: 'transparent',
          boxBorder: false,
          textShadow: true,
          textStroke: true,
        });
      }
    };
    reader.onerror = () => {
      setFileError('No se pudo leer el archivo de imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFileError(null);
    onChangeStyling({
      backgroundImageUrl: undefined,
      backgroundStyle: 'frosted-glass',
      backgroundColor: 'rgba(10, 15, 26, 0.90)',
      boxBorder: true,
      boxBorderColor: 'rgba(56, 189, 248, 0.45)',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectBackground = (preset: typeof PRESET_BACKGROUND_IMAGES[number]) => {
    setFileError(null);
    onChangeStyling({
      backgroundImageUrl: preset.url,
      backgroundImageOpacity: 100,
      backgroundStyle: 'transparent',
      backgroundColor: 'transparent',
      boxBorder: false,
      textShadow: true,
      textStroke: overlayId !== 'presentacion',
      textColor: preset.textColor,
      referenceColor: preset.referenceColor,
    });
  };

  // Submit custom template save with validation
  const handleConfirmSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = templateNameInput.trim();
    if (!cleanName) {
      setTemplateNameError('Ingresa un nombre para la plantilla.');
      return;
    }
    if (cleanName.length > 50) {
      setTemplateNameError('El nombre no puede exceder los 50 caracteres.');
      return;
    }

    onSaveTemplate(cleanName);
    setTemplateNameInput('');
    setTemplateNameError(null);
    setIsSavingTemplate(false);
  };

  return (
    <div className="flex flex-col h-full bg-studio-surface text-slate-200 overflow-y-auto select-none">
      {/* Editor Header */}
      <div className="p-3 border-b border-studio-border flex items-center justify-between bg-studio-panel/50">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Personalizar Overlay
        </h3>
        {!isSavingTemplate ? (
          <button
            onClick={() => {
              setIsSavingTemplate(true);
              setTemplateNameError(null);
            }}
            className="text-[11px] px-2.5 py-1 rounded-md bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 transition-colors font-medium flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Guardar Diseño</span>
          </button>
        ) : (
          <button
            onClick={() => setIsSavingTemplate(false)}
            className="text-[11px] text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Inline Save Template Form */}
      {isSavingTemplate && (
        <form onSubmit={handleConfirmSaveTemplate} className="p-3 bg-studio-panel border-b border-studio-border space-y-2 animate-fade-in">
          <label className="text-[11px] font-semibold text-foreground block">
            Nombre de la Nueva Plantilla:
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              autoFocus
              value={templateNameInput}
              onChange={(e) => {
                setTemplateNameInput(e.target.value);
                if (templateNameError) setTemplateNameError(null);
              }}
              placeholder="Ej: Culto Dominical 1..."
              className="flex-1 bg-studio-bg border border-studio-border rounded-md px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-md hover:bg-primary/90 transition-all flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Guardar</span>
            </button>
          </div>
          {templateNameError && (
            <p className="text-[10px] text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{templateNameError}</span>
            </p>
          )}
        </form>
      )}

      <div className="p-3.5 space-y-4 text-xs">
        {/* 1. SECCIÓN DE IMAGEN DE FONDO */}
        <div className="space-y-2.5 bg-studio-panel/70 border border-studio-border p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              Imagen de Fondo (Tercio Inferior)
            </span>
            {styling.backgroundImageUrl && (
              <button
                onClick={handleRemoveImage}
                className="text-[10px] text-destructive hover:underline flex items-center gap-1 font-semibold"
                title="Quitar imagen de fondo"
              >
                <Trash2 className="w-3 h-3" />
                <span>Quitar</span>
              </button>
            )}
          </div>

          {/* Validation error for file upload */}
          {fileError && (
            <div className="flex items-start gap-1 p-2 rounded bg-destructive/15 border border-destructive/30 text-destructive-foreground text-[10px]">
              <AlertCircle className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Subir archivo */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 rounded-lg border border-dashed border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Imagen (PNG / JPG / WebP)</span>
          </button>

          {/* Fondos de transmisión */}
          {overlayId === 'transmision' && <div>
            <span className="text-[10px] text-muted-foreground font-medium block mb-1.5">
              Fondos de transmisión:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESET_BACKGROUND_IMAGES.map((preset) => {
                const isSelected = styling.backgroundImageUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectBackground(preset)}
                    className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-primary bg-primary/20 ring-1 ring-primary text-foreground font-bold'
                        : 'border-studio-border bg-studio-panel hover:bg-studio-hover text-muted-foreground'
                    }`}
                  >
                    <div 
                      className="w-full h-4 rounded" 
                      style={{ background: preset.previewBg }}
                    />
                    <span className="text-[9px] truncate w-full">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>}

          {/* Fondos de presentación */}
          {overlayId === 'presentacion' && <div>
            <span className="text-[10px] text-muted-foreground font-medium block mb-1.5">
              Fondos de presentación:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESENTATION_BACKGROUND_IMAGES.map((preset) => {
                const isSelected = styling.backgroundImageUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectBackground(preset)}
                    className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-primary bg-primary/20 ring-1 ring-primary text-foreground font-bold'
                        : 'border-studio-border bg-studio-panel hover:bg-studio-hover text-muted-foreground'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-8 rounded object-cover"
                    />
                    <span className="text-[9px] truncate w-full">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>}

          {/* Opacidad de la imagen */}
          {styling.backgroundImageUrl && (
            <div className="pt-1">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>Opacidad:</span>
                <span className="font-mono text-primary font-bold">{styling.backgroundImageOpacity ?? 100}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={styling.backgroundImageOpacity ?? 100}
                onChange={(e) => onChangeStyling({ backgroundImageOpacity: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>
          )}
        </div>

        {/* 2. TIPOGRAFÍA Y TAMAÑO */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
            Tamaño y Fuente
          </span>

          <div className="space-y-3 rounded-xl bg-studio-panel border border-studio-border p-2.5">
            <div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>Versículo</span>
                <span className="font-mono text-primary font-bold">{styling.verseSize}px</span>
              </div>
              <input
                type="range"
                min="18"
                max="120"
                step="1"
                value={styling.verseSize}
                onChange={(e) => onChangeStyling({ verseSize: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>Referencia</span>
                <span className="font-mono text-primary font-bold">{styling.referenceSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="80"
                step="1"
                value={styling.referenceSize}
                onChange={(e) => onChangeStyling({ referenceSize: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>
            {overlayId === 'presentacion' && (
              <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground">Ajuste fino del bloque</span>
                  <button
                    type="button"
                    onClick={() => onChangeStyling({ offsetX: 0, offsetY: 0 })}
                    className="text-[10px] font-semibold text-primary hover:underline"
                  >
                    Centrar
                  </button>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>Izquierda / derecha</span>
                    <span className="font-mono text-primary">{Math.round(styling.offsetX ?? 0)} px</span>
                  </div>
                  <input
                    type="range"
                    min="-960"
                    max="960"
                    step="1"
                    value={styling.offsetX ?? 0}
                    onChange={(e) => onChangeStyling({ offsetX: Number(e.target.value) })}
                    className="w-full accent-primary"
                    aria-label="Mover presentación horizontalmente"
                  />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>Arriba / abajo</span>
                    <span className="font-mono text-primary">{Math.round(styling.offsetY ?? 0)} px</span>
                  </div>
                  <input
                    type="range"
                    min="-540"
                    max="540"
                    step="1"
                    value={styling.offsetY ?? 0}
                    onChange={(e) => onChangeStyling({ offsetY: Number(e.target.value) })}
                    className="w-full accent-primary"
                    aria-label="Mover presentación verticalmente"
                  />
                </div>
                <p className="text-[10px] leading-tight text-muted-foreground">
                  También puedes arrastrar el bloque directamente en la vista previa.
                </p>
              </div>
            )}
          </div>

          {/* Font Selector */}
          <div>
            <span className="text-[11px] text-muted-foreground block mb-1">Tipo de Letra:</span>
            <select
              value={styling.fontFamily}
              onChange={(e) => onChangeStyling({ fontFamily: e.target.value as any })}
              className="w-full bg-studio-panel border border-studio-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="Inter">Inter (Limpia y moderna)</option>
              <option value="Montserrat">Montserrat (Geométrica broadcast)</option>
              <option value="Playfair Display">Playfair Display (Serif elegante)</option>
              <option value="Cinzel">Cinzel (Imperial romana clásica)</option>
              <option value="Bebas Neue">Bebas Neue (Titular de impacto)</option>
            </select>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1">Color del Versículo</span>
              <div className="flex items-center gap-2 bg-studio-panel border border-studio-border rounded-md p-1.5">
                <input
                  type="color"
                  value={styling.textColor}
                  onChange={(e) => onChangeStyling({ textColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[11px] font-mono text-foreground uppercase">{styling.textColor}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1">Color Referencia</span>
              <div className="flex items-center gap-2 bg-studio-panel border border-studio-border rounded-md p-1.5">
                <input
                  type="color"
                  value={styling.referenceColor}
                  onChange={(e) => onChangeStyling({ referenceColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[11px] font-mono text-foreground uppercase">{styling.referenceColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. POSICIÓN EN PANTALLA */}
        <div className="space-y-2 pt-2 border-t border-studio-border/60">
          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
            Posición en Pantalla
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'lower-third', label: 'Tercio Inferior' },
              { id: 'center-box', label: 'Caja Central' },
              { id: 'bottom-bar', label: 'Barra Completa' },
            ].map((pos) => (
              <button
                key={pos.id}
                onClick={() => onChangeStyling({ position: pos.id as OverlayPosition })}
                className={`py-1.5 rounded-md text-xs font-semibold border text-center transition-all ${
                  styling.position === pos.id
                    ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                    : 'bg-studio-panel border-studio-border text-muted-foreground hover:bg-studio-hover'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. LEGIBILIDAD SOBRE VIDEO */}
        <div className="space-y-2 pt-2 border-t border-studio-border/60">
          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
            Legibilidad de Transmisión
          </span>

          <div className="flex items-center justify-between p-2 rounded-lg bg-studio-panel border border-studio-border">
            <div>
              <span className="font-semibold text-foreground block text-xs">Sombra Profunda</span>
              <span className="text-[10px] text-muted-foreground">Mayor contraste sobre fondos claros</span>
            </div>
            <input
              type="checkbox"
              checked={styling.textShadow}
              onChange={(e) => onChangeStyling({ textShadow: e.target.checked })}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-studio-panel border border-studio-border">
            <div>
              <span className="font-semibold text-foreground block text-xs">Contorno Negro (Stroke)</span>
              <span className="text-[10px] text-muted-foreground">Borde exterior de contraste nítido</span>
            </div>
            <input
              type="checkbox"
              checked={styling.textStroke}
              onChange={(e) => onChangeStyling({ textStroke: e.target.checked })}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>
        </div>

        {/* 5. ANIMACIÓN DE ENTRADA */}
        <div className="space-y-2 pt-2 border-t border-studio-border/60 pb-4">
          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
            Efecto de Entrada
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'slide-up', label: 'Deslizar' },
              { id: 'fade', label: 'Disolver' },
              { id: 'zoom', label: 'Zoom' },
            ].map((anim) => (
              <button
                key={anim.id}
                onClick={() => onChangeStyling({ animation: anim.id as AnimationType })}
                className={`py-1.5 rounded-md text-xs font-semibold border text-center transition-all ${
                  styling.animation === anim.id
                    ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                    : 'bg-studio-panel border-studio-border text-muted-foreground hover:bg-studio-hover'
                }`}
              >
                {anim.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
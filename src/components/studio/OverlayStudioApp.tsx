import React, { useState, useEffect, useCallback } from 'react';
import { StudioHeader } from './StudioHeader';
import { BibleSearchPanel } from './BibleSearchPanel';
import { LivePreviewCanvas } from './LivePreviewCanvas';
import { BroadcastDeck } from './BroadcastDeck';
import { VisualEditorPanel } from './VisualEditorPanel';
import { TemplatesPanel } from './TemplatesPanel';
import { SettingsModal } from './SettingsModal';
import {
  SyncService,
  getDefaultOverlayState,
  OVERLAY_CHANNELS,
  type ConnectionMode
} from '../../services/syncService';
import { BibleService } from '../../services/bibleService';
import type { 
  OverlayState, 
  OverlayStyling, 
  BibleContentPayload, 
  OverlayTemplate 
} from '../../types/overlay';
import { Sliders, Sparkles, BookOpen, Tv, Palette } from 'lucide-react';

export const OverlayStudioApp: React.FC = () => {
  const [currentOverlayId, setCurrentOverlayId] = useState<string>('transmision');
  const [liveState, setLiveState] = useState<OverlayState>(() => getDefaultOverlayState('transmision'));
  const [previewState, setPreviewState] = useState<OverlayState>(() => getDefaultOverlayState('transmision'));
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('local_demo');
  const [activeRightTab, setActiveRightTab] = useState<'STYLER' | 'TEMPLATES'>('STYLER');
  const [mobileWorkstationTab, setMobileWorkstationTab] = useState<'SEARCH' | 'DECK' | 'STYLE'>('DECK');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<OverlayTemplate[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('bible_studio_custom_templates');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [];
  });

  // Subscribe to the selected overlay channel
  useEffect(() => {
    let isMounted = true;

    // Load initial state
    SyncService.getInitialState(currentOverlayId).then((initial) => {
      if (isMounted) {
        setLiveState(initial);
        setPreviewState(initial);
      }
    });

    // Realtime subscription (Supabase + BroadcastChannel + LocalStorage)
    const unsubscribe = SyncService.subscribe(
      currentOverlayId,
      (updatedState) => {
        if (isMounted) {
          setLiveState(updatedState);
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
  }, [currentOverlayId]);

  const handleSelectOverlay = useCallback((overlayId: string) => {
    if (overlayId === currentOverlayId) return;

    const nextState = getDefaultOverlayState(overlayId);
    setCurrentOverlayId(overlayId);
    setLiveState(nextState);
    setPreviewState(nextState);
  }, [currentOverlayId]);

  // Push Live update helper
  const pushStateUpdate = useCallback((updated: OverlayState) => {
    setLiveState(updated);
    SyncService.pushUpdate(updated);
  }, []);

  // Action: Send Preview to Live (Master CUT)
  const handleSendLive = useCallback(() => {
    const updated: OverlayState = {
      ...liveState,
      content: previewState.content,
      styling: previewState.styling,
      is_visible: true,
      is_blackout: false,
    };
    pushStateUpdate(updated);
  }, [liveState, previewState, pushStateUpdate]);

  // Action: Toggle Visibility
  const handleToggleVisibility = useCallback(() => {
    const updated: OverlayState = {
      ...liveState,
      is_visible: !liveState.is_visible,
    };
    pushStateUpdate(updated);
  }, [liveState, pushStateUpdate]);

  // Action: Toggle Blackout
  const handleToggleBlackout = useCallback(() => {
    const updated: OverlayState = {
      ...liveState,
      is_blackout: !liveState.is_blackout,
    };
    pushStateUpdate(updated);
  }, [liveState, pushStateUpdate]);

  // Action: Clear Content
  const handleClearContent = useCallback(() => {
    const updated: OverlayState = {
      ...liveState,
      content: null,
    };
    pushStateUpdate(updated);
  }, [liveState, pushStateUpdate]);

  // Action: Verse Preview Selection
  const handlePreviewVerse = useCallback((payload: BibleContentPayload) => {
    setPreviewState((prev) => ({
      ...prev,
      content: payload,
    }));
  }, []);

  // Action: Direct to Live
  const handleLiveVerse = useCallback((payload: BibleContentPayload) => {
    setPreviewState((prev) => ({ ...prev, content: payload }));
    const updated: OverlayState = {
      ...liveState,
      content: payload,
      styling: previewState.styling,
      is_visible: true,
      is_blackout: false,
    };
    pushStateUpdate(updated);
  }, [liveState, previewState.styling, pushStateUpdate]);

  // Action: Next / Prev Verse in current chapter
  const handleNavigateVerse = useCallback(async (direction: 'prev' | 'next') => {
    const current = previewState.content || liveState.content;
    if (!current) return;

    const nextVerseNum = direction === 'next' 
      ? current.verseStart + 1 
      : Math.max(1, current.verseStart - 1);

    const refStr = `${current.bookName} ${current.chapter}:${nextVerseNum}`;
    try {
      const res = await BibleService.getPassage(refStr, current.translation);
      const nextPayload: BibleContentPayload = {
        book: current.book,
        bookName: current.bookName,
        chapter: current.chapter,
        verseStart: nextVerseNum,
        reference: res.reference,
        text: res.text,
        translation: current.translation,
        testament: current.testament,
      };

      setPreviewState((prev) => ({ ...prev, content: nextPayload }));

      // If currently visible on air, project immediately
      if (liveState.is_visible && !liveState.is_blackout) {
        pushStateUpdate({
          ...liveState,
          content: nextPayload,
        });
      }
    } catch (e) {
      console.warn('Fin de versículos disponibles en el capítulo:', e);
    }
  }, [previewState.content, liveState, pushStateUpdate]);

  // Action: Change Styling
  const handleChangeStyling = useCallback((changes: Partial<OverlayStyling>) => {
    const newStyling = { ...previewState.styling, ...changes };
    setPreviewState((prev) => ({
      ...prev,
      styling: newStyling,
    }));

    // Auto-update live overlay styling so changes reflect immediately
    pushStateUpdate({
      ...liveState,
      styling: newStyling,
    });
  }, [previewState.styling, liveState, pushStateUpdate]);

  // Action: Apply Preset Template
  const handleApplyTemplate = useCallback((template: OverlayTemplate) => {
    handleChangeStyling(template.styling);
  }, [handleChangeStyling]);

  // Action: Save Custom Template with validated name
  const handleSaveTemplate = useCallback((name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    const newTemplate: OverlayTemplate = {
      id: `custom-${Date.now()}`,
      name: cleanName,
      description: 'Diseño personalizado guardado',
      isPreset: false,
      styling: { ...previewState.styling },
    };

    const updated = [newTemplate, ...customTemplates];
    setCustomTemplates(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bible_studio_custom_templates', JSON.stringify(updated));
    }
  }, [previewState.styling, customTemplates]);

  // Action: Delete Custom Template
  const handleDeleteCustomTemplate = useCallback((id: string) => {
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bible_studio_custom_templates', JSON.stringify(updated));
    }
  }, [customTemplates]);

  const overlayUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/overlay/${currentOverlayId}`
    : `/overlay/${currentOverlayId}`;

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden select-none font-sans">
      {/* 1. Header Bar with Channel Switcher and OBS Link Copy */}
      <StudioHeader
        state={liveState}
        overlaysList={[...OVERLAY_CHANNELS]}
        currentOverlayId={currentOverlayId}
        onSelectOverlay={handleSelectOverlay}
      />

      {/* Responsive Workstation Mobile/Tablet Tab Switcher (<lg screens) */}
      <div className="lg:hidden flex border-b border-border bg-card px-2 py-1.5 justify-around text-xs">
        <button
          onClick={() => setMobileWorkstationTab('SEARCH')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
            mobileWorkstationTab === 'SEARCH'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Buscador Bíblico</span>
        </button>

        <button
          onClick={() => setMobileWorkstationTab('DECK')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
            mobileWorkstationTab === 'DECK'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Monitor y En Vivo</span>
        </button>

        <button
          onClick={() => setMobileWorkstationTab('STYLE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
            mobileWorkstationTab === 'STYLE'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Estilos</span>
        </button>
      </div>

      {/* 2. Main Studio Workstation Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Biblical Search & Passage Navigator */}
        <div className={`
          lg:flex lg:w-72 xl:w-80 flex-shrink-0 h-full
          ${mobileWorkstationTab === 'SEARCH' ? 'flex flex-1 w-full' : 'hidden lg:flex'}
        `}>
          <div className="w-full h-full">
            <BibleSearchPanel
              currentPayload={previewState.content}
              onPreviewVerse={handlePreviewVerse}
              onLiveVerse={handleLiveVerse}
            />
          </div>
        </div>

        {/* Center Column: 16:9 Live Preview Canvas + Broadcast Master Deck */}
        <div className={`
          flex-1 flex-col h-full overflow-hidden
          ${mobileWorkstationTab === 'DECK' ? 'flex' : 'hidden lg:flex'}
        `}>
          {/* 16:9 Canvas Viewport */}
          <div className="flex-1 overflow-hidden">
            <LivePreviewCanvas
              state={liveState}
              previewState={previewState}
              onChangeStyling={handleChangeStyling}
            />
          </div>

          {/* Master Broadcast Deck */}
          <BroadcastDeck
            state={liveState}
            previewPayload={previewState.content}
            onSendLive={handleSendLive}
            onToggleVisibility={handleToggleVisibility}
            onToggleBlackout={handleToggleBlackout}
            onClearContent={handleClearContent}
            onNavigateVerse={handleNavigateVerse}
          />
        </div>

        {/* Right Column: Visual Styler & Templates */}
        <div className={`
          lg:flex lg:w-72 xl:w-84 flex-shrink-0 flex-col h-full bg-card border-l border-border
          ${mobileWorkstationTab === 'STYLE' ? 'flex flex-1 w-full' : 'hidden lg:flex'}
        `}>
          {/* Tabs Switcher */}
          <div className="flex border-b border-border bg-studio-panel/60 p-1.5 gap-1">
            <button
              onClick={() => setActiveRightTab('STYLER')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeRightTab === 'STYLER'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Estilo</span>
            </button>
            <button
              onClick={() => setActiveRightTab('TEMPLATES')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeRightTab === 'TEMPLATES'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plantillas</span>
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {activeRightTab === 'STYLER' ? (
              <VisualEditorPanel
                overlayId={currentOverlayId}
                styling={previewState.styling}
                onChangeStyling={handleChangeStyling}
                onSaveTemplate={handleSaveTemplate}
              />
            ) : (
              <TemplatesPanel
                onApplyTemplate={handleApplyTemplate}
                customTemplates={customTemplates}
                onDeleteCustomTemplate={handleDeleteCustomTemplate}
              />
            )}
          </div>
        </div>
      </div>

      {/* 3. Settings & OBS Guide Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        overlayUrl={overlayUrl}
      />
    </div>
  );
};
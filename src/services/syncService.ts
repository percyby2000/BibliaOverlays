import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { OverlayState, OverlayStyling } from '../types/overlay';

export const OVERLAY_CHANNELS = [
  { id: 'transmision', name: 'Transmisión' },
  { id: 'presentacion', name: 'Presentación' },
] as const;

export function getOverlayName(overlayId: string): string {
  return OVERLAY_CHANNELS.find((channel) => channel.id === overlayId)?.name
    || 'Transmisión';
}

export const DEFAULT_STYLING: OverlayStyling = {
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
};

function getChannelDefaultStyling(overlayId: string): OverlayStyling {
  if (overlayId === 'presentacion') {
    return {
      ...DEFAULT_STYLING,
      fontFamily: 'Montserrat',
      verseSize: 68,
      referenceSize: 34,
      fontWeight: '600',
      italic: false,
      lineHeight: 1.18,
      letterSpacing: 0.2,
      textColor: '#F8FAFC',
      referenceColor: '#F87171',
      badgeBgColor: 'rgba(248, 113, 113, 0.18)',
      backgroundColor: 'rgba(12, 15, 18, 0.84)',
      backgroundStyle: 'cinematic-blur',
      backgroundOpacity: 88,
      backgroundImageUrl: undefined,
      backgroundImageOpacity: 0,
      alignment: 'center',
      position: 'center-box',
      paddingX: 64,
      paddingY: 42,
      marginBottom: 0,
      maxWidth: 86,
      borderRadius: 18,
      textShadow: true,
      textShadowBlur: 16,
      textShadowColor: 'rgba(0, 0, 0, 0.9)',
      textStroke: false,
      textStrokeWidth: 0,
      textStrokeColor: '#000000',
      boxBorder: false,
      boxBorderColor: 'transparent',
      boxBorderWidth: 0,
      accentBar: false,
      glowShadow: true,
      glowShadowColor: 'rgba(248, 113, 113, 0.22)',
      quoteDecoration: false,
      animation: 'fade',
      animationDuration: 420,
      showTranslationBadge: true,
      showBookIcon: true,
      uppercaseReference: true,
    };
  }

  return {
    ...DEFAULT_STYLING,
    fontFamily: 'Montserrat',
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
    uppercaseReference: true,
  };
}

export function getDefaultOverlayState(overlayId: string = 'transmision'): OverlayState {
  const styling = getChannelDefaultStyling(overlayId);

  return {
    id: overlayId,
    name: getOverlayName(overlayId),
    read_token: `token-${overlayId}-sec`,
    is_visible: true,
    is_blackout: false,
    kind: 'bible',
    styling,
    content: {
      book: 'JHN',
      bookName: 'Juan',
      chapter: 3,
      verseStart: 16,
      reference: 'Juan 3:16',
      text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
      translation: 'RVR1960',
      testament: 'NT'
    },
    updated_at: new Date().toISOString(),
    version: 1
  };
}

export type ConnectionMode = 'supabase_live' | 'local_demo' | 'reconnecting';

export class SyncService {
  private static localChannel: BroadcastChannel | null = null;

  private static getLocalChannel(): BroadcastChannel | null {
    if (typeof window === 'undefined') return null;
    if (!this.localChannel && 'BroadcastChannel' in window) {
      try {
        this.localChannel = new BroadcastChannel('bible_overlay_sync_bus');
      } catch (e) {
        console.warn('[SyncService] BroadcastChannel no soportado, usando StorageEvent fallback.');
      }
    }
    return this.localChannel;
  }

  /**
   * Recovers initial state with priority:
   * 1. Supabase PostgreSQL (if configured)
   * 2. LocalStorage cache (fastest & offline-first)
   * 3. Fallback default state
   */
  public static async getInitialState(overlayId: string): Promise<OverlayState> {
    const cacheKey = `bible_overlay_state_${overlayId}`;
    
    // 1. Try Local Storage Cache first for instantaneous render
    let cachedState: OverlayState | null = null;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          cachedState = JSON.parse(stored);
        }
      } catch (err) {
        console.error('[SyncService] Error al leer caché local:', err);
      }
    }

    // 2. If Supabase is configured, check live database
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('overlay_states')
          .select('*')
          .eq('overlay_id', overlayId)
          .single();

        if (data && !error) {
          const liveState: OverlayState = {
            id: overlayId,
            name: getOverlayName(overlayId),
            read_token: `token-${overlayId}`,
            is_visible: data.is_visible,
            is_blackout: data.is_blackout,
            kind: data.kind as any,
            styling: data.styling as any,
            content: data.content as any,
            updated_at: data.updated_at,
            version: data.version
          };

          // Update local cache
          if (typeof window !== 'undefined') {
            localStorage.setItem(cacheKey, JSON.stringify(liveState));
          }
          return liveState;
        }
      } catch (err) {
        console.warn('[SyncService] Error al consultar Supabase, usando estado en caché:', err);
      }
    }

    return cachedState || getDefaultOverlayState(overlayId);
  }

  /**
   * Pushes updated state to all connected overlays
   * Syncs to:
   * 1. LocalStorage (instant persistence)
   * 2. BroadcastChannel (instant inter-tab communication in zero latency)
   * 3. Supabase Realtime & PostgreSQL (if configured)
   */
  public static async pushUpdate(state: OverlayState): Promise<void> {
    const updatedState: OverlayState = {
      ...state,
      updated_at: new Date().toISOString(),
      version: (state.version || 0) + 1
    };

    const cacheKey = `bible_overlay_state_${state.id}`;

    // 1. Save to LocalStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(updatedState));
        // Also trigger a storage event for tabs that don't support BroadcastChannel
        localStorage.setItem(`bible_overlay_trigger_${state.id}`, String(Date.now()));
      } catch (e) {
        console.warn('[SyncService] Error guardando en localStorage:', e);
      }
    }

    // 2. Broadcast to other tabs immediately
    const channel = this.getLocalChannel();
    if (channel) {
      try {
        channel.postMessage({
          type: 'OVERLAY_STATE_CHANGED',
          overlayId: state.id,
          payload: updatedState
        });
      } catch (e) {
        console.warn('[SyncService] Error emitiendo por BroadcastChannel:', e);
      }
    }

    // 3. Sync to Supabase if configured
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Upsert state in PostgreSQL
        await supabase
          .from('overlay_states')
          .upsert({
            overlay_id: state.id,
            is_visible: updatedState.is_visible,
            is_blackout: updatedState.is_blackout,
            kind: updatedState.kind,
            styling: updatedState.styling as any,
            content: updatedState.content as any,
            updated_at: updatedState.updated_at,
            version: updatedState.version
          });

        // Send realtime broadcast
        const realtimeChannel = supabase.channel(`overlay_room:${state.id}`);
        await realtimeChannel.send({
          type: 'broadcast',
          event: 'state_update',
          payload: updatedState
        });
      } catch (err) {
        console.error('[SyncService] Error sincronizando con Supabase:', err);
      }
    }
  }

  /**
   * Subscribe to real-time updates for an overlay
   * Combines Supabase Realtime + BroadcastChannel + LocalStorage listener
   */
  public static subscribe(
    overlayId: string,
    onStateReceived: (state: OverlayState) => void,
    onModeChanged?: (mode: ConnectionMode) => void
  ): () => void {
    let isUnsubscribed = false;
    const cacheKey = `bible_overlay_state_${overlayId}`;

    // Inform current mode
    if (onModeChanged) {
      onModeChanged(isSupabaseConfigured() ? 'supabase_live' : 'local_demo');
    }

    // 1. Listen via BroadcastChannel (Inter-tab on same browser)
    const localChannel = this.getLocalChannel();
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (isUnsubscribed) return;
      if (event.data?.type === 'OVERLAY_STATE_CHANGED' && event.data?.overlayId === overlayId) {
        onStateReceived(event.data.payload);
      }
    };

    if (localChannel) {
      localChannel.addEventListener('message', handleBroadcastMessage);
    }

    // 2. Listen via storage event (fallback across tabs)
    const handleStorageEvent = (event: StorageEvent) => {
      if (isUnsubscribed) return;
      if (event.key === cacheKey && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          onStateReceived(parsed);
        } catch (e) {}
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageEvent);
    }

    // 3. Listen via Supabase Realtime (if configured)
    let supabaseSubscription: any = null;
    const supabase = getSupabase();

    if (supabase) {
      try {
        const channel = supabase.channel(`overlay_room:${overlayId}`)
          .on('broadcast', { event: 'state_update' }, ({ payload }) => {
            if (isUnsubscribed) return;
            if (payload && payload.id === overlayId) {
              onStateReceived(payload);
            }
          })
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'overlay_states',
              filter: `overlay_id=eq.${overlayId}`
            },
            (payload) => {
              if (isUnsubscribed) return;
              if (payload.new) {
                const newData: any = payload.new;
                const state: OverlayState = {
                  id: overlayId,
                  name: getOverlayName(overlayId),
                  read_token: `token-${overlayId}`,
                  is_visible: newData.is_visible,
                  is_blackout: newData.is_blackout,
                  kind: newData.kind,
                  styling: newData.styling,
                  content: newData.content,
                  updated_at: newData.updated_at,
                  version: newData.version
                };
                onStateReceived(state);
              }
            }
          )
          .subscribe((status) => {
            if (onModeChanged) {
              if (status === 'SUBSCRIBED') {
                onModeChanged('supabase_live');
              } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                onModeChanged('reconnecting');
              }
            }
          });

        supabaseSubscription = channel;
      } catch (err) {
        console.error('[SyncService] Error configurando canal Supabase:', err);
      }
    }

    // Return cleanup unsubscribe function
    return () => {
      isUnsubscribed = true;
      if (localChannel) {
        localChannel.removeEventListener('message', handleBroadcastMessage);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageEvent);
      }
      if (supabase && supabaseSubscription) {
        supabase.removeChannel(supabaseSubscription);
      }
    };
  }
}

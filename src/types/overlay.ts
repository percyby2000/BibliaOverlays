export type OverlayKind = 
  | 'bible' 
  | 'song_lyrics' 
  | 'announcement' 
  | 'lower_third_speaker' 
  | 'custom_text';

export type OverlayPosition = 
  | 'lower-third' 
  | 'bottom-bar' 
  | 'center-box' 
  | 'top-bar' 
  | 'fullscreen';

export type TextAlignment = 'left' | 'center' | 'right';

export type AnimationType = 
  | 'fade' 
  | 'slide-up' 
  | 'slide-down' 
  | 'zoom' 
  | 'none';

export type BackgroundStyle = 
  | 'transparent' 
  | 'frosted-glass' 
  | 'solid-dark' 
  | 'gradient-slate' 
  | 'gradient-gold'
  | 'gradient-violet'
  | 'gradient-emerald'
  | 'gradient-crimson'
  | 'cinematic-blur'
  | 'minimal-dark';

export interface OverlayTypography {
  fontFamily: 'Inter' | 'Playfair Display' | 'Cinzel' | 'Montserrat' | 'Bebas Neue' | 'Outfit' | 'system-ui';
  verseSize: number; // in pixels (at 1080p base, e.g. 36)
  referenceSize: number; // in pixels, e.g. 24
  fontWeight: '400' | '500' | '600' | '700' | '800';
  italic: boolean;
  lineHeight: number; // e.g. 1.35
  letterSpacing: number; // e.g. 0.5
}

export interface OverlayStyling {
  fontFamily: 'Inter' | 'Playfair Display' | 'Cinzel' | 'Montserrat' | 'Bebas Neue' | 'Outfit' | 'system-ui';
  verseSize: number;
  referenceSize: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  italic: boolean;
  lineHeight: number;
  letterSpacing: number;
  
  textColor: string;
  referenceColor: string;
  badgeBgColor: string;
  backgroundColor: string;
  backgroundStyle: BackgroundStyle;
  backgroundOpacity: number; // 0 to 100%
  alignment: TextAlignment;
  position: OverlayPosition;
  
  // Padding & margins (in pixels or %)
  paddingX: number;
  paddingY: number;
  marginBottom: number;
  maxWidth: number;
  offsetX?: number;
  offsetY?: number;
  borderRadius: number;
  
  // Shadow & Outline for extreme readability over any video background
  textShadow: boolean;
  textShadowBlur: number;
  textShadowColor: string;
  textStroke: boolean;
  textStrokeWidth: number;
  textStrokeColor: string;
  boxBorder: boolean;
  boxBorderColor: string;
  boxBorderWidth: number;
  
  // Custom Background Image Banner (e.g. watercolor smoke, church lower third PNG)
  backgroundImageUrl?: string;
  backgroundImageOpacity?: number; // 0 to 100%
  
  // Broadcast Aesthetics Pro
  accentBar?: boolean;
  accentBarColor?: string;
  glowShadow?: boolean;
  glowShadowColor?: string;
  quoteDecoration?: boolean;
  
  // Animation
  animation: AnimationType;
  animationDuration: number;
  
  // Extras
  showTranslationBadge: boolean;
  showBookIcon: boolean;
  uppercaseReference: boolean;
}

export interface BibleContentPayload {
  book: string;
  bookName: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  reference: string;
  text: string;
  translation: string;
  testament?: 'OT' | 'NT';
}

export interface OverlayState {
  id: string;
  name: string;
  read_token: string;
  is_visible: boolean;
  is_blackout: boolean;
  kind: OverlayKind;
  styling: OverlayStyling;
  content: BibleContentPayload | null;
  updated_at: string;
  version: number;
}

export interface OverlayTemplate {
  id: string;
  name: string;
  tagline: string;
  category: 'broadcast' | 'liturgico' | 'modern' | 'minimal' | 'custom';
  description: string;
  isPreset: boolean;
  styling: OverlayStyling;
}

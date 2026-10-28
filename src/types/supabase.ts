import type { OverlayKind, OverlayStyling, BibleContentPayload } from './overlay';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      overlays: {
        Row: {
          id: string;
          name: string;
          read_token: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          read_token?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          read_token?: string;
          created_by?: string | null;
          updated_at?: string;
        };
      };
      overlay_states: {
        Row: {
          overlay_id: string;
          is_visible: boolean;
          is_blackout: boolean;
          kind: OverlayKind;
          styling: OverlayStyling;
          content: BibleContentPayload | null;
          updated_at: string;
          version: number;
        };
        Insert: {
          overlay_id: string;
          is_visible?: boolean;
          is_blackout?: boolean;
          kind?: OverlayKind;
          styling: OverlayStyling;
          content?: BibleContentPayload | null;
          updated_at?: string;
          version?: number;
        };
        Update: {
          overlay_id?: string;
          is_visible?: boolean;
          is_blackout?: boolean;
          kind?: OverlayKind;
          styling?: OverlayStyling;
          content?: BibleContentPayload | null;
          updated_at?: string;
          version?: number;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          is_preset: boolean;
          styling: OverlayStyling;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          is_preset?: boolean;
          styling: OverlayStyling;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          is_preset?: boolean;
          styling?: OverlayStyling;
          user_id?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'operator';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'admin' | 'operator';
          created_at?: string;
        };
        Update: {
          email?: string;
          role?: 'admin' | 'operator';
        };
      };
    };
  };
}

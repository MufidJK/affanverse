/**
 * Supabase Database type definitions.
 *
 * Generated based on the actual schema of the `affanverse-db` Supabase project.
 * These types power autocompletion for `supabase.from("gallery").select(...)` etc.
 */

export interface Database {
  public: {
    Tables: {
      gallery: {
        Row: {
          /** Primary key — auto-generated bigint */
          id: number;
          /** Timestamp of creation — defaults to `now()` */
          created_at: string;
          /** Title of the gallery item */
          title: string | null;
          /** Description / caption for the gallery item */
          description: string | null;
          /** Public URL to the media file (image/video) */
          media_url: string | null;
          /** Content type, e.g. "image" or "video" */
          type: string | null;
          /** Section tags for filtering, e.g. ["stories", "gallery_dump"] */
          sections: string[] | null;
          /** Optional tags for categorization */
          tags: string[] | string | null;
          /** Content body (for stories) */
          content: string | null;
          /** Caption text */
          caption: string | null;
          /** Body text */
          body: string | null;
          /** Image URL alias */
          image_url: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          title?: string | null;
          description?: string | null;
          media_url?: string | null;
          type?: string | null;
          sections?: string[] | null;
          tags?: string[] | string | null;
          content?: string | null;
          caption?: string | null;
          body?: string | null;
          image_url?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          title?: string | null;
          description?: string | null;
          media_url?: string | null;
          type?: string | null;
          sections?: string[] | null;
          tags?: string[] | string | null;
          content?: string | null;
          caption?: string | null;
          body?: string | null;
          image_url?: string | null;
        };
      };
      guestbook: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          message: string;
          page_id: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          message: string;
          page_id: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          message?: string;
          page_id?: string;
        };
      };
      projects: {
        Row: {
          id: number;
          created_at: string;
          title: string | null;
          description: string | null;
          image_url: string | null;
          url: string | null;
          tags: string[] | string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          title?: string | null;
          description?: string | null;
          image_url?: string | null;
          url?: string | null;
          tags?: string[] | string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          title?: string | null;
          description?: string | null;
          image_url?: string | null;
          url?: string | null;
          tags?: string[] | string | null;
        };
      };
      chapters: {
        Row: {
          id: string;
          volume: number;
          chapter_number: number;
          log_code: string;
          title: string;
          content: string;
          system_note: string | null;
        };
        Insert: {
          id?: string;
          volume: number;
          chapter_number: number;
          log_code: string;
          title: string;
          content: string;
          system_note?: string | null;
        };
        Update: {
          id?: string;
          volume?: number;
          chapter_number?: number;
          log_code?: string;
          title?: string;
          content?: string;
          system_note?: string | null;
        };
      };
    };
    minigame_scores: {
      Row: {
        id: string;
        created_at: string;
        player_name: string;
        game_slug: string;
        score: number;
      };
      Insert: {
        id?: string;
        created_at?: string;
        player_name: string;
        game_slug: string;
        score: number;
      };
      Update: {
        id?: string;
        created_at?: string;
        player_name?: string;
        game_slug?: string;
        score?: number;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

/** Convenience type — a single gallery row */
export type Gallery = Database["public"]["Tables"]["gallery"]["Row"];

/** Convenience type — fields for inserting a new gallery row */
export type GalleryInsert = Database["public"]["Tables"]["gallery"]["Insert"];

/** Convenience type — fields for updating an existing gallery row */
export type GalleryUpdate = Database["public"]["Tables"]["gallery"]["Update"];

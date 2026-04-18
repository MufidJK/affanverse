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
          /** Public URL to the media file (image/video) */
          media_url: string | null;
          /** Content type, e.g. "image" or "video" */
          type: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          title?: string | null;
          media_url?: string | null;
          type?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          title?: string | null;
          media_url?: string | null;
          type?: string | null;
        };
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

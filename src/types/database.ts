/**
 * Database types — auto-generated from Supabase schema.
 * Run `npm run db:generate-types` to regenerate after schema changes.
 *
 * This is a starter type definition. Replace with generated types
 * once Supabase project is configured.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<{
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Update: Partial<{
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          updated_at: string;
        }>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: "visitor" | "trial" | "member" | "instructor" | "admin";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "visitor" | "trial" | "member" | "instructor" | "admin";
          created_at?: string;
        };
        Update: Partial<{
          role: "visitor" | "trial" | "member" | "instructor" | "admin";
        }>;
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: "active" | "grace" | "expired" | "cancelled";
          tier: "monthly" | "annual";
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: "active" | "grace" | "expired" | "cancelled";
          tier?: "monthly" | "annual";
          current_period_start?: string | null;
          current_period_end?: string | null;
        };
        Update: Partial<{
          status: "active" | "grace" | "expired" | "cancelled";
          tier: "monthly" | "annual";
          current_period_start: string | null;
          current_period_end: string | null;
        }>;
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          instructor_notes: string | null;
          category_id: string | null;
          published: boolean;
          access_level: "free" | "trial" | "member";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          instructor_notes?: string | null;
          category_id?: string | null;
          published?: boolean;
          access_level?: "free" | "trial" | "member";
        };
        Update: Partial<{
          title: string;
          slug: string;
          description: string | null;
          instructor_notes: string | null;
          category_id: string | null;
          published: boolean;
          access_level: "free" | "trial" | "member";
          updated_at: string;
        }>;
        Relationships: [];
      };
      lesson_media: {
        Row: {
          id: string;
          lesson_id: string;
          type: "video" | "pdf" | "audio" | "image";
          title: string;
          url: string | null;
          cloudflare_stream_id: string | null;
          storage_path: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          type: "video" | "pdf" | "audio" | "image";
          title: string;
          url?: string | null;
          cloudflare_stream_id?: string | null;
          storage_path?: string | null;
          sort_order?: number;
        };
        Update: Partial<{
          type: "video" | "pdf" | "audio" | "image";
          title: string;
          url: string | null;
          cloudflare_stream_id: string | null;
          storage_path: string | null;
          sort_order: number;
        }>;
        Relationships: [];
      };
      transcripts: {
        Row: {
          id: string;
          lesson_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          content: string;
        };
        Update: Partial<{
          content: string;
        }>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
        };
        Update: Partial<{
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
        }>;
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: Partial<{
          name: string;
          slug: string;
        }>;
        Relationships: [];
      };
      lesson_tags: {
        Row: {
          lesson_id: string;
          tag_id: string;
        };
        Insert: {
          lesson_id: string;
          tag_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      lesson_instructors: {
        Row: {
          lesson_id: string;
          instructor_id: string;
        };
        Insert: {
          lesson_id: string;
          instructor_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      seminars: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          date: string;
          instructor_name: string | null;
          has_recording: boolean;
          thumbnail_url: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          date: string;
          instructor_name?: string | null;
          has_recording?: boolean;
          thumbnail_url?: string | null;
          published?: boolean;
        };
        Update: Partial<{
          title: string;
          slug: string;
          description: string | null;
          date: string;
          instructor_name: string | null;
          has_recording: boolean;
          thumbnail_url: string | null;
          published: boolean;
          updated_at: string;
        }>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          date: string;
          location: string | null;
          event_type: "class" | "workshop" | "seminar" | "guest";
          capacity: number | null;
          price_cents: number | null;
          is_cancelled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          date: string;
          location?: string | null;
          event_type?: "class" | "workshop" | "seminar" | "guest";
          capacity?: number | null;
          price_cents?: number | null;
          is_cancelled?: boolean;
        };
        Update: Partial<{
          title: string;
          description: string | null;
          date: string;
          location: string | null;
          event_type: "class" | "workshop" | "seminar" | "guest";
          capacity: number | null;
          price_cents: number | null;
          is_cancelled: boolean;
          updated_at: string;
        }>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string | null;
          seminar_id: string | null;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id?: string | null;
          seminar_id?: string | null;
          content: string;
        };
        Update: Partial<{
          content: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string | null;
          seminar_id: string | null;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id?: string | null;
          seminar_id?: string | null;
          content: string;
        };
        Update: Partial<{
          content: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string | null;
          seminar_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id?: string | null;
          seminar_id?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      instructors: {
        Row: {
          id: string;
          name: string;
          title: string | null;
          bio: string | null;
          avatar_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          title?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          sort_order?: number;
        };
        Update: Partial<{
          name: string;
          title: string | null;
          bio: string | null;
          avatar_url: string | null;
          sort_order: number;
        }>;
        Relationships: [];
      };
      practice_posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          post_type: "recap" | "drill" | "announcement" | "reminder";
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          content: string;
          post_type?: "recap" | "drill" | "announcement" | "reminder";
          published?: boolean;
        };
        Update: Partial<{
          title: string;
          content: string;
          post_type: "recap" | "drill" | "announcement" | "reminder";
          published: boolean;
          updated_at: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "visitor" | "trial" | "member" | "instructor" | "admin";
      membership_status: "active" | "grace" | "expired" | "cancelled";
      membership_tier: "monthly" | "annual";
      media_type: "video" | "pdf" | "audio" | "image";
      event_type: "class" | "workshop" | "seminar" | "guest";
      post_type: "recap" | "drill" | "announcement" | "reminder";
      access_level: "free" | "trial" | "member";
    };
    CompositeTypes: Record<string, never>;
  };
}

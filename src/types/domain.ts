/**
 * Domain types used across the application.
 * These provide runtime type safety independent of Supabase's generated types.
 */

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: "visitor" | "trial" | "member" | "instructor" | "admin";
  created_at: string;
}

export interface Membership {
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
}

export interface Lesson {
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
  lesson_media?: LessonMedia[];
  transcripts?: Transcript[];
  tags?: { tag: Tag }[];
  instructors?: { instructor: Instructor }[];
}

export interface LessonMedia {
  id: string;
  lesson_id: string;
  type: "video" | "pdf" | "audio" | "image";
  title: string;
  url: string | null;
  cloudflare_stream_id: string | null;
  storage_path: string | null;
  sort_order: number;
  created_at: string;
}

export interface Transcript {
  id: string;
  lesson_id: string;
  content: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Instructor {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export interface Seminar {
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
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  event_type: "class" | "workshop" | "seminar" | "guest";
  capacity: number | null;
  price_cents: number | null;
  is_cancelled: boolean;
  registered_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  lesson_id: string | null;
  seminar_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  lesson?: { id: string; title: string; slug: string } | null;
}

export interface PracticePost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  post_type: "recap" | "drill" | "announcement" | "reminder";
  published: boolean;
  created_at: string;
  updated_at: string;
  author?: { full_name: string | null; avatar_url: string | null } | null;
}

export interface Bookmark {
  id: string;
  user_id: string;
  lesson_id: string | null;
  seminar_id: string | null;
  created_at: string;
}

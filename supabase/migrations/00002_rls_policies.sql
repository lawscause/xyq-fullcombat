-- XYQ Full Combat — Row Level Security Policies
-- All tables have RLS enabled. Access is denied by default.

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminars ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_posts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION: Get user's highest role
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_role(uid UUID)
RETURNS user_role AS $$
  SELECT role FROM user_roles
  WHERE user_id = uid
  ORDER BY
    CASE role
      WHEN 'admin' THEN 5
      WHEN 'instructor' THEN 4
      WHEN 'member' THEN 3
      WHEN 'trial' THEN 2
      WHEN 'visitor' THEN 1
    END DESC
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- HELPER: Check if user has active membership
-- ============================================================

CREATE OR REPLACE FUNCTION has_active_membership(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = uid
    AND status IN ('active', 'grace')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins/instructors can view all profiles
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- USER ROLES
-- ============================================================

-- Users can see their own roles
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- MEMBERSHIPS
-- ============================================================

-- Users can view their own membership
CREATE POLICY "Users can view own membership"
  ON memberships FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all memberships
CREATE POLICY "Admins can view all memberships"
  ON memberships FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- CATEGORIES & TAGS (public read)
-- ============================================================

CREATE POLICY "Anyone authenticated can read categories"
  ON categories FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone authenticated can read tags"
  ON tags FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admin/instructor can manage
CREATE POLICY "Staff can manage categories"
  ON categories FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can manage tags"
  ON tags FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- LESSONS
-- ============================================================

-- Published lessons visible based on access level
CREATE POLICY "Members can view published lessons"
  ON lessons FOR SELECT
  USING (
    published = TRUE
    AND (
      access_level = 'free'
      OR (access_level = 'trial' AND auth.uid() IS NOT NULL)
      OR (access_level = 'member' AND has_active_membership(auth.uid()))
    )
  );

-- Staff can view all lessons (including drafts)
CREATE POLICY "Staff can view all lessons"
  ON lessons FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- Staff can manage lessons
CREATE POLICY "Staff can manage lessons"
  ON lessons FOR INSERT
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can update lessons"
  ON lessons FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Admins can delete lessons"
  ON lessons FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- LESSON MEDIA
-- ============================================================

CREATE POLICY "Members can view lesson media"
  ON lesson_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = lesson_media.lesson_id
      AND published = TRUE
      AND (
        access_level = 'free'
        OR (access_level = 'trial' AND auth.uid() IS NOT NULL)
        OR (access_level = 'member' AND has_active_membership(auth.uid()))
      )
    )
  );

CREATE POLICY "Staff can manage lesson media"
  ON lesson_media FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- TRANSCRIPTS
-- ============================================================

CREATE POLICY "Members can view transcripts"
  ON transcripts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = transcripts.lesson_id
      AND published = TRUE
      AND has_active_membership(auth.uid())
    )
  );

CREATE POLICY "Staff can manage transcripts"
  ON transcripts FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- SEMINARS
-- ============================================================

CREATE POLICY "Members can view published seminars"
  ON seminars FOR SELECT
  USING (published = TRUE AND has_active_membership(auth.uid()));

CREATE POLICY "Staff can view all seminars"
  ON seminars FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can manage seminars"
  ON seminars FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- EVENTS
-- ============================================================

-- All authenticated users can view events
CREATE POLICY "Authenticated users can view events"
  ON events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage events"
  ON events FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- EVENT REGISTRATIONS
-- ============================================================

CREATE POLICY "Users can view own registrations"
  ON event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all registrations"
  ON event_registrations FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- COMMENTS
-- ============================================================

-- Members can view comments on accessible content
CREATE POLICY "Members can view comments"
  ON comments FOR SELECT
  USING (has_active_membership(auth.uid()));

-- Members can create comments
CREATE POLICY "Members can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND has_active_membership(auth.uid())
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments; staff can delete any
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (
    auth.uid() = user_id
    OR get_user_role(auth.uid()) IN ('admin', 'instructor')
  );

-- ============================================================
-- NOTES (private — only owner can access)
-- ============================================================

CREATE POLICY "Users can manage own notes"
  ON notes FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- BOOKMARKS (private — only owner can access)
-- ============================================================

CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- PRACTICE POSTS
-- ============================================================

-- All authenticated users can view published practice posts
CREATE POLICY "Authenticated users can view practice posts"
  ON practice_posts FOR SELECT
  USING (published = TRUE AND auth.uid() IS NOT NULL);

-- Staff can manage practice posts
CREATE POLICY "Staff can manage practice posts"
  ON practice_posts FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- INSTRUCTORS (public read)
-- ============================================================

CREATE POLICY "Anyone can view instructors"
  ON instructors FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage instructors"
  ON instructors FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

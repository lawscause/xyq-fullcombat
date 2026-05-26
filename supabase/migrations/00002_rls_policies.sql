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

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- USER ROLES
-- ============================================================

CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can select roles"
  ON user_roles FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- MEMBERSHIPS
-- ============================================================

CREATE POLICY "Users can view own membership"
  ON memberships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all memberships"
  ON memberships FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- CATEGORIES & TAGS (public read, staff write)
-- ============================================================

CREATE POLICY "Anyone authenticated can read categories"
  ON categories FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone authenticated can read tags"
  ON tags FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can insert categories"
  ON categories FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can update categories"
  ON categories FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can delete categories"
  ON categories FOR DELETE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can insert tags"
  ON tags FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can update tags"
  ON tags FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can delete tags"
  ON tags FOR DELETE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- LESSONS
-- ============================================================

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

CREATE POLICY "Staff can view all lessons"
  ON lessons FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can insert lessons"
  ON lessons FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'instructor'));

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

CREATE POLICY "Staff can view all lesson media"
  ON lesson_media FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can insert lesson media"
  ON lesson_media FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can update lesson media"
  ON lesson_media FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can delete lesson media"
  ON lesson_media FOR DELETE
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

CREATE POLICY "Staff can view all transcripts"
  ON transcripts FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can insert transcripts"
  ON transcripts FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can update transcripts"
  ON transcripts FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can delete transcripts"
  ON transcripts FOR DELETE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- LESSON TAGS & INSTRUCTORS (junction tables)
-- ============================================================

CREATE POLICY "Anyone authenticated can read lesson tags"
  ON lesson_tags FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can insert lesson tags"
  ON lesson_tags FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can delete lesson tags"
  ON lesson_tags FOR DELETE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Anyone authenticated can read lesson instructors"
  ON lesson_instructors FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can insert lesson instructors"
  ON lesson_instructors FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can delete lesson instructors"
  ON lesson_instructors FOR DELETE
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

CREATE POLICY "Staff can insert seminars"
  ON seminars FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can update seminars"
  ON seminars FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can delete seminars"
  ON seminars FOR DELETE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- SEMINAR RECORDINGS
-- ============================================================

CREATE POLICY "Members can view seminar recordings"
  ON seminar_recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM seminars
      WHERE seminars.id = seminar_recordings.seminar_id
      AND published = TRUE
      AND has_active_membership(auth.uid())
    )
  );

CREATE POLICY "Staff can view all seminar recordings"
  ON seminar_recordings FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can insert seminar recordings"
  ON seminar_recordings FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can update seminar recordings"
  ON seminar_recordings FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can delete seminar recordings"
  ON seminar_recordings FOR DELETE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- EVENTS
-- ============================================================

CREATE POLICY "Authenticated users can view events"
  ON events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can insert events"
  ON events FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can update events"
  ON events FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can delete events"
  ON events FOR DELETE
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

CREATE POLICY "Members can view comments"
  ON comments FOR SELECT
  USING (has_active_membership(auth.uid()));

CREATE POLICY "Members can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND has_active_membership(auth.uid())
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (
    auth.uid() = user_id
    OR get_user_role(auth.uid()) IN ('admin', 'instructor')
  );

-- ============================================================
-- NOTES (private — only owner can access)
-- ============================================================

CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- BOOKMARKS (private — only owner can access)
-- ============================================================

CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- PRACTICE POSTS
-- ============================================================

CREATE POLICY "Authenticated users can view practice posts"
  ON practice_posts FOR SELECT
  USING (published = TRUE AND auth.uid() IS NOT NULL);

CREATE POLICY "Staff can view all practice posts"
  ON practice_posts FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can insert practice posts"
  ON practice_posts FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can update practice posts"
  ON practice_posts FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Staff can delete practice posts"
  ON practice_posts FOR DELETE
  USING (get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================================
-- INSTRUCTORS (public read)
-- ============================================================

CREATE POLICY "Anyone can view instructors"
  ON instructors FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can insert instructors"
  ON instructors FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update instructors"
  ON instructors FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete instructors"
  ON instructors FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- PAYMENTS (admin only + user can view own)
-- ============================================================

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

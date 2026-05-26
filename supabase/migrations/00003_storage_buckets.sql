-- XYQ Full Combat — Storage Buckets
-- Creates buckets for file uploads with appropriate access policies.

-- ============================================================
-- CREATE STORAGE BUCKETS (skip if already exist)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'lesson-media',
    'lesson-media',
    true,
    524288000,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'video/mp4', 'video/quicktime', 'video/webm']
  ),
  (
    'seminar-media',
    'seminar-media',
    true,
    524288000,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4', 'video/quicktime']
  ),
  (
    'event-images',
    'event-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'documents',
    'documents',
    false,
    52428800,
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

-- Drop existing policies first to avoid conflicts
DO $$
BEGIN
  -- Lesson media
  DROP POLICY IF EXISTS "Public read lesson media" ON storage.objects;
  DROP POLICY IF EXISTS "Staff can upload lesson media" ON storage.objects;
  DROP POLICY IF EXISTS "Staff can delete lesson media" ON storage.objects;
  -- Seminar media
  DROP POLICY IF EXISTS "Public read seminar media" ON storage.objects;
  DROP POLICY IF EXISTS "Staff can upload seminar media" ON storage.objects;
  DROP POLICY IF EXISTS "Staff can delete seminar media" ON storage.objects;
  -- Event images
  DROP POLICY IF EXISTS "Public read event images" ON storage.objects;
  DROP POLICY IF EXISTS "Staff can upload event images" ON storage.objects;
  -- Documents
  DROP POLICY IF EXISTS "Authenticated read documents" ON storage.objects;
  DROP POLICY IF EXISTS "Staff can upload documents" ON storage.objects;
END $$;

-- Lesson media: public read, staff upload
CREATE POLICY "Public read lesson media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-media');

CREATE POLICY "Staff can upload lesson media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lesson-media'
    AND (SELECT get_user_role(auth.uid())) IN ('admin', 'instructor')
  );

CREATE POLICY "Staff can delete lesson media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'lesson-media'
    AND (SELECT get_user_role(auth.uid())) IN ('admin', 'instructor')
  );

-- Seminar media: public read, staff upload
CREATE POLICY "Public read seminar media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'seminar-media');

CREATE POLICY "Staff can upload seminar media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'seminar-media'
    AND (SELECT get_user_role(auth.uid())) IN ('admin', 'instructor')
  );

CREATE POLICY "Staff can delete seminar media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'seminar-media'
    AND (SELECT get_user_role(auth.uid())) IN ('admin', 'instructor')
  );

-- Event images: public read, staff upload
CREATE POLICY "Public read event images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "Staff can upload event images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-images'
    AND (SELECT get_user_role(auth.uid())) IN ('admin', 'instructor')
  );

-- Documents: authenticated read, staff upload
CREATE POLICY "Authenticated read documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Staff can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (SELECT get_user_role(auth.uid())) IN ('admin', 'instructor')
  );

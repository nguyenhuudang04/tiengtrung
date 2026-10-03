-- =========================================
-- 1. Tạo bảng learning_progress
-- =========================================

CREATE TABLE IF NOT EXISTS public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  vocabulary_id UUID NOT NULL
    REFERENCES public.vocabulary(id)
    ON DELETE CASCADE,

  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'learning', 'learned', 'review')),

  wrong_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,

  last_reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(vocabulary_id)
);


-- =========================================
-- 2. Function tự cập nhật updated_at
-- =========================================

CREATE OR REPLACE FUNCTION public.update_learning_progress_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- =========================================
-- 3. Trigger updated_at
-- =========================================

DROP TRIGGER IF EXISTS handle_learning_progress_updated_at
ON public.learning_progress;

CREATE TRIGGER handle_learning_progress_updated_at
BEFORE UPDATE ON public.learning_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_learning_progress_updated_at();


-- =========================================
-- 4. Bật RLS
-- =========================================

ALTER TABLE public.learning_progress
ENABLE ROW LEVEL SECURITY;


-- =========================================
-- 5. Xóa policy cũ nếu có
-- để SQL có thể chạy lại nhiều lần
-- =========================================

DROP POLICY IF EXISTS
"Cho phép SELECT công khai trên learning_progress"
ON public.learning_progress;

DROP POLICY IF EXISTS
"Cho phép INSERT công khai trên learning_progress"
ON public.learning_progress;

DROP POLICY IF EXISTS
"Cho phép UPDATE công khai trên learning_progress"
ON public.learning_progress;

DROP POLICY IF EXISTS
"Cho phép DELETE công khai trên learning_progress"
ON public.learning_progress;


-- =========================================
-- 6. Policy cho MVP chưa có đăng nhập
-- =========================================

CREATE POLICY
"Cho phép SELECT công khai trên learning_progress"
ON public.learning_progress
FOR SELECT
USING (true);


CREATE POLICY
"Cho phép INSERT công khai trên learning_progress"
ON public.learning_progress
FOR INSERT
WITH CHECK (true);


CREATE POLICY
"Cho phép UPDATE công khai trên learning_progress"
ON public.learning_progress
FOR UPDATE
USING (true)
WITH CHECK (true);


CREATE POLICY
"Cho phép DELETE công khai trên learning_progress"
ON public.learning_progress
FOR DELETE
USING (true);


-- =========================================
-- 7. Index
-- =========================================

CREATE INDEX IF NOT EXISTS idx_learning_progress_vocab_id
ON public.learning_progress(vocabulary_id);

CREATE INDEX IF NOT EXISTS idx_learning_progress_status
ON public.learning_progress(status);
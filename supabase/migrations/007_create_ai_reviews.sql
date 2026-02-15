-- =====================================================
-- AIレビューテーブル
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_reviews (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  review_content TEXT,
  overall_score INTEGER CHECK (overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100)),
  model_used VARCHAR(100),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  error_message TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_ai_reviews_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ai_reviews_updated_at
  BEFORE UPDATE ON ai_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_reviews_updated_at();

-- インデックス（submission_id は UNIQUE 制約により暗黙のユニークインデックスが存在するため省略）
CREATE INDEX idx_ai_reviews_status ON ai_reviews(status);

-- =====================================================
-- RLSポリシー
-- =====================================================

ALTER TABLE ai_reviews ENABLE ROW LEVEL SECURITY;

-- 受講生: 自分の提出に紐づくレビューのみ閲覧可能
DROP POLICY IF EXISTS "Users can view own ai reviews" ON ai_reviews;
CREATE POLICY "Users can view own ai reviews"
  ON ai_reviews FOR SELECT
  TO authenticated
  USING (
    submission_id IN (
      SELECT id FROM submissions
      WHERE user_id IN (
        SELECT id FROM users
        WHERE auth_id = auth.uid()
        AND is_deleted = false
      )
    )
  );

-- 管理者: 全レビュー閲覧可能
DROP POLICY IF EXISTS "Admins can view all ai reviews" ON ai_reviews;
CREATE POLICY "Admins can view all ai reviews"
  ON ai_reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- 講師(maintainer): 全レビュー閲覧可能
DROP POLICY IF EXISTS "Maintainers can view all ai reviews" ON ai_reviews;
CREATE POLICY "Maintainers can view all ai reviews"
  ON ai_reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'maintainer'
      AND users.is_deleted = false
    )
  );

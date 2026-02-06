-- =====================================================
-- Row Level Security (RLS) ポリシー
-- =====================================================

-- RLSを有効化
ALTER TABLE learning_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- learning_phases ポリシー
-- =====================================================

-- 公開フェーズは認証ユーザーなら誰でも閲覧可能
DROP POLICY IF EXISTS "Published phases are viewable by authenticated users" ON learning_phases;
CREATE POLICY "Published phases are viewable by authenticated users"
  ON learning_phases FOR SELECT
  TO authenticated
  USING (is_published = true AND is_deleted = false);

-- 管理者はすべてのフェーズを閲覧可能
DROP POLICY IF EXISTS "Admins can view all phases" ON learning_phases;
CREATE POLICY "Admins can view all phases"
  ON learning_phases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- 管理者はフェーズを作成可能
DROP POLICY IF EXISTS "Admins can insert phases" ON learning_phases;
CREATE POLICY "Admins can insert phases"
  ON learning_phases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- 管理者はフェーズを更新可能
DROP POLICY IF EXISTS "Admins can update phases" ON learning_phases;
CREATE POLICY "Admins can update phases"
  ON learning_phases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- 管理者はフェーズを削除可能
DROP POLICY IF EXISTS "Admins can delete phases" ON learning_phases;
CREATE POLICY "Admins can delete phases"
  ON learning_phases FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- =====================================================
-- learning_weeks ポリシー
-- =====================================================

-- 公開週は認証ユーザーなら誰でも閲覧可能
DROP POLICY IF EXISTS "Published weeks are viewable by authenticated users" ON learning_weeks;
CREATE POLICY "Published weeks are viewable by authenticated users"
  ON learning_weeks FOR SELECT
  TO authenticated
  USING (is_published = true AND is_deleted = false);

-- 管理者はすべての週を閲覧可能
DROP POLICY IF EXISTS "Admins can view all weeks" ON learning_weeks;
CREATE POLICY "Admins can view all weeks"
  ON learning_weeks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- 管理者は週を作成可能
DROP POLICY IF EXISTS "Admins can insert weeks" ON learning_weeks;
CREATE POLICY "Admins can insert weeks"
  ON learning_weeks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- 管理者は週を更新可能
DROP POLICY IF EXISTS "Admins can update weeks" ON learning_weeks;
CREATE POLICY "Admins can update weeks"
  ON learning_weeks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- 管理者は週を削除可能
DROP POLICY IF EXISTS "Admins can delete weeks" ON learning_weeks;
CREATE POLICY "Admins can delete weeks"
  ON learning_weeks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- =====================================================
-- learning_contents ポリシー
-- =====================================================

-- 公開コンテンツは認証ユーザーなら誰でも閲覧可能
DROP POLICY IF EXISTS "Published contents are viewable by authenticated users" ON learning_contents;
CREATE POLICY "Published contents are viewable by authenticated users"
  ON learning_contents FOR SELECT
  TO authenticated
  USING (is_published = true AND is_deleted = false);

-- 管理者はすべてのコンテンツを閲覧可能
DROP POLICY IF EXISTS "Admins can view all contents" ON learning_contents;
CREATE POLICY "Admins can view all contents"
  ON learning_contents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- 管理者はコンテンツを作成可能
DROP POLICY IF EXISTS "Admins can insert contents" ON learning_contents;
CREATE POLICY "Admins can insert contents"
  ON learning_contents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- 管理者はコンテンツを更新可能
DROP POLICY IF EXISTS "Admins can update contents" ON learning_contents;
CREATE POLICY "Admins can update contents"
  ON learning_contents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- 管理者はコンテンツを削除可能
DROP POLICY IF EXISTS "Admins can delete contents" ON learning_contents;
CREATE POLICY "Admins can delete contents"
  ON learning_contents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- =====================================================
-- user_progress ポリシー
-- =====================================================

-- ユーザーは自分の進捗のみ閲覧可能
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE auth_id = auth.uid()
      AND is_deleted = false
    )
  );

-- 管理者はすべての進捗を閲覧可能
DROP POLICY IF EXISTS "Admins can view all progress" ON user_progress;
CREATE POLICY "Admins can view all progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- ユーザーは自分の進捗を作成可能
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users
      WHERE auth_id = auth.uid()
      AND is_deleted = false
    )
  );

-- ユーザーは自分の進捗を更新可能
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE auth_id = auth.uid()
      AND is_deleted = false
    )
  );

-- =====================================================
-- submissions ポリシー
-- =====================================================

-- ユーザーは自分の提出のみ閲覧可能
DROP POLICY IF EXISTS "Users can view own submissions" ON submissions;
CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE auth_id = auth.uid()
      AND is_deleted = false
    )
  );

-- 管理者はすべての提出を閲覧可能
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
CREATE POLICY "Admins can view all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_deleted = false
    )
  );

-- ユーザーは自分の提出を作成可能
DROP POLICY IF EXISTS "Users can insert own submissions" ON submissions;
CREATE POLICY "Users can insert own submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users
      WHERE auth_id = auth.uid()
      AND is_deleted = false
    )
  );

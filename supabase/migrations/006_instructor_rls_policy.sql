-- メンテナー（講師）が全提出物を閲覧可能にするポリシー
DROP POLICY IF EXISTS "Maintainers can view all submissions" ON submissions;
CREATE POLICY "Maintainers can view all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'maintainer'
      AND users.is_deleted = false
    )
  );

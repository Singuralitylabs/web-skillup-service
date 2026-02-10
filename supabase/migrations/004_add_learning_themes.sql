-- =====================================================
-- 学習テーマ（カテゴリ）テーブルの追加
-- =====================================================

-- テーマテーブル（GAS学習、Webアプリ開発 など）
CREATE TABLE IF NOT EXISTS learning_themes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_atトリガーを設定
DROP TRIGGER IF EXISTS update_learning_themes_updated_at ON learning_themes;
CREATE TRIGGER update_learning_themes_updated_at
  BEFORE UPDATE ON learning_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- デフォルトテーマを挿入（既存フェーズの移行先）
INSERT INTO learning_themes (name, description, display_order, is_published)
VALUES ('GAS学習', 'Google Apps Scriptを使った自動化と開発の基礎を学びます', 1, true);

-- learning_phasesにtheme_id FK追加
ALTER TABLE learning_phases
  ADD COLUMN theme_id INTEGER REFERENCES learning_themes(id) ON DELETE CASCADE;

-- 既存フェーズをデフォルトテーマに割り当て
UPDATE learning_phases
SET theme_id = (SELECT id FROM learning_themes LIMIT 1)
WHERE theme_id IS NULL;

-- theme_idをNOT NULLに変更
ALTER TABLE learning_phases
  ALTER COLUMN theme_id SET NOT NULL;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_learning_phases_theme_id ON learning_phases(theme_id);

# Web技術学習支援サービス 要件定義書

## 1. プロジェクト概要

### 1.1 目的
「AIと学ぶ実践Web技術講座」の学習フェーズを支援するWebアプリケーション。学習コンテンツの配信、進捗管理、課題提出の機能を提供する。

### 1.2 関連事業
生成AI活用Web技術学習支援事業（2026年4月開講予定）

### 1.3 システム構成
本サービスは2つのWebアプリケーションで構成される。

| サービス | 役割 | URL（開発環境） |
|:--|:--|:--|
| シンラボポータルサイト | ログイン、ユーザー登録、承認管理 | `http://localhost:3001` |
| 学習支援サービス（本アプリ） | 学習コンテンツ配信、進捗管理、課題提出 | `http://localhost:3000` |

### 1.4 技術スタック
| 項目 | 技術 |
|:--|:--|
| フロントエンド | Next.js 16.1.6 (App Router, Turbopack) |
| UI フレームワーク | React 19.2.3 |
| スタイリング | Tailwind CSS 4 + @tailwindcss/typography |
| 言語 | TypeScript 5 |
| ランタイム / パッケージマネージャー | Bun |
| コード品質 | Biome 2.3.14 (リンター + フォーマッター) |
| バックエンド / DB / 認証 | Supabase (PostgreSQL + Auth + RLS) |
| アイコン | Lucide React |
| Markdown表示 | react-markdown + remark-gfm |
| 動画埋め込み | react-youtube |
| XSS対策 | isomorphic-dompurify |
| ホスティング | Vercel |
| 運用コスト | 無料枠で運用（初期） |

---

## 2. ユーザー種別と権限

### 2.1 ユーザー種別

| 種別 | DB上のロール | 説明 |
|:--|:--|:--|
| 受講生 | `member` | コンテンツ閲覧、進捗管理、課題提出を行う |
| 講師 / 運営 | `maintainer` | コンテンツ管理（CRUD）を行う |
| システム管理者 | `admin` | 全権限を持つ |

### 2.2 ユーザーステータス

| ステータス | 説明 |
|:--|:--|
| `pending` | 承認待ち（ポータルサイトの承認待ちページへリダイレクト） |
| `active` | 承認済み（学習サービスにアクセス可能） |
| `rejected` | 却下済み（ポータルサイトの却下ページへリダイレクト） |

### 2.3 権限一覧

| 機能 | 受講生 (member) | 講師 / 運営 (maintainer) | システム管理者 (admin) |
|:--|:--:|:--:|:--:|
| コンテンツ閲覧 | ○ | ○ | ○ |
| 自分の進捗確認 | ○ | ○ | ○ |
| 課題提出 | ○ | ○ | ○ |
| 提出履歴の確認 | ○ | ○ | ○ |
| コンテンツ管理（CRUD） | - | ○ | ○ |
| 受講生一覧・進捗一覧 | - | - | ○ |
| 提出課題の一覧確認 | - | - | ○ |
| 管理ダッシュボード | - | - | ○ |

---

## 3. データモデル

### 3.1 テーブル構成

#### users（ポータルサイト側で管理）
| カラム | 型 | 説明 |
|:--|:--|:--|
| id | integer (PK) | ユーザーID |
| auth_id | uuid | Supabase Auth UUID |
| email | text | メールアドレス |
| display_name | text | 表示名 |
| avatar_url | text | アバター画像URL |
| role | text | `admin` / `maintainer` / `member` |
| status | text | `pending` / `active` / `rejected` |
| bio | text | 自己紹介 |
| is_deleted | boolean | 論理削除フラグ |
| created_at / updated_at | timestamp | タイムスタンプ |

#### learning_phases
| カラム | 型 | 説明 |
|:--|:--|:--|
| id | integer (PK) | フェーズID |
| name | text | フェーズ名（例：Phase 1 - GAS基礎） |
| description | text | 説明 |
| display_order | integer | 表示順 |
| is_published | boolean | 公開フラグ |
| is_deleted | boolean | 論理削除フラグ |
| created_at / updated_at | timestamp | タイムスタンプ |

#### learning_weeks
| カラム | 型 | 説明 |
|:--|:--|:--|
| id | integer (PK) | 週ID |
| phase_id | integer (FK) | 所属フェーズ |
| name | text | 週名（例：Week 1 - はじめの一歩） |
| description | text | 説明 |
| display_order | integer | 表示順 |
| is_published | boolean | 公開フラグ |
| is_deleted | boolean | 論理削除フラグ |
| created_at / updated_at | timestamp | タイムスタンプ |

#### learning_contents
| カラム | 型 | 説明 |
|:--|:--|:--|
| id | integer (PK) | コンテンツID |
| week_id | integer (FK) | 所属週 |
| title | text | タイトル |
| content_type | text | `video` / `text` / `exercise` |
| video_url | text | YouTube URL（動画の場合） |
| text_content | text | Markdownテキスト（テキストの場合） |
| exercise_instructions | text | 演習指示（演習の場合） |
| display_order | integer | 表示順 |
| is_published | boolean | 公開フラグ |
| is_deleted | boolean | 論理削除フラグ |
| created_at / updated_at | timestamp | タイムスタンプ |

#### user_progress
| カラム | 型 | 説明 |
|:--|:--|:--|
| id | integer (PK) | 進捗ID |
| user_id | integer (FK) | ユーザーID |
| content_id | integer (FK) | コンテンツID |
| is_completed | boolean | 完了フラグ |
| completed_at | timestamp | 完了日時 |
| created_at | timestamp | タイムスタンプ |

※ `(user_id, content_id)` にユニーク制約あり

#### submissions
| カラム | 型 | 説明 |
|:--|:--|:--|
| id | integer (PK) | 提出ID |
| user_id | integer (FK) | ユーザーID |
| content_id | integer (FK) | コンテンツID |
| submission_type | text | `code` / `url` |
| code_content | text | コード内容（codeの場合） |
| url | text | URL（urlの場合） |
| submitted_at | timestamp | 提出日時 |
| created_at | timestamp | タイムスタンプ |

### 3.2 Row Level Security (RLS)

| テーブル | ポリシー |
|:--|:--|
| learning_phases / weeks / contents | 受講生：公開済みコンテンツのみ閲覧可。管理者：全件CRUD可 |
| user_progress | 受講生：自分の進捗のみ読み書き可。管理者：全件読み取り可 |
| submissions | 受講生：自分の提出のみ読み書き可。管理者：全件読み取り可 |

---

## 4. 機能要件

### 4.1 認証・ユーザー管理

#### 4.1.1 認証フロー
- Googleアカウントによるログイン（Supabase Auth）
- 認証機能はポータルサイト側で提供
- 本アプリは認証済みかつ `active` ステータスのユーザーのみアクセス可能

#### 4.1.2 ミドルウェアによるアクセス制御
1. 全ページリクエストでSupabase Authのセッションを確認
2. 未認証 → ポータルサイトのログインページへリダイレクト（戻りURLを保持）
3. `pending` → ポータルサイトの承認待ちページへリダイレクト
4. `rejected` → ポータルサイトの却下ページへリダイレクト
5. `active` → 通常アクセス許可

#### 4.1.3 クライアント側認証
- Supabase Auth Provider による認証状態のコンテキスト管理
- `onAuthStateChange` によるリアルタイム認証状態監視
- ログアウト機能（サイドナビゲーション内）

### 4.2 学習コンテンツ配信

#### 4.2.1 コンテンツ構成（3階層）
```
Phase（例：Phase 1 - GAS基礎）
  └── Week（例：Week 1 - はじめの一歩）
        ├── 動画教材（複数）
        ├── テキスト教材（複数）
        └── 演習課題（複数）
```

#### 4.2.2 動画教材
- YouTubeの限定公開動画を `react-youtube` で埋め込み表示
- URLからVideo IDを自動抽出
- 運営側でYouTube URLを登録

#### 4.2.3 テキスト教材
- Markdown形式で記述・保存
- `react-markdown` + `remark-gfm` でレンダリング（GitHub Flavored Markdown対応）
- `isomorphic-dompurify` によるXSSサニタイズ処理

#### 4.2.4 演習課題
- Markdown形式の演習指示を表示
- 課題提出フォームと連携

#### 4.2.5 コンテンツ表示制御
- `is_published` フラグで公開 / 非公開を制御
- `is_deleted` フラグで論理削除（データ保全）
- `display_order` で表示順を制御

### 4.3 進捗管理

#### 4.3.1 進捗の記録方法
- 各コンテンツ（動画・テキスト・演習）に「完了」ボタン
- 受講生が手動でクリックして完了 / 未完了をトグル
- API（`POST /api/progress`）で `user_progress` テーブルを upsert

#### 4.3.2 受講生側の進捗表示
- **ダッシュボード（ホーム）**: 全体の進捗率（%表示）+ Phase単位の進捗バー
- **Phase一覧**: 各Phaseの完了状況
- **Week一覧**: 各Weekの完了状況
- **コンテンツ詳細**: 個別コンテンツの完了チェック

#### 4.3.3 管理者側の進捗確認
- 受講生一覧 + 各受講生の進捗率
- 最終アクティビティ日時の表示

### 4.4 課題提出

#### 4.4.1 提出方法
受講生は以下のいずれかの形式で提出：
- **コード**: GASコードをテキストエリアに貼り付け
- **URL**: スプレッドシート / GASプロジェクトのURL共有

#### 4.4.2 提出フロー（実装済み）
1. 受講生が演習課題ページで提出フォームに入力
2. 提出タイプ（code / url）を選択
3. API（`POST /api/submissions`）で `submissions` テーブルに保存
4. 提出完了メッセージを表示

#### 4.4.3 提出履歴
- 受講生は自分の提出履歴を一覧で確認可能（`/submissions`）
- 提出日時、提出タイプ、内容を表示
- 日本語ロケールでの日時フォーマット

#### 4.4.4 補足
- 点数・合否判定は行わない
- 提出期限は目安のみ（強制なし）

### 4.5 管理機能

#### 4.5.1 管理ダッシュボード
以下の統計情報を表示：
- フェーズ数
- 週数
- コンテンツ数
- 受講生数
- 提出数
- 最近の提出一覧（直近5件、受講生名・日時付き）

#### 4.5.2 コンテンツ管理
- Phase / Week / コンテンツのCRUD操作
- admin / maintainer ロールのみアクセス可能

#### 4.5.3 受講生管理
- 全アクティブ受講生の一覧表示
- 個別受講生の進捗状況確認
- 最終アクティビティの追跡

#### 4.5.4 提出管理
- 全受講生の提出一覧表示
- 受講生名・コンテンツ情報付き

---

## 5. API一覧

| エンドポイント | メソッド | 説明 |
|:--|:--|:--|
| `/api/progress` | POST | コンテンツ完了状態のトグル（upsert） |
| `/api/submissions` | POST | 課題提出（code または url） |

---

## 6. 画面一覧

### 6.1 受講生向け画面

| パス | 画面名 | 概要 |
|:--|:--|:--|
| `/` | ダッシュボード | 全体進捗率、Phase別進捗バー、学習への導線 |
| `/learn` | コンテンツ一覧 | Phase一覧 → Week一覧 → コンテンツ一覧の階層表示 |
| `/learn/[phaseId]` | Week一覧 | 選択したPhase内のWeek一覧、進捗表示 |
| `/learn/[phaseId]/[weekId]` | コンテンツ一覧 | 選択したWeek内のコンテンツ一覧、進捗表示 |
| `/learn/[phaseId]/[weekId]/[contentId]` | コンテンツ詳細 | 動画 / テキスト / 演習の表示、完了ボタン、課題提出フォーム |
| `/submissions` | 提出履歴 | 自分の提出済み課題一覧 |

### 6.2 管理者向け画面

| パス | 画面名 | 概要 |
|:--|:--|:--|
| `/admin` | 管理ダッシュボード | 統計サマリー（受講生数、コンテンツ数、提出数等） |
| `/admin/students` | 受講生一覧 | 全受講生の進捗率、最終アクティビティ |
| `/admin/submissions` | 提出管理 | 全提出一覧、受講生名・コンテンツ情報付き |
| `/admin/phases` | フェーズ管理 | PhaseのCRUD |
| `/admin/weeks` | 週管理 | WeekのCRUD（Phase紐付き） |
| `/admin/contents` | コンテンツ管理 | コンテンツのCRUD（Week紐付き） |

### 6.3 共通UIコンポーネント

| コンポーネント | 説明 |
|:--|:--|
| SideNav | レスポンシブサイドナビゲーション（モバイルはドロワー形式） |
| PageTitle | パンくずリスト付きページヘッダー |
| MarkdownRenderer | XSSサニタイズ済みMarkdown表示（GFM対応） |
| YouTubeEmbed | YouTube動画埋め込みプレーヤー |
| CompleteButton | 完了トグルボタン（ローディング状態付き） |
| SubmissionForm | 課題提出フォーム（コード / URL切り替え） |

---

## 7. 非機能要件

### 7.1 対応デバイス
- **PC**: メイン利用を想定、フル機能
- **スマートフォン / タブレット**: レスポンシブ対応（モバイルドロワーナビゲーション）

### 7.2 パフォーマンス
- 初期受講生規模：10〜20名
- Supabase / Vercel無料枠で対応可能な範囲
- Server Componentsによるサーバーサイドレンダリング
- `Promise.all()` による並列データ取得で高速化

### 7.3 セキュリティ
- Supabase Authによる認証
- ミドルウェアによるページ単位のアクセス制御
- 承認済み（active）ユーザーのみコンテンツアクセス可
- Row Level Security（RLS）によるデータベースレベルのアクセス制御
- isomorphic-dompurifyによるXSSサニタイズ
- サーバーサイドでのユーザーID検証（API操作時）

### 7.4 ダークモード対応
- `prefers-color-scheme` によるOS設定連動のライト / ダークモード切り替え
- CSS変数によるテーマカラー管理

---

## 8. 外部連携

| 連携先 | 用途 | 状態 |
|:--|:--|:--|
| YouTube | 動画教材の埋め込み | 実装済み |
| シンラボポータルサイト | 認証・ユーザー管理・承認フロー | 実装済み |

---

## 9. 未実装機能（将来検討）

| 機能 | 備考 | 優先度 |
|:--|:--|:--|
| Slack通知（運営向け） | 課題提出時・新規登録時のWebhook通知 | 高 |
| フィードバック機能 | 講師から受講生への課題フィードバック | 高 |
| メール通知（受講生向け） | 承認完了時・フィードバック返信時 | 中 |
| お知らせ機能 | 運営から全受講生への連絡機能 | 中 |
| 決済機能 | 外部サービス（Stripe等）で対応 | 低 |
| プラン別機能制限 | 初期は全プラン同一機能 | 低 |
| 遅れアラート | 進捗が遅れている受講生の自動検知 | 低 |
| 学習時間記録 | アプリ利用時間の計測 | 低 |
| コミュニティ機能 | Slack / Discordで代替 | 低 |
| GitHub連携 | 課題提出はコード貼り付け / URL共有で対応 | 低 |

---

## 10. 今後の検討事項

- 課題フィードバック機能の設計・実装
- Slack Webhook通知の導入
- お知らせ機能の設計・実装
- 決済機能の組み込み時期・方法
- Phase 2（HTML/CSS/JS）、Phase 3（React）への拡張
- 受講生規模拡大時のプラン変更（Supabase / Vercel有料プラン）
- βテストの実施方法・フィードバック収集

---

## 改訂履歴

| 日付 | 内容 |
|:--|:--|
| 2024年12月 | 初版作成 |
| 2026年2月 | 実装内容に基づき全面更新。データモデル・API・画面一覧・セキュリティ等を追記。未実装機能を整理 |

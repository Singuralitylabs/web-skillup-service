# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

「AIと学ぶ実践Web技術講座」の学習コンテンツ配信サービス。Next.js 16 App Routerで構築。2つのサービスで構成されるエコシステムの一部で、本サービスはコース教材と受講生の進捗管理を担当し、別サービスの**Sinlabポータル**（デフォルト: `localhost:3001`）がユーザー登録・ログイン・アカウント管理を担当する。認証はSupabaseを共有しており、ユーザーはポータルで認証後にリダイレクトされる。

## コマンド

```bash
bun dev              # Turbopack使用の開発サーバー起動
bun run build        # 本番ビルド
bun run lint         # Biome リントチェック
bun run format       # Biome フォーマット
bun run check        # リント + フォーマット一括実行
bun run db:types     # Supabase型定義の再生成
```

テストフレームワークは未導入。

## コードスタイル (Biome)

- ダブルクォート、セミコロン必須、ES5トレイリングカンマ
- インデント2スペース、行幅100文字
- `useConst`、`useImportType`/`useExportType` はerrorレベルで強制
- `noUnusedVariables`/`noUnusedImports` はwarnレベル
- 型のみのインポートには `import type` を使用すること

## アーキテクチャ

### ルート構成 (App Router)

```
app/
├── (authenticated)/     # 全ページでアクティブなユーザーセッションが必要
│   ├── admin/           # 管理者専用：フェーズ・週・コンテンツ・受講生・提出物のCRUD
│   ├── learn/           # 学習画面: [phaseId]/[weekId]/[contentId]
│   ├── submissions/     # 受講生の提出履歴
│   └── page.tsx         # 進捗概要付きダッシュボード
├── api/
│   ├── progress/        # POST: コンテンツごとの進捗をupsert
│   └── submissions/     # POST: コードまたはURLの提出物を作成
```

### 認証・認可フロー

1. **Middleware** (`middleware.ts`) が静的ファイル以外の全リクエストをインターセプト
2. Supabaseサーバークライアントを生成し、`getUser()` を呼び出し
3. 未認証 → ポータルの `/login` にリダイレクト
4. 認証済みだがステータスが `pending`/`rejected` → ポータルの `/pending` または `/rejected` にリダイレクト
5. `active` ユーザーのみアプリにアクセス可能

**ロール**: `admin`（全権限）、`maintainer`（コンテンツ管理）、`member`（受講生）
**権限チェック**: `app/services/auth/permissions.ts` の `checkAdminPermissions()` と `checkContentPermissions()`

### データモデル (Supabase/PostgreSQL)

論理削除と表示順を備えた3層コンテンツ階層:
- **learning_phases** → **learning_weeks** → **learning_contents**（種別: `video`, `text`, `exercise`）
- **user_progress**: コンテンツごとの完了状態を記録（user+contentでユニーク）
- **submissions**: 演習コンテンツに紐づくコードまたはURLの提出物

セキュリティはデータベースレベルの**Row Level Security (RLS)** ポリシーで実現。公開コンテンツは認証済み全ユーザーが閲覧可能、進捗・提出物は本人のみ、管理者は全データの読み書きが可能。

### サービス層 (`app/services/`)

- `api/supabase-server.ts` — サーバーサイドSupabaseクライアント生成と `getServerCurrentUser()`
- `api/supabase-client.ts` — ブラウザサイドSupabaseクライアント
- `api/learning-server.ts` — フェーズ・週・コンテンツ・進捗の読み取りクエリ
- `api/admin-server.ts` — 管理者用CRUD操作
- `api/submissions-server.ts` — 提出物クエリ
- `api/users-server.ts` / `users-client.ts` — ユーザーデータクエリ
- `auth/server-auth.ts` — サーバーサイド認証ヘルパー
- `auth/permissions.ts` — ロールベースの権限チェック

### 主要パターン

- **Server Componentsがデフォルト**: ページとレイアウトは非同期Server ComponentとしてSupabaseを直接呼び出す
- **Client Components**: 必要な場合のみ `"use client"` を付与（認証プロバイダー、インタラクティブなフォーム、ボタン等）
- **認証プロバイダー**: `SupabaseAuthProvider` がルートレイアウトでアプリをラップし、`useSupabaseAuth()` フックを公開
- **コンテンツ描画**: `react-markdown` + `remark-gfm` でMarkdown表示、DOMPurifyでサニタイズ。動画は `react-youtube` で埋め込み
- **パスエイリアス**: `@/*` がプロジェクトルートにマッピング（例: `@/app/types`）

### 環境変数

`.env.local` に設定が必要（`.env.local.example` 参照）:
- `NEXT_PUBLIC_SUPABASE_URL` — SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase Publishableキー
- `SUPABASE_PROJECT_ID` — Supabase CLI操作用
- `NEXT_PUBLIC_PORTAL_URL` — ポータルサービスURL（デフォルト: `http://localhost:3001`）

### データベースマイグレーション

SQLマイグレーションは `supabase/migrations/` に連番で管理:
- `001_create_learning_tables.sql` — スキーマ作成
- `002_rls_policies.sql` — RLSポリシー
- `003_sample_data.sql` — サンプル/シードデータ

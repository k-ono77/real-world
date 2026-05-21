# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### 開発サーバー起動（フロント・バック同時）
```bash
npm run dev
```

### 個別起動
```bash
npm run dev -w backend    # バックエンド (tsx watch, port 5000)
npm run dev -w frontend   # フロントエンド (Vite, port 3000)
```

### Docker で全環境起動
```bash
docker compose up
# backend: localhost:5001, frontend: localhost:3000, db: localhost:5432
```

### DB 操作
```bash
npm run db:push -w backend    # スキーマをDBに反映
npm run db:studio -w backend  # Drizzle Studio (GUI)
```

### テスト
```bash
npm test                  # vitest (全テスト)
```

### ビルド
```bash
npm run start             # frontend build + backend start
```

## アーキテクチャ

### 全体構成
- **Frontend**: React 19 + React Router v7 + Vite（`frontend/src/`）
- **Backend**: Hono v4 + Drizzle ORM + PostgreSQL（`backend/src/`）
- npm workspaces で monorepo 管理

### バックエンド構造

```
backend/src/
├── index.ts              # Hono アプリ定義・ルート登録（port 5000）
├── routes/               # ルーター（Hono Router）
├── controllers/          # ビジネスロジック
├── db/
│   ├── index.ts          # Drizzle クライアント（DATABASE_URL 環境変数）
│   └── schema.ts         # テーブル定義・リレーション定義
├── helpers/
│   ├── authHelper.js     # JWT 生成（generateAuthResponce）
│   ├── commonHelper.js   # JWT 検証（createPayload）、debagLog
│   └── dbHelper.js       # DB エラーハンドリング
└── constants/
    └── AuthConstants.ts  # JWT_SECRET, TOKEN_EXPIRATION_MINUTES, ALG='HS256'
```

### APIルート一覧
| パス | コントローラ | 用途 |
|------|------------|------|
| `POST /api/users` | authController | サインアップ |
| `POST /api/users/login` | authController | ログイン |
| `GET/PUT /api/user` | userController | 自分のプロフィール取得・更新 |
| `GET/POST /api/articles` | articleController | 記事一覧・作成 |
| `GET /api/articles/feed` | articleController | フォロー中ユーザーの記事 |
| `GET /api/articles/:slug` | articleController | 記事詳細 |
| `POST /api/articles/:slug/favorite` | articleController | お気に入り追加 |
| `GET /api/profiles/:username` | profilesController | プロフィール |
| `GET /api/popular-authors` | popularAuthorsController | 人気著者一覧 |

### 認証フロー
- JWT は `hono/jwt` で署名・検証（HS256）
- `createPayload(headers)` でリクエストヘッダーの `authorization` トークンを検証し、`{ id, exp }` を返す
- 認証が必要なエンドポイントはコントローラ内で直接 `createPayload` を呼び出す（ミドルウェアではない）

### DBスキーマ（`backend/src/db/schema.ts`）
- `users` — id, email, username, password, bio, image
- `articles` — id, slug(unique), title, description, body, authorId, createdAt, updatedAt
- `tags` — name (PK)
- `article_tags` — articleId + tagName (複合PK、中間テーブル)
- `favorites` — userId + articleId (複合PK)
- `follows` — followerId + followingId (複合PK)

Drizzle のリレーション定義（`with:` クエリ用）は schema.ts 下部に記載。

### 環境変数
```
DATABASE_URL=postgres://user:password@db:5432/conduit_db
JWT_SECRET=...
TOKEN_EXPIRATION_MINUTES=...
```

FROM node:20-slim

WORKDIR /app

# 依存関係の定義ファイルをコピー
COPY package.json ./
COPY backend/package.json ./backend/

# 依存関係をインストール
RUN npm install -w backend

# バックエンドのソースをコピー
COPY backend ./backend

WORKDIR /app/backend
EXPOSE 5000

CMD ["npm", "run", "dev"]
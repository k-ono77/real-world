FROM node:20-slim

WORKDIR /app

# Monorepo全体のpackage.jsonとfrontendのものをコピー
COPY package.json ./
COPY frontend/package.json ./frontend/

# frontendの依存関係のみインストール
RUN npm install -w frontend

# ソースコードのコピー
COPY frontend ./frontend

WORKDIR /app/frontend
EXPOSE 5173

# Viteをホストモードで起動（これがないとブラウザから見れません）
CMD ["npm", "run", "dev", "--", "--host"]
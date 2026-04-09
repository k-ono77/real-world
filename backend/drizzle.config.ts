import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // 最新版はこの書き方です
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://user:password@db:5432/realworld',
  },
});
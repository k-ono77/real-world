// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'; // 使用しているDBに合わせて変更
import postgres from 'postgres';
import * as schema from './schema';

// 環境変数はご自身の docker-compose.yml 等に合わせて調整してください
const connectionString = process.env.DATABASE_URL || 'postgres://user:password@db:5432/dbname';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
import { pgTable, serial, text, varchar, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';

// ユーザー
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  bio: text('bio'),
  image: text('image'),
});

// 記事
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  body: text('body').notNull(),
  authorId: integer('author_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// タグ
export const tags = pgTable('tags', {
  name: text('name').primaryKey(),
});

// 記事とタグの中間テーブル
export const articleTags = pgTable('article_tags', {
  articleId: integer('article_id').references(() => articles.id).notNull(),
  tagName: text('tag_name').references(() => tags.name).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.articleId, t.tagName] }),
}));

// お気に入り
export const favorites = pgTable('favorites', {
  userId: integer('user_id').references(() => users.id).notNull(),
  articleId: integer('article_id').references(() => articles.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.articleId] }),
}));
import { pgTable, serial, text, varchar, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
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

// フォロー
export const follows = pgTable('follows', {
  followerId: integer('follower_id').references(() => users.id).notNull(),
  followingId: integer('following_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
},(t)=>({
  pk:primaryKey({columns:[t.followerId,t.followingId]}),
}));

// articlesテーブルのリレーション
export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  articleTags: many(articleTags),
}));

export const articlesTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagName],
    references: [tags.name],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  following : many(follows,{ relationName:'following'}),
  followers : many(follows,{ relationName:'followers'}),
})); 

export const followingRelations = relations(follows, ({ one }) => ({
  following : one(users,{
    fields : [follows.followerId],
    references :[users.id],
    relationName : 'following' 
  }),
}));


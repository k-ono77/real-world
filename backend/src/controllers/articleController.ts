import { db } from '../db/index.ts'
import { users, articleTags, tags, articles, follows, favorites, comments } from '../db/schema.ts'
import { desc, eq, inArray, count, and } from 'drizzle-orm'
import type { Context } from 'hono'
import slugify from 'slugify'
import { nanoid } from 'nanoid'
import { createPayload, debagLog } from '../helpers/commonHelper.js'
import { dbErrorHandler } from '../helpers/dbHelper.js'
import { factory } from '../helpers/factory.ts'
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type NewFavorite = InferInsertModel<typeof favorites>
export type Article = InferSelectModel<typeof articles>
export type NewArticle = InferInsertModel<typeof articles>
export type Tag = InferInsertModel<typeof tags>
export type User = InferSelectModel<typeof users>
interface Payload {
  id: number
  exp: number
}
export const createArticle = async (c: Context) => {
  type RequestBody = {
    article: Article
  }
  const articleData = await c.req.json<RequestBody>()
  const headers: string | undefined = c.req.header('authorization')
  const decodedPayload: Payload = await createPayload(headers)
  const userId = Number(decodedPayload.id)
  const { title, description, body, tagList } = articleData.article
  const generateSlug = (title: string) => {
    const base = slugify(title, {
      lower: true,
      strict: true,
      locale: 'ja',
    })
    return `${base}-${nanoid(6)}`
  }
  const slug = generateSlug(title)
  try {
    const [insertedArticle]: NewArticle[] = await db.insert(articles).values({
      title,
      description,
      body,
      slug,
      authorId: userId
    }).returning()
    const insertTags = tagList.map((tag: string) => {
      return {
        name: tag
      }
    })
    await db.insert(tags).values(insertTags).onConflictDoNothing().returning()
    const insertArticleTags = tagList.map((tag: string) => {
      return {
        articleId: insertedArticle.id,
        tagName: tag
      }
    })
    await db.insert(articleTags).values(insertArticleTags).onConflictDoNothing().returning()
    const [userInfo]: User[] = await db.select().from(users).where(eq(users.id, userId))
    const particalRes = await createArticleResponsePartical(insertedArticle, userId, insertedArticle.authorId)
    const res = {
      article: {
        slug: insertedArticle.slug,
        title: insertedArticle.title,
        description: insertedArticle.description,
        body: insertedArticle.body,
        tagList: tagList,
        createdAt: insertedArticle.createdAt,
        updatedAt: insertedArticle.updatedAt,
        favorited: particalRes.favorited,
        favoritesCount: particalRes.favoCount,
        author: {
          username: userInfo.username,
          bio: userInfo.bio,
          image: userInfo.image,
          following: particalRes.following
        }
      }
    }
    return c.json(res)
  } catch (e) {
    dbErrorHandler(e, c)
  }
}

export const getArticle = async (c: Context) => {
  const slug: string | undefined = c.req.param('slug')
  const headers: string | undefined = c.req.header('authorization')
  const { id: userId } = await createPayload(headers)
  try {
    const [article]: Article[] = await db.select().from(articles).where(eq(articles.slug, slug))
    let tagList = await db.select().from(articleTags).where(eq(articleTags.articleId, Number(article.id)))
    tagList = tagList.map((obj: any) => {
      return obj.tagName
    })
    const [userInfo]: User[] = await db.select().from(users).where(eq(users.id, article.authorId))
    const particalRes = await createArticleResponsePartical(article, userId, article.authorId)
    const res = {
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: tagList,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: particalRes.favorited,
        favoritesCount: particalRes.favoCount,
        author: {
          username: userInfo.username,
          bio: userInfo.bio,
          image: userInfo.image,
          following: particalRes.following
        }
      }
    }
    return c.json(res)
  } catch (e) {
    console.log(e)
  }
}

export const getGlobal = async (c: Context) => {
  const favorited: string | undefined = c.req.query('favorited')
  const author: string | undefined = c.req.query('author')
  const headers: string | undefined = c.req.header('authorization')
  const { id: userId }: Payload = await createPayload(headers)
  try {
    let authorId: number | undefined = undefined
    let favoritedArticleIds: number[] | undefined = undefined

    if (author) {
      const [user]: User[] = await db.select().from(users).where(eq(users.username, author))
      authorId = user.id
    }
    if (favorited) {
      const [user]: User[] = await db.select().from(users).where(eq(users.username, favorited))
      const rows = await db.select({ articleId: favorites.articleId }).from(favorites).where(eq(favorites.userId, user.id))
      favoritedArticleIds = rows.map((r: { articleId: number }) => r.articleId)
    }
    const latestArticles: Article[] = await db.query.articles.findMany({
      where: authorId
        ? eq(articles.authorId, authorId)
        : favoritedArticleIds
          ? inArray(articles.id, favoritedArticleIds)
          : undefined,
      orderBy: [desc(articles.createdAt)],
      with: {
        author: true,
        articleTags: true
      }
    })
    const res = await createArticles(latestArticles, userId)
    return c.json(res)
  } catch (e) {
    console.log(e)
  }
}

export const getFeed = async (c: Context) => {
  const headers: string | undefined = c.req.header('authorization')
  try {
    const { id: userId }: Payload = await createPayload(headers)
    const followingUserList = await db.select({ id: follows.followingId }).from(follows).where(eq(follows.followerId, userId))
    const userIds = followingUserList.map(u => u.id)
    const latestArticles: Article[] = await db.query.articles.findMany({
      where: inArray(articles.authorId, userIds),
      orderBy: [desc(articles.createdAt)],
      with: {
        author: true,
        articleTags: true
      }
    })
    const res = await createArticles(latestArticles, userId)
    return c.json(res)
  } catch (e) {
    debagLog(e)
  }
}

export const createArticles = async (latestArticles: Article[], userId: number) => {
  const formattedArticles = latestArticles.map((article: Article) => {
    const tags = article.articleTags.map((tag: Tag) => tag.tagName)
    return {
      ...article,
      articleTags: tags
    }
  })
  const data = await Promise.all(
    formattedArticles.map(async (article: any) => {
      const particalRes = await createArticleResponsePartical(article, userId, article.authorId)
      return {
        slug: article.slug,
        title: article.title,
        description: article.description,
        tagList: article.articleTags ?? [],
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: particalRes.favorited,
        favoritesCount: particalRes.favoCount,
        author: {
          username: article.author?.username ?? "fake name",
          bio: article.author?.bio ?? "",
          image: article.author?.image ?? "",
          following: particalRes.following
        }
      }
    }))
  const res = {
    articles: data,
    articlesCount: formattedArticles.length
  }
  return res
}

export const addFavorite = async (c: Context) => {
  const headers: string | undefined = c.req.header('authorization')
  const slug: string | undefined = c.req.param('slug')
  const { id: userId } = await createPayload(headers)
  try {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug))
    const inserteFavorite: NewFavorite = {
      userId: Number(userId),
      articleId: Number(article.id)
    }
    let tagList = await db.select().from(articleTags).where(eq(articleTags.articleId, Number(article.id)))
    tagList = tagList.map((obj: any) => {
      return obj.tagName
    })
    await db.insert(favorites).values(inserteFavorite).onConflictDoNothing().returning()
    const [userInfo]: User[] = await db.select().from(users).where(eq(users.id, article.authorId))
    const particalRes = await createArticleResponsePartical(article, userId, article.authorId)
    const res = {
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: tagList,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: particalRes.favorited,
        favoritesCount: particalRes.favoCount,
        author: {
          username: userInfo.username,
          bio: userInfo.bio,
          image: userInfo.image,
          following: particalRes.following
        }
      }
    }
    return c.json(res)
  } catch (e) {
    debagLog(e)
  }
}

export const deleteFavorie = async (c: Context) => {
  const headers: string | undefined = c.req.header('authorization')
  const slug: string | undefined = c.req.param('slug')
  const { id: userId } = await createPayload(headers)
  try {
    const [article]: Article[] = await db.query.articles.findMany({
      where: eq(articles.slug, slug),
      with: {
        author: true,
        articleTags: true
      }
    })
    if (!article) {
      return c.json({ errors: { body: ['article not found'] } }, 404)
    }
    const articleId = article.id
    await db.delete(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.articleId, articleId)
      )
    )
    const tagList = article.articleTags.map((obj: any) => {
      return obj.tagName
    })
    const particalRes = await createArticleResponsePartical(article, userId, article.authorId)
    const res = {
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: tagList,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: particalRes.favorited,
        favoritesCount: particalRes.favoCount,
        author: {
          username: article.author.username,
          bio: article.author.bio,
          image: article.author.image,
          following: particalRes.following
        }
      }
    }
    return c.json(res)
  } catch (e) {
    debagLog(e)
    return dbErrorHandler(e, c)
  }
}

export const updateArticle = async (c: Context) => {
  const slug: string | undefined = c.req.param('slug')
  const headers: string | undefined = c.req.header('authorization')
  const { id: userId } = await createPayload(String(headers))
  const articleData = await c.req.json()
  const { title, description, body, tagList } = articleData.article
  try {
    const [updatedArticle] = await db.update(articles)
      .set(
        {
          title,
          description,
          body
        }
      )
      .where(
        and(
          eq(articles.authorId, userId),
          eq(articles.slug, String(slug))
        )
      )
      .returning()
    const insertTags = tagList.map((tag: string) => {
      return {
        name: tag
      }
    })
    await db.insert(tags).values(insertTags).onConflictDoNothing().returning()
    const insertArticleTags = tagList.map((tag: string) => {
      return {
        articleId: updatedArticle.id,
        tagName: tag
      }
    })
    await db.insert(articleTags).values(insertArticleTags).onConflictDoNothing().returning()
    const particalRes = await createArticleResponsePartical(updatedArticle, userId, updatedArticle.authorId)
    const [userInfo]: User[] = await db.select().from(users).where(eq(users.id, userId))
    const res = {
      article: {
        slug: updatedArticle.slug,
        title: updatedArticle.title,
        description: updatedArticle.description,
        body: updatedArticle.body,
        tagList: tagList,
        createdAt: updatedArticle.createdAt,
        updatedAt: updatedArticle.updatedAt,
        favorited: particalRes.favorited,
        favoritesCount: particalRes.favoCount,
        author: {
          username: userInfo.username,
          bio: userInfo.bio,
          image: userInfo.image,
          following: particalRes.following
        }
      }
    }
    return c.json(res)
  } catch (e) {
    debagLog(e)
  }
}

export const deleteArticle = async (c: Context) => {
  const slug: string | undefined = c.req.param('slug')
  try {
    const [article]: Article[] = await db.select().from(articles).where(eq(articles.slug, String(slug)))
    debagLog(article)
    await db.delete(articleTags).where(eq(articleTags.articleId, article.id))
    await db.delete(favorites).where(eq(favorites.articleId, article.id))
    await db.delete(articles).where(eq(articles.id, article.id))
    return c.json({ message: 'delete article' })
  } catch (e) {
    debagLog(e)
  }
}

export const getComments = async (c: Context) => {
  const slug: string | undefined = c.req.param('slug')
  const headers: string | undefined = c.req.header('authorization')
  try {
    const { id: userId } = await createPayload(String(headers))
    const [article]: Article[] = await db.select().from(articles).where(eq(articles.slug, String(slug)))
    const commentsRow = await db.query.comments.findMany({
      where: eq(comments.articleId, article.id),
      columns: {
        id: true,
        createdAt: true,
        updatedAt: true,
        body: true,
      },
      with: {
        author: {
          columns: {
            id: true,
            username: true,
            bio: true,
            image: true,
          }
        }
      }
    })
    const commentsList = []
    for (const comment of commentsRow) {
      const follwingRow = await db.select().from(follows).where(and(eq(follows.followerId, userId), eq(follows.followingId, comment.author.id)))
      const following = follwingRow.length > 0
      const { id, ...authorWithoutId } = comment.author
      commentsList.push({
        ...comment,
        author: {
          ...authorWithoutId,
          following: following
        }
      })
    }
    const res = {
      comments: commentsList
    }
    return c.json(res)
  } catch (e) {
    debagLog(e)
  }
}

export const createComment = async (c: Context) => {
  const slug = c.req.param('slug')
  const headers: string | undefined = c.req.header('authorization')
  if (!headers) return
  const { id: userId }: Payload = await createPayload(headers)
  const { comment: commentData } = await c.req.json()
  try {
    const [article] = await db.select().from(articles).where(eq(articles.slug, String(slug)))
    const insertComment = {
      body: commentData.body,
      authorId: userId,
      articleId: article.id,
    }
    const [insertedComment] = await db.insert(comments).values(insertComment).returning()
    const [author] = await db.select().from(users).where(eq(users.id, userId))
    const res = {
      comment: {
        id: insertedComment.id,
        createdAt: insertedComment.createdAt,
        updatedAt: insertedComment.updatedAt,
        body: insertedComment.body,
        author: {
          username: author.username,
          bio: author.bio,
          image: author.image,
          following: false
        }
      }
    }
    return c.json(res)
  } catch (e) {
    debagLog(e)
  }
}

export const deleteComment = async (c: Context) => {
  const delCommntId = c.req.param('id')
  const headers: string | undefined = c.req.header('authorization')
  if (!headers) return
  const { id: userId }: Payload = await createPayload(headers)
  await db.delete(comments).where(and(eq(comments.id,Number(delCommntId)),eq(comments.authorId,userId))).returning()
  return c.json({ message: 'delete comment' })
}

const createArticleResponsePartical = async (insertedArticle: Article, userId: number, authorId: number) => {
  let [{ favoCount }] = await db.select({ favoCount: count() }).from(favorites).where(eq(favorites.articleId, insertedArticle.id))
  favoCount = Number(favoCount)
  const rows = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.articleId, insertedArticle.id)))
  const favorited = rows.length > 0
  const follwingRow = await db.select().from(follows).where(and(eq(follows.followerId, userId), eq(follows.followingId, authorId)))
  const following = follwingRow.length > 0
  return {
    favoCount: favoCount,
    favorited: favorited,
    following: following
  }
}


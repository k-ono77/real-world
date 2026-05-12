import { db } from '../db/index.ts' 
import { users, articles, articleTags, tags, articles, follows } from '../db/schema.ts'
import { leftJoin, desc, eq, and, sql, inArray } from 'drizzle-orm'
import type { Context } from 'hono'
import slugify from 'slugify'
import { nanoid } from 'nanoid'
import { createPayload, debagLog } from '../helpers/commonHelper.js'
import { dbErrorHandler } from '../helpers/dbHelper.js'
import { InferSelectModel,InferInsertModel } from 'drizzle-orm'

export type Article = InferSelectModel<typeof articles>
export type NewArticle = InferInsertModel<typeof articles>
export type Tag = InferInsertModel<typeof tags>
export interface User {
  username: string
  bio: string
  image: string
  following: boolean
}
interface Payload {
  id : number
  exp : number
}
export const createArticle = async (c: Context) =>{
  type RequestBody = {
    article: Article
  }
  interface User {
    username: string
    bio: string
    image: string
    following: boolean
  }
  const articleDto = await c.req.json<RequestBody>()
  const headers : string | undefined = await c.req.header('authorization')
  const decodedPayload : Payload = await createPayload(headers)
  const userId = Number(decodedPayload.id) 
  const { title, description, body, tagList } = articleDto.article
  const generateSlug = (title: string) => {
    const base = slugify(title, {
      lower: true,
      strict: true,
      locale: 'ja',
    })
    return `${base}-${nanoid(6)}`
  }
  const slug = generateSlug(title)
  try{
    const [insertedArticle] : NewArticle = await db.insert(articles).values({
      title,
      description,
      body,
      slug,
      authorId : userId
    }).returning()
    const insertTags = tagList.map((tag:string)=>{
      return {
        name : tag
      }
    })
    await db.insert(tags).values(insertTags).onConflictDoNothing().returning()
    const insertArticleTags = tagList.map((tag:string)=>{
      return {
        articleId : insertedArticle.id,
        tagName : tag
      }
    })
    await db.insert(articleTags).values(insertArticleTags).onConflictDoNothing().returning()
    const [userInfo] : User[] = await db.select().from(users).where(eq(users.id,userId))
    const res = {
      article:{
        slug : insertedArticle.slug,
        title : insertedArticle.title,
        description : insertedArticle.description,
        body : insertedArticle.body,
        tagList: tagList,
        createdAt: insertedArticle.createdAt,
        updatedAt: insertedArticle.updatedAt,
        favorited: false,
        favoritesCount:0,
        author:{
          username: userInfo.username,
          bio: userInfo.bio,
          image: userInfo.image,
          following: false
        }
      }
    }
    return c.json(res)
  }catch(e){
    dbErrorHandler(e,c)
  }
}

export const getArticle = async (c : Context) => {
  const slug: string | undefined = c.req.param('slug')
  const headers :string | undefined = c.req.header('authorization')
  try{
    const [article] : Article = await db.select().from(articles).where(eq(articles.slug,slug))
    let tagList = await db.select().from(articleTags).where(eq(articleTags.articleId,Number(article.id)))
    tagList = tagList.map((obj:any) =>{
      return obj.tagName
    })
    const [userInfo] : User[] = await db.select().from(users).where(eq(users.id,article.authorId)) 
    const res = {
      article:{
        slug : article.slug,
        title : article.title,
        description : article.description,
        body : article.body,
        tagList: tagList,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: false,
        favoritesCount:0,
        author:{
          username: userInfo.username,
          bio: userInfo.bio,
          image: userInfo.image,
          following: false
        }
      }
    }
    return c.json(res)
  }catch(e){
    console.log(e)
  }
}

export const getGlobal = async (c : Context) => {
  try{
    const latestArticles : Article[] = await db.query.articles.findMany({
      orderBy: [desc(articles.createdAt)],
      with : {
        author : true,
        articleTags : true
      }
    })
    const res = createArticles(latestArticles)
    return c.json(res)
  }catch(e){
    console.log(e)
  }
}

export const getFeed = async(c:Context) => { 
  const headers : string | undefined = c.req.header('authorization')
  try{
    const { id : userId } : Payload =  await createPayload(headers)
    const followingUserList = await db.select({id:follows.followingId}).from(follows).where(eq(follows.followerId,userId))
    const userIds = followingUserList.map(u =>u.id)
    const latestArticles : Article[] = await db.query.articles.findMany({
      where: inArray(articles.authorId, userIds),
      orderBy: [desc(articles.createdAt)],
      with : {
        author : true,
        articleTags : true
      }
    })
    const res = createArticles(latestArticles)    
    return c.json(res)
  }catch(e){
    debagLog(e)
  }
}

export const createArticles = (latestArticles : Article[]) => {
  const formattedArticles = latestArticles.map((article:Article) => {
      const tags = article.articleTags.map((tag:Tag) => tag.tagName)
      return {
        ...article,
        articleTags: tags 
      }
    })
  const data = formattedArticles.map((article: any) => {
    return {
      slug: article.slug,
      title: article.title,
      description: article.description,
      tagList: article.articleTags ?? [],
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited: false,
      favoritesCount: 0,
      author: {
        username: article.author?.username ?? "fake name",
        bio: article.author?.bio ?? "",
        image: article.author?.image ?? "",
        following: true
      }
    }
  })
  const res = {
    articles : data,
    articlesCount:formattedArticles.length
  }
  return res
}

export const addFavorite = async(c:Context) => {
  const slug : string = c.req.param('slug')
  const ariticleId : InferSelectModel.id  = await db.select({id:articles.id}).from(articles).where(eq(articles.slug,slug))
}
import { db } from '../db/index.ts'; 
import { users, articles, articleTags, tags } from '../db/schema.ts';
import { eq, and, sql } from 'drizzle-orm';
import type { Context } from 'hono';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import { createPayloade } from '../helpers/commonHelper.js';
import { dbErrorHandler } from '../helpers/dbHelper.js';
import { InferSelectModel,InferInsertModel } from 'drizzle-orm';

export type Article = InferSelectModel<typeof articles>;
export type NewArticle = InferInsertModel<typeof articles>;
export const createArticle = async (c: Context) =>{
  type Article = {
    title: string;
    description: string;
    body: string;
    taglist: string[];
  };
  type RequestBody = {
    article: Article;
  };
  interface Payload {
    id : number;
    exp : number;
  }
  interface User {
    username: string;
    bio: string;
    image: string;
    following: boolean;
  }
  const articleDto = await c.req.json<RequestBody>();
  const headers : string | undefined = await c.req.header('authorization');
  const decodedPayload : Payload = await createPayloade(headers);
  const userId = Number(decodedPayload.id); 
  const { title, description, body, tagList } = articleDto.article;
  const generateSlug = (title: string) => {
    const base = slugify(title, {
      lower: true,
      strict: true,
      locale: 'ja',
    });
    return `${base}-${nanoid(6)}`;
  };
  const slug = generateSlug(title);
  try{
    const [insertedArticle] : NewArticle = await db.insert(articles).values({
      title,
      description,
      body,
      slug,
      authorId : userId
    }).returning();
    const insertTags = tagList.map((tag:string)=>{
      return {
        name : tag
      }
    });
    await db.insert(tags).values(insertTags).onConflictDoNothing().returning();
    const insertArticleTags = tagList.map((tag:string)=>{
      return {
        articleId : insertedArticle.id,
        tagName : tag
      }
    });
    await db.insert(articleTags).values(insertArticleTags).onConflictDoNothing().returning();
    const [userInfo] : User[] = await db.select().from(users).where(eq(users.id,userId));
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
    dbErrorHandler(e,c);
  }
}

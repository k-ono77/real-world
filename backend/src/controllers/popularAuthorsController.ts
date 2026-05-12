import { db } from '../db/index.ts'; 
import { users, articles, articleTags, tags, follows } from '../db/schema.ts';
import { leftJoin, desc, eq, and, sql, count } from 'drizzle-orm';
import type { Context } from 'hono';
import { createPayload, debagLog } from '../helpers/commonHelper.js';
import { InferSelectModel,InferInsertModel } from 'drizzle-orm';

type Follows = InferInsertModel<typeof follows>;
type Users = InferSelectModel<typeof users>;
interface Payload {
  id : number;
  exp : number;
}
export const getAuthors = async(c:Context)=>{
  console.log("getAuthors");
  try{
    const follwerCount = count(follows.followerId);
    const authors = await db
    .select({
        users,
        followers: follwerCount
    }).from(users)
    .leftJoin(follows, eq(users.id,follows.followingId))
    .groupBy(users.id)
    .orderBy(desc(follwerCount))
    return c.json(authors);
  }catch(e){
    debagLog(e)
  }
}
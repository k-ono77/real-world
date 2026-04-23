import { db } from '../db/index.ts'; 
import { users, articles, articleTags, tags} from '../db/schema.ts';
import { leftJoin, desc, eq, and, sql } from 'drizzle-orm';
import type { Context } from 'hono';
import { createPayloade, debagLog } from '../helpers/commonHelper.js';

export const getProfile = async(c:Context)=>{
  const userName = c.req.param('username');
  try{
    const [userData] = await db.select().from(users).where(eq(users.username,userName));
    const formattedProfile = {
      profile:{
        username:userData.username,
        bio: userData.bio,
        image: userData.image,
        following: false
      }
    };
    return c.json(formattedProfile);
  }catch(e){
    debagLog(e);
  }
}
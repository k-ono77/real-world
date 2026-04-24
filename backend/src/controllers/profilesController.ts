import { db } from '../db/index.ts'; 
import { users, articles, articleTags, tags, follows} from '../db/schema.ts';
import { leftJoin, desc, eq, and, sql } from 'drizzle-orm';
import type { Context } from 'hono';
import { createPayloade, debagLog } from '../helpers/commonHelper.js';
import { InferSelectModel,InferInsertModel } from 'drizzle-orm';

type Follows = InferInsertModel<typeof follows>;
type Users = InferSelectModel<typeof users>;
interface Payload {
  id : number;
  exp : number;
}
export const getProfile = async(c:Context)=>{
  const userName = c.req.param('username');
  const headers = c.req.header('authorization');
  try{
    const [followingUserData] : Users = await db.select().from(users).where(eq(users.username,userName));
    const decodePayloade : Payload = await createPayloade(headers);
    const userId : number = Number(decodePayloade.id);
    const [userData] = await db.select().from(users).where(eq(users.username,userName));
    const [followsData] = await db.select().from(follows).where(
      and(
        eq(follows.followingId,followingUserData.id),
        eq(follows.followerId,userId)
      )
    )
    const formattedProfile = {
      profile:{
        username:userData.username,
        bio: userData.bio,
        image: userData.image,
        following: !!followsData
      }
    };
    return c.json(formattedProfile);
  }catch(e){
    debagLog(e);
  }
}

export const followUser = async(c:Context)=>{
  try{
    const followingUserProfile = await setFollowStatus(c,true);
    return c.json(followingUserProfile);
  }catch(e){
    debagLog(e);
  }
}

export const unfollowUser = async(c:Context) => {
  try{
    const followingUserProfile = await setFollowStatus(c,false);
    return c.json(followingUserProfile);
  }catch(e){
    debagLog(e);
  }
}

export const setFollowStatus = async(c:Context,follow:boolean) => {
  const userName = c.req.param('username');
  const headers = c.req.header('authorization');
  try{
    const [followingUserData] : Users = await db.select().from(users).where(eq(users.username,userName));
    const decodePayloade : Payload = await createPayloade(headers);
    const userId : number = Number(decodePayloade.id);
    if(follow){
      const insertFollow : Follows = {
        followerId : userId,
        followingId : followingUserData.id 
      }
      await db.insert(follows).values(insertFollow).returning();
    }else{
      await db.delete(follows).where(
        and(
          eq(follows.followingId,followingUserData.id),
          eq(follows.followerId,userId)
        )
      )
    }
    const followingUserProfile = {
      profile: {
      username: followingUserData.username,
      bio: followingUserData.bio,
      image: followingUserData.image,
      following: follow
      }
    }
    return followingUserProfile;
  }catch(e){
    debagLog(e);
  }

}
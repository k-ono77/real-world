import { db } from '../db/index.ts'; 
import { users } from '../db/schema.ts';
import { eq, and, sql } from 'drizzle-orm';
import { dbErrorHandler } from '../helpers/dbHelper.js';
import { generateAuthResponce } from '../helpers/authHelper.js';
import { sign, verify } from 'hono/jwt';
import { Auth } from '../constants/AuthConstants.ts';

export const settingUpdate = async (c) =>{
  const body = await c.req.json();
  const headers = await c.req.header('authorization');
  const decodedPayload = await verify(headers, Auth.SECRET, Auth.ALG);
  const {bio, email, image, password, username} = body.user;
  try{
    const user = await db.update(users)
    .set(
      {
        bio: bio,
        email: email,
        image: image,
        password: password,
        username: username
      }
    )
    .where(eq(users.id,decodedPayload.id))
    .returning();
    const r = user[0];
    return generateAuthResponce(r, c);
  }catch(e){
    return dbErrorHandler(e, c);
  }
}

  
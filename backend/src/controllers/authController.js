import { db } from '../db/index.ts'; 
import { users } from '../db/schema.ts';
import { dbErrorHandler } from '../helpers/dbHelper.js';
import { generateAuthResponce } from '../helpers/authHelper.js';
import { eq, and, sql } from 'drizzle-orm';

export const siginUp = async (c) =>{
  const body = await c.req.json();
  const { email, password, username} = body.user;
  try{
    const newUser  = await db.insert(users).values({
      email,
      password,
      username
    }).returning();
    let r = newUser[0];
    return generateAuthResponce(r, c);
  }catch(e){
    return dbErrorHandler(e, c);
  }
}

export const login = async (c) =>{
  const body = await c.req.json();
  const { email, password} = body.user;
  try{
    const user  = await db.select().from(users).where(
      and(
        eq(users.email,email),
        eq(users.password,password)
      )
    );
    if(!user[0]) return c.json({errors:{body:['login failed.']}}, 422);
    let r = user[0];
    return generateAuthResponce(r, c);
  }catch(e){
    return dbErrorHandler(e, c);
  }
}
  
import { db } from '../db/index.ts'; 
import { users } from '../db/schema.ts';
import dbErrorHandler from '../helpers/dbErrorHandler.js';
import { sign } from 'hono/jwt';
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
    return generateAuthResponse(r, c);
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
    return generateAuthResponse(r, c);
  }catch(e){
    return dbErrorHandler(e, c);
  }
}
async function generateAuthResponse(responce,context){
  const SECRET_KYE = process.env.JWT_SECRET;
  const TOKEN_EXPIRATION_MINUTES = process.env.TOKEN_EXPIRATION_MINUTES;
  const payload = {
      sub: responce.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * TOKEN_EXPIRATION_MINUTES,
    };
  const token = await sign(payload, SECRET_KYE);
  return context.json(
    {user:
      {
        email:responce.email,
        username: responce.username,
        bio: responce.bio,
        image: responce.image,
        token: token,
      }
    }
  );

}
  
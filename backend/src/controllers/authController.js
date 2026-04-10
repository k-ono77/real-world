import { Hono } from "hono";
import { db } from '../db/index.ts'; 
import { users } from '../db/schema.ts';
import dbErrorHandler from '../helpers/dbErrorHandler.js';


export const siginUp = async (c) =>{
  const body = await c.req.json();
  const { email, password, username} = body.user;
  try{
    const newUser  = await db.insert(users).values({
      email,
      password,
      username
    }).returning();
    return c.json(newUser[0]);
  }catch(e){
    return dbErrorHandler(e,c);
  }
}
  
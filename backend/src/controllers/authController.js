import { Hono } from "hono";
import { db } from '../db/index.ts'; 
import { users } from '../db/schema.ts';


export const siginUp = async (c) =>{
  const body = await c.req.json();
  const { email, password, username} = body.user;
  const newUser  = await db.insert(users).values({
    email,
    password,
    username
  }).returning();
  console.log(newUser[0]);
  return c.json(newUser[0]);

}
  
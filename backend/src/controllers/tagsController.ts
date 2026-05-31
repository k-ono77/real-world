import { db } from '../db/index.ts' 
import { tags } from '../db/schema.ts'
import type { Context } from 'hono'
import { InferSelectModel } from 'drizzle-orm'
import { debagLog } from '../helpers/commonHelper.ts'
export type TagRow = InferSelectModel<typeof tags>

export const getTags = async(c:Context) => {
  try{
    const tagsRow: TagRow[] = await db.select().from(tags)
    const tagsList = tagsRow.map((tag)=>tag.name)
    return c.json({tags:tagsList})
  }catch(e){
    debagLog(e)
  }
}

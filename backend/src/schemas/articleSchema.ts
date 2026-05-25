import { z } from 'zod';

const articleFields = {
  title: z.string().min(1, "can't be blank"),
  description: z.string().min(1, "can't be blank"),
  body: z.string().min(1, "can't be blank"),
  tagList: z.string().min(1, "can't be blank"),
};

export const createArticleSchema = z.object({
  article: z.object(articleFields),
});

export const updateArticleSchema = z.object({
  article: z.object(articleFields).partial(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;

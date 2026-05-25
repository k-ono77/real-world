import { z } from 'zod';

export const signupSchema = z.object({
  user: z.object({
    username: z.string().min(1, "can't be blank"),
    email: z.email('is invalid'),
    password: z.string().min(5, 'is too short (minimum is 5 characters)'),
  }),
});

export const loginSchema = z.object({
  user: z.object({
    email: z.string().min(1, "can't be blank").email('is invalid'),
    password: z.string().min(1, "can't be blank"),
  }),
});

// z.infer⇨zodスキーマからtsの型を生成
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

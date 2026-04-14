export const Auth = {
  SECRET: process.env.JWT_SECRET,
  EXP_MIN: process.env.TOKEN_EXPIRATION_MINUTES,
  ALG: 'HS256',
} as const;
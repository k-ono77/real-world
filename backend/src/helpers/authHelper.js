import { Auth } from '../constants/AuthConstants.ts';
import { sign } from 'hono/jwt';

export const generateAuthResponce  = async(responce,context) =>{
  const payload = {
      id: responce.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * Auth.EXP_MIN,
    };
  const token = await sign(payload, Auth.SECRET , Auth.ALG);
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

const authHelper ={
    generateAuthResponce
}

export default authHelper;
import { verify } from 'hono/jwt';
import { Auth } from '../constants/AuthConstants.js'

interface Payload {
  id: number
  exp: number
}

export function debagLog(log: any, title: string = 'DEBAG') {
  console.log(`--------${title}--------------`);
  console.log(log);
  console.log('----------------------');
}

export async function createPayload(token: string): Promise<Payload> {
  return verify(token, Auth.SECRET, Auth.ALG) as unknown as Payload;
}

const commonHelper = {
  debagLog,
  createPayload
};

export default commonHelper;

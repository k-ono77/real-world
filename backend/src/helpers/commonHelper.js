import { verify } from 'hono/jwt';
import { Auth } from '../constants/AuthConstants.js'
export function debagLog(log,title='DEBAG') {
  console.log(`--------${title}--------------`);
  console.log(log);
  console.log('----------------------');
}

export async function createPayload(token){
  return verify(token, Auth.SECRET, Auth.ALG);
}

const commonHelper = {
  debagLog,
  createPayload
};

export default commonHelper;

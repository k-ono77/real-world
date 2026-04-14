export function dbErrorHandler(error,c) {
  const status = error.cause.code;
  let message = 'Please contact the administrator.'
  if (status){
    if (status.startsWith('23')){
      message = 'Please check your input.'
    }
    if (status.startsWith('42')){
      message = 'A system error has occurred. Please contact your administrator.'
    }
    if (status.startsWith('08')){
      message = 'The network is unstable. Please contact your administrator.'
    }
  }
  const resBody = {errors:{body:[message]}};
  return c.json(resBody, 422);
}

const dbHelper = {
  dbErrorHandler
};


export default dbHelper;

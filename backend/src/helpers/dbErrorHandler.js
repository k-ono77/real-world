function dbErrorHandler(error,c) {
  const status = error.cause.code;
  let message = '管理者にお問い合わせください。'
  if (status){
    if (status.startsWith('23')){
      message = '入力内容を確認してください。'
    }
    if (status.startsWith('42')){
      message = '障害が発生しました。管理者にお問い合わせください。'
    }
    if (status.startsWith('08')){
      message = 'ネットワークが不安定です。管理者にお問い合わせください。'
    }
  }
  const resBody = {errors:{body:[message]}};
  return c.json(resBody, 422);
}

export default dbErrorHandler;

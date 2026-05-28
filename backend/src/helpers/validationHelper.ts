
type ValidationErrorResponse = {
    errors: {
      body: string[];
    }
}

type IssueLike = {
  path: PropertyKey[]
  message: string
}

export const formatValidationError = ( error: { issues: IssueLike[] }) : ValidationErrorResponse => {
    const messages = error.issues.map((issue) => {
    const field = issue.path.at(-1) ?? 'body';
    return `${String(field)} ${issue.message}`;
  });

  return {
    errors: {
      body: messages,
    },
  };
};

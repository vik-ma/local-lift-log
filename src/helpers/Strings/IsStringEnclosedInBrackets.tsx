export const IsStringEnclosedInBrackets = (str: string) => {
  const regex = /^\[.*\]$/;

  return regex.test(str);
};

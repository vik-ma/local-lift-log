export const IsStringEmpty = (str: string) => {
  if (str === null || str === undefined || str.trim().length === 0) return true;
  return false;
};

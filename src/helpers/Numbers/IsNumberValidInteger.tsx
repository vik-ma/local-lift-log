export const IsNumberValidInteger = (number: number, minValue = 0) => {
  if (isNaN(number)) return false;
  if (number < minValue) return false;
  if (!Number.isInteger(number)) return false;
  return true;
};

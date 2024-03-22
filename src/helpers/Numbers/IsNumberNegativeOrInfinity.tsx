export const IsNumberNegativeOrInfinity = (number: number): boolean => {
  if (number < 0) return true;
  if (!isFinite(number)) return true;
  return false;
};

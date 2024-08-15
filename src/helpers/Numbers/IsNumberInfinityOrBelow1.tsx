export const IsNumberInfinityOrBelow1 = (number: number): boolean => {
  if (number < 1) return true;
  if (!isFinite(number)) return true;
  return false;
};

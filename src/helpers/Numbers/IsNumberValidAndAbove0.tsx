export const IsNumberValidAndAbove0 = (number: number): boolean => {
  if (isNaN(number)) return false;
  if (number <= 0) return false;
  if (!isFinite(number)) return false;
  return true;
};

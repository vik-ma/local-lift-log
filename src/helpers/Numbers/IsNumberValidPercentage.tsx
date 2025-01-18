export const IsNumberValidPercentage = (num: number, allow0: boolean) => {
  if (isNaN(num)) return false;
  if (allow0 && num < 0) return false;
  if (!allow0 && num <= 0) return false;
  if (num > 100) return false;
  return true;
};

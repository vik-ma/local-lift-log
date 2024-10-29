export const IsStringValidNumberBetween0And1 = (
  inputString: string
): boolean => {
  const inputNumber = Number(inputString);
  if (isNaN(inputNumber) || inputNumber <= 0 || inputNumber >= 1) return false;
  return true;
};

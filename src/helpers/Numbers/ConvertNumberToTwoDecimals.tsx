export const ConvertNumberToTwoDecimals = (number: number): number => {
  return Math.round(number * 100) / 100;
};

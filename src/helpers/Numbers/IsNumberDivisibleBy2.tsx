export const IsNumberDivisibleBy2 = (num: number) => {
  return Number.isInteger(num) && num > 0 && num % 2 === 0;
};

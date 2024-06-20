export const IsNumberValidId = (num: number) => {
  return Number.isInteger(num) && num > 0;
};

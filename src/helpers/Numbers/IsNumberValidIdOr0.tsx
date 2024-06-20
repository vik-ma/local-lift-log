export const IsNumberValidIdOr0 = (num: number) => {
  return Number.isInteger(num) && num >= 0;
};

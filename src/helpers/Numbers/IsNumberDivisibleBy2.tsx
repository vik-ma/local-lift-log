import { IsNumberValidInteger } from "..";

export const IsNumberDivisibleBy2 = (num: number) => {
  return IsNumberValidInteger(num, 0, true) && num % 2 === 0;
};

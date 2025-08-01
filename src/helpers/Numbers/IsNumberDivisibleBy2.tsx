import { IsNumberValidInteger } from "..";

export const IsNumberDivisibleBy2 = (num: number) => {
  const minValue = 0;
  const doNotAllowMinValue = true;

  return (
    IsNumberValidInteger(num, minValue, doNotAllowMinValue) && num % 2 === 0
  );
};

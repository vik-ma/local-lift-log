import { IsNumberNegativeOrInfinity } from "..";

export const IsStringInvalidNumber = (inputString: string): boolean => {
  const inputNumber = Number(inputString);
  if (isNaN(inputNumber) || IsNumberNegativeOrInfinity(inputNumber))
    return true;
  return false;
};

import { IsNumberNegativeOrInfinity } from "..";

export const IsStringValidInteger = (inputString: string): boolean => {
  const inputNumber = Number(inputString);
  if (!Number.isInteger(inputNumber) || IsNumberNegativeOrInfinity(inputNumber))
    return true;
  return false;
};

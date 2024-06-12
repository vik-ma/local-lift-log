import { IsNumberNegativeOrInfinity } from "..";

export const IsStringInvalidIntegerOr0 = (inputString: string): boolean => {
  const inputNumber = Number(inputString);
  if (
    !Number.isInteger(inputNumber) ||
    IsNumberNegativeOrInfinity(inputNumber) ||
    inputNumber === 0
  )
    return true;
  return false;
};

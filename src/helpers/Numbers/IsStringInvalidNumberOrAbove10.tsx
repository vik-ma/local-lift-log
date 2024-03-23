import { IsNumberNegativeOrInfinity } from "..";

export const IsStringInvalidNumberOrAbove10 = (
  inputString: string
): boolean => {
  const inputNumber = Number(inputString);
  if (
    !Number.isInteger(inputNumber) ||
    IsNumberNegativeOrInfinity(inputNumber) ||
    inputNumber > 10
  )
    return true;
  return false;
};

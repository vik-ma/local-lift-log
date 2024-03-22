import { IsNumberNegativeOrInfinity } from "..";

export const IsStringInvalidNumberOrAbove59 = (
  inputString: string
): boolean => {
  const inputNumber = Number(inputString);
  if (
    !Number.isInteger(inputNumber) ||
    IsNumberNegativeOrInfinity(inputNumber) ||
    inputNumber > 59
  )
    return true;
  return false;
};

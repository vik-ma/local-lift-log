import { IsNumberValid } from "..";

export const IsStringInvalidIntegerOrAbove10 = (
  inputString: string
): boolean => {
  const inputNumber = Number(inputString);

  if (
    !IsNumberValid(inputNumber) ||
    !Number.isInteger(inputNumber) ||
    inputNumber > 10
  )
    return true;

  return false;
};

import { IsNumberValid } from "..";

export const IsStringInvalidNumberOrAbove59 = (
  inputString: string
): boolean => {
  const inputNumber = Number(inputString);

  if (
    !IsNumberValid(inputNumber) ||
    !Number.isInteger(inputNumber) ||
    inputNumber > 59
  )
    return true;

  return false;
};

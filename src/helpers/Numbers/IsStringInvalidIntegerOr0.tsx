import { IsNumberValid } from "..";

export const IsStringInvalidIntegerOr0 = (inputString: string): boolean => {
  const inputNumber = Number(inputString);

  if (
    !IsNumberValid(inputNumber) ||
    !Number.isInteger(inputNumber) ||
    inputNumber === 0
  )
    return true;
    
  return false;
};

import { IsNumberValid } from "..";

export const IsStringInvalidInteger = (inputString: string): boolean => {
  const inputNumber = Number(inputString);

  if (!IsNumberValid(inputNumber) || !Number.isInteger(inputNumber))
    return true;

  return false;
};

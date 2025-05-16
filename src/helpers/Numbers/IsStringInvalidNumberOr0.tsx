import { IsNumberValid } from "..";

export const IsStringInvalidNumberOr0 = (inputString: string): boolean => {
  const inputNumber = Number(inputString);

  if (!IsNumberValid(inputNumber) || inputNumber === 0) return true;
  
  return false;
};

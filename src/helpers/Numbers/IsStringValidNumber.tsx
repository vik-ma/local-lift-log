import { IsNumberNegativeOrInfinity } from "..";

export const IsStringValidNumber = (inputString: string): boolean => {
    const inputNumber = Number(inputString);
    if (isNaN(inputNumber) || IsNumberNegativeOrInfinity(inputNumber))
      return true;
    return false;
  };
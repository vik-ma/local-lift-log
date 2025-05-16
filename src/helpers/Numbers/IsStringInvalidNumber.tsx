import { IsNumberValid } from "..";

export const IsStringInvalidNumber = (inputString: string): boolean => {
  const inputNumber = Number(inputString);

  if (!IsNumberValid(inputNumber)) return true;

  return false;
};

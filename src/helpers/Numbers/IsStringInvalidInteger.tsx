import { IsNumberValidInteger } from "..";

export const IsStringInvalidInteger = (
  inputString: string,
  minValue: number = 0,
  doNotAllowMinValue?: boolean,
  maxValue?: number
): boolean => {
  const inputNumber = Number(inputString);

  if (
    !IsNumberValidInteger(inputNumber, minValue, doNotAllowMinValue, maxValue)
  )
    return true;

  return false;
};

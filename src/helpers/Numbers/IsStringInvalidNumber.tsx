import { IsNumberValid, IsStringEmpty } from "..";

export const IsStringInvalidNumber = (
  inputString: string,
  minValue: number = 0,
  doNotAllowMinValue?: boolean,
  maxValue?: number,
  allowEmptyString?: boolean
) => {
  if (allowEmptyString && IsStringEmpty(inputString)) return false;

  const inputNumber = Number(inputString);

  if (!IsNumberValid(inputNumber, minValue, doNotAllowMinValue, maxValue))
    return true;

  return false;
};

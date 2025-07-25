import { IsNumberValidInteger, IsStringEmpty } from "..";

export const IsStringInvalidInteger = (
  inputString: string,
  minValue: number = 0,
  doNotAllowMinValue?: boolean,
  maxValue?: number,
  allowEmptyString?: boolean
) => {
  if (allowEmptyString && IsStringEmpty(inputString)) return false;

  const inputNumber = Number(inputString);

  if (
    !IsNumberValidInteger(inputNumber, minValue, doNotAllowMinValue, maxValue)
  )
    return true;

  return false;
};

import { IsNumberValid, IsNumberValidInteger } from "..";

export const ConvertNumberToInputString = (
  num: number,
  minValue: number = 0,
  doNotAllowMinValue?: boolean,
  maxValue?: number,
  isInteger?: boolean,
  defaultInvalidValue?: string,
  doNotReturn0AsEmptyString?: boolean
) => {
  if (
    isInteger &&
    IsNumberValidInteger(num, minValue, doNotAllowMinValue, maxValue)
  )
    return num === 0 && !doNotReturn0AsEmptyString ? "" : num.toString();

  if (!isInteger && IsNumberValid(num, minValue, doNotAllowMinValue, maxValue))
    return num === 0 && !doNotReturn0AsEmptyString ? "" : num.toString();

  if (defaultInvalidValue !== undefined) return defaultInvalidValue;

  return "";
};

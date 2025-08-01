import { ConvertInputStringToNumber, IsNumberValid } from "..";

export const ShouldSetTrackingValueButtonBeDisabled = (
  setTrackingString: string,
  isSetTrackingInvalid: boolean,
  isIncrease: boolean,
  increment: number,
  maxValue?: number,
  minValue?: number
) => {
  if (isSetTrackingInvalid) return true;

  const modifier = isIncrease ? 1 : -1;

  const startAtMinusOne = minValue === -1;

  const incrementMinValue = 0;
  const doNotAllowMinValue = true;

  const validatedIncrement = IsNumberValid(
    increment,
    incrementMinValue,
    doNotAllowMinValue
  )
    ? increment
    : 1;

  const value =
    ConvertInputStringToNumber(setTrackingString, startAtMinusOne) +
    modifier * validatedIncrement;

  const min = minValue ?? 0;

  if (value < min) return true;

  if (maxValue && value > maxValue) return true;

  return false;
};

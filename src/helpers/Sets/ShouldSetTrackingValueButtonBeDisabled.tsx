import { ConvertInputStringToNumber } from "..";

export const ShouldSetTrackingValueButtonBeDisabled = (
  setTrackingString: string,
  isSetTrackingInvalid: boolean,
  isIncrease: boolean,
  increment: number,
  maxValue?: number
): boolean => {
  if (isSetTrackingInvalid) return true;

  const modifier = isIncrease ? 1 : -1;

  const value =
    ConvertInputStringToNumber(setTrackingString) + modifier * increment;

  if (value < 0) return true;

  if (maxValue && value > maxValue) return true;

  return false;
};

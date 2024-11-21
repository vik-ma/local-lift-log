import { NumberRange } from "../../typings";
import { IsNumberNegativeOrInfinity } from "./IsNumberNegativeOrInfinity";

export const ValidateNumberRangeNumbers = (numberRange: NumberRange) => {
  if (
    IsNumberNegativeOrInfinity(numberRange.start) ||
    IsNumberNegativeOrInfinity(numberRange.end) ||
    numberRange.start > numberRange.end
  )
    return false;

  return true;
};

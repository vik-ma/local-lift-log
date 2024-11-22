import { NumberRange } from "../../typings";
import { IsNumberNegativeOrInfinity } from "./IsNumberNegativeOrInfinity";

export const IsNumberRangeValidAndFiltered = (numberRange: NumberRange) => {
  if (
    IsNumberNegativeOrInfinity(numberRange.start) ||
    IsNumberNegativeOrInfinity(numberRange.end) ||
    numberRange.start > numberRange.end
  )
    return false;

  if (numberRange.start === 0 && numberRange.end === 0) return false;

  return true;
};

import { useMemo } from "react";
import { IsStringInvalidNumber } from "../helpers";
import { NumberRange, NumberRangeInvalidityMap } from "../typings";

export const useNumberRangeInvalidityMap = (
  numberRange: NumberRange,
  minValue?: number,
  maxValue?: number
) => {
  const numberRangeInvalidityMap: NumberRangeInvalidityMap = useMemo(() => {
    let isStartInputInvalid = false;
    let isEndInputInvalid = false;

    if (IsStringInvalidNumber(numberRange.startInput))
      isStartInputInvalid = true;

    if (IsStringInvalidNumber(numberRange.endInput)) isEndInputInvalid = true;

    if (!isStartInputInvalid && !isEndInputInvalid) {
      if (numberRange.start > numberRange.end) {
        return { start: true, end: true };
      }
    }

    if (minValue !== undefined && numberRange.start < minValue)
      isStartInputInvalid = true;

    if (maxValue !== undefined && numberRange.end > maxValue)
      isEndInputInvalid = true;

    return { start: isStartInputInvalid, end: isEndInputInvalid };
  }, [numberRange, minValue, maxValue]);

  return numberRangeInvalidityMap;
};

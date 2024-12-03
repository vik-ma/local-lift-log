import { useMemo } from "react";
import { IsStringInvalidInteger, IsStringInvalidNumber } from "../helpers";
import { NumberRange, NumberRangeInvalidityMap } from "../typings";

export const useNumberRangeInvalidityMap = (
  numberRange: NumberRange,
  minValue?: number,
  maxValue?: number,
  isIntegerOnly?: boolean
) => {
  const numberRangeInvalidityMap: NumberRangeInvalidityMap = useMemo(() => {
    let isStartInputInvalid = false;
    let isEndInputInvalid = false;

    if (
      IsStringInvalidNumber(numberRange.startInput) ||
      (isIntegerOnly && IsStringInvalidInteger(numberRange.startInput))
    ) {
      isStartInputInvalid = true;
    }

    if (
      IsStringInvalidNumber(numberRange.endInput) ||
      (isIntegerOnly && IsStringInvalidInteger(numberRange.endInput))
    ) {
      isEndInputInvalid = true;
    }

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
  }, [numberRange, minValue, maxValue, isIntegerOnly]);

  return numberRangeInvalidityMap;
};

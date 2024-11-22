import { useMemo } from "react";
import { IsStringInvalidNumber } from "../helpers";
import { NumberRange, NumberRangeInvalidityMap } from "../typings";

export const useNumberRangeInvalidityMap = (numberRange: NumberRange) => {
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

    return { start: isStartInputInvalid, end: isEndInputInvalid };
  }, [numberRange]);

  return numberRangeInvalidityMap;
};

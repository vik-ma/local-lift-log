import { useMemo, useState } from "react";
import { IsStringInvalidNumber } from "../helpers";

const INPUT_MIN_VALUE = 0;
const DO_NOT_ALLOW_MIN_VALUE = false;
const INPUT_MAX_VALUE = 1;

export const useMultiplierInputMap = () => {
  const [multiplierInputMap, setMultiplierInputMap] = useState<
    Map<string, string>
  >(new Map());

  const multiplierInputInvaliditySet: Set<string> = useMemo(() => {
    const multiplierInputValiditySet = new Set<string>();

    for (const [key, value] of multiplierInputMap) {
      if (
        IsStringInvalidNumber(
          value,
          INPUT_MIN_VALUE,
          DO_NOT_ALLOW_MIN_VALUE,
          INPUT_MAX_VALUE
        )
      ) {
        multiplierInputValiditySet.add(key);
      }
    }

    return multiplierInputValiditySet;
  }, [multiplierInputMap]);

  return {
    multiplierInputMap,
    setMultiplierInputMap,
    multiplierInputInvaliditySet,
  };
};

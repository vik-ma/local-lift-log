import { useMemo, useState } from "react";
import { IsStringInvalidNumber } from "../helpers";

export const useMultiplierInputMap = () => {
  const [multiplierInputMap, setMultiplierInputMap] = useState<
    Map<string, string>
  >(new Map());

  const multiplierInputInvaliditySet: Set<string> = useMemo(() => {
    const multiplierInputValiditySet = new Set<string>();

    for (const [key, value] of multiplierInputMap) {
      if (IsStringInvalidNumber(value, 0, false, 1)) {
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

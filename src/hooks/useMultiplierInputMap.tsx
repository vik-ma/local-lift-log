import { useMemo, useState } from "react";
import { IsStringValidNumberBetween0And1 } from "../helpers";

export const useMultiplierInputMap = () => {
  const [multiplierInputMap, setMultiplierInputMap] = useState<
    Map<string, string>
  >(new Map());

  const multiplierInputInvaliditySet: Set<string> = useMemo(() => {
    const multiplierInputValiditySet = new Set<string>();

    for (const [key, value] of multiplierInputMap) {
      if (!IsStringValidNumberBetween0And1(value)) {
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

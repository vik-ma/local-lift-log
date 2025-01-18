import { useMemo } from "react";
import { IsStringInvalidNumberOr0 } from "../helpers";

export const useIsStringValidNumberAbove0 = (str: string) => {
  const isStringValidNumberAbove0 = useMemo(() => {
    if (IsStringInvalidNumberOr0(str)) return false;
    return true;
  }, [str]);

  return isStringValidNumberAbove0;
};

import { useMemo } from "react";
import { IsStringEmpty, IsStringInvalidNumber } from "../helpers";

export const useIsStringValidNumberOrEmpty = (str: string) => {
  const isStringValidNumberOrEmpty = useMemo(() => {
    if (IsStringEmpty(str)) return false;
    if (IsStringInvalidNumber(str)) return false;
    return true;
  }, [str]);

  return isStringValidNumberOrEmpty;
};

import { useMemo } from "react";
import { IsStringEmpty, IsStringInvalidNumber } from "../helpers";

export const useIsStringValidNumber = (str: string): boolean => {
  const isStringValidNumber = useMemo(() => {
    if (IsStringEmpty(str)) return false;
    if (IsStringInvalidNumber(str)) return false;
    return true;
  }, [str]);

  return isStringValidNumber;
};

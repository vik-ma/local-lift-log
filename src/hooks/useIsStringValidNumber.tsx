import { useMemo } from "react";
import { IsStringInvalidNumber } from "../helpers";

export const useIsStringValidNumber = (str: string) => {
  const isStringValidNumber = useMemo(() => {
    if (IsStringInvalidNumber(str)) return false;
    return true;
  }, [str]);

  return isStringValidNumber;
};

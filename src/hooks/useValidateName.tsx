import { useMemo } from "react";
import { IsStringEmpty } from "../helpers";

export const useValidateName = (name: string) => {
  const isNameValid = useMemo(() => {
    if (IsStringEmpty(name)) return false;
    return true;
  }, [name]);

  return isNameValid;
};

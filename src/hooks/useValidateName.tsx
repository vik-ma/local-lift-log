import { useMemo } from "react";
import { IsStringEmpty } from "../helpers";

export const useValidateName = (name: string): boolean => {
  const isNameValid = useMemo(() => {
    if (IsStringEmpty(name)) return false;
    return true;
  }, [name]);

  return isNameValid;
};

export default useValidateName;

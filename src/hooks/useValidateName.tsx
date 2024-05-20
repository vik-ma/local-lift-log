import { useMemo } from "react";

export const useValidateName = (name: string): boolean => {
  const isNameValid = useMemo(() => {
    if (name === null || name === undefined || name.trim().length === 0)
      return false;
    return true;
  }, [name]);

  return isNameValid;
};

export default useValidateName;

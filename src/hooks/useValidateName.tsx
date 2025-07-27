import { useMemo } from "react";
import { IsStringEmpty } from "../helpers";

type UseValidateNameProps = {
  name: string;
};

export const useValidateName = ({ name }: UseValidateNameProps) => {
  const isNameValid = useMemo(() => {
    if (IsStringEmpty(name)) return false;
    return true;
  }, [name]);

  return isNameValid;
};

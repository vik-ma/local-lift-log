import { useMemo } from "react";
import { ValidTimeInputBehaviors } from "../helpers";

export const useValidTimeInputBehaviors = (isHhmmss: boolean) => {
  const validTimeInputBehaviors = useMemo(
    () => ValidTimeInputBehaviors(isHhmmss),
    [isHhmmss]
  );

  return validTimeInputBehaviors;
};

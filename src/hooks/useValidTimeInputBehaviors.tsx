import { useMemo } from "react";
import { ValidTimeInputBehaviors } from "../helpers";
import { TimeInputType } from "../typings";

export const useValidTimeInputBehaviors = (type: TimeInputType) => {
  const validTimeInputBehaviors = useMemo(
    () => ValidTimeInputBehaviors(type),
    [type]
  );

  return validTimeInputBehaviors;
};

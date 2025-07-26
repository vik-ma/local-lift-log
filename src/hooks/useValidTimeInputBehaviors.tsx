import { useMemo } from "react";
import { ValidTimeInputBehaviors } from "../helpers";

type UseValidTimeInputBehaviorsProps = {
  isHhmmss: boolean;
};

export const useValidTimeInputBehaviors = ({
  isHhmmss,
}: UseValidTimeInputBehaviorsProps) => {
  const validTimeInputBehaviors = useMemo(
    () => ValidTimeInputBehaviors(isHhmmss),
    [isHhmmss]
  );

  return validTimeInputBehaviors;
};

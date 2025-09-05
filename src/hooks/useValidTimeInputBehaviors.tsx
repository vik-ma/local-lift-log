import { useMemo } from "react";
import { GetValidTimeInputBehaviors } from "../helpers";

type UseValidTimeInputBehaviorsProps = {
  isHhmmss: boolean;
};

export const useValidTimeInputBehaviors = ({
  isHhmmss,
}: UseValidTimeInputBehaviorsProps) => {
  const validTimeInputBehaviors = useMemo(
    () => GetValidTimeInputBehaviors(isHhmmss),
    [isHhmmss]
  );

  return validTimeInputBehaviors;
};

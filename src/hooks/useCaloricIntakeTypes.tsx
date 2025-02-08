import { useMemo } from "react";
import { CaloricIntakeTypes } from "../helpers";

export const useCaloricIntakeTypes = () => {
  const dietPhaseTypes = useMemo(() => CaloricIntakeTypes(), []);

  return dietPhaseTypes;
};

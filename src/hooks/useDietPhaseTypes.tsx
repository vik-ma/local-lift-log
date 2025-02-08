import { useMemo } from "react";
import { DietPhaseTypes } from "../helpers";

export const useDietPhaseTypes = () => {
  const dietPhaseTypes = useMemo(() => DietPhaseTypes(), []);

  return dietPhaseTypes;
};

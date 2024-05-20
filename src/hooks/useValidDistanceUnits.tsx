import { useMemo } from "react";
import { ValidDistanceUnits } from "../helpers";

export const useValidDistanceUnits = () => {
  const validDistanceUnits = useMemo(() => ValidDistanceUnits(), []);

  return validDistanceUnits;
};

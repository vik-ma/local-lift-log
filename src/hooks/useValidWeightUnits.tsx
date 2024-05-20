import { useMemo } from "react";
import { ValidWeightUnits } from "../helpers";

export const useValidWeightUnits = () => {
  const validWeightUnits = useMemo(() => ValidWeightUnits(), []);

  return validWeightUnits;
};
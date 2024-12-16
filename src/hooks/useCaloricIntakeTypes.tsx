import { useMemo } from "react";
import { CaloricIntakeTypes } from "../helpers";

export const useCaloricIntakeTypes = () => {
  const caloricIntakeTypes = useMemo(() => CaloricIntakeTypes(), []);

  return caloricIntakeTypes;
};

import { useMemo } from "react";
import { ValidMeasurementUnits } from "../helpers";

export const useValidMeasurementUnits = () => {
  const validMeasurementUnits = useMemo(() => ValidMeasurementUnits(), []);

  return validMeasurementUnits;
};

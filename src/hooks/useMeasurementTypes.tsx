import { useMemo } from "react";
import { MeasurementTypes } from "../helpers";

export const useMeasurementTypes = () => {
  const measurementTypes = useMemo(() => MeasurementTypes(), []);

  return measurementTypes;
};

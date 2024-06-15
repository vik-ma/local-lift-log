import { useMemo } from "react";
import { DefaultNewMeasurement } from "../helpers";

export const useDefaultMeasurement = () => {
  const defaultNewMeasurement = useMemo(() => DefaultNewMeasurement(), []);

  return defaultNewMeasurement;
};

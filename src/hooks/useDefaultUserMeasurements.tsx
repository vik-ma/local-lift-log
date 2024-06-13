import { useMemo } from "react";
import { DefaultNewUserMeasurements } from "../helpers";

export const useDefaultUserMeasurements = () => {
  const defaultNewUserMeasurements = useMemo(
    () => DefaultNewUserMeasurements(),
    []
  );

  return defaultNewUserMeasurements;
};

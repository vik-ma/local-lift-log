import { useMemo } from "react";
import { DefaultNewWorkout } from "../helpers";

export const useDefaultWorkout = () => {
  const defaultNewWorkout = useMemo(
    () => DefaultNewWorkout(),
    []
  );

  return defaultNewWorkout;
};

import { useMemo } from "react";
import { DefaultNewWorkoutTemplate } from "../helpers";

export const useDefaultWorkoutTemplate = () => {
  const defaultNewWorkoutTemplate = useMemo(
    () => DefaultNewWorkoutTemplate(),
    []
  );

  return defaultNewWorkoutTemplate;
};

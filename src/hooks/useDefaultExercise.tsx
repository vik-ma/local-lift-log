import { useMemo } from "react";
import { DefaultNewExercise } from "../helpers";

export const useDefaultExercise = () => {
  const defaultNewExercise = useMemo(() => DefaultNewExercise(), []);

  return defaultNewExercise;
};

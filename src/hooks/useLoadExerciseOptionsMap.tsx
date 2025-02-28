import { useMemo } from "react";
import { ValidLoadExerciseOptionsMap } from "../helpers";

export const useLoadExerciseOptionsMap = () => {
  const loadExerciseOptionsMap = useMemo(
    () => ValidLoadExerciseOptionsMap(),
    []
  );

  return loadExerciseOptionsMap;
};

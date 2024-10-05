import { useMemo } from "react";
import { ExerciseGroupDictionary } from "../helpers";

export const useExerciseGroupList = () => {
  const exerciseGroupList = useMemo(
    () => Array.from(ExerciseGroupDictionary().values()),
    []
  );

  return exerciseGroupList;
};

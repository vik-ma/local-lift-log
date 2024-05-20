import { useMemo } from "react";
import { ExerciseGroupDictionary } from "../helpers";

export const useExerciseGroupDictionary = () => {
  const exerciseGroupDictionary = useMemo(() => ExerciseGroupDictionary(), []);

  return exerciseGroupDictionary;
};

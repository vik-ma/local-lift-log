import { useMemo } from "react";
import { EXERCISE_GROUP_DICTIONARY } from "../constants";

export const useExerciseGroupList = () => {
  const exerciseGroupList = useMemo(
    () => Array.from(EXERCISE_GROUP_DICTIONARY),
    []
  );

  return exerciseGroupList;
};

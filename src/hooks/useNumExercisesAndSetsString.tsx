import { useMemo } from "react";
import { FormatNumExercisesAndSetsStrings } from "../helpers";

export const useNumExercisesAndSetsString = (
  numExercises: number | undefined,
  numSets: number | undefined
) => {
  const numExercisesAndSetsString = useMemo(() => {
    return FormatNumExercisesAndSetsStrings(numExercises, numSets);
  }, [numExercises, numSets]);

  return numExercisesAndSetsString;
};

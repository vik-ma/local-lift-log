import { useState, useEffect, useMemo, useCallback } from "react";
import {
  GetExerciseListWithGroupStrings,
  GetExerciseListWithGroupStringsAndTotalSets,
} from "../helpers";
import { Exercise, UseExerciseListReturnType } from "../typings";

export const useExerciseList = (
  showTotalNumSets?: boolean
): UseExerciseListReturnType => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [isExercisesLoading, setIsExercisesLoading] = useState<boolean>(true);

  const filteredExercises = useMemo(() => {
    if (filterQuery !== "") {
      return exercises.filter(
        (item) =>
          item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item
            .formattedGroupString!.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase())
      );
    }
    return exercises;
  }, [exercises, filterQuery]);

  const getExercises = useCallback(async () => {
    const exercises = showTotalNumSets
      ? await GetExerciseListWithGroupStringsAndTotalSets()
      : await GetExerciseListWithGroupStrings();

    if (exercises === undefined) return;

    setExercises(exercises);
    setIsExercisesLoading(false);
  }, [showTotalNumSets]);

  useEffect(() => {
    getExercises();
  }, [getExercises]);

  return {
    filterQuery,
    setFilterQuery,
    filteredExercises,
    exercises,
    setExercises,
    getExercises,
    isExercisesLoading,
  };
};

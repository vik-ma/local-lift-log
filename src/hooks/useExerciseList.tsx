import { useState, useEffect, useMemo, useCallback } from "react";
import { GetExerciseListWithGroupStrings } from "../helpers";
import { Exercise } from "../typings";

export const useExerciseList = () => {
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
    const exercises = await GetExerciseListWithGroupStrings();

    if (exercises === undefined) return;

    setExercises(exercises);
    setIsExercisesLoading(false);
  }, []);

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
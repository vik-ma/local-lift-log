import { useState, useEffect, useMemo, useCallback } from "react";
import {
  GetExerciseListWithGroupStrings,
  GetExerciseListWithGroupStringsAndTotalSets,
  UpdateIsFavorite,
  UpdateItemInList,
} from "../helpers";
import {
  Exercise,
  UseExerciseListReturnType,
  ExerciseSortCategory,
} from "../typings";

export const useExerciseList = (
  showTotalNumSets?: boolean
): UseExerciseListReturnType => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [isExercisesLoading, setIsExercisesLoading] = useState<boolean>(true);
  const [sortCategory, setSortCategory] =
    useState<ExerciseSortCategory>("favorite");

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

  const sortExercisesByName = (exerciseList: Exercise[]) => {
    exerciseList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setExercises(exerciseList);
  };

  const sortExercisesByNumSetsCompleted = (exerciseList: Exercise[]) => {
    const sortedArray = exerciseList.sort((a, b) => {
      const aCount = a.set_count !== undefined ? a.set_count : -Infinity;
      const bCount = b.set_count !== undefined ? b.set_count : -Infinity;
      return bCount - aCount;
    });

    setExercises(sortedArray);
  };

  const toggleFavorite = async (exercise: Exercise) => {
    const newFavoriteValue = exercise.is_favorite === 1 ? 0 : 1;

    const success = await UpdateIsFavorite(
      exercise.id,
      "exercise",
      newFavoriteValue
    );

    if (!success) return;

    const updatedExercise: Exercise = {
      ...exercise,
      is_favorite: newFavoriteValue,
    };

    const updatedExercises = UpdateItemInList(exercises, updatedExercise);

    if (sortCategory === "name") {
      sortExercisesByName(updatedExercises);
    } else if (sortCategory === "num-sets") {
      sortExercisesByNumSetsCompleted(updatedExercises);
    }
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "name") {
      setSortCategory(key);
      sortExercisesByName([...exercises]);
    } else if (key === "num-sets") {
      setSortCategory(key);
      sortExercisesByNumSetsCompleted([...exercises]);
    }
  };

  const getExercises = useCallback(async () => {
    const exercises = showTotalNumSets
      ? await GetExerciseListWithGroupStringsAndTotalSets()
      : await GetExerciseListWithGroupStrings();

    if (exercises === undefined) return;

    sortExercisesByName(exercises);
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
    toggleFavorite,
    handleSortOptionSelection,
    sortCategory,
    setSortCategory,
  };
};

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  GetExerciseListWithGroupStrings,
  GetExerciseListWithGroupStringsAndTotalSets,
  UpdateExercise,
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
  const [favoritesCheckboxValue, setFavoritesCheckboxValue] =
    useState<boolean>(true);
  const [sortCategory, setSortCategory] =
    useState<ExerciseSortCategory>("name");

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

  const sortExercisesByName = (
    exercises: Exercise[],
    listFavoritesFirst: boolean
  ) => {
    exercises.sort((a, b) => {
      if (listFavoritesFirst && b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setExercises(exercises);
  };

  const sortExercisesByNumSetsCompleted = (
    exercises: Exercise[],
    listFavoritesFirst: boolean
  ) => {
    exercises.sort((a, b) => {
      if (listFavoritesFirst && b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        const aCount = a.set_count !== undefined ? a.set_count : -Infinity;
        const bCount = b.set_count !== undefined ? b.set_count : -Infinity;
        return bCount - aCount;
      }
    });

    setExercises(exercises);
  };

  const toggleFavorite = async (exercise: Exercise) => {
    const newFavoriteValue = exercise.is_favorite === 1 ? 0 : 1;

    const updatedExercise: Exercise = {
      ...exercise,
      is_favorite: newFavoriteValue,
    };

    const success = await UpdateExercise(updatedExercise);

    if (!success) return;

    const updatedExercises = UpdateItemInList(exercises, updatedExercise);

    sortExercisesByName(updatedExercises, favoritesCheckboxValue);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "name") {
      setSortCategory(key);
      sortExercisesByName([...exercises], favoritesCheckboxValue);
    } else if (key === "num-sets") {
      setSortCategory(key);
      sortExercisesByNumSetsCompleted([...exercises], favoritesCheckboxValue);
    }
  };

  const handleListFavoritesFirstChange = (value: boolean) => {
    setFavoritesCheckboxValue(value);

    if (sortCategory === "name") {
      sortExercisesByName([...exercises], value);
    } else if (sortCategory === "num-sets") {
      sortExercisesByNumSetsCompleted([...exercises], value);
    }
  };

  const getExercises = useCallback(async () => {
    const exercises = showTotalNumSets
      ? await GetExerciseListWithGroupStringsAndTotalSets()
      : await GetExerciseListWithGroupStrings();

    if (exercises === undefined) return;

    sortExercisesByName(exercises, true);
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
    favoritesCheckboxValue,
    handleListFavoritesFirstChange,
    sortCategory,
    setSortCategory,
  };
};

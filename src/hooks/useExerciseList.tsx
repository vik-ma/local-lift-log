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
import { useExerciseGroupList } from ".";

export const useExerciseList = (
  showTotalNumSets?: boolean
): UseExerciseListReturnType => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [isExercisesLoading, setIsExercisesLoading] = useState<boolean>(true);
  const [sortCategory, setSortCategory] =
    useState<ExerciseSortCategory>("favorite");
  const [showSecondaryExerciseGroups, setShowSecondaryExerciseGroups] =
    useState<boolean>(false);

  const exerciseGroupList = useExerciseGroupList();
  const [shownExerciseGroups, setShownExerciseGroups] = useState<string[]>([
    ...exerciseGroupList,
  ]);

  const areExerciseGroupsFiltered = useMemo(() => {
    return shownExerciseGroups.length !== exerciseGroupList.length;
  }, [shownExerciseGroups, exerciseGroupList]);

  const filteredExercises = useMemo(() => {
    if (filterQuery !== "" || areExerciseGroupsFiltered) {
      // Only show exercises whose name or Exercise Group is included in the filterQuery
      // and whose Exercise Group is included in shownExerciseGroups
      return exercises.filter(
        (item) =>
          (item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            item
              .formattedGroupStringPrimary!.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) &&
          shownExerciseGroups.some((group) =>
            item.formattedGroupStringPrimary!.includes(group)
          )
      );
    }
    return exercises;
  }, [exercises, filterQuery, shownExerciseGroups, areExerciseGroupsFiltered]);

  const sortExercisesByName = (exerciseList: Exercise[]) => {
    exerciseList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setExercises(exerciseList);
  };

  const sortExercisesByFavoritesFirst = (exerciseList: Exercise[]) => {
    exerciseList.sort((a, b) => {
      if (b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setExercises(exerciseList);
  };

  const sortExercisesByNumSetsCompleted = (exerciseList: Exercise[]) => {
    exerciseList.sort((a, b) => {
      const aCount = a.set_count !== undefined ? a.set_count : -Infinity;
      const bCount = b.set_count !== undefined ? b.set_count : -Infinity;

      if (bCount !== aCount) return bCount - aCount;

      return a.name.localeCompare(b.name);
    });

    setExercises(exerciseList);
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

    sortExercisesByActiveCategory(updatedExercises);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "name") {
      setSortCategory(key);
      sortExercisesByName([...exercises]);
    } else if (key === "num-sets") {
      setSortCategory(key);
      sortExercisesByNumSetsCompleted([...exercises]);
    } else if (key === "favorite") {
      setSortCategory(key);
      sortExercisesByFavoritesFirst([...exercises]);
    }
  };

  const sortExercisesByActiveCategory = (exerciseList: Exercise[]) => {
    switch (sortCategory) {
      case "favorite":
        sortExercisesByFavoritesFirst(exerciseList);
        break;
      case "name":
        sortExercisesByName(exerciseList);
        break;
      case "num-sets":
        sortExercisesByNumSetsCompleted(exerciseList);
        break;
      default:
        break;
    }
  };

  const getExercises = useCallback(async () => {
    const exercises = showTotalNumSets
      ? await GetExerciseListWithGroupStringsAndTotalSets()
      : await GetExerciseListWithGroupStrings();

    if (exercises === undefined) return;

    sortExercisesByFavoritesFirst(exercises);
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
    exerciseGroupList,
    shownExerciseGroups,
    setShownExerciseGroups,
    areExerciseGroupsFiltered,
    sortExercisesByActiveCategory,
    showSecondaryExerciseGroups,
    setShowSecondaryExerciseGroups,
  };
};

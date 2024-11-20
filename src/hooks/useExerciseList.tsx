import { useState, useEffect, useCallback, useRef } from "react";
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
import { useExerciseGroupDictionary, useExerciseGroupList } from ".";

export const useExerciseList = (
  getExercisesOnLoad: boolean,
  showTotalNumSets?: boolean
): UseExerciseListReturnType => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sortCategory, setSortCategory] =
    useState<ExerciseSortCategory>("favorite");
  const [includeSecondaryGroups, setIncludeSecondaryGroups] =
    useState<boolean>(false);
  const [exerciseMap, setExerciseMap] = useState<Map<number, Exercise>>(
    new Map()
  );

  const exerciseGroupList = useExerciseGroupList();
  const exerciseGroupDictionary = useExerciseGroupDictionary();

  const isExerciseListLoaded = useRef(false);

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
      ? await GetExerciseListWithGroupStringsAndTotalSets(
          exerciseGroupDictionary
        )
      : await GetExerciseListWithGroupStrings(exerciseGroupDictionary);

    if (exercises === undefined) return;

    const exerciseMap = new Map<number, Exercise>(
      exercises.map((obj) => [obj.id, obj])
    );

    sortExercisesByFavoritesFirst(exercises);
    setExerciseMap(exerciseMap);
    isExerciseListLoaded.current = true;
  }, [showTotalNumSets, exerciseGroupDictionary]);

  useEffect(() => {
    if (getExercisesOnLoad) {
      getExercises();
    }
  }, [getExercises, getExercisesOnLoad]);

  return {
    exercises,
    setExercises,
    getExercises,
    toggleFavorite,
    handleSortOptionSelection,
    sortCategory,
    setSortCategory,
    exerciseGroupList,
    sortExercisesByActiveCategory,
    includeSecondaryGroups,
    setIncludeSecondaryGroups,
    isExerciseListLoaded,
    exerciseMap,
    exerciseGroupDictionary,
  };
};

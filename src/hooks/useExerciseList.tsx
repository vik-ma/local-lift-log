import { useState, useRef } from "react";
import {
  GetExerciseListWithGroupStrings,
  GetExerciseListWithGroupStringsAndTotalSets,
  GetSortCategoryFromStore,
  UpdateIsFavorite,
  UpdateItemInList,
} from "../helpers";
import {
  Exercise,
  UseExerciseListReturnType,
  ExerciseSortCategory,
  ExerciseMap,
  StoreRef,
  UserSettings,
} from "../typings";
import { useExerciseGroupDictionary, useExerciseGroupList } from ".";

type UseExerciseListProps = {
  store: StoreRef;
  showTotalNumSets?: boolean;
  ignoreExercisesWithNoSets?: boolean;
};

export const useExerciseList = ({
  store,
  showTotalNumSets,
  ignoreExercisesWithNoSets,
}: UseExerciseListProps): UseExerciseListReturnType => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sortCategory, setSortCategory] =
    useState<ExerciseSortCategory>("favorite");
  const [includeSecondaryGroups, setIncludeSecondaryGroups] =
    useState<boolean>(false);
  const exerciseMap = useRef<ExerciseMap>(new Map());

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

  const handleSortOptionSelection = async (key: string) => {
    if (store.current === null) return;

    await store.current.set("sort-category-exercises", { value: key });

    await sortExercisesByActiveCategory(
      [...exercises],
      key as ExerciseSortCategory
    );
  };

  const sortExercisesByActiveCategory = async (
    exerciseList: Exercise[],
    newCategory?: ExerciseSortCategory
  ) => {
    if (store.current === null) return;

    if (newCategory !== undefined) {
      setSortCategory(newCategory);
    }

    const activeCategory = newCategory ?? sortCategory;

    switch (activeCategory) {
      case "favorite":
        sortExercisesByFavoritesFirst([...exerciseList]);
        break;
      case "name":
        sortExercisesByName([...exerciseList]);
        break;
      case "num-sets":
        sortExercisesByNumSetsCompleted([...exerciseList]);
        break;
      default:
        // Overwrite invalid categories
        setSortCategory("favorite");
        await store.current.set("sort-category-exercises", {
          value: "favorite",
        });
        sortExercisesByFavoritesFirst([...exerciseList]);
        break;
    }
  };

  const getExercises = async (category: ExerciseSortCategory) => {
    const { exercises, newExerciseMap } = showTotalNumSets
      ? await GetExerciseListWithGroupStringsAndTotalSets(
          exerciseGroupDictionary,
          ignoreExercisesWithNoSets
        )
      : await GetExerciseListWithGroupStrings(exerciseGroupDictionary);

    sortExercisesByActiveCategory(exercises, category);
    exerciseMap.current = newExerciseMap;
    isExerciseListLoaded.current = true;
  };

  const loadExerciseGroupsString = (exerciseGroupsString: string) => {
    const exerciseGroupList: string[] = [];

    const exerciseGroups = exerciseGroupsString.split(",");

    for (const group of exerciseGroups) {
      if (exerciseGroupDictionary.has(group)) {
        exerciseGroupList.push(group);
      }
    }

    return exerciseGroupList;
  };

  const loadExercisesString = async (
    userSettings: UserSettings,
    exercisesString: string
  ) => {
    await loadExerciseList(userSettings);

    const exerciseIdSet = new Set<number>();

    const exerciseIds = exercisesString.split(",");

    for (const exerciseId of exerciseIds) {
      const id = Number(exerciseId);
      if (exerciseMap.current.has(id)) {
        exerciseIdSet.add(id);
      }
    }

    return exerciseIdSet;
  };

  const loadExerciseList = async (userSettings: UserSettings) => {
    if (isExerciseListLoaded.current) return;

    setIncludeSecondaryGroups(!!userSettings.show_secondary_exercise_groups);

    const sortCategory = await GetSortCategoryFromStore(
      store,
      "favorite" as ExerciseSortCategory,
      "exercises"
    );

    await getExercises(sortCategory);
  };

  return {
    exercises,
    setExercises,
    getExercises,
    toggleFavorite,
    handleSortOptionSelection,
    sortCategory,
    exerciseGroupList,
    sortExercisesByActiveCategory,
    includeSecondaryGroups,
    setIncludeSecondaryGroups,
    isExerciseListLoaded,
    exerciseMap,
    exerciseGroupDictionary,
    loadExercisesString,
    loadExerciseGroupsString,
    loadExerciseList,
  };
};

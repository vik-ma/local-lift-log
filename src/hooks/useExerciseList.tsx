import { useState, useRef, useMemo } from "react";
import {
  DoesListOrSetHaveCommonElement,
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
import { useExerciseGroupList, useExerciseListFilters } from ".";
import { EXERCISE_GROUP_DICTIONARY } from "../constants";

type UseExerciseListProps = {
  store: StoreRef;
  showTotalNumSets?: boolean;
  ignoreExercisesWithNoSets?: boolean;
};

const PAGE_SIZE = 20;

export const useExerciseList = ({
  store,
  showTotalNumSets,
  ignoreExercisesWithNoSets,
}: UseExerciseListProps): UseExerciseListReturnType => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<ExerciseSortCategory>("favorite");
  const [showSecondaryGroups, setShowSecondaryGroups] =
    useState<boolean>(false);
  const [paginationPage, setPaginationPage] = useState<number>(1);

  const exerciseMap = useRef<ExerciseMap>(new Map());

  const exerciseGroupDictionary = EXERCISE_GROUP_DICTIONARY;
  const exerciseGroupList = useExerciseGroupList();

  const isExerciseListLoaded = useRef(false);

  const exerciseListFilters = useExerciseListFilters({ store: store });

  const { filterMap, exerciseFilterValues, loadFilterMapFromStore } =
    exerciseListFilters;

  const { filterExerciseGroups, includeSecondaryGroups } = exerciseFilterValues;

  const filteredExercises = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      // Only show exercises whose name or Exercise Group is included in the filterQuery
      // and whose Exercise Group is included in filterExerciseGroups
      return exercises.filter(
        (item) =>
          (item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            item
              .formattedGroupStringPrimary!.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            (showSecondaryGroups &&
              item.formattedGroupStringSecondary
                ?.toLocaleLowerCase()
                .includes(filterQuery.toLocaleLowerCase()))) &&
          (!filterMap.has("exercise-groups") ||
            DoesListOrSetHaveCommonElement(
              filterExerciseGroups,
              item.exerciseGroupStringSetPrimary
            ) ||
            (includeSecondaryGroups &&
              DoesListOrSetHaveCommonElement(
                filterExerciseGroups,
                item.exerciseGroupStringMapSecondary
              )))
      );
    }
    return exercises;
  }, [
    exercises,
    filterQuery,
    filterMap,
    filterExerciseGroups,
    showSecondaryGroups,
    includeSecondaryGroups,
  ]);

  const paginatedExercises = useMemo(() => {
    const start = (paginationPage - 1) * PAGE_SIZE;
    return filteredExercises.slice(start, start + PAGE_SIZE);
  }, [filteredExercises, paginationPage]);

  const totalPaginationPages = Math.ceil(filteredExercises.length / PAGE_SIZE);

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
    const exerciseGroupSet = new Set<string>();

    const exerciseGroups = exerciseGroupsString.split(",");

    for (const group of exerciseGroups) {
      if (exerciseGroupDictionary.has(group)) {
        exerciseGroupSet.add(group);
      }
    }

    const exerciseGroupList = Array.from(exerciseGroupSet);

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

    setShowSecondaryGroups(!!userSettings.show_secondary_exercise_groups);

    await loadFilterMapFromStore(
      exerciseGroupDictionary,
      loadExerciseGroupsString
    );

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
    filterQuery,
    setFilterQuery,
    filteredExercises,
    toggleFavorite,
    handleSortOptionSelection,
    sortCategory,
    exerciseGroupList,
    sortExercisesByActiveCategory,
    showSecondaryGroups,
    setShowSecondaryGroups,
    isExerciseListLoaded,
    exerciseMap,
    exerciseGroupDictionary,
    loadExercisesString,
    loadExerciseGroupsString,
    loadExerciseList,
    exerciseListFilters,
    paginationPage,
    setPaginationPage,
    paginatedExercises,
    totalPaginationPages,
  };
};

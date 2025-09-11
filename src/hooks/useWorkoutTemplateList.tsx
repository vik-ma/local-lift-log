import {
  WorkoutTemplate,
  UseWorkoutTemplateListReturnType,
  WorkoutTemplateSortCategory,
  UseExerciseListReturnType,
  WorkoutTemplateMap,
  StoreRef,
  UserSettings,
  StoreFilterMapKey,
} from "../typings";
import { useState, useRef, useMemo } from "react";
import { useDisclosure } from "@heroui/react";
import Database from "@tauri-apps/plugin-sql";
import {
  CreateExerciseSetIds,
  DoesListOrSetHaveCommonElement,
  GetSortCategoryFromStore,
} from "../helpers";
import { useListFilters } from ".";

type UseWorkoutTemplateListProps = {
  store: StoreRef;
  useExerciseList: UseExerciseListReturnType;
  ignoreEmptyWorkoutTemplates?: boolean;
  workoutTemplateIdToIgnore?: number;
};

export const useWorkoutTemplateList = ({
  store,
  useExerciseList,
  ignoreEmptyWorkoutTemplates,
  workoutTemplateIdToIgnore,
}: UseWorkoutTemplateListProps): UseWorkoutTemplateListReturnType => {
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<WorkoutTemplateSortCategory>("name");
  const workoutTemplateMap = useRef<WorkoutTemplateMap>(new Map());

  const isWorkoutTemplateListLoaded = useRef(false);

  const workoutTemplateListModal = useDisclosure();

  const {
    exerciseGroupDictionary,
    isExerciseListLoaded,
    loadExerciseList,
    exerciseMap,
  } = useExerciseList;

  const listFilters = useListFilters({
    store: store,
    filterMapSuffix: "workout-templates",
    useExerciseList,
  });

  const { filterMap, listFilterValues, loadFilterMapFromStore } = listFilters;

  const {
    filterExercises,
    filterExerciseGroups,
    includeSecondaryExerciseGroups,
  } = listFilterValues;

  const filterWorkoutTemplateListModal = useDisclosure();

  const filteredWorkoutTemplates = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return workoutTemplates.filter(
        (item) =>
          (item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            (item.note !== null &&
              item.note
                .toLocaleLowerCase()
                .includes(filterQuery.toLocaleLowerCase()))) &&
          (!filterMap.has("exercises") ||
            DoesListOrSetHaveCommonElement(
              filterExercises,
              item.exerciseIdSet
            )) &&
          (!filterMap.has("exercise-groups") ||
            DoesListOrSetHaveCommonElement(
              filterExerciseGroups,
              item.exerciseGroupSetPrimary
            ) ||
            (includeSecondaryExerciseGroups &&
              DoesListOrSetHaveCommonElement(
                filterExerciseGroups,
                item.exerciseGroupSetSecondary
              )))
      );
    }
    return workoutTemplates;
  }, [
    workoutTemplates,
    filterQuery,
    filterMap,
    filterExercises,
    filterExerciseGroups,
    includeSecondaryExerciseGroups,
  ]);

  const getWorkoutTemplates = async (category: WorkoutTemplateSortCategory) => {
    if (!isExerciseListLoaded.current) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get all columns and how many Sets and Exercises every WorkoutTemplate contains
      const result = await db.select<WorkoutTemplate[]>(
        `SELECT 
          workout_templates.*, 
          json_group_array(DISTINCT exercise_id) AS exerciseIdList,
          (SELECT COUNT(*) 
            FROM sets 
            WHERE sets.workout_template_id = workout_templates.id AND sets.is_template = 1) AS numSets
        FROM 
          workout_templates
        LEFT JOIN 
          (SELECT DISTINCT workout_template_id, exercise_id
            FROM sets 
            WHERE is_template = 1) AS distinct_sets
        ON 
          workout_templates.id = distinct_sets.workout_template_id
        GROUP BY 
          workout_templates.id`
      );

      const workoutTemplates: WorkoutTemplate[] = [];
      const newWorkoutTemplateMap: WorkoutTemplateMap = new Map();

      for (const row of result) {
        if (
          row.id === workoutTemplateIdToIgnore ||
          (ignoreEmptyWorkoutTemplates && row.numSets === 0)
        )
          continue;

        const exerciseIds = CreateExerciseSetIds(
          row.exerciseIdList,
          exerciseGroupDictionary,
          exerciseMap.current
        );

        const workoutTemplate: WorkoutTemplate = {
          id: row.id,
          name: row.name,
          exercise_order: row.exercise_order,
          note: row.note,
          numSets: row.numSets,
          exerciseIdSet: exerciseIds.exerciseIdSet,
          exerciseGroupSetPrimary: exerciseIds.exerciseGroupSetPrimary,
          exerciseGroupSetSecondary: exerciseIds.exerciseGroupSetSecondary,
        };

        workoutTemplates.push(workoutTemplate);
        newWorkoutTemplateMap.set(workoutTemplate.id, workoutTemplate);
      }

      sortWorkoutTemplatesByActiveCategory(workoutTemplates, category);
      workoutTemplateMap.current = newWorkoutTemplateMap;
      isWorkoutTemplateListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  };

  const loadWorkoutTemplateList = async (userSettings: UserSettings) => {
    if (isWorkoutTemplateListLoaded.current) return;

    await loadExerciseList(userSettings);

    const validFilterKeys = new Set<StoreFilterMapKey>([
      "exercises",
      "exercise-groups",
    ]);

    await loadFilterMapFromStore(userSettings, validFilterKeys);

    const workoutTemplateSortCategory = await GetSortCategoryFromStore(
      store,
      "name" as WorkoutTemplateSortCategory,
      "workout-templates"
    );

    await getWorkoutTemplates(workoutTemplateSortCategory);
  };

  const sortWorkoutTemplatesByName = (
    workoutTemplateList: WorkoutTemplate[]
  ) => {
    workoutTemplateList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setWorkoutTemplates(workoutTemplateList);
  };

  const sortWorkoutTemplatesByNumSets = (
    workoutTemplateList: WorkoutTemplate[],
    isAscending: boolean
  ) => {
    workoutTemplateList.sort((a, b) => {
      const aCount = a.numSets !== undefined ? a.numSets : -Infinity;
      const bCount = b.numSets !== undefined ? b.numSets : -Infinity;

      if (bCount !== aCount) {
        const sortKey = isAscending ? aCount - bCount : bCount - aCount;
        return sortKey;
      }

      // Sort names alphabetically if same number of Sets
      return a.name.localeCompare(b.name);
    });

    setWorkoutTemplates(workoutTemplateList);
  };

  const sortWorkoutTemplatesByNumExercises = (
    workoutTemplateList: WorkoutTemplate[],
    isAscending: boolean
  ) => {
    workoutTemplateList.sort((a, b) => {
      const aCount =
        a.exerciseIdSet !== undefined ? a.exerciseIdSet.size : -Infinity;
      const bCount =
        b.exerciseIdSet !== undefined ? b.exerciseIdSet.size : -Infinity;

      if (bCount !== aCount) {
        const sortKey = isAscending ? aCount - bCount : bCount - aCount;
        return sortKey;
      }

      // Sort names alphabetically if same number of Exercises
      return a.name.localeCompare(b.name);
    });

    setWorkoutTemplates(workoutTemplateList);
  };

  const handleSortOptionSelection = async (key: string) => {
    if (store.current === null) return;

    await store.current.set("sort-category-workout-templates", { value: key });

    await sortWorkoutTemplatesByActiveCategory(
      [...workoutTemplates],
      key as WorkoutTemplateSortCategory
    );
  };

  const sortWorkoutTemplatesByActiveCategory = async (
    workoutTemplateList: WorkoutTemplate[],
    newCategory?: WorkoutTemplateSortCategory
  ) => {
    if (store.current === null) return;

    if (newCategory !== undefined) {
      setSortCategory(newCategory);
    }

    const activeCategory = newCategory ?? sortCategory;

    const isAscending = true;

    switch (activeCategory) {
      case "name":
        sortWorkoutTemplatesByName([...workoutTemplateList]);
        break;
      case "num-sets-asc":
        sortWorkoutTemplatesByNumSets([...workoutTemplateList], isAscending);
        break;
      case "num-sets-desc":
        sortWorkoutTemplatesByNumSets([...workoutTemplateList], !isAscending);
        break;
      case "num-exercises-asc":
        sortWorkoutTemplatesByNumExercises(
          [...workoutTemplateList],
          isAscending
        );
        break;
      case "num-exercises-desc":
        sortWorkoutTemplatesByNumExercises(
          [...workoutTemplateList],
          !isAscending
        );
        break;
      default:
        // Overwrite invalid categories
        setSortCategory("name");
        await store.current.set("sort-category-workout-templates", {
          value: "name",
        });
        sortWorkoutTemplatesByName([...workoutTemplateList]);
        break;
    }
  };

  const handleOpenFilterButton = async (userSettings: UserSettings) => {
    filterWorkoutTemplateListModal.onOpen();

    await loadWorkoutTemplateList(userSettings);
  };

  const handleOpenWorkoutTemplateListModal = async (
    userSettings: UserSettings | undefined
  ) => {
    if (userSettings === undefined) return;

    workoutTemplateListModal.onOpen();

    await loadWorkoutTemplateList(userSettings);
  };

  const loadFilterWorkoutTemplatesString = async (
    workoutTemplatesString: string
  ) => {
    const workoutTemplateIdSet = new Set<number>();

    const workoutTemplateIds = workoutTemplatesString.split(",");

    for (const workoutTemplateId of workoutTemplateIds) {
      const id = Number(workoutTemplateId);
      if (workoutTemplateMap.current.has(id)) {
        workoutTemplateIdSet.add(id);
      }
    }

    return workoutTemplateIdSet;
  };

  return {
    workoutTemplateListModal,
    workoutTemplates,
    setWorkoutTemplates,
    handleOpenWorkoutTemplateListModal,
    filterQuery,
    setFilterQuery,
    filteredWorkoutTemplates,
    handleSortOptionSelection,
    sortCategory,
    filterWorkoutTemplateListModal,
    handleOpenFilterButton,
    listFilters,
    workoutTemplateMap,
    isWorkoutTemplateListLoaded,
    sortWorkoutTemplatesByActiveCategory,
    loadWorkoutTemplateList,
    loadFilterWorkoutTemplatesString,
  };
};

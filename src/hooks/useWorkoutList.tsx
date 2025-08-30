import { useState, useRef, useMemo } from "react";
import {
  StoreFilterMapKey,
  StoreRef,
  UseExerciseListReturnType,
  UserSettings,
  UseWorkoutListReturnType,
  Workout,
  WorkoutSortCategory,
} from "../typings";
import Database from "@tauri-apps/plugin-sql";
import {
  CreateExerciseSetIds,
  CreateShownPropertiesSet,
  DoesListOrSetHaveCommonElement,
  FormatDateString,
  GetSortCategoryFromStore,
  IsDateInWeekdaySet,
  IsDateWithinLimit,
} from "../helpers";
import { useDisclosure } from "@heroui/react";
import { useListFilters, useRoutineList, useWorkoutTemplateList } from ".";

type UseWorkoutListProps = {
  store: StoreRef;
  useExerciseList: UseExerciseListReturnType;
  ignoreEmptyWorkouts?: boolean;
  workoutIdToIgnore?: number;
};

export const useWorkoutList = ({
  store,
  useExerciseList,
  ignoreEmptyWorkouts,
  workoutIdToIgnore,
}: UseWorkoutListProps): UseWorkoutListReturnType => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<WorkoutSortCategory>("date-desc");
  const [selectedWorkoutProperties, setSelectedWorkoutProperties] = useState<
    Set<string>
  >(new Set());

  const { exerciseGroupDictionary, loadExerciseList, exerciseMap } =
    useExerciseList;

  const workoutTemplateList = useWorkoutTemplateList({
    store: store,
    useExerciseList: useExerciseList,
    ignoreEmptyWorkoutTemplates: true,
  });

  const { loadWorkoutTemplateList, workoutTemplateMap } = workoutTemplateList;

  const routineList = useRoutineList({
    store: store,
    useExerciseList: useExerciseList,
    useWorkoutTemplateList: workoutTemplateList,
  });

  const { routineMap, loadRoutineList } = routineList;

  const listFilters = useListFilters({
    store: store,
    filterMapSuffix: "workouts",
    useExerciseList,
    useRoutineList: routineList,
    useWorkoutTemplateList: workoutTemplateList,
  });

  const { filterMap, listFilterValues, loadFilterMapFromStore } = listFilters;

  const {
    filterMinDate,
    filterMaxDate,
    filterWeekdays,
    filterRoutines,
    filterExercises,
    filterExerciseGroups,
    filterWorkoutTemplates,
    includeSecondaryExerciseGroups,
  } = listFilterValues;

  const isWorkoutListLoaded = useRef(false);
  const workoutListHasEmptyWorkouts = useRef(false);

  const workoutListModal = useDisclosure();
  const filterWorkoutListModal = useDisclosure();

  const filteredWorkouts = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return workouts.filter(
        (item) =>
          (item.formattedDate
            ?.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            item.comment
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            item.workoutTemplate?.name
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            item.routine?.name
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) &&
          (!filterMap.has("min-date") ||
            IsDateWithinLimit(item.date, filterMinDate, false)) &&
          (!filterMap.has("max-date") ||
            IsDateWithinLimit(item.date, filterMaxDate, true)) &&
          (!filterMap.has("weekdays") ||
            IsDateInWeekdaySet(item.date, filterWeekdays)) &&
          (!filterMap.has("routines") || filterRoutines.has(item.routine_id)) &&
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
              ))) &&
          (!filterMap.has("workout-templates") ||
            filterWorkoutTemplates.has(item.workout_template_id))
      );
    }
    return workouts;
  }, [
    workouts,
    filterQuery,
    filterMap,
    filterMinDate,
    filterMaxDate,
    filterWeekdays,
    filterRoutines,
    filterExercises,
    filterExerciseGroups,
    includeSecondaryExerciseGroups,
    filterWorkoutTemplates,
  ]);

  const getWorkouts = async (category: WorkoutSortCategory) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get all columns for Workout, number of Sets and simplified list of Exercises for every Workout
      // Also get name of Workout Template from workout_template_id
      const resultWorkouts = await db.select<Workout[]>(
        `SELECT 
          workouts.*,
          json_group_array(DISTINCT exercise_id) AS exerciseIdList,
          (SELECT COUNT(*) 
            FROM sets 
            WHERE sets.workout_id = workouts.id AND sets.is_template = 0) AS numSets
        FROM 
          workouts
        LEFT JOIN 
          (SELECT DISTINCT workout_id, exercise_id
          FROM sets
          WHERE is_template = 0) AS distinct_sets
        ON 
          workouts.id = distinct_sets.workout_id
        GROUP BY 
          workouts.id`
      );

      const workouts: Workout[] = [];

      for (const row of resultWorkouts) {
        if (
          row.id === workoutIdToIgnore ||
          (ignoreEmptyWorkouts && row.numSets === 0)
        )
          continue;

        if (row.numSets === 0) {
          workoutListHasEmptyWorkouts.current = true;
        }

        const formattedDate = FormatDateString(row.date);

        const exerciseIds = CreateExerciseSetIds(
          row.exerciseIdList,
          exerciseGroupDictionary,
          exerciseMap.current
        );

        const workout: Workout = {
          id: row.id,
          workout_template_id: row.workout_template_id,
          date: row.date,
          exercise_order: row.exercise_order,
          comment: row.comment,
          routine_id: row.routine_id,
          numSets: row.numSets,
          formattedDate: formattedDate,
          workoutTemplate: workoutTemplateMap.current.get(
            row.workout_template_id
          ),
          hasInvalidWorkoutTemplate:
            row.workout_template_id !== 0 &&
            !workoutTemplateMap.current.has(row.workout_template_id),
          routine: routineMap.current.get(row.routine_id),
          hasInvalidRoutine:
            row.routine_id !== 0 && !routineMap.current.has(row.routine_id),
          exerciseIdSet: exerciseIds.exerciseIdSet,
          exerciseGroupSetPrimary: exerciseIds.exerciseGroupSetPrimary,
          exerciseGroupSetSecondary: exerciseIds.exerciseGroupSetSecondary,
        };

        workouts.push(workout);
      }

      await sortWorkoutsByActiveCategory(workouts, category);
      isWorkoutListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  };

  const loadWorkoutList = async (userSettings: UserSettings) => {
    if (isWorkoutListLoaded.current) return;

    await loadExerciseList(userSettings);

    await loadWorkoutTemplateList(userSettings);

    await loadRoutineList(userSettings);

    const workoutPropertySet = CreateShownPropertiesSet(
      userSettings.shown_workout_properties,
      "workout"
    );

    setSelectedWorkoutProperties(workoutPropertySet);

    const validFilterKeys = new Set<StoreFilterMapKey>([
      "min-date",
      "max-date",
      "weekdays",
      "routines",
      "exercises",
      "exercise-groups",
      "workout-templates",
    ]);

    await loadFilterMapFromStore(userSettings, validFilterKeys);

    const workoutSortCategory = await GetSortCategoryFromStore(
      store,
      "name" as WorkoutSortCategory,
      "workouts"
    );

    await getWorkouts(workoutSortCategory);
  };

  const sortWorkoutsByDate = (workoutList: Workout[], isAscending: boolean) => {
    if (isAscending) {
      workoutList.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      workoutList.sort((a, b) => b.date.localeCompare(a.date));
    }

    setWorkouts(workoutList);
  };

  const sortWorkoutsByNumSets = (
    workoutList: Workout[],
    isAscending: boolean
  ) => {
    workoutList.sort((a, b) => {
      const aCount = a.numSets !== undefined ? a.numSets : -Infinity;
      const bCount = b.numSets !== undefined ? b.numSets : -Infinity;

      if (bCount !== aCount) {
        const sortKey = isAscending ? aCount - bCount : bCount - aCount;
        return sortKey;
      }

      // Sort by latest date first if same number of Sets
      return b.date.localeCompare(a.date);
    });

    setWorkouts(workoutList);
  };

  const sortWorkoutsByNumExercises = (
    workoutList: Workout[],
    isAscending: boolean
  ) => {
    workoutList.sort((a, b) => {
      const aCount =
        a.exerciseIdSet !== undefined ? a.exerciseIdSet.size : -Infinity;
      const bCount =
        b.exerciseIdSet !== undefined ? b.exerciseIdSet.size : -Infinity;

      if (bCount !== aCount) {
        const sortKey = isAscending ? aCount - bCount : bCount - aCount;
        return sortKey;
      }

      // Sort by latest date first if same number of Exercises
      return b.date.localeCompare(a.date);
    });

    setWorkouts(workoutList);
  };

  const handleSortOptionSelection = async (key: string) => {
    if (store.current === null) return;

    await store.current.set("sort-category-workouts", { value: key });

    await sortWorkoutsByActiveCategory(
      [...workouts],
      key as WorkoutSortCategory
    );
  };

  const sortWorkoutsByActiveCategory = async (
    workoutList: Workout[],
    newCategory?: WorkoutSortCategory
  ) => {
    if (store.current === null) return;

    if (newCategory !== undefined) {
      setSortCategory(newCategory);
    }

    const activeCategory = newCategory ?? sortCategory;

    const isAscending = true;

    switch (activeCategory) {
      case "date-asc":
        sortWorkoutsByDate([...workoutList], isAscending);
        break;
      case "date-desc":
        sortWorkoutsByDate([...workoutList], !isAscending);
        break;
      case "num-sets-asc":
        sortWorkoutsByNumSets([...workoutList], isAscending);
        break;
      case "num-sets-desc":
        sortWorkoutsByNumSets([...workoutList], !isAscending);
        break;
      case "num-exercises-asc":
        sortWorkoutsByNumExercises([...workoutList], isAscending);
        break;
      case "num-exercises-desc":
        sortWorkoutsByNumExercises([...workoutList], !isAscending);
        break;
      default:
        // Overwrite invalid categories
        setSortCategory("date-desc");
        await store.current.set("sort-category-workouts", {
          value: "date-desc",
        });
        sortWorkoutsByDate([...workoutList], !isAscending);
        break;
    }
  };
  const handleOpenFilterButton = async (userSettings: UserSettings) => {
    filterWorkoutListModal.onOpen();

    await loadWorkoutList(userSettings);
  };

  const handleOpenWorkoutListModal = async (
    userSettings: UserSettings | undefined
  ) => {
    if (userSettings === undefined) return;

    workoutListModal.onOpen();

    await loadWorkoutList(userSettings);
  };

  return {
    workouts,
    setWorkouts,
    handleOpenWorkoutListModal,
    workoutListModal,
    filteredWorkouts,
    filterQuery,
    setFilterQuery,
    sortWorkoutsByActiveCategory,
    sortCategory,
    handleSortOptionSelection,
    filterWorkoutListModal,
    handleOpenFilterButton,
    routineList,
    listFilters,
    workoutTemplateList,
    isWorkoutListLoaded,
    workoutListHasEmptyWorkouts,
    loadWorkoutList,
    selectedWorkoutProperties,
    setSelectedWorkoutProperties,
  };
};

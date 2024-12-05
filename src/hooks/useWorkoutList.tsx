import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  UseExerciseListReturnType,
  UseWorkoutListReturnType,
  Workout,
  WorkoutSortCategory,
} from "../typings";
import Database from "tauri-plugin-sql-api";
import {
  CreateWorkoutExerciseSets,
  DoesListOrSetHaveCommonElement,
  FormatDateString,
  IsDateInWeekdaySet,
  IsDateWithinRange,
} from "../helpers";
import { useDisclosure } from "@nextui-org/react";
import { useListFilters, useRoutineList, useWorkoutTemplateList } from ".";

export const useWorkoutList = (
  getWorkoutsOnLoad: boolean,
  useExerciseList: UseExerciseListReturnType,
  ignoreEmptyWorkouts?: boolean,
  ignoreWorkoutId?: number
): UseWorkoutListReturnType => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<WorkoutSortCategory>("date-desc");

  const {
    exerciseGroupDictionary,
    includeSecondaryGroups,
    isExerciseListLoaded,
    getExercises,
    exerciseMap,
  } = useExerciseList;

  const workoutTemplateList = useWorkoutTemplateList(
    getWorkoutsOnLoad,
    useExerciseList,
    true
  );

  const {
    isWorkoutTemplateListLoaded,
    getWorkoutTemplates,
    workoutTemplateMap,
  } = workoutTemplateList;

  const routineList = useRoutineList(getWorkoutsOnLoad, workoutTemplateList);

  const { routineMap, isRoutineListLoaded, getRoutines } = routineList;

  const listFilters = useListFilters(
    useExerciseList,
    routineMap.current,
    undefined,
    workoutTemplateMap.current
  );

  const {
    filterDateRange,
    filterMap,
    filterWeekdays,
    filterRoutines,
    filterExercises,
    filterExerciseGroups,
    filterWorkoutTemplates,
  } = listFilters;

  const isWorkoutListLoaded = useRef(false);

  const workoutListModal = useDisclosure();
  const filterWorkoutListModal = useDisclosure();

  const filteredWorkouts = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return workouts.filter(
        (item) =>
          (item.formattedDate
            ?.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            item.note
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            item.workoutTemplate?.name
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            item.routine?.name
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) &&
          (!filterMap.has("dates") ||
            IsDateWithinRange(item.date, filterDateRange)) &&
          (!filterMap.has("weekdays") ||
            IsDateInWeekdaySet(item.date, filterWeekdays)) &&
          (!filterMap.has("routines") || filterRoutines.has(item.routine_id)) &&
          (!filterMap.has("exercises") ||
            DoesListOrSetHaveCommonElement(
              filterExercises,
              item.exerciseIdSet
            )) &&
          (!filterMap.has("exercise-groups") ||
            (!includeSecondaryGroups &&
              DoesListOrSetHaveCommonElement(
                filterExerciseGroups,
                item.exerciseGroupSetPrimary
              )) ||
            (includeSecondaryGroups &&
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
    filterDateRange,
    filterWeekdays,
    filterRoutines,
    filterExercises,
    filterExerciseGroups,
    includeSecondaryGroups,
    filterWorkoutTemplates,
  ]);

  const getWorkouts = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get all columns for Workout, number of Sets and simplified list of Exercises for every Workout
      // Also get name of Workout Template from workout_template_id
      const resultWorkouts = await db.select<Workout[]>(
        `SELECT 
          workouts.*,
          json_group_array(
              DISTINCT json_object('id', exercise_id)
          ) AS exerciseListString,
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
          row.id === ignoreWorkoutId ||
          (ignoreEmptyWorkouts && row.numSets === 0)
        )
          continue;

        const formattedDate = FormatDateString(row.date);

        const workoutExerciseSets = CreateWorkoutExerciseSets(
          row.exerciseListString,
          exerciseGroupDictionary,
          exerciseMap.current
        );

        const workout: Workout = {
          id: row.id,
          workout_template_id: row.workout_template_id,
          date: row.date,
          exercise_order: row.exercise_order,
          note: row.note,
          rating_general: row.rating_general,
          rating_energy: row.rating_energy,
          rating_injury: row.rating_injury,
          rating_sleep: row.rating_sleep,
          rating_calories: row.rating_calories,
          rating_fasting: row.rating_fasting,
          rating_time: row.rating_time,
          rating_stress: row.rating_stress,
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
          exerciseIdSet: workoutExerciseSets.exerciseIdSet,
          exerciseGroupSetPrimary: workoutExerciseSets.exerciseGroupSetPrimary,
          exerciseGroupSetSecondary:
            workoutExerciseSets.exerciseGroupSetSecondary,
        };

        workouts.push(workout);
      }

      sortWorkoutsByDate(workouts, false);
      isWorkoutListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, [
    ignoreEmptyWorkouts,
    ignoreWorkoutId,
    routineMap,
    exerciseGroupDictionary,
    workoutTemplateMap,
    exerciseMap,
  ]);

  const loadWorkoutList = useCallback(async () => {
    if (!isExerciseListLoaded.current) {
      await getExercises();
    }

    if (!isWorkoutTemplateListLoaded.current) {
      await getWorkoutTemplates();
    }

    if (!isRoutineListLoaded.current) {
      await getRoutines();
    }

    if (!isWorkoutListLoaded.current) {
      await getWorkouts();
    }
  }, [
    isExerciseListLoaded,
    isWorkoutTemplateListLoaded,
    isRoutineListLoaded,
    isWorkoutListLoaded,
    getExercises,
    getWorkoutTemplates,
    getRoutines,
    getWorkouts,
  ]);

  useEffect(() => {
    if (getWorkoutsOnLoad) {
      loadWorkoutList();
    }
  }, [getWorkoutsOnLoad, loadWorkoutList]);

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

      // Sort by newest date first if same number of Sets
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

      // Sort by newest date first if same number of Exercises
      return b.date.localeCompare(a.date);
    });

    setWorkouts(workoutList);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "date-desc") {
      setSortCategory(key);
      sortWorkoutsByDate([...workouts], false);
    } else if (key === "date-asc") {
      setSortCategory(key);
      sortWorkoutsByDate([...workouts], true);
    } else if (key === "num-sets-desc") {
      setSortCategory(key);
      sortWorkoutsByNumSets([...workouts], false);
    } else if (key === "num-sets-asc") {
      setSortCategory(key);
      sortWorkoutsByNumSets([...workouts], true);
    } else if (key === "num-exercises-desc") {
      setSortCategory(key);
      sortWorkoutsByNumExercises([...workouts], false);
    } else if (key === "num-exercises-asc") {
      setSortCategory(key);
      sortWorkoutsByNumExercises([...workouts], true);
    }
  };

  const handleOpenFilterButton = async () => {
    await loadWorkoutList();

    filterWorkoutListModal.onOpen();
  };

  const handleOpenWorkoutListModal = async () => {
    await loadWorkoutList();

    workoutListModal.onOpen();
  };

  return {
    workouts,
    setWorkouts,
    getWorkouts,
    handleOpenWorkoutListModal,
    workoutListModal,
    filteredWorkouts,
    filterQuery,
    setFilterQuery,
    sortWorkoutsByDate,
    sortCategory,
    setSortCategory,
    handleSortOptionSelection,
    filterWorkoutListModal,
    handleOpenFilterButton,
    routineList,
    listFilters,
    workoutTemplateList,
    isWorkoutListLoaded,
  };
};

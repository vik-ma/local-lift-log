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
import { useListFilters, useRoutineList } from ".";

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

  const exerciseGroupDictionary = useExerciseList.exerciseGroupDictionary;

  const routineList = useRoutineList(true);

  const listFilters = useListFilters(useExerciseList, routineList);

  const {
    handleFilterSaveButton,
    filterDateRange,
    setFilterDateRange,
    filterMap,
    removeFilter,
    resetFilter,
    showResetFilterButton,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
    filterRoutines,
    setFilterRoutines,
    filterExercises,
    setFilterExercises,
    filterExerciseGroups,
    setFilterExerciseGroups,
    includeSecondaryGroups,
    setIncludeSecondaryGroups,
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
            item.workoutTemplateName
              ?.toLocaleLowerCase()
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
              )))
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
  ]);

  const getWorkouts = useCallback(async () => {
    if (!routineList.isRoutineListLoaded.current) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get all columns for Workout, number of Sets and simplified list of Exercises for every Workout
      // Also get name of Workout Template from workout_template_id
      const resultWorkouts = await db.select<Workout[]>(
        `SELECT 
          workouts.*, 
          workout_templates.name AS workoutTemplateName,
          json_group_array(
            json_object(
              'id', COALESCE(exercises.id, distinct_sets.exercise_id),
              'exercise_group_set_string_primary', exercises.exercise_group_set_string_primary,
              'exercise_group_set_string_secondary', exercises.exercise_group_set_string_secondary
            )
          ) AS exerciseListString,
          (SELECT COUNT(*) 
            FROM sets 
              WHERE sets.workout_id = workouts.id AND sets.is_template = 0) AS numSets
          FROM 
            workouts
          LEFT JOIN 
            (SELECT DISTINCT exercise_id, workout_id FROM sets WHERE is_template = 0) AS distinct_sets
            ON workouts.id = distinct_sets.workout_id
          LEFT JOIN 
            exercises ON distinct_sets.exercise_id = exercises.id
          LEFT JOIN 
            workout_templates ON workouts.workout_template_id = workout_templates.id
          GROUP BY 
            workouts.id;`
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
          exerciseGroupDictionary
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
          workoutTemplateName: row.workoutTemplateName,
          hasInvalidWorkoutTemplate:
            row.workout_template_id > 0 && row.workoutTemplateName === null,
          routine: routineList.routineMap.get(row.routine_id),
          hasInvalidRoutine:
            row.routine_id !== 0 && !routineList.routineMap.has(row.routine_id),
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
    routineList.routineMap,
    routineList.isRoutineListLoaded,
    exerciseGroupDictionary,
  ]);

  useEffect(() => {
    if (getWorkoutsOnLoad) {
      getWorkouts();
    }
  }, [getWorkoutsOnLoad, getWorkouts]);

  const sortWorkoutsByDate = (workoutList: Workout[], isAscending: boolean) => {
    if (isAscending) {
      workoutList.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      workoutList.sort((a, b) => b.date.localeCompare(a.date));
    }

    setWorkouts(workoutList);
  };

  const handleOpenWorkoutListModal = useCallback(() => {
    if (!isWorkoutListLoaded.current) {
      getWorkouts();
    }

    workoutListModal.onOpen();
  }, [workoutListModal, getWorkouts]);

  const handleSortOptionSelection = (key: string) => {
    if (key === "date-desc") {
      setSortCategory(key);
      sortWorkoutsByDate([...workouts], false);
    } else if (key === "date-asc") {
      setSortCategory(key);
      sortWorkoutsByDate([...workouts], true);
    }
  };

  const handleOpenFilterButton = async () => {
    if (!useExerciseList.isExerciseListLoaded.current) {
      await useExerciseList.getExercises();
    }

    filterWorkoutListModal.onOpen();
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
    handleFilterSaveButton,
    filterDateRange,
    setFilterDateRange,
    filterMap,
    removeFilter,
    resetFilter,
    showResetFilterButton,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
    filterRoutines,
    setFilterRoutines,
    filterExercises,
    setFilterExercises,
    routineList,
    filterExerciseGroups,
    setFilterExerciseGroups,
    includeSecondaryGroups,
    setIncludeSecondaryGroups,
    listFilters,
  };
};

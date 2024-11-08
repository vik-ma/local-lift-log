import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Routine,
  UseWorkoutListReturnType,
  Workout,
  WorkoutSortCategory,
} from "../typings";
import Database from "tauri-plugin-sql-api";
import { FormatDateString } from "../helpers";
import { useDisclosure } from "@nextui-org/react";

export const useWorkoutList = (
  getWorkoutsOnLoad: boolean,
  ignoreEmptyWorkouts?: boolean,
  ignoreWorkoutId?: number
): UseWorkoutListReturnType => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<WorkoutSortCategory>("date-desc");
  const [routineMap, setRoutineMap] = useState<Map<number, Routine>>(new Map());

  const workoutListIsLoaded = useRef(false);

  const workoutListModal = useDisclosure();

  const filteredWorkouts = useMemo(() => {
    if (filterQuery !== "") {
      return workouts.filter(
        (item) =>
          item.formattedDate
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
            .includes(filterQuery.toLocaleLowerCase())
      );
    }
    return workouts;
  }, [workouts, filterQuery]);

  const getWorkouts = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get id, date and how many Sets and Exercises every Workout contains
      // Also get name of Workout Template from workout_template_id
      const resultWorkouts = await db.select<Workout[]>(
        `SELECT 
          workouts.*, 
          workout_templates.name AS workoutTemplateName,
          COUNT(DISTINCT CASE WHEN is_template = 0 THEN sets.exercise_id END) AS numExercises,
          SUM(CASE WHEN is_template = 0 THEN 1 ELSE 0 END) AS numSets
        FROM 
          workouts
        LEFT JOIN 
          sets ON workouts.id = sets.workout_id
        LEFT JOIN 
          workout_templates ON workouts.workout_template_id = workout_templates.id
        GROUP BY 
          workouts.id`
      );

      const resultRoutines = await db.select<Routine[]>(
        "SELECT * FROM routines"
      );

      const routineMap = new Map<number, Routine>(
        resultRoutines.map((obj) => [obj.id, obj])
      );

      const workouts: Workout[] = [];

      for (const row of resultWorkouts) {
        if (
          row.id === ignoreWorkoutId ||
          (ignoreEmptyWorkouts && row.numSets === 0)
        )
          continue;

        const formattedDate = FormatDateString(row.date);

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
          numExercises: row.numExercises,
          formattedDate: formattedDate,
          workoutTemplateName: row.workoutTemplateName,
          hasInvalidWorkoutTemplate:
            row.workout_template_id > 0 && row.workoutTemplateName === null,
          routine: routineMap.get(row.routine_id),
        };

        workouts.push(workout);
      }

      setRoutineMap(routineMap);
      sortWorkoutsByDate(workouts, false);
      workoutListIsLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, [ignoreEmptyWorkouts, ignoreWorkoutId]);

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
    if (!workoutListIsLoaded.current) {
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
    routineMap,
  };
};

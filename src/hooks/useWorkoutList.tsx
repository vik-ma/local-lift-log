import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  UseWorkoutListReturnType,
  Workout,
  WorkoutSortCategory,
} from "../typings";
import Database from "tauri-plugin-sql-api";
import { FormatYmdDateString } from "../helpers";
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
            .includes(filterQuery.toLocaleLowerCase())
      );
    }
    return workouts;
  }, [workouts, filterQuery]);

  const getWorkouts = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get id, date, rating and how many Sets and Exercises every Workout contains
      const result = await db.select<Workout[]>(
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

      const workouts: Workout[] = [];

      for (const row of result) {
        if (
          row.id === ignoreWorkoutId ||
          (ignoreEmptyWorkouts && row.numSets === 0)
        )
          continue;

        const formattedDate = FormatYmdDateString(row.date);

        const workout: Workout = {
          id: row.id,
          workout_template_id: row.workout_template_id,
          date: row.date,
          exercise_order: row.exercise_order,
          note: row.note,
          rating: row.rating,
          numSets: row.numSets,
          numExercises: row.numExercises,
          formattedDate: formattedDate,
          workoutTemplateName: row.workoutTemplateName,
        };

        workouts.push(workout);
      }

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
  };
};

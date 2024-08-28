import { useState, useEffect, useCallback, useRef } from "react";
import { UseWorkoutListReturnType, Workout } from "../typings";
import Database from "tauri-plugin-sql-api";
import { FormatYmdDateString } from "../helpers";
import { useDisclosure } from "@nextui-org/react";

export const useWorkoutList = (
  getWorkoutsOnLoad: boolean,
  ignoreEmptyWorkouts?: boolean,
  ignoreWorkoutId?: number
): UseWorkoutListReturnType => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showNewestFirst, setShowNewestFirst] = useState<boolean>(false);

  const workoutListIsLoaded = useRef(false);

  const workoutListModal = useDisclosure();

  const getWorkouts = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get id, date, rating and how many Sets and Exercises every Workout contains
      const result = await db.select<Workout[]>(
        `SELECT workouts.*, 
        COUNT(DISTINCT CASE WHEN is_template = 0 THEN sets.exercise_id END) AS numExercises,
        SUM(CASE WHEN is_template = 0 THEN 1 ELSE 0 END) AS numSets
        FROM workouts LEFT JOIN sets 
        ON workouts.id = sets.workout_id 
        GROUP BY workouts.id`
      );

      const workouts: Workout[] = [];

      for (const row of result) {
        if (
          row.id === ignoreWorkoutId ||
          (ignoreEmptyWorkouts && row.numSets === 0)
        )
          continue;

        const formattedDate: string = FormatYmdDateString(row.date);

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
        };

        workouts.push(workout);
      }

      setWorkouts(workouts);
    } catch (error) {
      console.log(error);
    }
  }, [ignoreEmptyWorkouts, ignoreWorkoutId]);

  useEffect(() => {
    if (getWorkoutsOnLoad) {
      getWorkouts();
    }
  }, [getWorkoutsOnLoad, getWorkouts]);

  const reverseWorkoutList = () => {
    const reversedWorkouts = [...workouts].reverse();

    setWorkouts(reversedWorkouts);

    setShowNewestFirst(!showNewestFirst);
  };

  const handleOpenWorkoutListModal = useCallback(() => {
    if (!workoutListIsLoaded.current) {
      getWorkouts();
      workoutListIsLoaded.current = true;
    }

    workoutListModal.onOpen();
  }, [workoutListModal, getWorkouts]);

  return {
    workouts,
    setWorkouts,
    showNewestFirst,
    reverseWorkoutList,
    getWorkouts,
    handleOpenWorkoutListModal,
    workoutListModal,
  };
};

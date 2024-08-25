import { useState, useEffect, useCallback } from "react";
import { UseWorkoutListReturnType, Workout } from "../typings";
import Database from "tauri-plugin-sql-api";
import { FormatYmdDateString } from "../helpers";

export const useWorkoutList = (
  getWorkoutsOnLoad: boolean
): UseWorkoutListReturnType => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showNewestFirst, setShowNewestFirst] = useState<boolean>(false);

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

      const workouts: Workout[] = result.map((row) => {
        const formattedDate: string = FormatYmdDateString(row.date);
        return {
          id: row.id,
          workout_template_id: row.workout_template_id,
          date: formattedDate,
          exercise_order: row.exercise_order,
          note: row.note,
          is_loaded: row.is_loaded,
          rating: row.rating,
          numSets: row.numSets,
          numExercises: row.numExercises,
        };
      });

      setWorkouts(workouts);
    } catch (error) {
      console.log(error);
    }
  }, []);

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

  return {
    workouts,
    setWorkouts,
    showNewestFirst,
    reverseWorkoutList,
    getWorkouts,
  };
};

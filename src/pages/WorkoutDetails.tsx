import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Workout, WorkoutSet } from "../typings";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";
import { NotFound } from ".";
import { OrderSetsBySetListOrderString } from "../helpers";

export default function WorkoutDetails() {
  const [workout, setWorkout] = useState<Workout>();
  const [workoutDate, setWorkoutDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sets, setSets] = useState<WorkoutSet[]>([]);

  const { id } = useParams();

  const updateWorkout = useCallback(async (workout: Workout) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute(
        `UPDATE workouts SET 
        workout_template_id = $1, date = $2, set_list_order = $3, note = $4, is_loaded = $5 
        WHERE id = $6`,
        [
          workout.workout_template_id,
          workout.date,
          workout.set_list_order,
          workout.note,
          workout.is_loaded,
          workout.id,
        ]
      );
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Workout[]>(
          "SELECT * FROM workouts WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const workout: Workout = result[0];

        if (workout.is_loaded) {
          const setList = await db.select<WorkoutSet[]>(
            `SELECT sets.*, exercises.name AS exercise_name
            FROM sets 
            JOIN exercises ON sets.exercise_id = exercises.id 
            WHERE workout_id = $1 AND is_template = 0`,
            [id]
          );

          const orderedSetList: WorkoutSet[] = OrderSetsBySetListOrderString(
            setList,
            workout.set_list_order
          );

          setSets(orderedSetList);
        } else {
          if (workout.workout_template_id !== 0) {
            // TODO: Create new sets
          }

          workout.is_loaded = 1;

          await updateWorkout(workout);
        }

        const formattedDate: string = new Date(workout.date).toDateString();

        setWorkout(workout);
        setWorkoutDate(formattedDate);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    loadWorkout();
  }, [id, updateWorkout]);

  if (workout === undefined) return NotFound();

  return (
    <>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex justify-center">
              <h1 className="text-2xl font-semibold">{workoutDate}</h1>
            </div>
          </>
        )}
      </div>
    </>
  );
}

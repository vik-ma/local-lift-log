import { useState, useEffect } from "react";
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
          if (workout.workout_template_id === 0) return;


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
  }, [id]);

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

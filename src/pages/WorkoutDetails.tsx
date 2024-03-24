import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Workout } from "../typings";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";

export default function WorkoutDetails() {
  const [workout, setWorkout] = useState<Workout>();
  const [workoutDate, setWorkoutDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { id } = useParams();

  useEffect(() => {
    const getWorkout = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Workout[]>(
          "SELECT * FROM workouts WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const currentRoutine: Workout = result[0];

        const formattedDate: string = new Date(
          currentRoutine.date
        ).toDateString();

        setWorkout(currentRoutine);
        setWorkoutDate(formattedDate);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getWorkout();
  }, [id]);

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

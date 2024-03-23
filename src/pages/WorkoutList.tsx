import { useState, useEffect } from "react";
import { Workout } from "../typings";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    const getWorkouts = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Workout[]>("SELECT * FROM workouts");

        const workouts: Workout[] = result.map((row) => ({
          id: row.id,
          workout_template_id: row.workout_template_id,
          date: row.date,
          set_list_order: row.set_list_order,
          note: row.note,
        }));

        setWorkouts(workouts);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getWorkouts();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Workout List
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex flex-col gap-1">
            {workouts.map((workout) => (
              <div className="flex flex-row gap-2" key={`${workout.id}`}>
                <span>{workout.id}</span>
                <span>{workout.date}</span>
                <span>{workout.note}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

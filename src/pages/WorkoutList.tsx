import { useState, useEffect } from "react";
import { WorkoutListItem } from "../typings";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";
import { Button } from "@nextui-org/react";

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<WorkoutListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    const getWorkouts = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutListItem[]>(
          "SELECT id, date FROM workouts"
        );

        const workouts: WorkoutListItem[] = result.map((row) => {
          const formattedDate: string = new Date(row.date)
            .toString()
            .substring(0, 15);
          return {
            id: row.id,
            date: formattedDate,
          };
        });

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
          <div className="flex flex-col gap-1.5">
            {workouts.map((workout) => (
              <div className="flex flex-row gap-2" key={`${workout.id}`}>
                <Button
                  className="text-xl font-medium"
                  color="primary"
                  onPress={() => navigate(`/workouts/${workout.id}`)}
                >
                  {workout.date}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

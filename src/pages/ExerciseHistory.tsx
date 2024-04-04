import { useParams } from "react-router-dom";
import { Exercise } from "../typings";
import { useState, useEffect } from "react";
import Database from "tauri-plugin-sql-api";
import { LoadingSpinner } from "../components";

export default function ExerciseHistoryPage() {
  const [exercise, setExercise] = useState<Exercise>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { id } = useParams();

  useEffect(() => {
    const getExercise = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Exercise[]>(
          "SELECT * FROM exercises WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const currentExercise: Exercise = result[0];

        setExercise(currentExercise);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getExercise();
  }, [id]);
  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
            <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
              {exercise?.name}
            </h1>
          </div>
        </>
      )}
    </div>
  );
}

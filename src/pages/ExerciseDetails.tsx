import { useParams } from "react-router-dom";
import { Exercise } from "../typings";
import { useState, useMemo, useEffect } from "react";
import { NotFound } from ".";
import Database from "tauri-plugin-sql-api";

export default function ExerciseDetailsPage() {
  const { id } = useParams();
  const [exercise, setExercise] = useState<Exercise>();

  useEffect(() => {
    const getExercise = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Exercise[]>(
          "SELECT * FROM exercises WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const currentRoutine: Exercise = result[0];
        setExercise(currentRoutine);
      } catch (error) {
        console.log(error);
      }
    };

    getExercise();
  }, [id]);

  if (exercise === undefined) return NotFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
        <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
          {exercise?.name}
        </h1>
      </div>
    </div>
  );
}

import Database from "tauri-plugin-sql-api";
import { useState, useEffect } from "react";
import { Exercise, ExerciseListItem } from "../typings";
import { ConvertExerciseGroupSetString } from "../helpers/Exercises/ConvertExerciseGroupSetString";
import { Button } from "@nextui-org/react";

export default function ExerciseListPage() {
  const [exercises, setExercises] = useState<ExerciseListItem[]>([]);

  useEffect(() => {
    const getExercises = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Exercise[]>(
          "SELECT id, name, exercise_group_set_string FROM exercises"
        );

        const exercises: ExerciseListItem[] = result.map((row) => {
          const convertedValues = ConvertExerciseGroupSetString(
            row.exercise_group_set_string
          );
          return {
            id: row.id,
            name: row.name,
            exercise_group_set: convertedValues.set,
            exercise_group_string: convertedValues.formattedString,
          };
        });

        setExercises(exercises);
      } catch (error) {
        console.log(error);
      }
    };

    getExercises();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Exercise List
          </h1>
        </div>
        <div className="flex flex-col">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex flex-row justify-between rounded-lg px-2 hover:bg-amber-100 p-1"
            >
              <div className="flex flex-col">
                <div className="text-xl">{exercise.name}</div>
                <div className="text-xs text-stone-500">{exercise.exercise_group_string}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button className="font-medium">Edit</Button>
                <Button className="font-medium" color="danger">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

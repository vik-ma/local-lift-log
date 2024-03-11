import { useParams } from "react-router-dom";
import { Exercise } from "../typings";
import { useState, useMemo, useEffect } from "react";
import { NotFound } from ".";
import { Button, Input } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import LoadingSpinner from "../components/LoadingSpinner";
import { ConvertExerciseGroupSetString } from "../helpers/Exercises/ConvertExerciseGroupSetString";

export default function ExerciseDetailsPage() {
  const { id } = useParams();
  const [exercise, setExercise] = useState<Exercise>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [exerciseGroupSet, setExerciseGroupSet] = useState<Set<string>>(
    new Set<string>()
  );
  const [exerciseGroupString, setExerciseGroupString] = useState<string>("");

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

        const convertedValues = ConvertExerciseGroupSetString(
          currentExercise.exercise_group_set_string
        );

        setExercise(currentExercise);
        setExerciseGroupSet(convertedValues.set);
        setExerciseGroupString(convertedValues.formattedString);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getExercise();
  }, [id]);

  if (exercise === undefined) return NotFound();

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
            <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
              {exercise?.name}
            </h1>
          </div>
          <div>
            <h2 className="text-xl px-1">
              <span className="font-semibold">Note:</span> {exercise?.note}
            </h2>
          </div>
          <div>
            <h2 className="text-xl px-1">
              <span className="font-semibold">Exercise Groups:</span>{" "}
              {exerciseGroupString}
            </h2>
          </div>
          {isEditing ? (
            <div className="flex flex-col justify-center gap-2">
              <Input
                // value={newExerciseName}
                // isInvalid={isNewExerciseNameInvalid}
                label="Name"
                // errorMessage={isNewExerciseNameInvalid && "Name can't be empty"}
                variant="faded"
                // onValueChange={(value) => setNewExerciseName(value)}
                isRequired
                isClearable
              />
              <Input
                // value={newExerciseNote!}
                label="Note"
                variant="faded"
                // onValueChange={(value) => setNewExerciseNote(value)}
                isClearable
              />
              <div className="flex justify-center gap-4">
                <Button color="danger" onPress={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button color="success">Save</Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button color="primary" onPress={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

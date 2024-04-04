import { useParams, useNavigate } from "react-router-dom";
import { Exercise } from "../typings";
import { useState, useMemo, useEffect } from "react";
import { NotFound } from ".";
import { Button, Input, CheckboxGroup, Checkbox } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import { LoadingSpinner } from "../components";
import {
  ConvertExerciseGroupSetString,
  ValidateExerciseGroupSetString,
  ConvertExerciseGroupStringListToSetString,
  ExerciseGroupDictionary,
} from "../helpers";

export default function ExerciseDetailsPage() {
  const { id } = useParams();
  const [exercise, setExercise] = useState<Exercise>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newExerciseName, setNewExerciseName] = useState<string>("");
  const [newExerciseNote, setNewExerciseNote] = useState<string>("");
  const [exerciseGroupSetString, setExerciseGroupSetString] =
    useState<string>("");
  const [exerciseGroupList, setExerciseGroupList] = useState<string[]>([]);
  const [exerciseGroupString, setExerciseGroupString] = useState<string>("");

  const navigate = useNavigate();

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
        setNewExerciseName(currentExercise.name);
        setNewExerciseNote(currentExercise.note ?? "");
        setExerciseGroupSetString(currentExercise.exercise_group_set_string);
        setExerciseGroupList(convertedValues.list);
        setExerciseGroupString(convertedValues.formattedString);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getExercise();
  }, [id]);

  const isNewExerciseNameInvalid = useMemo(() => {
    return (
      newExerciseName === null ||
      newExerciseName === undefined ||
      newExerciseName.trim().length === 0
    );
  }, [newExerciseName]);

  const isNewExerciseGroupSetStringInvalid = useMemo(() => {
    return !ValidateExerciseGroupSetString(exerciseGroupSetString);
  }, [exerciseGroupSetString]);

  const handleExerciseGroupStringChange = (
    exerciseGroupStringList: string[]
  ) => {
    const exerciseGroupSetString = ConvertExerciseGroupStringListToSetString(
      exerciseGroupStringList
    );

    setExerciseGroupSetString(exerciseGroupSetString);
  };

  const updateExercise = async () => {
    if (!isUpdateExerciseValid()) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const noteToInsert: string | null =
        newExerciseNote.trim().length === 0 ? null : newExerciseNote;

      await db.execute(
        "UPDATE exercises SET name = $1, note = $2, exercise_group_set_string = $3 WHERE id = $4",
        [newExerciseName, noteToInsert, exerciseGroupSetString, exercise?.id]
      );

      setExercise((prev) => ({
        ...prev!,
        name: newExerciseName,
        note: newExerciseNote,
        exercise_group_set_string: exerciseGroupSetString,
      }));

      const convertedValues = ConvertExerciseGroupSetString(
        exerciseGroupSetString
      );

      setExerciseGroupString(convertedValues.formattedString);
      setExerciseGroupList(convertedValues.list);

      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const isUpdateExerciseValid = () => {
    if (
      newExerciseName === null ||
      newExerciseName === undefined ||
      newExerciseName.trim().length === 0
    )
      return false;

    if (!ValidateExerciseGroupSetString(exerciseGroupSetString)) return false;

    return true;
  };

  if (exercise === undefined) return NotFound();

  const exerciseGroupDictionary = ExerciseGroupDictionary();

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
          <div>
            <h2 className="text-xl font-semibold ">Note</h2>
            <span>{exercise?.note}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Exercise Groups</h2>
            <span>{exerciseGroupString}</span>
          </div>
          {isEditing ? (
            <div className="flex flex-col justify-center gap-2">
              <Input
                value={newExerciseName}
                isInvalid={isNewExerciseNameInvalid}
                label="Name"
                errorMessage={isNewExerciseNameInvalid && "Name can't be empty"}
                variant="faded"
                onValueChange={(value) => setNewExerciseName(value)}
                isRequired
                isClearable
              />
              <Input
                value={newExerciseNote!}
                label="Note"
                variant="faded"
                onValueChange={(value) => setNewExerciseNote(value)}
                isClearable
              />
              <div>
                <CheckboxGroup
                  isRequired
                  isInvalid={isNewExerciseGroupSetStringInvalid}
                  defaultValue={exerciseGroupList}
                  label="Select Exercise Groups"
                  errorMessage={
                    isNewExerciseGroupSetStringInvalid &&
                    "At least one Exercise Group must be selected"
                  }
                  onValueChange={(value) =>
                    handleExerciseGroupStringChange(value)
                  }
                >
                  <div className="grid grid-cols-2 gap-0.5">
                    {Array.from(exerciseGroupDictionary).map(([key, value]) => (
                      <Checkbox key={key} color="success" value={key}>
                        {value}
                      </Checkbox>
                    ))}
                  </div>
                </CheckboxGroup>
              </div>
              <div className="flex justify-center gap-4">
                <Button color="danger" onPress={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  onPress={updateExercise}
                  isDisabled={
                    isNewExerciseNameInvalid ||
                    isNewExerciseGroupSetStringInvalid
                  }
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 justify-center">
              <Button color="primary" onPress={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button
                color="success"
                onPress={() => navigate(`/exercises/${id}/history`)}
              >
                History
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

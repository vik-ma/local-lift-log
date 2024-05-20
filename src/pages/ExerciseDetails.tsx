import { useParams, useNavigate } from "react-router-dom";
import { Exercise } from "../typings";
import { useState, useEffect } from "react";
import { NotFound } from ".";
import { Button, Input, CheckboxGroup, Checkbox } from "@nextui-org/react";
import { LoadingSpinner } from "../components";
import {
  ConvertExerciseGroupSetString,
  ConvertExerciseGroupStringListToSetString,
  ExerciseGroupDictionary,
  GetExerciseFromId,
  UpdateExercise,
  IsExerciseValid,
} from "../helpers";
import { useValidateExerciseGroupString, useValidateName } from "../hooks";

export default function ExerciseDetailsPage() {
  const { id } = useParams();
  const [exercise, setExercise] = useState<Exercise>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newExerciseName, setNewExerciseName] = useState<string>("");
  const [newExerciseNote, setNewExerciseNote] = useState<string>("");
  const [exerciseGroupSetString, setExerciseGroupSetString] =
    useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const getExercise = async () => {
      const currentExercise = await GetExerciseFromId(Number(id));

      setExercise(currentExercise);
      setNewExerciseName(currentExercise.name);
      setNewExerciseNote(currentExercise.note ?? "");
      setExerciseGroupSetString(currentExercise.exercise_group_set_string);
      setIsLoading(false);
    };

    getExercise();
  }, [id]);

  const isNewExerciseNameValid = useValidateName(newExerciseName);

  const isNewExerciseGroupSetStringValid = useValidateExerciseGroupString(
    exerciseGroupSetString
  );

  const handleExerciseGroupStringChange = (
    exerciseGroupStringList: string[]
  ) => {
    const exerciseGroupSetString = ConvertExerciseGroupStringListToSetString(
      exerciseGroupStringList
    );

    setExerciseGroupSetString(exerciseGroupSetString);
  };

  const updateExercise = async () => {
    if (
      exercise === undefined ||
      !IsExerciseValid(isNewExerciseNameValid, isNewExerciseGroupSetStringValid)
    )
      return;

    const noteToInsert: string | null =
      newExerciseNote.trim().length === 0 ? null : newExerciseNote;

    const convertedValues = ConvertExerciseGroupSetString(
      exerciseGroupSetString
    );

    const updatedExercise: Exercise = {
      ...exercise,
      name: newExerciseName,
      note: noteToInsert,
      exercise_group_set_string: exerciseGroupSetString,
      formattedGroupString: convertedValues.formattedString,
      exerciseGroupStringList: convertedValues.list,
    };

    const success = await UpdateExercise(updatedExercise);

    if (!success) return;

    setExercise(updatedExercise);

    setIsEditing(false);
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
              {exercise.name}
            </h1>
          </div>
          <div>
            <h2 className="text-xl font-semibold ">Note</h2>
            <span>{exercise.note}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Exercise Groups</h2>
            <span>{exercise.formattedGroupString}</span>
          </div>
          {isEditing ? (
            <div className="flex flex-col justify-center gap-2">
              <Input
                value={newExerciseName}
                isInvalid={!isNewExerciseNameValid}
                label="Name"
                errorMessage={!isNewExerciseNameValid && "Name can't be empty"}
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
                  isInvalid={!isNewExerciseGroupSetStringValid}
                  defaultValue={exercise.exerciseGroupStringList}
                  label="Select Exercise Groups"
                  errorMessage={
                    !isNewExerciseGroupSetStringValid &&
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
                    !isNewExerciseNameValid || !isNewExerciseGroupSetStringValid
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

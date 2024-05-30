import { useParams, useNavigate } from "react-router-dom";
import { Exercise } from "../typings";
import { useState, useEffect } from "react";
import { Button, useDisclosure } from "@nextui-org/react";
import { LoadingSpinner, ExerciseModal } from "../components";
import {
  ConvertExerciseGroupSetString,
  GetExerciseFromId,
  UpdateExercise,
  IsExerciseValid,
  ConvertEmptyStringToNull,
} from "../helpers";
import {
  useDefaultExercise,
  useExerciseGroupDictionary,
  useValidateExerciseGroupString,
  useValidateName,
} from "../hooks";

export default function ExerciseDetailsPage() {
  const { id } = useParams();
  const [exercise, setExercise] = useState<Exercise>();

  const defaultExercise = useDefaultExercise();

  const [editedExercise, setEditedExercise] =
    useState<Exercise>(defaultExercise);

  const navigate = useNavigate();

  const exerciseModal = useDisclosure();

  useEffect(() => {
    const getExercise = async () => {
      const currentExercise = await GetExerciseFromId(Number(id));

      setExercise(currentExercise);
      setEditedExercise(currentExercise);
    };

    getExercise();
  }, [id]);

  const isEditedExerciseNameValid = useValidateName(editedExercise.name);

  const isEditedExerciseGroupSetStringValid = useValidateExerciseGroupString(
    editedExercise.exercise_group_set_string
  );

  const exerciseGroupDictionary = useExerciseGroupDictionary();

  const updateExercise = async () => {
    if (
      editedExercise === undefined ||
      !IsExerciseValid(
        isEditedExerciseNameValid,
        isEditedExerciseGroupSetStringValid
      )
    )
      return;

    const noteToInsert = ConvertEmptyStringToNull(editedExercise.note);

    const convertedValues = ConvertExerciseGroupSetString(
      editedExercise.exercise_group_set_string
    );

    const updatedExercise: Exercise = {
      ...editedExercise,
      note: noteToInsert,
      formattedGroupString: convertedValues.formattedString,
      exerciseGroupStringList: convertedValues.list,
    };

    const success = await UpdateExercise(updatedExercise);

    if (!success) return;

    setExercise(updatedExercise);

    exerciseModal.onClose();
  };

  if (exercise === undefined) return <LoadingSpinner />;

  return (
    <>
      <ExerciseModal
        exerciseModal={exerciseModal}
        exercise={editedExercise}
        setExercise={setEditedExercise}
        isExerciseNameValid={isEditedExerciseNameValid}
        isExerciseGroupSetStringValid={isEditedExerciseGroupSetStringValid}
        exerciseGroupDictionary={exerciseGroupDictionary}
        buttonAction={updateExercise}
      />
      <div className="flex flex-col gap-4">
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
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            color="success"
            onPress={() => exerciseModal.onOpen()}
          >
            Edit
          </Button>
          <Button
            size="sm"
            color="success"
            onPress={() => navigate(`/exercises/${id}/history`)}
          >
            History
          </Button>
        </div>
      </div>
    </>
  );
}

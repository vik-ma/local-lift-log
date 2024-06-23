import { useParams, useNavigate } from "react-router-dom";
import { Exercise } from "../typings";
import { useState, useEffect } from "react";
import { Button, useDisclosure } from "@nextui-org/react";
import { LoadingSpinner, ExerciseModal, DetailsHeader } from "../components";
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

export default function ExerciseDetails() {
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
        isEditing={true}
      />
      <div className="flex flex-col gap-4">
        <DetailsHeader
          header={exercise.name}
          subHeader={exercise.formattedGroupString ?? ""}
          note={exercise.note}
          editButtonAction={() => exerciseModal.onOpen()}
        />
        <div className="flex justify-center">
          <Button
            size="sm"
            onPress={() => navigate(`/exercises/${id}/history`)}
          >
            History
          </Button>
        </div>
      </div>
    </>
  );
}

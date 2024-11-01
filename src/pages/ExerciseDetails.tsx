import { useParams, useNavigate } from "react-router-dom";
import { Exercise } from "../typings";
import { useState, useEffect } from "react";
import { Button, useDisclosure } from "@nextui-org/react";
import { LoadingSpinner, ExerciseModal, DetailsHeader } from "../components";
import {
  ConvertExerciseGroupSetStringPrimary,
  GetExerciseWithId,
  UpdateExercise,
  IsExerciseValid,
  ConvertEmptyStringToNull,
} from "../helpers";
import {
  useDefaultExercise,
  useValidateExerciseGroupStringPrimary,
  useValidateName,
  useDetailsHeaderOptionsMenu,
  useExerciseGroupDictionary,
} from "../hooks";
import { FavoriteIcon } from "../assets";

export default function ExerciseDetails() {
  const { id } = useParams();
  const [exercise, setExercise] = useState<Exercise>();

  const defaultExercise = useDefaultExercise();

  const [editedExercise, setEditedExercise] =
    useState<Exercise>(defaultExercise);

  const navigate = useNavigate();

  const exerciseModal = useDisclosure();

  const exerciseGroupDictionary = useExerciseGroupDictionary();

  useEffect(() => {
    const getExercise = async () => {
      const currentExercise = await GetExerciseWithId(Number(id));

      setExercise(currentExercise);
      setEditedExercise(currentExercise);
    };

    getExercise();
  }, [id]);

  const useDetailsHeaderOptions = useDetailsHeaderOptionsMenu("Exercise");

  const isEditedExerciseNameValid = useValidateName(editedExercise.name);

  const isExerciseGroupSetPrimaryStringValid =
    useValidateExerciseGroupStringPrimary(
      editedExercise.exercise_group_set_string_primary
    );

  // TODO: ADD SECONDARY

  const updateExercise = async () => {
    if (
      editedExercise === undefined ||
      !IsExerciseValid(
        isEditedExerciseNameValid,
        isExerciseGroupSetPrimaryStringValid
      )
    )
      return;

    const noteToInsert = ConvertEmptyStringToNull(editedExercise.note);

    const convertedValues = ConvertExerciseGroupSetStringPrimary(
      editedExercise.exercise_group_set_string_primary
    );

    // TODO: ADD SECONDARY

    const updatedExercise: Exercise = {
      ...editedExercise,
      note: noteToInsert,
      formattedGroupStringPrimary: convertedValues.formattedString,
      exerciseGroupStringListPrimary: convertedValues.list,
    };

    const success = await UpdateExercise(updatedExercise);

    if (!success) return;

    setExercise(updatedExercise);

    exerciseModal.onClose();
  };

  const toggleFavorite = async () => {
    if (exercise === undefined) return;

    const newFavoriteValue = exercise.is_favorite === 1 ? 0 : 1;

    const updatedExercise: Exercise = {
      ...exercise,
      is_favorite: newFavoriteValue,
    };

    const success = await UpdateExercise(updatedExercise);

    if (!success) return;

    setExercise(updatedExercise);
  };

  if (exercise === undefined) return <LoadingSpinner />;

  return (
    <>
      <ExerciseModal
        exerciseModal={exerciseModal}
        exercise={editedExercise}
        setExercise={setEditedExercise}
        isExerciseNameValid={isEditedExerciseNameValid}
        isExerciseGroupSetPrimaryStringValid={
          isExerciseGroupSetPrimaryStringValid
        }
        exerciseGroupDictionary={exerciseGroupDictionary}
        buttonAction={updateExercise}
      />
      <div className="flex flex-col gap-4">
        <DetailsHeader
          header={exercise.name}
          subHeader={exercise.formattedGroupStringPrimary ?? ""}
          note={exercise.note}
          detailsType="Exercise"
          editButtonAction={() => exerciseModal.onOpen()}
          useDetailsHeaderOptions={useDetailsHeaderOptions}
        />
        <div className="flex justify-center gap-2">
          <Button
            aria-label={
              exercise.is_favorite
                ? `Unset Favorite For ${exercise.name}`
                : `Set Favorite For ${exercise.name}`
            }
            className="z-1"
            color={exercise.is_favorite ? "primary" : "default"}
            startContent={
              <FavoriteIcon
                isChecked={!!exercise.is_favorite}
                size={30}
                isInPrimaryButton={true}
              />
            }
            onPress={toggleFavorite}
          >
            <span className="w-[4rem]">
              {exercise.is_favorite ? "Favorited" : "Favorite"}
            </span>
          </Button>
          <Button onPress={() => navigate(`/exercises/${id}/history`)}>
            History
          </Button>
        </div>
      </div>
    </>
  );
}

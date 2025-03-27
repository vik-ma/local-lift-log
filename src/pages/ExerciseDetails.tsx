import { useParams } from "react-router-dom";
import { Exercise } from "../typings";
import { useState, useEffect } from "react";
import { useDisclosure } from "@heroui/react";
import { LoadingSpinner, ExerciseModal, DetailsHeader } from "../components";
import {
  GetExerciseWithId,
  UpdateExercise,
  IsExerciseValid,
  ConvertEmptyStringToNull,
  UpdateExerciseValues,
} from "../helpers";
import {
  useDefaultExercise,
  useValidateExerciseGroupStringPrimary,
  useValidateName,
  useDetailsHeaderOptionsMenu,
  useExerciseGroupDictionary,
  useMultiplierInputMap,
} from "../hooks";
import toast from "react-hot-toast";

export default function ExerciseDetails() {
  const { id } = useParams();
  const [exercise, setExercise] = useState<Exercise>();

  const defaultExercise = useDefaultExercise();

  const [editedExercise, setEditedExercise] =
    useState<Exercise>(defaultExercise);

  const exerciseModal = useDisclosure();

  const exerciseGroupDictionary = useExerciseGroupDictionary();

  const {
    multiplierInputMap,
    setMultiplierInputMap,
    multiplierInputInvaliditySet,
  } = useMultiplierInputMap();

  useEffect(() => {
    const getExercise = async () => {
      const currentExercise = await GetExerciseWithId(
        Number(id),
        exerciseGroupDictionary
      );

      setExercise(currentExercise);
      setEditedExercise(currentExercise);
    };

    getExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useDetailsHeaderOptions = useDetailsHeaderOptionsMenu("Exercise");

  const isEditedExerciseNameValid = useValidateName(editedExercise.name);

  const isExerciseGroupSetPrimaryStringValid =
    useValidateExerciseGroupStringPrimary(
      editedExercise.exercise_group_set_string_primary,
      exerciseGroupDictionary
    );

  const updateExercise = async () => {
    if (
      editedExercise === undefined ||
      !IsExerciseValid(
        isEditedExerciseNameValid,
        isExerciseGroupSetPrimaryStringValid
      )
    )
      return;

    editedExercise.note = ConvertEmptyStringToNull(editedExercise.note);

    const updatedExercise = await UpdateExerciseValues(
      editedExercise,
      multiplierInputMap,
      exerciseGroupDictionary
    );

    if (updatedExercise === undefined) return;

    setExercise(updatedExercise);

    exerciseModal.onClose();
    toast.success("Exercise Updated");
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
        multiplierInputMap={multiplierInputMap}
        setMultiplierInputMap={setMultiplierInputMap}
        multiplierInputInvaliditySet={multiplierInputInvaliditySet}
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
          isFavorite={!!exercise.is_favorite}
          item={exercise}
          toggleFavorite={toggleFavorite}
        />
      </div>
    </>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { Exercise } from "../typings";
import { useState, useEffect } from "react";
import { Button, useDisclosure } from "@nextui-org/react";
import { LoadingSpinner, ExerciseModal, DetailsHeader } from "../components";
import {
  ConvertExerciseGroupSetString,
  GetExerciseWithId,
  UpdateExercise,
  IsExerciseValid,
  ConvertEmptyStringToNull,
} from "../helpers";
import {
  useDefaultExercise,
  useExerciseGroupDictionary,
  useValidateExerciseGroupString,
  useValidateName,
  useDetailsHeaderOptionsMenu,
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

  useEffect(() => {
    const getExercise = async () => {
      const currentExercise = await GetExerciseWithId(Number(id));

      setExercise(currentExercise);
      setEditedExercise(currentExercise);
    };

    getExercise();
  }, [id]);

  const { showNote, menuItems, handleOptionMenuSelection } =
    useDetailsHeaderOptionsMenu();

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
          showNote={showNote}
          detailsType="Exercise"
          editButtonAction={() => exerciseModal.onOpen()}
          handleOptionMenuSelection={handleOptionMenuSelection}
          menuItems={menuItems}
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

import Database from "tauri-plugin-sql-api";
import { useState } from "react";
import { Exercise } from "../typings";
import {
  ConvertEmptyStringToNull,
  ConvertExerciseGroupSetString,
  CreateDefaultExercises,
  IsExerciseValid,
} from "../helpers";
import { Button, useDisclosure, Input } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { DeleteModal, ExerciseModal, LoadingSpinner } from "../components";
import { SearchIcon } from "../assets";
import {
  useValidateExerciseGroupString,
  useValidateName,
  useExerciseGroupDictionary,
  useExerciseList,
  useDefaultExercise,
} from "../hooks";

export default function ExerciseListPage() {
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise>();

  const {
    filterQuery,
    setFilterQuery,
    filteredExercises,
    exercises,
    setExercises,
    getExercises,
    isExercisesLoading,
  } = useExerciseList();

  const deleteModal = useDisclosure();
  const newExerciseModal = useDisclosure();

  const navigate = useNavigate();

  const defaultNewExercise = useDefaultExercise();

  const exerciseGroupDictionary = useExerciseGroupDictionary();

  const [newExercise, setNewExercise] = useState<Exercise>(defaultNewExercise);

  const isNewExerciseNameValid = useValidateName(newExercise.name);

  const isNewExerciseGroupSetStringValid = useValidateExerciseGroupString(
    newExercise.exercise_group_set_string
  );

  const deleteExercise = async () => {
    if (exerciseToDelete === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from exercises WHERE id = $1", [exerciseToDelete.id]);

      const updatedExercises: Exercise[] = exercises.filter(
        (item) => item.id !== exerciseToDelete?.id
      );
      setExercises(updatedExercises);

      toast.success("Exercise Deleted");
    } catch (error) {
      console.log(error);
    }

    setExerciseToDelete(undefined);
    deleteModal.onClose();
  };

  const handleDeleteButton = (exercise: Exercise) => {
    setExerciseToDelete(exercise);
    deleteModal.onOpen();
  };

  const addExercise = async () => {
    if (
      !IsExerciseValid(isNewExerciseNameValid, isNewExerciseGroupSetStringValid)
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const noteToInsert = ConvertEmptyStringToNull(newExercise.note);

      const result = await db.execute(
        "INSERT into exercises (name, exercise_group_set_string, note) VALUES ($1, $2, $3)",
        [newExercise.name, newExercise.exercise_group_set_string, noteToInsert]
      );

      const convertedValues = ConvertExerciseGroupSetString(
        newExercise.exercise_group_set_string
      );

      const newExerciseListItem: Exercise = {
        ...newExercise,
        id: result.lastInsertId,
        exerciseGroupStringList: convertedValues.list,
        formattedGroupString: convertedValues.formattedString,
      };
      setExercises([...exercises, newExerciseListItem]);

      newExerciseModal.onClose();
      setNewExercise(defaultNewExercise);

      toast.success("Exercise Created");
    } catch (error) {
      console.log(error);
    }
  };

  const restoreDefaultExercises = async () => {
    await CreateDefaultExercises();
    await getExercises();
    toast.success("Default Exercises Restored");
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Exercise"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete {exerciseToDelete?.name}
            ?
          </p>
        }
        deleteButtonAction={deleteExercise}
      />
      <ExerciseModal
        exerciseModal={newExerciseModal}
        exercise={newExercise}
        setExercise={setNewExercise}
        isExerciseNameValid={isNewExerciseNameValid}
        isExerciseGroupSetStringValid={isNewExerciseGroupSetStringValid}
        exerciseGroupDictionary={exerciseGroupDictionary}
        buttonAction={addExercise}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Exercise List
          </h1>
        </div>
        <Input
          label="Search"
          variant="faded"
          placeholder="Type to search..."
          isClearable
          value={filterQuery}
          onValueChange={setFilterQuery}
          startContent={<SearchIcon />}
        />
        {isExercisesLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col w-full">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex flex-row justify-between rounded-lg px-2 hover:bg-amber-100 p-1"
                >
                  <div className="flex flex-col">
                    <div className="text-lg truncate w-56">{exercise.name}</div>
                    <div className="text-xs text-stone-500">
                      {exercise.formattedGroupString}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      className="font-medium"
                      onPress={() => navigate(`/exercises/${exercise.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="font-medium"
                      color="danger"
                      onPress={() => handleDeleteButton(exercise)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                className="text-lg font-medium"
                size="lg"
                color="success"
                onPress={() => newExerciseModal.onOpen()}
              >
                Create New Exercise
              </Button>
            </div>
            {exercises.length === 0 && (
              <div className="flex justify-center">
                <Button
                  className="text-lg font-medium"
                  size="lg"
                  color="primary"
                  onPress={restoreDefaultExercises}
                >
                  Restore Default Exercise List
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

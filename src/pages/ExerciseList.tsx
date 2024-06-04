import Database from "tauri-plugin-sql-api";
import { useState } from "react";
import { Exercise } from "../typings";
import {
  ConvertEmptyStringToNull,
  ConvertExerciseGroupSetString,
  CreateDefaultExercises,
  IsExerciseValid,
  UpdateExercise,
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

type OperationType = "add" | "edit" | "delete";

export default function ExerciseListPage() {
  const [operationType, setOperationType] = useState<OperationType>("add");

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
  const exerciseModal = useDisclosure();

  const navigate = useNavigate();

  const defaultNewExercise = useDefaultExercise();

  const exerciseGroupDictionary = useExerciseGroupDictionary();

  const [operatingExercise, setOperatingExercise] =
    useState<Exercise>(defaultNewExercise);

  const isOperatingExerciseNameValid = useValidateName(operatingExercise.name);

  const isOperatingExerciseGroupSetStringValid = useValidateExerciseGroupString(
    operatingExercise.exercise_group_set_string
  );

  const deleteExercise = async () => {
    if (operatingExercise.id === 0 || operationType !== "delete") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from exercises WHERE id = $1", [operatingExercise.id]);

      const updatedExercises: Exercise[] = exercises.filter(
        (item) => item.id !== operatingExercise.id
      );
      setExercises(updatedExercises);

      toast.success("Exercise Deleted");
    } catch (error) {
      console.log(error);
    }

    resetExercise();
    deleteModal.onClose();
  };

  const handleDeleteButton = (exercise: Exercise) => {
    setOperationType("delete");
    setOperatingExercise(exercise);
    deleteModal.onOpen();
  };

  const addExercise = async () => {
    if (
      !IsExerciseValid(
        isOperatingExerciseNameValid,
        isOperatingExerciseGroupSetStringValid
      ) ||
      operationType !== "add"
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const noteToInsert = ConvertEmptyStringToNull(operatingExercise.note);

      const result = await db.execute(
        "INSERT into exercises (name, exercise_group_set_string, note) VALUES ($1, $2, $3)",
        [
          operatingExercise.name,
          operatingExercise.exercise_group_set_string,
          noteToInsert,
        ]
      );

      const convertedValues = ConvertExerciseGroupSetString(
        operatingExercise.exercise_group_set_string
      );

      const newExerciseListItem: Exercise = {
        ...operatingExercise,
        id: result.lastInsertId,
        exerciseGroupStringList: convertedValues.list,
        formattedGroupString: convertedValues.formattedString,
      };
      setExercises([...exercises, newExerciseListItem]);

      resetExercise();
      toast.success("Exercise Created");
      exerciseModal.onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const restoreDefaultExercises = async () => {
    await CreateDefaultExercises();
    await getExercises();
    toast.success("Default Exercises Restored");
  };

  const updateExercise = async () => {
    if (
      operatingExercise === undefined ||
      !IsExerciseValid(
        isOperatingExerciseNameValid,
        isOperatingExerciseGroupSetStringValid
      ) ||
      operationType !== "edit"
    )
      return;

    const noteToInsert = ConvertEmptyStringToNull(operatingExercise.note);

    const convertedValues = ConvertExerciseGroupSetString(
      operatingExercise.exercise_group_set_string
    );

    const updatedExercise: Exercise = {
      ...operatingExercise,
      note: noteToInsert,
      formattedGroupString: convertedValues.formattedString,
      exerciseGroupStringList: convertedValues.list,
    };

    const success = await UpdateExercise(updatedExercise);

    if (!success) return;

    const updatedExercises: Exercise[] = exercises.map((item) =>
      item.id === operatingExercise.id ? updatedExercise : item
    );

    setExercises(updatedExercises);

    resetExercise();
    toast.success("Exercise Updated");
    exerciseModal.onClose();
  };

  const handleEditButton = (exercise: Exercise) => {
    setOperationType("edit");
    setOperatingExercise(exercise);
    exerciseModal.onOpen();
  };

  const handleCreateNewExerciseButton = () => {
    resetExercise();
    exerciseModal.onOpen();
  };

  const resetExercise = () => {
    setOperationType("add");
    setOperatingExercise(defaultNewExercise);
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Exercise"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete{" "}
            {operatingExercise?.name}?
          </p>
        }
        deleteButtonAction={deleteExercise}
      />
      <ExerciseModal
        exerciseModal={exerciseModal}
        exercise={operatingExercise}
        setExercise={setOperatingExercise}
        isExerciseNameValid={isOperatingExerciseNameValid}
        isExerciseGroupSetStringValid={isOperatingExerciseGroupSetStringValid}
        exerciseGroupDictionary={exerciseGroupDictionary}
        buttonAction={operationType === "edit" ? updateExercise : addExercise}
        isEditing={operationType === "edit"}
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
                  className="flex flex-row justify-between rounded-lg px-2 cursor-pointer hover:bg-amber-100 p-1"
                  onClick={() => navigate(`/exercises/${exercise.id}`)}
                >
                  <div className="flex flex-col">
                    <div className="text-lg truncate w-56">{exercise.name}</div>
                    <div className="text-xs text-stone-500">
                      {exercise.formattedGroupString}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      className="font-medium"
                      onPress={() => handleEditButton(exercise)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
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
                onPress={() => handleCreateNewExerciseButton()}
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

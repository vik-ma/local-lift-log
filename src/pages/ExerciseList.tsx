import Database from "tauri-plugin-sql-api";
import { useState } from "react";
import { Exercise } from "../typings";
import {
  ConvertEmptyStringToNull,
  ConvertExerciseGroupSetString,
  CreateDefaultExercises,
  DeleteItemFromList,
  IsExerciseValid,
  UpdateExercise,
  UpdateItemInList,
  FormatSetsCompletedString,
} from "../helpers";
import {
  Button,
  useDisclosure,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Checkbox,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { DeleteModal, ExerciseModal, LoadingSpinner } from "../components";
import { FavoriteIcon, SearchIcon, VerticalMenuIcon } from "../assets";
import {
  useValidateExerciseGroupString,
  useValidateName,
  useExerciseGroupDictionary,
  useExerciseList,
  useDefaultExercise,
} from "../hooks";

type OperationType = "add" | "edit" | "delete";

export default function ExerciseList() {
  const [operationType, setOperationType] = useState<OperationType>("add");

  const {
    filterQuery,
    setFilterQuery,
    filteredExercises,
    exercises,
    setExercises,
    getExercises,
    isExercisesLoading,
    toggleFavorite,
    handleSortOptionSelection,
    favoritesCheckboxValue,
    handleListFavoritesFirstChange,
    sortCategory,
  } = useExerciseList(true);

  const deleteModal = useDisclosure();
  const exerciseModal = useDisclosure();

  const navigate = useNavigate();

  const defaultExercise = useDefaultExercise();

  const exerciseGroupDictionary = useExerciseGroupDictionary();

  const [operatingExercise, setOperatingExercise] =
    useState<Exercise>(defaultExercise);

  const isOperatingExerciseNameValid = useValidateName(operatingExercise.name);

  const isOperatingExerciseGroupSetStringValid = useValidateExerciseGroupString(
    operatingExercise.exercise_group_set_string
  );

  const deleteExercise = async () => {
    if (operatingExercise.id === 0 || operationType !== "delete") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from exercises WHERE id = $1", [operatingExercise.id]);

      const updatedExercises = DeleteItemFromList(
        exercises,
        operatingExercise.id
      );

      setExercises(updatedExercises);

      toast.success("Exercise Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingExercise();
    deleteModal.onClose();
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
        `INSERT into exercises (name, exercise_group_set_string, note, is_favorite) 
         VALUES ($1, $2, $3, $4)`,
        [
          operatingExercise.name,
          operatingExercise.exercise_group_set_string,
          noteToInsert,
          operatingExercise.is_favorite,
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

      resetOperatingExercise();
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

    const updatedExercises = UpdateItemInList(exercises, updatedExercise);

    setExercises(updatedExercises);

    resetOperatingExercise();
    toast.success("Exercise Updated");
    exerciseModal.onClose();
  };

  const handleCreateNewExerciseButton = () => {
    if (operationType !== "add") {
      resetOperatingExercise();
    }
    exerciseModal.onOpen();
  };

  const resetOperatingExercise = () => {
    setOperationType("add");
    setOperatingExercise(defaultExercise);
  };

  const handleGroupedSetOptionSelection = (key: string, exercise: Exercise) => {
    if (key === "edit") {
      setOperationType("edit");
      setOperatingExercise(exercise);
      exerciseModal.onOpen();
    } else if (key === "delete") {
      setOperationType("delete");
      setOperatingExercise(exercise);
      deleteModal.onOpen();
    } else if (key === "toggle-favorite") {
      toggleFavorite(exercise);
    }
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
        <div className="flex justify-between gap-1 w-full items-center">
          <Button
            color="primary"
            onPress={() => handleCreateNewExerciseButton()}
          >
            New Exercise
          </Button>
          <Checkbox
            isSelected={favoritesCheckboxValue}
            onValueChange={handleListFavoritesFirstChange}
          >
            List Favorites First
          </Checkbox>
          <Dropdown>
            <DropdownTrigger>
              <Button className="z-1" variant="flat">
                Sort By
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              selectedKeys={[sortCategory]}
              onAction={(key) => handleSortOptionSelection(key as string)}
            >
              <DropdownItem key="name">Exercise Name (A-Z)</DropdownItem>
              <DropdownItem key="num-sets">
                Number Of Sets Completed
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        {isExercisesLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1 w-full">
              {filteredExercises.map((exercise) => (
                <div
                  className="flex flex-row justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                  key={exercise.id}
                >
                  <button
                    className="flex flex-col justify-start items-start"
                    onClick={() => navigate(`/exercises/${exercise.id}`)}
                  >
                    <span className="w-[19rem] truncate text-left">
                      {exercise.name}
                    </span>
                    {exercise.set_count! > 0 && (
                      <span className="text-xs text-yellow-600 text-left">
                        {FormatSetsCompletedString(exercise.set_count)}
                      </span>
                    )}
                    <span className="text-xs text-stone-400 text-left">
                      {exercise.formattedGroupString}
                    </span>
                  </button>
                  <div className="flex items-center gap-0.5">
                    <Button
                      aria-label={
                        exercise.is_favorite
                          ? `Unset Favorite For ${exercise.name}`
                          : `Set Favorite For ${exercise.name}`
                      }
                      isIconOnly
                      className="z-1"
                      size="sm"
                      color={exercise.is_favorite ? "primary" : "default"}
                      radius="lg"
                      variant="light"
                      onPress={() => toggleFavorite(exercise)}
                    >
                      <FavoriteIcon
                        isChecked={!!exercise.is_favorite}
                        size={28}
                      />
                    </Button>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          aria-label={`Toggle ${exercise.name} Options Menu`}
                          isIconOnly
                          className="z-1"
                          size="sm"
                          radius="lg"
                          variant="light"
                        >
                          <VerticalMenuIcon size={17} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label={`Option Menu For ${exercise.name} Exercise`}
                        onAction={(key) =>
                          handleGroupedSetOptionSelection(
                            key as string,
                            exercise
                          )
                        }
                      >
                        <DropdownItem key="edit">Edit</DropdownItem>
                        <DropdownItem key="toggle-favorite">
                          {exercise.is_favorite
                            ? "Remove Favorite"
                            : "Set Favorite"}
                        </DropdownItem>
                        <DropdownItem key="delete" className="text-danger">
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              ))}
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

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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  DeleteModal,
  EmptyListLabel,
  ExerciseGroupCheckboxes,
  ExerciseModal,
  FavoriteButton,
  ListPageSearchInput,
  LoadingSpinner,
} from "../components";
import { VerticalMenuIcon } from "../assets";
import {
  useValidateExerciseGroupString,
  useValidateName,
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
    sortCategory,
    exerciseGroupDictionary,
    shownExerciseGroups,
    setShownExerciseGroups,
  } = useExerciseList(true);

  const deleteModal = useDisclosure();
  const exerciseModal = useDisclosure();
  const exerciseGroupModal = useDisclosure();

  const navigate = useNavigate();

  const defaultExercise = useDefaultExercise();

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
        `INSERT into exercises 
        (name, exercise_group_set_string, note, is_favorite) 
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

  const handleFilterExerciseGroupsButton = () => {
    exerciseGroupModal.onOpen();
  };

  const handleToggleAllButton = () => {
    if (shownExerciseGroups.length < exerciseGroupDictionary.size) {
      setShownExerciseGroups(Array.from(exerciseGroupDictionary.keys()));
    } else {
      setShownExerciseGroups([]);
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
            <span className="text-secondary">{operatingExercise.name}</span>
            {operatingExercise.set_count! > 0 && (
              <>
                , that has{" "}
                <span className="text-secondary">
                  {operatingExercise.set_count} Sets Completed
                </span>
              </>
            )}
            ?
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
      <Modal
        isOpen={exerciseGroupModal.isOpen}
        onOpenChange={exerciseGroupModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Filter Exercise Groups</ModalHeader>
              <ModalBody>
                <ExerciseGroupCheckboxes
                  isValid={shownExerciseGroups.length > 0}
                  value={shownExerciseGroups}
                  handleChange={setShownExerciseGroups}
                  exerciseGroupDictionary={exerciseGroupDictionary}
                  hideLabel
                />
              </ModalBody>
              <ModalFooter className="flex justify-between">
                <div>
                  <Button variant="flat" onPress={handleToggleAllButton}>
                    Toggle All
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button color="primary" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    isDisabled={shownExerciseGroups.length === 0}
                  >
                    Filter
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="Exercise List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredExercises.length}
          totalListLength={exercises.length}
          bottomContent={
            <div className="flex justify-between gap-1 w-full items-center">
              <Button
                color="secondary"
                variant="flat"
                onPress={() => handleCreateNewExerciseButton()}
                size="sm"
              >
                New Exercise
              </Button>
              <div className="flex gap-1.5">
                <Button
                  className="z-1"
                  variant="flat"
                  size="sm"
                  onPress={handleFilterExerciseGroupsButton}
                >
                  Filter Exercise Groups
                </Button>
                <Dropdown>
                  <DropdownTrigger>
                    <Button className="z-1" variant="flat" size="sm">
                      Sort By
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    selectionMode="single"
                    selectedKeys={[sortCategory]}
                    onAction={(key) => handleSortOptionSelection(key as string)}
                  >
                    <DropdownItem key="favorite">Favorites First</DropdownItem>
                    <DropdownItem key="name">Exercise Name (A-Z)</DropdownItem>
                    <DropdownItem key="num-sets">
                      Number Of Sets Completed
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          }
        />
        {isExercisesLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1 w-full">
              {filteredExercises.map((exercise) => (
                <div
                  className="flex justify-between items-center bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                  key={exercise.id}
                >
                  <button
                    className="flex flex-col justify-start items-start pl-2 py-1"
                    onClick={() => navigate(`/exercises/${exercise.id}`)}
                  >
                    <span className="w-[18.5rem] truncate text-left">
                      {exercise.name}
                    </span>
                    {exercise.set_count! > 0 && (
                      <span className="text-xs text-secondary text-left">
                        {FormatSetsCompletedString(exercise.set_count)}
                      </span>
                    )}
                    <span className="text-xs text-stone-400 text-left">
                      {exercise.formattedGroupString}
                    </span>
                  </button>
                  <div className="flex items-center gap-0.5 pr-1">
                    <FavoriteButton
                      name={exercise.name}
                      isFavorite={!!exercise.is_favorite}
                      item={exercise}
                      toggleFavorite={toggleFavorite}
                    />
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          aria-label={`Toggle ${exercise.name} Options Menu`}
                          isIconOnly
                          className="z-1"
                          radius="lg"
                          variant="light"
                        >
                          <VerticalMenuIcon size={19} color="#888" />
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
              {filteredExercises.length === 0 && (
                <EmptyListLabel itemName="Exercises" />
              )}
            </div>
            <Button variant="flat" onPress={restoreDefaultExercises}>
              Restore Default Exercises
            </Button>
          </>
        )}
      </div>
    </>
  );
}

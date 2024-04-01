import Database from "tauri-plugin-sql-api";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Exercise, ExerciseListItem } from "../typings";
import {
  ConvertExerciseGroupSetString,
  ValidateExerciseGroupSetString,
  ExerciseGroupDictionary,
  ConvertExerciseGroupStringListToSetString,
  CreateDefaultExerciseList,
} from "../helpers";
import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Checkbox,
  CheckboxGroup,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components";
import { SearchIcon } from "../assets";

export default function ExerciseListPage() {
  const [exercises, setExercises] = useState<ExerciseListItem[]>([]);
  const [exerciseToDelete, setExerciseToDelete] = useState<ExerciseListItem>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>("");

  const filteredExercises = useMemo(() => {
    if (filterQuery !== "") {
      return exercises.filter(
        (item) =>
          item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item.exercise_group_string
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase())
      );
    }
    return exercises;
  }, [exercises, filterQuery]);

  const deleteModal = useDisclosure();
  const newExerciseModal = useDisclosure();

  const navigate = useNavigate();

  const defaultNewExercise: Exercise = {
    id: 0,
    name: "",
    exercise_group_set_string: "",
    note: "",
  };

  const [newExercise, setNewExercise] = useState<Exercise>(defaultNewExercise);
  const [newExerciseGroupStringList, setNewExerciseGroupStringList] = useState<
    string[]
  >([]);

  const getExercises = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<Exercise[]>(
        "SELECT id, name, exercise_group_set_string FROM exercises"
      );

      const exercises: ExerciseListItem[] = result.map((row) => {
        const convertedValues = ConvertExerciseGroupSetString(
          row.exercise_group_set_string
        );
        return {
          id: row.id,
          name: row.name,
          exercise_group_list: convertedValues.list,
          exercise_group_string: convertedValues.formattedString,
        };
      });

      setExercises(exercises);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getExercises();
  }, [getExercises]);

  const deleteExercise = async () => {
    if (exerciseToDelete === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from exercises WHERE id = $1", [exerciseToDelete.id]);

      const updatedExercises: ExerciseListItem[] = exercises.filter(
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

  const handleDeleteButtonPress = (exercise: ExerciseListItem) => {
    setExerciseToDelete(exercise);
    deleteModal.onOpen();
  };

  const addExercise = async () => {
    if (!isNewExerciseValid()) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const noteToInsert: string | null =
        newExercise.note?.trim().length === 0 ? null : newExercise.note;

      const result = await db.execute(
        "INSERT into exercises (name, exercise_group_set_string, note) VALUES ($1, $2, $3)",
        [newExercise.name, newExercise.exercise_group_set_string, noteToInsert]
      );

      const convertedValues = ConvertExerciseGroupSetString(
        newExercise.exercise_group_set_string
      );

      const newExerciseListItem: ExerciseListItem = {
        id: result.lastInsertId,
        name: newExercise.name,
        exercise_group_list: convertedValues.list,
        exercise_group_string: convertedValues.formattedString,
      };
      setExercises([...exercises, newExerciseListItem]);

      newExerciseModal.onClose();
      setNewExercise(defaultNewExercise);
      setNewExerciseGroupStringList([]);

      toast.success("Exercise Created");
    } catch (error) {
      console.log(error);
    }
  };

  const isNewExerciseNameInvalid = useMemo(() => {
    return (
      newExercise.name === null ||
      newExercise.name === undefined ||
      newExercise.name.trim().length === 0
    );
  }, [newExercise.name]);

  const isNewExerciseGroupSetStringInvalid = useMemo(() => {
    return !ValidateExerciseGroupSetString(
      newExercise.exercise_group_set_string
    );
  }, [newExercise.exercise_group_set_string]);

  const handleExerciseGroupStringChange = (
    exerciseGroupStringList: string[]
  ) => {
    const exerciseGroupSetString = ConvertExerciseGroupStringListToSetString(
      exerciseGroupStringList
    );

    setNewExercise((prev) => ({
      ...prev,
      exercise_group_set_string: exerciseGroupSetString,
    }));
    setNewExerciseGroupStringList(exerciseGroupStringList);
  };

  const isNewExerciseValid = () => {
    if (
      newExercise.name === null ||
      newExercise === undefined ||
      newExercise.name.trim().length === 0
    )
      return false;

    if (!ValidateExerciseGroupSetString(newExercise.exercise_group_set_string))
      return false;

    return true;
  };

  const restoreDefaultExerciseList = async () => {
    await CreateDefaultExerciseList();
    await getExercises();
  };

  const exerciseGroupDictionary = ExerciseGroupDictionary();

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Exercise
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to permanently delete{" "}
                  {exerciseToDelete?.name}?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={deleteExercise}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={newExerciseModal.isOpen}
        onOpenChange={newExerciseModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                New Exercise
              </ModalHeader>
              <ModalBody>
                <Input
                  value={newExercise.name}
                  isInvalid={isNewExerciseNameInvalid}
                  label="Name"
                  errorMessage={
                    isNewExerciseNameInvalid && "Name can't be empty"
                  }
                  variant="faded"
                  onValueChange={(value) =>
                    setNewExercise((prev) => ({ ...prev, name: value }))
                  }
                  isRequired
                  isClearable
                />
                <Input
                  value={newExercise.note ?? ""}
                  label="Note"
                  variant="faded"
                  onValueChange={(value) =>
                    setNewExercise((prev) => ({ ...prev, note: value }))
                  }
                  isClearable
                />
                <div>
                  <CheckboxGroup
                    isRequired
                    isInvalid={isNewExerciseGroupSetStringInvalid}
                    defaultValue={newExerciseGroupStringList}
                    label="Select Exercise Groups"
                    errorMessage={
                      isNewExerciseGroupSetStringInvalid &&
                      "At least one Exercise Group must be selected"
                    }
                    onValueChange={(value) =>
                      handleExerciseGroupStringChange(value)
                    }
                  >
                    <div className="grid grid-cols-2 gap-0.5">
                      {Array.from(exerciseGroupDictionary).map(
                        ([key, value]) => (
                          <Checkbox key={key} color="success" value={key}>
                            {value}
                          </Checkbox>
                        )
                      )}
                    </div>
                  </CheckboxGroup>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  onPress={addExercise}
                  isDisabled={
                    isNewExerciseNameInvalid ||
                    isNewExerciseGroupSetStringInvalid
                  }
                >
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col items-center gap-2">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
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
        {isLoading ? (
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
                      {exercise.exercise_group_string}
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
                      onPress={() => handleDeleteButtonPress(exercise)}
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
                  onPress={restoreDefaultExerciseList}
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

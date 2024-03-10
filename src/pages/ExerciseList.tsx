import Database from "tauri-plugin-sql-api";
import { useState, useEffect } from "react";
import { Exercise, ExerciseListItem } from "../typings";
import { ConvertExerciseGroupSetString } from "../helpers/Exercises/ConvertExerciseGroupSetString";
import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ExerciseListPage() {
  const [exercises, setExercises] = useState<ExerciseListItem[]>([]);
  const [exerciseToDelete, setExerciseToDelete] = useState<ExerciseListItem>();

  const deleteModal = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    const getExercises = async () => {
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
            exercise_group_set: convertedValues.set,
            exercise_group_string: convertedValues.formattedString,
          };
        });

        setExercises(exercises);
      } catch (error) {
        console.log(error);
      }
    };

    getExercises();
  }, []);

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
                <p>Are you sure you want to permanently delete Exercise?</p>
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
      <div className="flex flex-col items-center gap-2">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Exercise List
          </h1>
        </div>
        <div className="flex flex-col">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex flex-row justify-between rounded-lg px-2 hover:bg-amber-100 p-1"
            >
              <div className="flex flex-col">
                <div className="text-lg">{exercise.name}</div>
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
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { WorkoutListItem } from "../typings";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { FormatDateString } from "../helpers";

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<WorkoutListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutListItem>();

  const navigate = useNavigate();

  const deleteModal = useDisclosure();

  useEffect(() => {
    const getWorkouts = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutListItem[]>(
          "SELECT id, date FROM workouts"
        );

        const workouts: WorkoutListItem[] = result.map((row) => {
          const formattedDate: string = FormatDateString(row.date);
          return {
            id: row.id,
            date: formattedDate,
          };
        });

        setWorkouts(workouts);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getWorkouts();
  }, []);

  const deleteWorkout = async () => {
    if (workoutToDelete === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from workouts WHERE id = $1", [workoutToDelete.id]);

      // Delete all sets referencing workout
      db.execute("DELETE from sets WHERE workout_id = $1", [
        workoutToDelete.id,
      ]);

      const updatedWorkouts: WorkoutListItem[] = workouts.filter(
        (item) => item.id !== workoutToDelete?.id
      );
      setWorkouts(updatedWorkouts);

      toast.success("Workout Deleted");
    } catch (error) {
      console.log(error);
    }

    setWorkoutToDelete(undefined);
    deleteModal.onClose();
  };

  const handleDeleteButtonPress = (workout: WorkoutListItem) => {
    setWorkoutToDelete(workout);
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
                Delete Workout
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to permanently delete Workout on{" "}
                  {workoutToDelete?.date}, including all Sets performed in the
                  Workout?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={deleteWorkout}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Workout List
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex flex-col gap-1.5 w-full">
            {workouts.map((workout) => (
              <div
                className="flex flex-row justify-between items-center gap-2"
                key={`${workout.id}`}
                onClick={() => navigate(`/workouts/${workout.id}`)}
              >
                <div className="text-lg font-medium bg-white px-2.5 py-2 w-full rounded-lg cursor-pointer hover:bg-stone-100">
                  {workout.date}
                </div>
                <div>
                  <Button
                    color="danger"
                    onPress={() => handleDeleteButtonPress(workout)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Workout, WorkoutSet } from "../typings";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";
import { NotFound } from ".";
import {
  CreateSetsFromWorkoutTemplate,
  GenerateSetListOrderString,
  OrderSetsBySetListOrderString,
} from "../helpers";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Reorder } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function WorkoutDetails() {
  const [workout, setWorkout] = useState<Workout>();
  const [workoutDate, setWorkoutDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [setToDelete, setSetToDelete] = useState<WorkoutSet>();

  const initialized = useRef(false);

  const { id } = useParams();

  const deleteModal = useDisclosure();

  const updateWorkout = useCallback(async (workout: Workout) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute(
        `UPDATE workouts SET 
        workout_template_id = $1, date = $2, set_list_order = $3, note = $4, is_loaded = $5 
        WHERE id = $6`,
        [
          workout.workout_template_id,
          workout.date,
          workout.set_list_order,
          workout.note,
          workout.is_loaded,
          workout.id,
        ]
      );
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Workout[]>(
          "SELECT * FROM workouts WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const workout: Workout = result[0];

        if (workout.is_loaded) {
          const setList = await db.select<WorkoutSet[]>(
            `SELECT sets.*, exercises.name AS exercise_name
            FROM sets 
            JOIN exercises ON sets.exercise_id = exercises.id 
            WHERE workout_id = $1 AND is_template = 0`,
            [id]
          );

          const orderedSetList: WorkoutSet[] = OrderSetsBySetListOrderString(
            setList,
            workout.set_list_order
          );

          setSets(orderedSetList);
        } else {
          // Stop useEffect running twice in dev
          if (!initialized.current) {
            initialized.current = true;
          } else return;

          if (workout.workout_template_id !== 0) {
            const setList = await CreateSetsFromWorkoutTemplate(
              workout.id,
              workout.workout_template_id
            );

            const setListOrder: string = GenerateSetListOrderString(setList);
            workout.set_list_order = setListOrder;

            setSets(setList);
          }

          workout.is_loaded = 1;

          await updateWorkout(workout);
        }

        const formattedDate: string = new Date(workout.date).toDateString();

        setWorkout(workout);
        setWorkoutDate(formattedDate);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    loadWorkout();
  }, [id, updateWorkout]);

  const updateSetListOrder = async (setList: WorkoutSet[] = sets) => {
    if (workout === undefined) return;

    const setListOrderString: string = GenerateSetListOrderString(setList);

    const updatedWorkout: Workout = {
      ...workout,
      set_list_order: setListOrderString,
    };

    await updateWorkout(updatedWorkout);
    setWorkout(updatedWorkout);
  };

  const deleteSet = async () => {
    if (setToDelete === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from sets WHERE id = $1", [setToDelete.id]);

      const updatedSetList: WorkoutSet[] = sets.filter(
        (item) => item.id !== setToDelete.id
      );
      setSets(updatedSetList);
      await updateSetListOrder(updatedSetList);

      toast.success("Set Deleted");
    } catch (error) {
      console.log(error);
    }

    setSetToDelete(undefined);
    deleteModal.onClose();
  };

  const handleDeleteButtonPress = (set: WorkoutSet) => {
    setSetToDelete(set);
    deleteModal.onOpen();
  };

  if (workout === undefined) return NotFound();

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
                Delete Set
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete {setToDelete?.exercise_name}{" "}
                  Set from Workout?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={deleteSet}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex justify-center">
              <h1 className="text-2xl font-semibold">{workoutDate}</h1>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold flex items-center justify-between">
                Set List{" "}
                {sets.length > 1 && (
                  <span className="text-xs italic text-stone-500 font-normal">
                    Drag Sets To Reorder Set List
                  </span>
                )}
              </h2>
              <div className="flex flex-col gap-1">
                <Reorder.Group
                  className="flex flex-col gap-1"
                  values={sets}
                  onReorder={setSets}
                >
                  {sets.map((set) => (
                    <Reorder.Item
                      key={set.id}
                      value={set}
                      onDragEnd={() => updateSetListOrder()}
                    >
                      <div className="flex gap-2 justify-between items-center">
                        <span>{set.exercise_name}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            color="danger"
                            onPress={() => handleDeleteButtonPress(set)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Listbox,
  ListboxItem,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { Workout, WorkoutTemplateListItem } from "../typings";
import { GetCurrentYmdDateString } from "../helpers/Dates/GetCurrentYmdDateString";
import Database from "tauri-plugin-sql-api";
import { useState, useEffect } from "react";

export default function WorkoutIndex() {
  const [workoutTemplates, setWorkoutTemplates] = useState<
    WorkoutTemplateListItem[]
  >([]);

  const navigate = useNavigate();

  const workoutTemplatesModal = useDisclosure();

  useEffect(() => {
    const getWorkoutTemplates = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutTemplateListItem[]>(
          "SELECT id, name FROM workout_templates"
        );

        const templates: WorkoutTemplateListItem[] = result.map((row) => ({
          id: row.id,
          name: row.name,
        }));

        setWorkoutTemplates(templates);
      } catch (error) {
        console.log(error);
      }
    };

    getWorkoutTemplates();
  }, []);

  const createWorkout = async (workout_template_id: number) => {
    const currentDate: string = GetCurrentYmdDateString();

    const newWorkout: Workout = {
      id: 0,
      workout_template_id: workout_template_id,
      date: currentDate,
      set_list_order: "",
      note: null,
    };

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into workouts (workout_template_id, date, set_list_order, note) VALUES ($1, $2, $3, $4)",
        [
          newWorkout.workout_template_id,
          newWorkout.date,
          newWorkout.set_list_order,
          newWorkout.note,
        ]
      );

      navigate(`/workouts/${result.lastInsertId}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Modal
        isOpen={workoutTemplatesModal.isOpen}
        onOpenChange={workoutTemplatesModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-1.5">
                Load Workout Template
              </ModalHeader>
              <ModalBody>
                <Listbox
                  aria-label="Workout Template List"
                  // onAction={}
                >
                  {workoutTemplates.map((template) => (
                    <ListboxItem
                      key={`${template.id}`}
                      className="text-success"
                      color="success"
                      variant="faded"
                    >
                      {template.name}
                    </ListboxItem>
                  ))}
                </Listbox>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col gap-3">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Workouts
          </h1>
        </div>
        <div className="flex flex-col justify-center gap-1.5">
          <Button
            size="lg"
            color="success"
            className="font-medium text-xl"
            onPress={() => createWorkout(0)}
          >
            New Empty Workout
          </Button>
          <Button
            size="lg"
            color="success"
            className="font-medium text-xl"
            onPress={() => workoutTemplatesModal.onOpen()}
          >
            New Workout From Template
          </Button>
          <Button
            size="lg"
            color="primary"
            className="font-medium text-xl"
            onPress={() => navigate(`/workouts/list`)}
          >
            Workout List
          </Button>
        </div>
      </div>
    </>
  );
}

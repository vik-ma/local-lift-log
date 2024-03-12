import Database from "tauri-plugin-sql-api";
import { WorkoutTemplate } from "../typings";
import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

export default function WorkoutTemplateList() {
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    const getWorkoutTemplates = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutTemplate[]>(
          "SELECT * FROM workout_templates"
        );

        const templates: WorkoutTemplate[] = result.map((row) => ({
          id: row.id,
          name: row.name,
          set_list_order: row.set_list_order,
          note: row.note,
        }));

        setWorkoutTemplates(templates);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getWorkoutTemplates();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Workout Templates
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              {workoutTemplates.map((template, index) => (
                <div
                  className="flex flex-row justify-stretch gap-1"
                  key={`routine-${index}`}
                >
                  <div className="w-[200px]">
                    <Button
                      className="w-full text-lg font-medium"
                      color="primary"
                      onPress={() =>
                        navigate(`/workout-templates/${template.id}`)
                      }
                    >
                      {template.name}
                    </Button>
                  </div>
                  <Button
                    color="danger"
                    // onPress={() => handleDeleteButtonPress(template)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                className="text-lg font-medium"
                size="lg"
                color="success"
                // onPress={() => newWorkoutTemplateModal.onOpen()}
              >
                Create New Workout Template
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

import Database from "tauri-plugin-sql-api";
import { WorkoutTemplate, WorkoutTemplateListItem } from "../typings";
import { Button, useDisclosure } from "@nextui-org/react";
import { useState, useEffect } from "react";
import {
  LoadingSpinner,
  DeleteModal,
  WorkoutTemplateModal,
} from "../components";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useDefaultWorkoutTemplate, useValidateName } from "../hooks";
import { ConvertEmptyStringToNull } from "../helpers";

export default function WorkoutTemplateList() {
  const [workoutTemplates, setWorkoutTemplates] = useState<
    WorkoutTemplateListItem[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workoutTemplateToDelete, setWorkoutTemplateToDelete] =
    useState<WorkoutTemplateListItem>();

  const defaultNewWorkoutTemplate = useDefaultWorkoutTemplate();

  const [newWorkoutTemplate, setNewWorkoutTemplate] = useState<WorkoutTemplate>(
    defaultNewWorkoutTemplate
  );

  const navigate = useNavigate();

  const deleteModal = useDisclosure();
  const workoutTemplateModal = useDisclosure();

  const isNewWorkoutTemplateNameValid = useValidateName(
    newWorkoutTemplate.name
  );

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
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getWorkoutTemplates();
  }, []);

  const addWorkoutTemplate = async () => {
    if (!isNewWorkoutTemplateNameValid) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const noteToInsert = ConvertEmptyStringToNull(newWorkoutTemplate.note);

      const result = await db.execute(
        "INSERT into workout_templates (name, exercise_order, note) VALUES ($1, $2, $3)",
        [
          newWorkoutTemplate.name,
          newWorkoutTemplate.exercise_order,
          noteToInsert,
        ]
      );

      const newTemplate: WorkoutTemplateListItem = {
        id: result.lastInsertId,
        name: newWorkoutTemplate.name,
      };
      setWorkoutTemplates([...workoutTemplates, newTemplate]);

      workoutTemplateModal.onClose();
      navigate(`/workout-templates/${result.lastInsertId}`);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteWorkoutTemplate = async () => {
    if (workoutTemplateToDelete === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from workout_templates WHERE id = $1", [
        workoutTemplateToDelete.id,
      ]);

      // Delete all sets referencing workout_template
      db.execute(
        "DELETE from sets WHERE workout_template_id = $1 AND is_template = 1",
        [workoutTemplateToDelete.id]
      );

      const updatedWorkoutTemplates: WorkoutTemplateListItem[] =
        workoutTemplates.filter(
          (item) => item.id !== workoutTemplateToDelete?.id
        );
      setWorkoutTemplates(updatedWorkoutTemplates);

      toast.success("Workout Template Deleted");
    } catch (error) {
      console.log(error);
    }

    setWorkoutTemplateToDelete(undefined);
    deleteModal.onClose();
  };

  const handleDeleteButton = (workoutTemplate: WorkoutTemplateListItem) => {
    setWorkoutTemplateToDelete(workoutTemplate);
    deleteModal.onOpen();
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <WorkoutTemplateModal
        workoutTemplateModal={workoutTemplateModal}
        workoutTemplate={newWorkoutTemplate}
        setWorkoutTemplate={setNewWorkoutTemplate}
        isWorkoutTemplateNameValid={isNewWorkoutTemplateNameValid}
        buttonAction={addWorkoutTemplate}
      />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Workout Template"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete{" "}
            {workoutTemplateToDelete?.name}?
          </p>
        }
        deleteButtonAction={deleteWorkoutTemplate}
      />

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
                  key={`workout-template-${index}`}
                >
                  <div className="w-full">
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
                    onPress={() => handleDeleteButton(template)}
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
                onPress={() => workoutTemplateModal.onOpen()}
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

import Database from "tauri-plugin-sql-api";
import { WorkoutTemplate } from "../typings";
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

type OperationType = "edit" | "delete";

export default function WorkoutTemplateList() {
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [operationType, setOperationType] = useState<OperationType>("edit");

  const defaultWorkoutTemplate = useDefaultWorkoutTemplate();

  const [operatingWorkoutTemplate, setOperatingWorkoutTemplate] =
    useState<WorkoutTemplate>(defaultWorkoutTemplate);

  const navigate = useNavigate();

  const deleteModal = useDisclosure();
  const workoutTemplateModal = useDisclosure();

  const isNewWorkoutTemplateNameValid = useValidateName(
    operatingWorkoutTemplate.name
  );

  useEffect(() => {
    const getWorkoutTemplates = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        // Get id, name and how many Sets and Exercises every WorkoutTemplate contains
        const result = await db.select<WorkoutTemplate[]>(
          `SELECT workout_templates.*, 
          COUNT(DISTINCT CASE WHEN is_template = 1 THEN sets.exercise_id END) AS numExercises,
          SUM(CASE WHEN is_template = 1 THEN 1 ELSE 0 END) AS numSets
          FROM workout_templates LEFT JOIN sets 
          ON workout_templates.id = sets.workout_template_id 
          GROUP BY workout_templates.id`
        );

        setWorkoutTemplates(result);
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

      const noteToInsert = ConvertEmptyStringToNull(
        operatingWorkoutTemplate.note
      );

      const result = await db.execute(
        "INSERT into workout_templates (name, exercise_order, note) VALUES ($1, $2, $3)",
        [
          operatingWorkoutTemplate.name,
          operatingWorkoutTemplate.exercise_order,
          noteToInsert,
        ]
      );

      const newTemplate: WorkoutTemplate = {
        ...operatingWorkoutTemplate,
        id: result.lastInsertId,
      };

      setWorkoutTemplates([...workoutTemplates, newTemplate]);

      workoutTemplateModal.onClose();

      navigate(`/workout-templates/${result.lastInsertId}`);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteWorkoutTemplate = async () => {
    if (operatingWorkoutTemplate.id === 0 || operationType !== "delete") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from workout_templates WHERE id = $1", [
        operatingWorkoutTemplate.id,
      ]);

      // Delete all sets referencing workout_template
      db.execute(
        "DELETE from sets WHERE workout_template_id = $1 AND is_template = 1",
        [operatingWorkoutTemplate.id]
      );

      const updatedWorkoutTemplates: WorkoutTemplate[] =
        workoutTemplates.filter(
          (item) => item.id !== operatingWorkoutTemplate?.id
        );
      setWorkoutTemplates(updatedWorkoutTemplates);

      toast.success("Workout Template Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingWorkoutTemplate();
    deleteModal.onClose();
  };

  const resetOperatingWorkoutTemplate = () => {
    setOperatingWorkoutTemplate(defaultWorkoutTemplate);
    setOperationType("edit");
  };

  const handleDeleteButton = (workoutTemplate: WorkoutTemplate) => {
    setOperatingWorkoutTemplate(workoutTemplate);
    setOperationType("delete");
    deleteModal.onOpen();
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <WorkoutTemplateModal
        workoutTemplateModal={workoutTemplateModal}
        workoutTemplate={operatingWorkoutTemplate}
        setWorkoutTemplate={setOperatingWorkoutTemplate}
        isWorkoutTemplateNameValid={isNewWorkoutTemplateNameValid}
        buttonAction={addWorkoutTemplate}
        isEditing={operationType === "edit"}
      />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Workout Template"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete{" "}
            {operatingWorkoutTemplate?.name}?
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
                  className="flex flex-row items-center gap-1"
                  key={`workout-template-${index}`}
                >
                  <div className="flex-grow">
                    <button
                      className="flex flex-col justify-start items-start bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:bg-default-200 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                      onClick={() =>
                        navigate(`/workout-templates/${template.id}`)
                      }
                    >
                      <span className="w-72 truncate text-left">
                        {template.name}
                      </span>
                      <span className="text-xs text-stone-500 text-left">
                        {template.numExercises} Exercises, {template.numSets}{" "}
                        Sets
                      </span>
                    </button>
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

import Database from "tauri-plugin-sql-api";
import { WorkoutTemplate } from "../typings";
import {
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { useState } from "react";
import {
  LoadingSpinner,
  DeleteModal,
  WorkoutTemplateModal,
} from "../components";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  useDefaultWorkoutTemplate,
  useValidateName,
  useWorkoutTemplateList,
} from "../hooks";
import {
  ConvertEmptyStringToNull,
  DeleteItemFromList,
  UpdateItemInList,
  UpdateWorkoutTemplate,
  FormatNumItemsString,
  GetUniqueMultisetIds,
  DeleteMultisetWithId,
} from "../helpers";
import { VerticalMenuIcon } from "../assets";

type OperationType = "add" | "edit" | "delete";

export default function WorkoutTemplateList() {
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

  const { workoutTemplates, setWorkoutTemplates, isLoading } =
    useWorkoutTemplateList();

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

      const workoutTemplateMultisetIds = await GetUniqueMultisetIds(
        operatingWorkoutTemplate.id,
        true
      );

      // Delete all multisets in workout
      for (const multisetId of workoutTemplateMultisetIds) {
        await DeleteMultisetWithId(multisetId);
      }

      // Delete all sets referencing workout_template
      db.execute(
        "DELETE from sets WHERE workout_template_id = $1 AND is_template = 1",
        [operatingWorkoutTemplate.id]
      );

      const updatedWorkoutTemplates = DeleteItemFromList(
        workoutTemplates,
        operatingWorkoutTemplate.id
      );

      setWorkoutTemplates(updatedWorkoutTemplates);

      toast.success("Workout Template Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingWorkoutTemplate();
    deleteModal.onClose();
  };

  const updateWorkoutTemplate = async () => {
    if (operatingWorkoutTemplate.id === 0 || operationType !== "edit") return;

    const noteToInsert = ConvertEmptyStringToNull(
      operatingWorkoutTemplate.note
    );

    const updatedWorkoutTemplate: WorkoutTemplate = {
      ...operatingWorkoutTemplate,
      note: noteToInsert,
    };

    const success = await UpdateWorkoutTemplate(updatedWorkoutTemplate);

    if (!success) return;

    const updatedWorkoutTemplates = UpdateItemInList(
      workoutTemplates,
      updatedWorkoutTemplate
    );

    setWorkoutTemplates(updatedWorkoutTemplates);

    resetOperatingWorkoutTemplate();
    workoutTemplateModal.onClose();
  };

  const resetOperatingWorkoutTemplate = () => {
    setOperatingWorkoutTemplate(defaultWorkoutTemplate);
    setOperationType("add");
  };

  const handleWorkoutTemplateOptionSelection = (
    key: string,
    workoutTemplate: WorkoutTemplate
  ) => {
    if (key === "edit") {
      setOperationType("edit");
      setOperatingWorkoutTemplate(workoutTemplate);
      workoutTemplateModal.onOpen();
    } else if (key === "delete") {
      setOperationType("delete");
      setOperatingWorkoutTemplate(workoutTemplate);
      deleteModal.onOpen();
    }
  };

  const handleCreateNewWorkoutTemplateButton = () => {
    if (operationType !== "add") {
      resetOperatingWorkoutTemplate();
    }
    workoutTemplateModal.onOpen();
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <WorkoutTemplateModal
        workoutTemplateModal={workoutTemplateModal}
        workoutTemplate={operatingWorkoutTemplate}
        setWorkoutTemplate={setOperatingWorkoutTemplate}
        isWorkoutTemplateNameValid={isNewWorkoutTemplateNameValid}
        buttonAction={
          operationType === "edit" ? updateWorkoutTemplate : addWorkoutTemplate
        }
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
            <div className="flex flex-col gap-1 w-full">
              {workoutTemplates.map((template) => (
                <div
                  className="flex flex-row justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                  key={template.id}
                >
                  <button
                    className="flex flex-col justify-start items-start"
                    onClick={() =>
                      navigate(`/workout-templates/${template.id}`)
                    }
                  >
                    <span className="w-[21rem] truncate text-left">
                      {template.name}
                    </span>
                    {template.numSets! > 0 ? (
                      <span className="text-xs text-secondary text-left">
                        {FormatNumItemsString(
                          template.numExercises,
                          "Exercise"
                        )}
                        , {FormatNumItemsString(template.numSets, "Set")}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400 text-left">
                        Empty
                      </span>
                    )}
                    <span className="w-[21rem] break-all text-xs text-stone-500 text-left">
                      {template.note}
                    </span>
                  </button>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        aria-label={`Toggle ${template.name} Options Menu`}
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
                      aria-label={`Option Menu For ${template.name} Workout Template`}
                      onAction={(key) =>
                        handleWorkoutTemplateOptionSelection(
                          key as string,
                          template
                        )
                      }
                    >
                      <DropdownItem key="edit">Edit</DropdownItem>
                      <DropdownItem key="delete" className="text-danger">
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                className="font-medium"
                variant="flat"
                onPress={handleCreateNewWorkoutTemplateButton}
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

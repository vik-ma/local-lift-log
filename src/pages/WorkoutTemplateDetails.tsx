import { useParams } from "react-router-dom";
import { UserSettingsOptional, WorkoutSet, WorkoutTemplate } from "../typings";
import { useState, useMemo, useEffect } from "react";
import {
  Button,
  Input,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import LoadingSpinner from "../components/LoadingSpinner";
import { NotFound } from ".";
import toast, { Toaster } from "react-hot-toast";
import { GetDefaultUnitValues } from "../helpers/UserSettings/GetDefaultUnitValues";

export default function WorkoutTemplateDetails() {
  const { id } = useParams();
  const [workoutTemplate, setWorkoutTemplate] = useState<WorkoutTemplate>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newWorkoutTemplateName, setNewWorkoutTemplateName] =
    useState<string>("");
  const [newWorkoutTemplateNote, setNewWorkoutTemplateNote] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();

  const defaultNewSet: WorkoutSet = {
    id: 0,
    workout_id: 0,
    exercise_id: 0,
    is_template: 1,
    workout_template_id: 0,
    note: null,
    comment: null,
    is_completed: 0,
    time_completed: null,
    is_warmup: 0,
    weight: 0,
    reps: 0,
    rir: 0,
    rpe: 0,
    time_in_seconds: 0,
    distance: 0,
    resistance_level: 0,
    is_tracking_weight: 0,
    is_tracking_reps: 0,
    is_tracking_rir: 0,
    is_tracking_rpe: 0,
    is_tracking_time: 0,
    is_tracking_distance: 0,
    is_tracking_resistance_level: 0,
    weight_unit: "",
    distance_unit: "",
  };

  const [newSet, setNewSet] = useState<WorkoutSet>(defaultNewSet);

  const isNewWorkoutTemplateNameInvalid = useMemo(() => {
    return (
      newWorkoutTemplateName === null ||
      newWorkoutTemplateName === undefined ||
      newWorkoutTemplateName.trim().length === 0
    );
  }, [newWorkoutTemplateName]);

  useEffect(() => {
    const getWorkoutTemplate = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutTemplate[]>(
          "SELECT * FROM workout_templates WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const currentWorkoutTemplate: WorkoutTemplate = result[0];
        setWorkoutTemplate(currentWorkoutTemplate);
        setNewWorkoutTemplateName(currentWorkoutTemplate.name);
        setNewWorkoutTemplateNote(currentWorkoutTemplate.note ?? "");
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    const loadUserSettings = async () => {
      try {
        const userSettings = await GetDefaultUnitValues();
        if (userSettings !== undefined) setUserSettings(userSettings);
      } catch (error) {
        console.log(error);
      }
    };

    getWorkoutTemplate();
    loadUserSettings();
  }, [id]);

  const updateWorkoutTemplateNoteAndName = async () => {
    if (isNewWorkoutTemplateNameInvalid) return;

    try {
      if (workoutTemplate === undefined) return;

      const noteToInsert: string | null =
        newWorkoutTemplateNote.trim().length === 0
          ? null
          : newWorkoutTemplateNote;

      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE workout_templates SET name = $1, note = $2 WHERE id = $3",
        [newWorkoutTemplateName, noteToInsert, workoutTemplate.id]
      );

      setWorkoutTemplate((prev) => ({
        ...prev!,
        name: newWorkoutTemplateName,
        note: newWorkoutTemplateNote,
      }));

      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (workoutTemplate === undefined) return NotFound();

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
            <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
              {workoutTemplate.name}
            </h1>
          </div>
          <div>
            <h2 className="text-xl font-semibold ">Note</h2>
            <span>{workoutTemplate?.note}</span>
          </div>
          {isEditing ? (
            <div className="flex flex-col justify-center gap-2">
              <Input
                value={newWorkoutTemplateName}
                isInvalid={isNewWorkoutTemplateNameInvalid}
                label="Name"
                errorMessage={
                  isNewWorkoutTemplateNameInvalid && "Name can't be empty"
                }
                variant="faded"
                onValueChange={(value) => setNewWorkoutTemplateName(value)}
                isRequired
                isClearable
              />
              <Input
                value={newWorkoutTemplateNote!}
                label="Note"
                variant="faded"
                onValueChange={(value) => setNewWorkoutTemplateNote(value)}
                isClearable
              />
              <div className="flex justify-center gap-4">
                <Button color="danger" onPress={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  onPress={updateWorkoutTemplateNoteAndName}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button color="primary" onPress={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold ">Set List</h2>
            <div className="flex justify-center">
              <Button color="success">Add Set</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

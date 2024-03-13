import { useParams } from "react-router-dom";
import {
  Routine,
  WorkoutTemplateListItem,
  RoutineScheduleItem,
} from "../typings";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Listbox,
  ListboxItem,
} from "@nextui-org/react";
import { NotFound } from ".";
import Database from "tauri-plugin-sql-api";
import LoadingSpinner from "../components/LoadingSpinner";
import { GetScheduleDayNames } from "../helpers/Routines/GetScheduleDayNames";
import { GetScheduleDayValues } from "../helpers/Routines/GetScheduleValues";
import toast, { Toaster } from "react-hot-toast";

export default function RoutineDetailsPage() {
  const { id } = useParams();
  const [routine, setRoutine] = useState<Routine>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newRoutineName, setNewRoutineName] = useState<string>("");
  const [newRoutineNote, setNewRoutineNote] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workoutTemplates, setWorkoutTemplates] = useState<
    WorkoutTemplateListItem[]
  >([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [scheduleValues, setScheduleValues] = useState<RoutineScheduleItem[][]>(
    []
  );

  const isNewRoutineNameInvalid = useMemo(() => {
    return (
      newRoutineName === null ||
      newRoutineName === undefined ||
      newRoutineName.trim().length === 0
    );
  }, [newRoutineName]);

  const workoutTemplatesModal = useDisclosure();

  const getWorkoutTemplateSchedules = useCallback(async () => {
    if (routine?.num_days_in_schedule === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<RoutineScheduleItem[]>(
        `SELECT workout_template_schedules.id, day, workout_template_id,
        (SELECT name FROM workout_templates WHERE id = workout_template_schedules.workout_template_id) AS name
        FROM workout_template_schedules 
        WHERE routine_id = $1`,
        [id]
      );

      const schedules: RoutineScheduleItem[] = result.map((row) => ({
        id: row.id,
        day: row.day,
        workout_template_id: row.workout_template_id,
        name: row.name,
      }));

      const workoutScheduleStringList: RoutineScheduleItem[][] =
        GetScheduleDayValues(routine?.num_days_in_schedule, schedules);

      setScheduleValues(workoutScheduleStringList);
    } catch (error) {
      console.log(error);
    }
  }, [id, routine?.num_days_in_schedule]);

  useEffect(() => {
    const getRoutine = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Routine[]>(
          "SELECT * FROM routines WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const currentRoutine: Routine = result[0];
        setRoutine(currentRoutine);
        setNewRoutineName(currentRoutine.name);
        setNewRoutineNote(currentRoutine.note ?? "");
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

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

    getRoutine();
    getWorkoutTemplates();
    getWorkoutTemplateSchedules();
  }, [id, getWorkoutTemplateSchedules]);

  const updateRoutineNoteAndName = async () => {
    if (isNewRoutineNameInvalid) return;

    try {
      if (routine === undefined) return;

      const noteToInsert: string | null =
        newRoutineNote.trim().length === 0 ? null : newRoutineNote;

      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE routines SET name = $1, note = $2 WHERE id = $3",
        [newRoutineName, noteToInsert, routine.id]
      );

      setRoutine((prev) => ({
        ...prev!,
        name: newRoutineName,
        note: newRoutineNote,
      }));

      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddWorkoutButtonPress = (day: number) => {
    setSelectedDay(day);
    workoutTemplatesModal.onOpen();
  };

  const addWorkoutTemplateToDay = async (workoutTemplateIdString: string) => {
    const workoutTemplateId: number = parseInt(workoutTemplateIdString);

    if (
      routine === undefined ||
      isNaN(workoutTemplateId) ||
      selectedDay < 0 ||
      selectedDay > routine?.num_days_in_schedule - 1
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "INSERT into workout_template_schedules (day, workout_template_id, routine_id) VALUES ($1, $2, $3)",
        [selectedDay, workoutTemplateId, routine.id]
      );

      await getWorkoutTemplateSchedules();

      workoutTemplatesModal.onClose();
      toast.success(`Workout added to ${dayNameList[selectedDay]}`);
    } catch (error) {
      console.log(error);
    }
  };

  const removeWorkoutTemplateFromDay = async (workoutTemplateId: number) => {
    if (
      routine === undefined ||
      isNaN(workoutTemplateId) ||
      selectedDay < 0 ||
      selectedDay > routine?.num_days_in_schedule - 1
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute("DELETE from workout_template_schedules WHERE id = $1", [
        workoutTemplateId,
      ]);

      await getWorkoutTemplateSchedules();

      workoutTemplatesModal.onClose();
      toast.success(`Workout removed from ${dayNameList[selectedDay]}`);
    } catch (error) {
      console.log(error);
    }
  };

  if (routine === undefined) return NotFound();

  const dayNameList: string[] = GetScheduleDayNames(
    routine?.num_days_in_schedule,
    routine?.is_schedule_weekly === "true" ? true : false
  );

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <Modal
        isOpen={workoutTemplatesModal.isOpen}
        onOpenChange={workoutTemplatesModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-1.5">
                <h2>
                  Add Workout Template to{" "}
                  <span className="text-success">
                    {dayNameList[selectedDay]}
                  </span>
                </h2>
              </ModalHeader>
              <ModalBody>
                <Listbox
                  aria-label="Workout Template List"
                  onAction={(key) => addWorkoutTemplateToDay(key.toString())}
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
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
              <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
                {routine?.name}
              </h1>
            </div>
            <div>
              <h2 className="text-xl px-1">
                <span className="font-semibold">Note:</span> {routine?.note}
              </h2>
            </div>
            {isEditing ? (
              <div className="flex flex-col justify-center gap-2">
                <Input
                  value={newRoutineName}
                  isInvalid={isNewRoutineNameInvalid}
                  label="Name"
                  errorMessage={
                    isNewRoutineNameInvalid && "Name can't be empty"
                  }
                  variant="faded"
                  onValueChange={(value) => setNewRoutineName(value)}
                  isRequired
                  isClearable
                />
                <Input
                  value={newRoutineNote!}
                  label="Note"
                  variant="faded"
                  onValueChange={(value) => setNewRoutineNote(value)}
                  isClearable
                />
                <div className="flex justify-center gap-4">
                  <Button color="danger" onPress={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button color="success" onPress={updateRoutineNoteAndName}>
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
          </>
        )}
        <div>
          <h2 className="text-xl font-semibold">
            {routine.is_schedule_weekly !== "true"
              ? `${routine.num_days_in_schedule} Day Schedule`
              : "Weekly Schedule"}
          </h2>
          <div className="flex flex-col gap-0.5 py-1">
            {Array.from(Array(routine.num_days_in_schedule), (_, i) => (
              <div
                key={`day-${i + 1}`}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col w-48 gap-1">
                  <span className="font-medium">{dayNameList[i]}</span>
                  {scheduleValues[i]?.length > 0 ? (
                    scheduleValues[i].map((schedule) => {
                      return (
                        <div
                          key={`${schedule.id}`}
                          className="flex justify-between items-center"
                        >
                          <span>{schedule.name}</span>
                          <Button
                            className="text-sm"
                            size="sm"
                            color="danger"
                            onPress={() => {
                              removeWorkoutTemplateFromDay(schedule.id);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-stone-400">No workout</div>
                  )}
                </div>
                <Button
                  color="success"
                  onPress={() => handleAddWorkoutButtonPress(i)}
                >
                  Add Workout
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

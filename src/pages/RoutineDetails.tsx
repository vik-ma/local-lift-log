import { useParams } from "react-router-dom";
import {
  Routine,
  WorkoutTemplateListItem,
  RoutineScheduleItem,
  UserSettingsOptional,
} from "../typings";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  DatePicker,
  DateValue,
} from "@nextui-org/react";
import { NotFound } from ".";
import Database from "tauri-plugin-sql-api";
import { LoadingSpinner, DeleteModal, RoutineModal } from "../components";
import {
  GetScheduleDayNames,
  GetScheduleDayValues,
  UpdateActiveRoutineId,
  ConvertDateToYmdString,
  IsYmdDateStringValid,
  ConvertEmptyStringToNull,
  DefaultNewRoutine,
} from "../helpers";
import toast, { Toaster } from "react-hot-toast";
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { useIsRoutineValid } from "../hooks";

export default function RoutineDetailsPage() {
  const { id } = useParams();
  const [routine, setRoutine] = useState<Routine>(DefaultNewRoutine());
  const [editedRoutine, setEditedRoutine] = useState<Routine>(
    DefaultNewRoutine()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workoutTemplates, setWorkoutTemplates] = useState<
    WorkoutTemplateListItem[]
  >([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [scheduleValues, setScheduleValues] = useState<RoutineScheduleItem[][]>(
    []
  );
  const [workoutRoutineScheduleToRemove, setWorkoutRoutineScheduleToRemove] =
    useState<RoutineScheduleItem>();
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();

  const deleteModal = useDisclosure();
  const workoutTemplatesModal = useDisclosure();
  const routineModal = useDisclosure();

  const { isRoutineNameValid, isRoutineValid } =
    useIsRoutineValid(editedRoutine);

  const getWorkoutRoutineSchedules = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<RoutineScheduleItem[]>(
        `SELECT workout_routine_schedules.id, day, workout_template_id,
        (SELECT name FROM workout_templates WHERE id = workout_routine_schedules.workout_template_id) AS name
        FROM workout_routine_schedules 
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
        GetScheduleDayValues(routine.num_days_in_schedule, schedules);

      setScheduleValues(workoutScheduleStringList);
    } catch (error) {
      console.log(error);
    }
  }, [id, routine.num_days_in_schedule]);

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
        setEditedRoutine(currentRoutine);
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

    const getUserSettings = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<UserSettingsOptional[]>(
          "SELECT id, active_routine_id, locale FROM user_settings"
        );

        const userSettings: UserSettingsOptional = result[0];

        if (userSettings !== undefined) setUserSettings(userSettings);
      } catch (error) {
        console.log(error);
      }
    };

    getRoutine();
    getWorkoutTemplates();
    getWorkoutRoutineSchedules();
    getUserSettings();
  }, [id, getWorkoutRoutineSchedules]);

  const updateRoutine = async () => {
    if (!isRoutineValid) return;

    const noteToInsert = ConvertEmptyStringToNull(editedRoutine.note);

    const updatedRoutine: Routine = {
      ...editedRoutine,
      note: noteToInsert,
    };

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE routines SET name = $1, note = $2, is_schedule_weekly = $3, num_days_in_schedule = $4 WHERE id = $5",
        [
          updatedRoutine.name,
          updatedRoutine.note,
          updatedRoutine.is_schedule_weekly,
          updatedRoutine.num_days_in_schedule,
          updatedRoutine.id,
        ]
      );

      setRoutine(updatedRoutine);
      setEditedRoutine(updatedRoutine);
      routineModal.onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddWorkoutButton = (day: number) => {
    setSelectedDay(day);
    workoutTemplatesModal.onOpen();
  };

  const addWorkoutTemplateToDay = async (workoutTemplateIdString: string) => {
    const workoutTemplateId: number = parseInt(workoutTemplateIdString);

    if (
      routine === undefined ||
      isNaN(workoutTemplateId) ||
      selectedDay < 0 ||
      selectedDay > routine.num_days_in_schedule - 1
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "INSERT into workout_routine_schedules (day, workout_template_id, routine_id) VALUES ($1, $2, $3)",
        [selectedDay, workoutTemplateId, routine.id]
      );

      await getWorkoutRoutineSchedules();

      workoutTemplatesModal.onClose();
      toast.success(`Workout added to ${dayNameList[selectedDay]}`);
    } catch (error) {
      console.log(error);
    }
  };

  const removeWorkoutTemplateFromDay = async () => {
    if (routine === undefined || workoutRoutineScheduleToRemove === undefined)
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute("DELETE from workout_routine_schedules WHERE id = $1", [
        workoutRoutineScheduleToRemove.id,
      ]);

      await getWorkoutRoutineSchedules();

      deleteModal.onClose();
      toast.success(
        `${workoutRoutineScheduleToRemove.name} removed from ${dayNameList[selectedDay]}`
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveButton = (schedule: RoutineScheduleItem) => {
    setSelectedDay(schedule.day);
    setWorkoutRoutineScheduleToRemove(schedule);
    deleteModal.onOpen();
  };

  const handleSetActiveButton = async () => {
    if (routine === undefined || userSettings === undefined) return;

    const updatedSettings: UserSettingsOptional = {
      ...userSettings,
      active_routine_id: routine.id,
    };

    await UpdateActiveRoutineId(updatedSettings);

    setUserSettings(updatedSettings);
  };

  const handleSelectCustomStartDate = (selectedDate: DateValue) => {
    if (routine === undefined) return;

    const formattedDate = ConvertDateToYmdString(
      selectedDate.toDate(getLocalTimeZone())
    );

    updateCustomStartDate(formattedDate);
  };

  const updateCustomStartDate = async (dateString: string) => {
    if (routine === undefined || routine.is_schedule_weekly) return;

    if (!IsYmdDateStringValid(dateString)) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE routines SET custom_schedule_start_date = $1 WHERE id = $2",
        [dateString, routine.id]
      );

      setRoutine((prev) => ({
        ...prev!,
        custom_schedule_start_date: dateString,
      }));

      toast.success("Start Date Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const resetCustomStartDate = async () => {
    if (routine === undefined || routine.custom_schedule_start_date === null)
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE routines SET custom_schedule_start_date = $1 WHERE id = $2",
        [null, routine.id]
      );

      setRoutine((prev) => ({
        ...prev!,
        custom_schedule_start_date: null,
      }));

      toast.success("Start Date Reset");
    } catch (error) {
      console.log(error);
    }
  };

  const dayNameList: string[] = useMemo(() => {
    return GetScheduleDayNames(
      routine.num_days_in_schedule ?? 7,
      !!routine.is_schedule_weekly ?? true
    );
  }, [routine.num_days_in_schedule, routine.is_schedule_weekly]);

  if (routine === undefined) return NotFound();

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <RoutineModal
        routineModal={routineModal}
        routine={editedRoutine}
        setRoutine={setEditedRoutine}
        isRoutineNameValid={isRoutineNameValid}
        buttonAction={updateRoutine}
      />
      <DeleteModal
        deleteModal={deleteModal}
        header="Remove Workout Template"
        body={
          <p className="break-words">
            Are you sure you want to remove{" "}
            <span className="font-medium text-yellow-500">
              {workoutRoutineScheduleToRemove?.name}
            </span>{" "}
            from{" "}
            <span className="font-medium text-yellow-500">
              {dayNameList[selectedDay]}
            </span>
            ?
          </p>
        }
        deleteButtonAction={removeWorkoutTemplateFromDay}
        deleteButtonText="Remove"
      />
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
              <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
                {routine.name}
              </h1>
            </div>
            <div className="flex justify-center">
              {userSettings?.active_routine_id === routine.id ? (
                <span className="text-xl text-success font-semibold">
                  Currently Active Routine
                </span>
              ) : (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-lg text-danger font-semibold">
                    Currently Not Active Routine
                  </span>
                  <Button
                    size="sm"
                    color="success"
                    onPress={handleSetActiveButton}
                  >
                    Set Active
                  </Button>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold ">Note</h2>
              <span>{routine.note}</span>
            </div>
            <div className="flex justify-center">
              <Button
                size="sm"
                color="success"
                onPress={() => routineModal.onOpen()}
              >
                Edit
              </Button>
            </div>
          </>
        )}
        <div className="flex flex-col">
          {routine.is_schedule_weekly === 0 && (
            <div className="flex gap-4 items-end">
              <I18nProvider locale={userSettings?.locale}>
                <DatePicker
                  className="w-40"
                  classNames={{ base: "font-medium" }}
                  label="Start date"
                  labelPlacement="outside"
                  variant="flat"
                  value={
                    routine.custom_schedule_start_date
                      ? parseDate(routine.custom_schedule_start_date)
                      : null
                  }
                  onChange={handleSelectCustomStartDate}
                />
              </I18nProvider>
              <div className="pb-1">
                {routine.custom_schedule_start_date !== null ? (
                  <Button
                    size="sm"
                    color="danger"
                    onPress={resetCustomStartDate}
                  >
                    Reset
                  </Button>
                ) : (
                  <span className="font-medium text-stone-500">
                    No Start Date Set
                  </span>
                )}
              </div>
            </div>
          )}
          <h2 className="text-xl font-semibold pt-3 pb-1">
            {routine.is_schedule_weekly === 0
              ? `${routine.num_days_in_schedule} Day Schedule`
              : "Weekly Schedule"}
          </h2>
          <div className="flex flex-col gap-0.5 py-1">
            {Array.from(Array(routine.num_days_in_schedule), (_, i) => (
              <div
                key={`day-${i + 1}`}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col w-64 gap-1">
                  <span className="font-medium">{dayNameList[i]}</span>
                  {scheduleValues[i]?.length > 0 ? (
                    scheduleValues[i].map((schedule) => {
                      return (
                        <div
                          key={`${schedule.id}`}
                          className="flex justify-between items-center"
                        >
                          <span className="truncate max-w-44">
                            {schedule.name}
                          </span>
                          <Button
                            className="h-6 w-16"
                            size="sm"
                            color="danger"
                            onPress={() => {
                              handleRemoveButton(schedule);
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
                  size="sm"
                  color="success"
                  onPress={() => handleAddWorkoutButton(i)}
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

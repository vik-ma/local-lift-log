import { useParams } from "react-router-dom";
import {
  Routine,
  RoutineScheduleItem,
  UserSettingsOptional,
  UserSettings,
} from "../typings";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  useDisclosure,
  DatePicker,
  DateValue,
} from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import {
  LoadingSpinner,
  DeleteModal,
  RoutineModal,
  WorkoutTemplateListModal,
  DetailsHeader,
} from "../components";
import {
  GetScheduleDayNames,
  GetScheduleDayValues,
  UpdateActiveRoutineId,
  ConvertDateToYmdString,
  IsYmdDateStringValid,
  ConvertEmptyStringToNull,
  DefaultNewRoutine,
  IsNumberValidId,
  GetUserSettings,
  UpdateRoutine,
} from "../helpers";
import toast, { Toaster } from "react-hot-toast";
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { useIsRoutineValid, useWorkoutTemplateList } from "../hooks";

export default function RoutineDetails() {
  const { id } = useParams();
  const [routine, setRoutine] = useState<Routine>(DefaultNewRoutine());
  const [editedRoutine, setEditedRoutine] = useState<Routine>(
    DefaultNewRoutine()
  );
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [scheduleValues, setScheduleValues] = useState<RoutineScheduleItem[][]>(
    []
  );
  const [workoutRoutineScheduleToRemove, setWorkoutRoutineScheduleToRemove] =
    useState<RoutineScheduleItem>();
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();

  const deleteModal = useDisclosure();
  const routineModal = useDisclosure();

  const { isRoutineNameValid, isRoutineValid } =
    useIsRoutineValid(editedRoutine);

  const { workoutTemplatesModal, workoutTemplates } = useWorkoutTemplateList();

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
          `SELECT routines.*,
          (SELECT COUNT(*) FROM workout_routine_schedules 
          WHERE workout_routine_schedules.routine_id = routines.id) AS numWorkoutTemplates
          FROM routines WHERE id = $1`,
          [id]
        );

        if (result.length === 0) return;

        const currentRoutine: Routine = result[0];
        setRoutine(currentRoutine);
        setEditedRoutine(currentRoutine);
      } catch (error) {
        console.log(error);
      }
    };

    const getUserSettings = async () => {
      const settings: UserSettings | undefined = await GetUserSettings();
      if (settings !== undefined) setUserSettings(settings);
    };

    getRoutine();
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

    const success = await UpdateRoutine(updatedRoutine);

    if (!success) return;

    if (updatedRoutine.num_days_in_schedule < routine.num_days_in_schedule) {
      deleteWorkoutTemplateSchedulesAboveDayNumber(
        updatedRoutine.num_days_in_schedule
      );
    }

    setRoutine(updatedRoutine);
    setEditedRoutine(updatedRoutine);

    routineModal.onClose();
    toast.success("Routine Updated");
  };

  const handleAddWorkoutButton = (day: number) => {
    setSelectedDay(day);
    workoutTemplatesModal.onOpen();
  };

  const addWorkoutTemplateToDay = async (workoutTemplateId: number) => {
    if (!IsNumberValidId(workoutTemplateId)) return;

    if (selectedDay < 0 || selectedDay > routine.num_days_in_schedule - 1)
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "INSERT into workout_routine_schedules (day, workout_template_id, routine_id) VALUES ($1, $2, $3)",
        [selectedDay, workoutTemplateId, routine.id]
      );

      await getWorkoutRoutineSchedules();

      const updatedRoutine: Routine = {
        ...routine,
        numWorkoutTemplates: routine.numWorkoutTemplates! + 1,
      };

      setRoutine(updatedRoutine);

      workoutTemplatesModal.onClose();
      toast.success(`Workout added to ${dayNameList[selectedDay]}`);
    } catch (error) {
      console.log(error);
    }
  };

  const removeWorkoutTemplateFromDay = async () => {
    if (workoutRoutineScheduleToRemove === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute("DELETE from workout_routine_schedules WHERE id = $1", [
        workoutRoutineScheduleToRemove.id,
      ]);

      await getWorkoutRoutineSchedules();

      const updatedRoutine: Routine = {
        ...routine,
        numWorkoutTemplates: routine.numWorkoutTemplates! - 1,
      };

      setRoutine(updatedRoutine);

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
    if (userSettings === undefined) return;

    const updatedSettings: UserSettingsOptional = {
      ...userSettings,
      active_routine_id: routine.id,
    };

    await UpdateActiveRoutineId(updatedSettings);

    setUserSettings(updatedSettings);
  };

  const handleSelectCustomStartDate = (selectedDate: DateValue) => {
    const formattedDate = ConvertDateToYmdString(
      selectedDate.toDate(getLocalTimeZone())
    );

    updateCustomStartDate(formattedDate);
  };

  const updateCustomStartDate = async (dateString: string) => {
    if (routine.is_schedule_weekly) return;

    if (!IsYmdDateStringValid(dateString)) return;

    const updatedRoutine = {
      ...routine,
      custom_schedule_start_date: dateString,
    };

    const success = await UpdateRoutine(updatedRoutine);

    if (!success) return;

    setRoutine(updatedRoutine);
    toast.success("Start Date Updated");
  };

  const resetCustomStartDate = async () => {
    if (routine.custom_schedule_start_date === null) return;

    const updatedRoutine = {
      ...routine,
      custom_schedule_start_date: null,
    };

    const success = await UpdateRoutine(updatedRoutine);

    if (!success) return;

    setRoutine(updatedRoutine);
    toast.success("Start Date Reset");
  };

  const deleteWorkoutTemplateSchedulesAboveDayNumber = async (
    numDaysInSchedule: number
  ) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Delete all workout_routine_schedules for routine_id
      // that contains a day number that exceeds numDaysInSchedule
      const result = await db.execute(
        `DELETE from workout_routine_schedules 
        WHERE routine_id = $1 AND day >= $2`,
        [routine.id, numDaysInSchedule]
      );

      const updatedRoutine: Routine = {
        ...routine,
        numWorkoutTemplates: routine.numWorkoutTemplates! - result.rowsAffected,
      };

      setRoutine(updatedRoutine);
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

  if (routine.id === 0 || userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <RoutineModal
        routineModal={routineModal}
        routine={editedRoutine}
        setRoutine={setEditedRoutine}
        isRoutineNameValid={isRoutineNameValid}
        buttonAction={updateRoutine}
        isEditing={true}
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
      <WorkoutTemplateListModal
        workoutTemplateListModal={workoutTemplatesModal}
        workoutTemplates={workoutTemplates}
        listboxOnActionFunction={addWorkoutTemplateToDay}
        header={
          <span>
            Add Workout Template to{" "}
            <span className="text-success">{dayNameList[selectedDay]}</span>
          </span>
        }
      />
      <div className="flex flex-col gap-4">
        <DetailsHeader
          header={routine.name}
          subHeader={
            routine.numWorkoutTemplates === 0
              ? "No Workouts Added"
              : routine.numWorkoutTemplates === 1
              ? "1 Workout"
              : `${routine.numWorkoutTemplates} Workouts`
          }
          note={routine.note}
          editButtonAction={() => routineModal.onOpen()}
        />
        <div className="flex justify-center">
          {userSettings?.active_routine_id === routine.id ? (
            <span className="text-success font-semibold">
              Currently Active Routine
            </span>
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-semibold text-stone-500">
                Currently Not Active Routine
              </span>
              <Button size="sm" onPress={handleSetActiveButton}>
                Set Active
              </Button>
            </div>
          )}
        </div>
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
                  <span
                    className={
                      scheduleValues[i].length > 0
                        ? "text-yellow-600 font-medium"
                        : "font-medium"
                    }
                  >
                    {dayNameList[i]}
                  </span>
                  {scheduleValues[i].length > 0 ? (
                    scheduleValues[i].map((schedule) => {
                      return (
                        <div
                          key={schedule.id}
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
                  variant="flat"
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

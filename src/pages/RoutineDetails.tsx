import { useParams } from "react-router-dom";
import {
  Routine,
  RoutineScheduleItem,
  UserSettingsOptional,
  WorkoutTemplate,
  NoDayRoutineScheduleItem,
} from "../typings";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Button,
  useDisclosure,
  DatePicker,
  DateValue,
  Chip,
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
  FormatNumItemsString,
  CreateRoutineWorkoutTemplateList,
  ConvertDateStringToCalendarDate,
  FormatRoutineScheduleTypeString,
  CreateNoDayWorkoutTemplateList,
} from "../helpers";
import toast, { Toaster } from "react-hot-toast";
import { getLocalTimeZone } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import {
  useIsRoutineValid,
  useWorkoutTemplateList,
  useDetailsHeaderOptionsMenu,
  useExerciseList,
} from "../hooks";
import { Link } from "react-router-dom";

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
  const [noDayWorkoutTemplateList, setNoDayWorkoutTemplateList] = useState<
    NoDayRoutineScheduleItem[]
  >([]);

  const deleteModal = useDisclosure();
  const routineModal = useDisclosure();

  const { isRoutineNameValid, isRoutineValid } =
    useIsRoutineValid(editedRoutine);

  const exerciseList = useExerciseList(false);

  const workoutTemplateList = useWorkoutTemplateList(true, exerciseList);

  const {
    handleOpenWorkoutTemplateListModal,
    workoutTemplateListModal,
    isWorkoutTemplateListLoaded,
    workoutTemplateMap,
  } = workoutTemplateList;

  const isRoutineLoaded = useRef(false);

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

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }, [id, routine.num_days_in_schedule]);

  useEffect(() => {
    const getRoutine = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Routine[]>(
          `SELECT routines.*,
           json_group_array(workout_routine_schedules.workout_template_id) AS workoutTemplateIds
           FROM routines
           LEFT JOIN workout_routine_schedules
           ON routines.id = workout_routine_schedules.routine_id WHERE routines.id = $1`,
          [id]
        );

        if (result.length === 0) return;

        const routine = result[0];

        const isNoDaySchedule = routine.schedule_type === 2;

        const { workoutTemplateIdList, workoutTemplateIdSet } =
          CreateRoutineWorkoutTemplateList(
            isNoDaySchedule
              ? `[${routine.workout_template_order}]`
              : routine.workoutTemplateIds
          );

        const currentRoutine: Routine = {
          ...routine,
          workoutTemplateIdList,
          workoutTemplateIdSet,
        };

        if (isNoDaySchedule) {
          const noDayWorkoutTemplateList = await CreateNoDayWorkoutTemplateList(
            workoutTemplateIdList,
            workoutTemplateMap.current
          );

          setNoDayWorkoutTemplateList(noDayWorkoutTemplateList);
        }

        setRoutine(currentRoutine);
        setEditedRoutine(currentRoutine);
        isRoutineLoaded.current = true;
      } catch (error) {
        console.log(error);
      }
    };

    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings !== undefined) setUserSettings(userSettings);
    };

    if (isWorkoutTemplateListLoaded.current) {
      getRoutine();
    }

    if (isRoutineLoaded.current) {
      getWorkoutRoutineSchedules();
      loadUserSettings();
    }
    // isRoutineLoaded.current and isWorkoutTemplateListLoaded.current
    // needs to be specifically included in array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    id,
    getWorkoutRoutineSchedules,
    isRoutineLoaded.current,
    isWorkoutTemplateListLoaded.current,
  ]);

  const useDetailsHeaderOptions = useDetailsHeaderOptionsMenu("Routine");

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

  const handleAddWorkoutToDayButton = (day: number) => {
    setSelectedDay(day);
    handleOpenWorkoutTemplateListModal();
  };

  const addWorkoutTemplateToDay = async (workoutTemplate: WorkoutTemplate) => {
    if (!IsNumberValidId(workoutTemplate.id) || routine.schedule_type === 2)
      return;

    if (selectedDay < 0 || selectedDay > routine.num_days_in_schedule - 1)
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "INSERT into workout_routine_schedules (day, workout_template_id, routine_id) VALUES ($1, $2, $3)",
        [selectedDay, workoutTemplate.id, routine.id]
      );

      await updateRoutineWorkoutTemplateList();

      workoutTemplateListModal.onClose();
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

      await updateRoutineWorkoutTemplateList();

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
    if (routine.schedule_type !== 1) return;

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
      await db.execute(
        `DELETE from workout_routine_schedules 
        WHERE routine_id = $1 AND day >= $2`,
        [routine.id, numDaysInSchedule]
      );

      await updateRoutineWorkoutTemplateList();
    } catch (error) {
      console.log(error);
    }
  };

  const updateRoutineWorkoutTemplateList = async () => {
    const updatedSchedules = await getWorkoutRoutineSchedules();

    const scheduleWorkoutTemplateIds = updatedSchedules.map((item) => item.id);

    const workoutTemplateIds = JSON.stringify(scheduleWorkoutTemplateIds);

    const { workoutTemplateIdList, workoutTemplateIdSet } =
      CreateRoutineWorkoutTemplateList(workoutTemplateIds);

    const updatedRoutine: Routine = {
      ...routine,
      workoutTemplateIds,
      workoutTemplateIdList,
      workoutTemplateIdSet,
    };

    setRoutine(updatedRoutine);
  };

  const dayNameList: string[] = useMemo(() => {
    return GetScheduleDayNames(
      routine.num_days_in_schedule ?? 7,
      routine.schedule_type === 0
    );
  }, [routine.num_days_in_schedule, routine.schedule_type]);

  const addWorkoutTemplateToOrder = async (
    workoutTemplate: WorkoutTemplate
  ) => {
    if (!IsNumberValidId(workoutTemplate.id) || routine.schedule_type !== 2)
      return;

    const noDayScheduleItem: NoDayRoutineScheduleItem = {
      workout_template_id: workoutTemplate.id,
      name: workoutTemplate.name,
    };

    const updatedWorkoutTemplateOrder = [
      ...noDayWorkoutTemplateList,
      noDayScheduleItem,
    ];

    const updatedWorkoutTemplateIdList = updatedWorkoutTemplateOrder.map(
      (item) => item.workout_template_id
    );
    const updatedWorkoutTemplateSet = new Set(updatedWorkoutTemplateIdList);
    const workoutTemplateOrderString = updatedWorkoutTemplateIdList.join(",");

    const updatedRoutine: Routine = {
      ...routine,
      workout_template_order: workoutTemplateOrderString,
      workoutTemplateIdList: updatedWorkoutTemplateIdList,
      workoutTemplateIdSet: updatedWorkoutTemplateSet,
    };

    const success = await UpdateRoutine(updatedRoutine);

    if (!success) return;

    setRoutine(updatedRoutine);
    setEditedRoutine(updatedRoutine);
    setNoDayWorkoutTemplateList(updatedWorkoutTemplateOrder);

    workoutTemplateListModal.onClose();
    toast.success("Workout added");
  };

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
        useWorkoutTemplateList={workoutTemplateList}
        onClickAction={
          routine.schedule_type == 2
            ? addWorkoutTemplateToOrder
            : addWorkoutTemplateToDay
        }
        header={
          <span>
            Add Workout Template
            {routine.schedule_type !== 2 && (
              <span>
                {" "}
                to
                <span className="text-secondary">
                  {" "}
                  {dayNameList[selectedDay]}
                </span>
              </span>
            )}
          </span>
        }
      />
      <div className="flex flex-col gap-4">
        <DetailsHeader
          header={routine.name}
          subHeader={
            routine.workoutTemplateIdList === undefined ||
            routine.workoutTemplateIdList.length === 0
              ? "No Workouts Added"
              : FormatNumItemsString(
                  routine.workoutTemplateIdList.length,
                  "Workout"
                )
          }
          note={routine.note}
          detailsType="Routine"
          editButtonAction={() => routineModal.onOpen()}
          useDetailsHeaderOptions={useDetailsHeaderOptions}
        />
        <div className="flex justify-center">
          {userSettings.active_routine_id === routine.id ? (
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
          {routine.schedule_type === 1 && (
            <div className="flex gap-2 items-end">
              <I18nProvider locale={userSettings.locale}>
                <DatePicker
                  className="w-40"
                  classNames={{ base: "gap-0.5" }}
                  label={
                    <span className="font-medium text-base px-0.5">
                      Start date
                    </span>
                  }
                  labelPlacement="outside"
                  variant="faded"
                  value={ConvertDateStringToCalendarDate(
                    routine.custom_schedule_start_date
                  )}
                  onChange={handleSelectCustomStartDate}
                />
              </I18nProvider>
              <div className="pb-1">
                {routine.custom_schedule_start_date !== null ? (
                  <Button size="sm" onPress={resetCustomStartDate}>
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
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold pt-3 pb-1">
              {FormatRoutineScheduleTypeString(
                routine.schedule_type,
                routine.num_days_in_schedule,
                true
              )}
            </h2>
            {routine.schedule_type === 2 && (
              <Button
                className="font-medium"
                variant="flat"
                onPress={() => workoutTemplateListModal.onOpen()}
              >
                Add Workout
              </Button>
            )}
          </div>
          {routine.schedule_type !== 2 ? (
            <div className="flex flex-col gap-1 py-1">
              {Array.from(Array(routine.num_days_in_schedule), (_, i) => (
                <div
                  key={`day-${i + 1}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <h3
                      className={
                        scheduleValues[i]?.length > 0
                          ? "text-yellow-600 font-medium"
                          : "text-stone-600 font-medium"
                      }
                    >
                      {dayNameList[i]}
                    </h3>
                    <div className="flex flex-wrap gap-x-1.5 gap-y-1 w-[19rem]">
                      {scheduleValues[i]?.length > 0 ? (
                        scheduleValues[i].map((schedule) => {
                          return (
                            <Chip
                              key={schedule.id}
                              variant="flat"
                              radius="sm"
                              classNames={{ content: "max-w-[16rem] truncate" }}
                              onClose={() => {
                                handleRemoveButton(schedule);
                              }}
                            >
                              <Link
                                to={`/workout-templates/${schedule.workout_template_id}/`}
                              >
                                {schedule.name}
                              </Link>
                            </Chip>
                          );
                        })
                      ) : (
                        <div className="text-stone-400">No workout</div>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-24"
                    size="sm"
                    variant="flat"
                    onPress={() => handleAddWorkoutToDayButton(i)}
                  >
                    Add Workout
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1 py-1">
              <div className="flex flex-col gap-1">
                {noDayWorkoutTemplateList.map((item, index) => (
                  <Chip
                    key={`workout-template-list-item-${index}`}
                    variant="flat"
                    radius="sm"
                    size="lg"
                    classNames={{ content: "max-w-[15rem] truncate" }}
                    // TODO: ADD
                    onClose={() => {}}
                  >
                    <Link
                      to={`/workout-templates/${item.workout_template_id}/`}
                    >
                      {item.name}
                    </Link>
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

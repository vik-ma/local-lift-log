import { useParams } from "react-router-dom";
import {
  Routine,
  RoutineScheduleItem,
  WorkoutTemplate,
  NoDayRoutineScheduleItem,
  UserSettings,
} from "../typings";
import { useState, useEffect, useMemo, useRef } from "react";
import { Button, useDisclosure, Chip, Switch } from "@heroui/react";
import Database from "tauri-plugin-sql-api";
import {
  LoadingSpinner,
  DeleteModal,
  RoutineModal,
  WorkoutTemplateListModal,
  DetailsHeader,
  WeekdayDropdown,
} from "../components";
import {
  GetScheduleDayNames,
  GetScheduleDayValues,
  ConvertEmptyStringToNull,
  DefaultNewRoutine,
  IsNumberValidId,
  GetUserSettings,
  UpdateRoutine,
  FormatNumItemsString,
  CreateRoutineWorkoutTemplateList,
  FormatRoutineScheduleTypeString,
  CreateNoDayWorkoutTemplateList,
  DeleteItemFromList,
  DeleteWorkoutRoutineSchedule,
  UpdateUserSetting,
} from "../helpers";
import toast from "react-hot-toast";
import {
  useIsRoutineValid,
  useWorkoutTemplateList,
  useDetailsHeaderOptionsMenu,
  useExerciseList,
  useWeekdayMap,
} from "../hooks";
import { Link } from "react-router-dom";
import { Reorder } from "framer-motion";

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
  const [operatingRoutineScheduleItem, setOperatingRoutineScheduleItem] =
    useState<RoutineScheduleItem>();
  const [
    operatingNoDayRoutineScheduleItem,
    setOperatingNoDayRoutineScheduleItem,
  ] = useState<NoDayRoutineScheduleItem>();
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [noDayWorkoutTemplateList, setNoDayWorkoutTemplateList] = useState<
    NoDayRoutineScheduleItem[]
  >([]);
  const [isScheduleItemBeingDragged, setIsScheduleItemBeingDragged] =
    useState<boolean>(false);

  const weekdayMap = useWeekdayMap();

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

  const getWorkoutRoutineSchedules = async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<RoutineScheduleItem[]>(
        `SELECT workout_routine_schedules.id, day, workout_template_id,
        (SELECT name FROM workout_templates WHERE id = workout_routine_schedules.workout_template_id) AS name
        FROM workout_routine_schedules 
        WHERE routine_id = $1`,
        [id]
      );

      const schedules: RoutineScheduleItem[] = [];

      const invalidWorkoutTemplateIds: number[] = [];

      for (const row of result) {
        if (workoutTemplateMap.current.has(row.workout_template_id)) {
          const schedule: RoutineScheduleItem = {
            id: row.id,
            day: row.day,
            workout_template_id: row.workout_template_id,
            name: row.name,
          };

          schedules.push(schedule);
        } else {
          invalidWorkoutTemplateIds.push(row.workout_template_id);
        }
      }

      if (invalidWorkoutTemplateIds.length > 0) {
        for (const workoutTemplateId of invalidWorkoutTemplateIds)
          await DeleteWorkoutRoutineSchedule(
            workoutTemplateId,
            "workout_template_id"
          );
      }

      const workoutScheduleStringList: RoutineScheduleItem[][] =
        GetScheduleDayValues(routine.num_days_in_schedule, schedules);

      setScheduleValues(workoutScheduleStringList);

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

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
              : routine.workoutTemplateIds,
            workoutTemplateMap.current
          );

        const currentRoutine: Routine = {
          ...routine,
          workoutTemplateIdList,
          workoutTemplateIdSet,
        };

        if (isNoDaySchedule) {
          const noDayWorkoutTemplateList = CreateNoDayWorkoutTemplateList(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoutineLoaded.current, isWorkoutTemplateListLoaded.current]);

  const useDetailsHeaderOptions = useDetailsHeaderOptionsMenu("Routine");

  const updateRoutine = async () => {
    if (!isRoutineValid) return;

    const noteToInsert = ConvertEmptyStringToNull(editedRoutine.note);

    const updatedRoutine: Routine = {
      ...editedRoutine,
      note: noteToInsert,
    };

    // If switching schedule_type from Weekly/Custom to No Day Set
    if (routine.schedule_type !== 2 && updatedRoutine.schedule_type === 2) {
      const { workoutTemplateIdList, workoutTemplateIdSet } =
        CreateRoutineWorkoutTemplateList(
          `[${routine.workout_template_order}]`,
          workoutTemplateMap.current
        );

      updatedRoutine.workoutTemplateIdList = workoutTemplateIdList;
      updatedRoutine.workoutTemplateIdSet = workoutTemplateIdSet;

      const noDayWorkoutTemplateList = CreateNoDayWorkoutTemplateList(
        workoutTemplateIdList,
        workoutTemplateMap.current
      );

      setNoDayWorkoutTemplateList(noDayWorkoutTemplateList);
    }

    // If switching schedule_type from No Day Set to Weekly/Custom
    if (routine.schedule_type === 2 && updatedRoutine.schedule_type !== 2) {
      await getWorkoutRoutineSchedules();
    }

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

  const removeWorkoutTemplateFromDay = async (
    scheduleItemToDelete?: RoutineScheduleItem
  ) => {
    const scheduleItem = scheduleItemToDelete ?? operatingRoutineScheduleItem;

    if (scheduleItem === undefined || routine.schedule_type === 2) return;

    const day = scheduleItem.day;

    const success = await DeleteWorkoutRoutineSchedule(scheduleItem.id, "id");

    if (!success) return;

    await updateRoutineWorkoutTemplateList();

    deleteModal.onClose();
    toast.success(`${scheduleItem.name} removed from ${dayNameList[day]}`);
  };

  const handleRemoveRoutineScheduleItemButton = (
    schedule: RoutineScheduleItem
  ) => {
    if (userSettings === undefined) return;

    if (userSettings.never_show_delete_modal) {
      removeWorkoutTemplateFromDay(schedule);
    } else {
      setSelectedDay(schedule.day);
      setOperatingRoutineScheduleItem(schedule);
      deleteModal.onOpen();
    }
  };

  const handleRemoveNoDayRoutineScheduleItemButton = (
    schedule: NoDayRoutineScheduleItem
  ) => {
    if (userSettings === undefined) return;

    if (userSettings.never_show_delete_modal) {
      removeWorkoutTemplateFromNoDaySchedule(schedule);
    } else {
      setOperatingNoDayRoutineScheduleItem(schedule);
      deleteModal.onOpen();
    }
  };

  const handleChangeIsActiveRoutine = async (value: boolean) => {
    if (userSettings === undefined) return;

    const newValue = value ? routine.id : 0;

    await UpdateUserSetting(
      "active_routine_id",
      newValue,
      userSettings,
      setUserSettings
    );
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
      CreateRoutineWorkoutTemplateList(
        workoutTemplateIds,
        workoutTemplateMap.current
      );

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

  const addWorkoutTemplateToNoDaySchedule = async (
    workoutTemplate: WorkoutTemplate
  ) => {
    if (!IsNumberValidId(workoutTemplate.id) || routine.schedule_type !== 2)
      return;

    // Get max id of noDayWorkoutTemplateList items
    const highestId = noDayWorkoutTemplateList.reduce(
      (max, item) => (item.id > max ? item.id : max),
      -Infinity
    );

    // Set id as 0 if noDayWorkoutTemplateList is empty, otherwise max + 1
    const id = highestId === -Infinity ? 0 : highestId + 1;

    const noDayScheduleItem: NoDayRoutineScheduleItem = {
      id: id,
      workout_template_id: workoutTemplate.id,
      name: workoutTemplate.name,
    };

    const updatedWorkoutTemplateOrder = [
      ...noDayWorkoutTemplateList,
      noDayScheduleItem,
    ];

    const success = await updateNoDayWorkoutTemplateList(
      updatedWorkoutTemplateOrder
    );

    if (!success) return;

    workoutTemplateListModal.onClose();
    toast.success("Workout added");
  };

  const removeWorkoutTemplateFromNoDaySchedule = async (
    scheduleItemToDelete?: NoDayRoutineScheduleItem
  ) => {
    const scheduleItem =
      scheduleItemToDelete ?? operatingNoDayRoutineScheduleItem;

    if (scheduleItem === undefined || routine.schedule_type !== 2) return;

    const updatedWorkoutTemplateOrder = DeleteItemFromList(
      noDayWorkoutTemplateList,
      scheduleItem.id
    );

    const success = await updateNoDayWorkoutTemplateList(
      updatedWorkoutTemplateOrder
    );

    if (!success) return;

    deleteModal.onClose();
    toast.success("Workout removed");
  };

  const updateRoutineStartDay = async (weekdayNum: string) => {
    const startDay = Number(weekdayNum);

    if (isNaN(startDay) || startDay < 0 || startDay > 7) return;

    const updatedRoutine: Routine = { ...routine, start_day: startDay };

    const success = await UpdateRoutine(updatedRoutine);

    if (!success) return;

    setRoutine(updatedRoutine);
    setEditedRoutine(updatedRoutine);

    toast.success("Start day updated");
  };

  const updateWorkoutTemplateOrder = async () => {
    const updatedWorkoutTemplateOrder = [...noDayWorkoutTemplateList];

    await updateNoDayWorkoutTemplateList(updatedWorkoutTemplateOrder);

    setIsScheduleItemBeingDragged(false);
  };

  const updateNoDayWorkoutTemplateList = async (
    workoutTemplateOrder: NoDayRoutineScheduleItem[]
  ) => {
    const updatedWorkoutTemplateIdList = workoutTemplateOrder.map(
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

    if (!success) return false;

    setRoutine(updatedRoutine);
    setEditedRoutine(updatedRoutine);
    setNoDayWorkoutTemplateList(workoutTemplateOrder);

    return true;
  };

  if (routine.id === 0 || userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
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
          routine.schedule_type === 2 ? (
            <p>
              Are you sure you want to remove{" "}
              <span className="text-secondary truncate max-w-[23rem] inline-block align-top">
                {operatingNoDayRoutineScheduleItem?.name}
              </span>
              ?
            </p>
          ) : (
            <p className="break-words">
              Are you sure you want to remove{" "}
              <span className="text-secondary truncate max-w-[24rem] inline-block align-top">
                {operatingRoutineScheduleItem?.name}
              </span>{" "}
              from{" "}
              <span className="text-secondary">{dayNameList[selectedDay]}</span>
              ?
            </p>
          )
        }
        deleteButtonAction={
          routine.schedule_type === 2
            ? removeWorkoutTemplateFromNoDaySchedule
            : removeWorkoutTemplateFromDay
        }
        deleteButtonText="Remove"
      />
      <WorkoutTemplateListModal
        useWorkoutTemplateList={workoutTemplateList}
        onClickAction={
          routine.schedule_type == 2
            ? addWorkoutTemplateToNoDaySchedule
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
      <div className="flex flex-col gap-3">
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
        <div className="flex items-center justify-between">
          <div>
            {routine.schedule_type === 1 && (
              <WeekdayDropdown
                value={routine.start_day}
                label="Start Day"
                weekdayMap={weekdayMap}
                targetType="routine"
                updateRoutineStartDay={updateRoutineStartDay}
              />
            )}
          </div>
          <Switch
            className="flex-row-reverse gap-3"
            color="primary"
            isSelected={
              userSettings.active_routine_id === routine.id ? true : false
            }
            onValueChange={(value) => handleChangeIsActiveRoutine(value)}
          >
            <span className="text-stone-600 font-medium">Active Routine</span>
          </Switch>
        </div>
        <div className="flex flex-col gap-0.5">
          {routine.schedule_type === 2 ? (
            <div className="flex items-end justify-between">
              <div className="flex flex-col px-1">
                <h2 className="text-xl font-semibold">Workout Order</h2>
                {routine.schedule_type === 2 &&
                  noDayWorkoutTemplateList.length > 1 && (
                    <span className="text-xs text-stone-500 font-normal">
                      Drag Workouts To Change Order
                    </span>
                  )}
              </div>
              <Button
                className="font-medium"
                color="secondary"
                variant="flat"
                onPress={() => workoutTemplateListModal.onOpen()}
              >
                Add Workout
              </Button>
            </div>
          ) : (
            <h2 className="text-xl font-semibold">
              {FormatRoutineScheduleTypeString(
                routine.schedule_type,
                routine.num_days_in_schedule
              )}
            </h2>
          )}
          {routine.schedule_type !== 2 ? (
            <div className="flex flex-col gap-0.5">
              {Array.from(Array(routine.num_days_in_schedule), (_, i) => (
                <div
                  key={`day-${i + 1}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <h3
                      className={
                        scheduleValues[i]?.length > 0
                          ? "text-yellow-600 font-medium pb-0.5"
                          : "text-stone-600 font-medium pb-0.5"
                      }
                    >
                      {dayNameList[i]}
                    </h3>
                    <div className="flex flex-wrap gap-x-1.5 gap-y-1 w-[19rem]">
                      {scheduleValues[i]?.length > 0 ? (
                        scheduleValues[i].map((schedule) => {
                          return (
                            <Chip
                              className="bg-stone-300/80"
                              classNames={{
                                content: "max-w-[16rem] truncate pl-1.5",
                              }}
                              key={schedule.id}
                              variant="flat"
                              radius="sm"
                              onClose={() =>
                                handleRemoveRoutineScheduleItemButton(schedule)
                              }
                            >
                              <Link
                                className="hover:text-white"
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
                    color="secondary"
                    variant="flat"
                    onPress={() => handleAddWorkoutToDayButton(i)}
                  >
                    Add Workout
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1 pt-1.5">
              <Reorder.Group
                className="flex flex-col w-full gap-1"
                values={noDayWorkoutTemplateList}
                onReorder={setNoDayWorkoutTemplateList}
              >
                {noDayWorkoutTemplateList.map((item) => (
                  <Reorder.Item
                    className={
                      isScheduleItemBeingDragged
                        ? "cursor-grabbing"
                        : "cursor-grab"
                    }
                    key={item.id}
                    value={item}
                    onDragStart={() => setIsScheduleItemBeingDragged(true)}
                    onDragEnd={() => updateWorkoutTemplateOrder()}
                  >
                    <Chip
                      className="bg-stone-300/80 hover:bg-stone-400/40"
                      classNames={{ content: "w-[22.75rem] truncate pl-1" }}
                      variant="flat"
                      radius="sm"
                      size="lg"
                      onClose={() =>
                        handleRemoveNoDayRoutineScheduleItemButton(item)
                      }
                    >
                      <Link
                        className={
                          isScheduleItemBeingDragged
                            ? "pointer-events-none"
                            : "hover:text-white"
                        }
                        to={`/workout-templates/${item.workout_template_id}/`}
                      >
                        {item.name}
                      </Link>
                    </Chip>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

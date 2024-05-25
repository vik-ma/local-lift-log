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
  Input,
  Listbox,
  ListboxItem,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  DatePicker,
  DateValue,
} from "@nextui-org/react";
import { NotFound } from ".";
import Database from "tauri-plugin-sql-api";
import { LoadingSpinner, DeleteModal } from "../components";
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
  const [isEditing, setIsEditing] = useState<boolean>(false);
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

  const { isRoutineNameValid, isRoutineValid } = useIsRoutineValid(routine);

  const getWorkoutRoutineSchedules = useCallback(async () => {
    if (routine?.num_days_in_schedule === undefined) return;

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
    if (routine === undefined || !isRoutineValid) return;

    const noteToInsert = ConvertEmptyStringToNull(routine.note);

    const updatedRoutine: Routine = {
      ...routine,
      note: noteToInsert,
    };

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE routines SET name = $1, note = $2, is_schedule_weekly = $3, num_days_in_schedule = $4 WHERE id = $5",
        [
          routine.name,
          noteToInsert,
          routine.is_schedule_weekly,
          routine.num_days_in_schedule,
          routine.id,
        ]
      );

      setRoutine(updatedRoutine);

      setIsEditing(false);
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
      selectedDay > routine?.num_days_in_schedule - 1
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

  const handleScheduleTypeChange = (scheduleType: string) => {
    if (scheduleType === "weekly") {
      setRoutine((prev) => ({
        ...prev!,
        is_schedule_weekly: 1,
        num_days_in_schedule: 7,
      }));
    } else setRoutine((prev) => ({ ...prev!, is_schedule_weekly: 0 }));
  };

  const handleNumDaysInScheduleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (routine?.is_schedule_weekly) return;

    const numDays: number = parseInt(e.target.value);

    if (isNaN(numDays) || numDays < 2 || numDays > 14) return;

    setRoutine((prev) => ({ ...prev!, num_days_in_schedule: numDays }));
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
      routine?.num_days_in_schedule ?? 7,
      !!routine?.is_schedule_weekly ?? true
    );
  }, [routine?.num_days_in_schedule, routine?.is_schedule_weekly]);

  if (routine === undefined) return NotFound();

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
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
                {routine?.name}
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
              <span>{routine?.note}</span>
            </div>
            {isEditing ? (
              <div className="flex flex-col justify-center gap-2">
                <Input
                  value={routine?.name}
                  isInvalid={!isRoutineNameValid}
                  label="Name"
                  errorMessage={!isRoutineNameValid && "Name can't be empty"}
                  variant="faded"
                  onValueChange={(value) =>
                    setRoutine((prev) => ({ ...prev!, name: value }))
                  }
                  isRequired
                  isClearable
                />
                <Input
                  value={routine?.note ?? ""}
                  label="Note"
                  variant="faded"
                  onValueChange={(value) =>
                    setRoutine((prev) => ({ ...prev!, note: value }))
                  }
                  isClearable
                />
                <div className="flex justify-between items-center px-1 gap-4">
                  <RadioGroup
                    value={routine?.is_schedule_weekly ? "weekly" : "custom"}
                    onValueChange={(value) => handleScheduleTypeChange(value)}
                    defaultValue="weekly"
                    label="Schedule Type"
                  >
                    <Radio value="weekly">Weekly</Radio>
                    <Radio value="custom">Custom</Radio>
                  </RadioGroup>
                  <Select
                    isRequired
                    size="lg"
                    variant="faded"
                    label="Number of days in schedule"
                    labelPlacement="outside"
                    placeholder="Select number of days"
                    selectedKeys={[routine!.num_days_in_schedule.toString()]}
                    onChange={handleNumDaysInScheduleChange}
                    className={
                      routine?.is_schedule_weekly
                        ? "hidden max-w-[240px]"
                        : " max-w-[240px]"
                    }
                    disallowEmptySelection
                  >
                    {numDaysInScheduleOptions.map((number) => (
                      <SelectItem key={number} value={number}>
                        {number.toString()}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="flex justify-center gap-4">
                  <Button color="danger" onPress={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    color="success"
                    onPress={updateRoutine}
                    isDisabled={!isRoutineValid}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button
                  size="sm"
                  color="success"
                  onPress={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              </div>
            )}
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
